import type { AuthonUser, AuthTokens } from '@authon/shared';

const DEFAULT_API_URL = 'https://api.authon.dev';
const STORAGE_SCHEMA_VERSION = 2;

export type SessionChangeReason =
  | 'setSession'
  | 'tokenRefresh'
  | 'updateUser'
  | 'clearSession'
  | 'signOut'
  | 'refreshFailed';

export interface SessionChange {
  reason: SessionChangeReason;
  accessToken: string | null;
  user: AuthonUser | null;
}

export type SessionChangeListener = (change: SessionChange) => void;

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthonUser;
}

function normalizeApiUrl(apiUrl: string): string {
  try {
    const url = new URL(apiUrl);
    const pathname = url.pathname.replace(/\/+$/, '');
    return `${url.origin}${pathname}`;
  } catch {
    return apiUrl.replace(/\/+$/, '');
  }
}

/** FNV-1a: deterministic in browsers and sensitive to every character in the key. */
function stableDigest(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function tokenExpiration(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof decoded.exp === 'number' && Number.isFinite(decoded.exp) ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<StoredSession>;
  return typeof session.accessToken === 'string'
    && tokenExpiration(session.accessToken) !== null
    && typeof session.refreshToken === 'string'
    && session.refreshToken.length > 0
    && !!session.user
    && typeof session.user === 'object'
    && typeof session.user.id === 'string';
}

export class SessionManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthonUser | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly apiUrl: string;
  private readonly publishableKey: string;
  private readonly storageKey: string;
  private refreshRetryCount = 0;
  private refreshInFlight: Promise<AuthTokens | null> | null = null;
  private readonly listeners = new Set<SessionChangeListener>();
  private readonly requestControllers = new Set<AbortController>();
  private ready = true;
  private readinessPromise: Promise<void> = Promise.resolve();
  private destroyed = false;

  private static readonly MAX_REFRESH_RETRIES = 3;
  private static readonly RETRY_DELAYS = [3, 10, 30]; // seconds

  constructor(publishableKey: string, apiUrl: string) {
    this.publishableKey = publishableKey;
    this.apiUrl = normalizeApiUrl(apiUrl);
    this.storageKey = `authon_session_v${STORAGE_SCHEMA_VERSION}_${encodeURIComponent(this.apiUrl)}_${stableDigest(publishableKey)}`;
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') return;

    let stored: string | null = null;
    let legacyKey: string | null = null;
    try {
      stored = localStorage.getItem(this.storageKey);
      if (!stored && this.apiUrl === DEFAULT_API_URL) {
        legacyKey = `authon_session_${this.publishableKey.slice(0, 16)}`;
        stored = localStorage.getItem(legacyKey);
      }
      if (!stored) return;

      const data: unknown = JSON.parse(stored);
      if (!isStoredSession(data)) {
        if (!legacyKey) localStorage.removeItem(this.storageKey);
        return;
      }

      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;

      if (legacyKey && this.persistToStorage()) localStorage.removeItem(legacyKey);

      const expiration = tokenExpiration(data.accessToken)!;
      const remainingSeconds = expiration - Math.floor(Date.now() / 1000);
      if (remainingSeconds > 0) {
        this.scheduleRefresh(remainingSeconds);
        return;
      }

      this.ready = false;
      this.readinessPromise = this.refresh().then(() => undefined).finally(() => {
        if (!this.destroyed) this.ready = true;
      });
    } catch {
      // Storage is optional. Invalid or inaccessible data is treated as no session.
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
    }
  }

  private persistToStorage(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (this.accessToken && this.refreshToken && this.user) {
        localStorage.setItem(this.storageKey, JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          user: this.user,
        }));
      } else {
        localStorage.removeItem(this.storageKey);
      }
      return true;
    } catch {
      return false;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  waitUntilReady(): Promise<void> {
    return this.readinessPromise;
  }

  getToken(): string | null {
    return this.ready && this.isTokenValid() ? this.accessToken : null;
  }

  isTokenValid(): boolean {
    if (!this.accessToken) return false;
    const expiration = tokenExpiration(this.accessToken);
    return expiration !== null && expiration > Math.floor(Date.now() / 1000);
  }

  getUser(): AuthonUser | null {
    return this.getToken() ? this.user : null;
  }

  setSession(tokens: AuthTokens, reason: 'setSession' | 'tokenRefresh' = 'setSession'): void {
    if (this.destroyed) return;
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.user = tokens.user;
    this.ready = true;
    this.refreshRetryCount = 0;
    this.persistToStorage();
    if (tokens.expiresIn > 0) this.scheduleRefresh(tokens.expiresIn);
    this.notify(reason);
  }

  subscribe(listener: SessionChangeListener): () => void {
    if (this.destroyed) return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  updateUser(user: AuthonUser): void {
    if (this.destroyed) return;
    this.user = user;
    this.persistToStorage();
    this.notify('updateUser');
  }

  clearSession(reason: 'clearSession' | 'refreshFailed' = 'clearSession'): void {
    if (this.destroyed) return;
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.ready = true;
    this.persistToStorage();
    this.cancelRefreshTimer();
    this.notify(reason);
  }

  private scheduleRefresh(expiresIn: number): void {
    this.cancelRefreshTimer();
    const refreshIn = Math.max((expiresIn - 60) * 1000, 0);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, refreshIn);
  }

  private cancelRefreshTimer(): void {
    if (!this.refreshTimer) return;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
  }

  async refresh(): Promise<AuthTokens | null> {
    if (this.destroyed) return null;
    if (this.refreshInFlight) return this.refreshInFlight;

    if (!this.refreshToken) {
      this.clearSession('refreshFailed');
      return null;
    }

    const inFlight = this.doRefresh();
    this.refreshInFlight = inFlight;
    try {
      return await inFlight;
    } finally {
      if (this.refreshInFlight === inFlight) this.refreshInFlight = null;
    }
  }

  private async doRefresh(): Promise<AuthTokens | null> {
    if (!this.refreshToken || this.destroyed) return null;
    const controller = new AbortController();
    this.requestControllers.add(controller);
    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        signal: controller.signal,
      });
      if (this.destroyed) return null;
      if (!res.ok) {
        if (res.status === 401) {
          this.refreshRetryCount = 0;
          this.clearSession('refreshFailed');
          return null;
        }
        this.retryRefresh();
        return null;
      }
      const tokens: AuthTokens = await res.json();
      if (this.destroyed) return null;
      this.refreshRetryCount = 0;
      this.setSession(tokens, 'tokenRefresh');
      return tokens;
    } catch {
      if (!this.destroyed && !controller.signal.aborted) this.retryRefresh();
      return null;
    } finally {
      this.requestControllers.delete(controller);
    }
  }

  private retryRefresh(): void {
    if (this.destroyed) return;
    const delay = this.refreshRetryCount < SessionManager.MAX_REFRESH_RETRIES
      ? SessionManager.RETRY_DELAYS[Math.min(this.refreshRetryCount, SessionManager.RETRY_DELAYS.length - 1)]
      : 60;
    this.refreshRetryCount++;
    this.cancelRefreshTimer();
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, delay * 1000);
  }

  async signOut(): Promise<void> {
    if (this.destroyed) return;
    const controller = new AbortController();
    this.requestControllers.add(controller);
    try {
      await fetch(`${this.apiUrl}/v1/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
        credentials: 'include',
        signal: controller.signal,
      });
    } catch {
      // A local sign-out must succeed even when the network request does not.
    } finally {
      this.requestControllers.delete(controller);
    }
    if (!this.destroyed) {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      this.ready = true;
      this.persistToStorage();
      this.cancelRefreshTimer();
      this.notify('signOut');
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cancelRefreshTimer();
    for (const controller of this.requestControllers) controller.abort();
    this.requestControllers.clear();
    this.listeners.clear();
  }

  private notify(reason: SessionChangeReason): void {
    const change: SessionChange = {
      reason,
      accessToken: this.getToken(),
      user: this.getUser(),
    };
    for (const listener of [...this.listeners]) {
      try {
        listener(change);
      } catch {
        // One adapter callback must not prevent other subscribers from updating.
      }
    }
  }
}
