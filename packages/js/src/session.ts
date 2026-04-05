import type { AuthonUser, AuthTokens } from '@authon/shared';

export class SessionManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthonUser | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private apiUrl: string;
  private publishableKey: string;
  private storageKey: string;
  private refreshRetryCount = 0;
  private refreshInFlight: Promise<AuthTokens | null> | null = null;
  private static readonly MAX_REFRESH_RETRIES = 3;
  private static readonly RETRY_DELAYS = [3, 10, 30]; // seconds

  constructor(publishableKey: string, apiUrl: string) {
    this.publishableKey = publishableKey;
    this.apiUrl = apiUrl;
    this.storageKey = `authon_session_${publishableKey.slice(0, 16)}`;
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;
      const data = JSON.parse(stored);
      if (data.accessToken && data.refreshToken && data.user) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
        // Token might be expired, schedule immediate refresh
        this.scheduleRefresh(5);
      }
    } catch { /* ignore corrupt storage */ }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;
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
    } catch { /* ignore */ }
  }

  getToken(): string | null {
    return this.accessToken;
  }

  isTokenValid(): boolean {
    if (!this.accessToken) return false;
    try {
      const [, payload] = this.accessToken.split('.');
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  getUser(): AuthonUser | null {
    return this.user;
  }

  setSession(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.user = tokens.user;
    this.persistToStorage();
    if (tokens.expiresIn && tokens.expiresIn > 0) {
      this.scheduleRefresh(tokens.expiresIn);
    }
  }

  updateUser(user: AuthonUser): void {
    this.user = user;
  }

  clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.persistToStorage();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    // Refresh 60 seconds before expiry
    const refreshIn = Math.max((expiresIn - 60) * 1000, 30000);
    this.refreshTimer = setTimeout(() => this.refresh(), refreshIn);
  }

  async refresh(): Promise<AuthTokens | null> {
    // Single-flight: if refresh is already in progress, return that promise
    if (this.refreshInFlight) return this.refreshInFlight;

    if (!this.refreshToken) {
      this.clearSession();
      return null;
    }

    this.refreshInFlight = this._doRefresh();
    const result = await this.refreshInFlight;
    this.refreshInFlight = null;
    return result;
  }

  private async _doRefresh(): Promise<AuthTokens | null> {
    if (!this.refreshToken) {
      this.clearSession();
      return null;
    }
    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          this.refreshRetryCount = 0;
          this.clearSession();
          return null;
        }
        this.retryRefresh();
        return null;
      }
      const tokens: AuthTokens = await res.json();
      this.refreshRetryCount = 0;
      this.setSession(tokens);
      return tokens;
    } catch {
      this.retryRefresh();
      return null;
    }
  }

  private retryRefresh(): void {
    if (this.refreshRetryCount < SessionManager.MAX_REFRESH_RETRIES) {
      const delay = SessionManager.RETRY_DELAYS[Math.min(this.refreshRetryCount, SessionManager.RETRY_DELAYS.length - 1)];
      this.refreshRetryCount++;
      this.scheduleRefresh(delay + 60); // scheduleRefresh subtracts 60
    } else {
      this.refreshRetryCount = 0;
      this.clearSession();
    }
  }

  async signOut(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/v1/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    this.clearSession();
  }

  destroy(): void {
    this.clearSession();
  }
}
