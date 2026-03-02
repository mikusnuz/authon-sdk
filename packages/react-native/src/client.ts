import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import type {
  AuthonReactNativeConfig,
  AuthonUser,
  SignInParams,
  SignUpParams,
  TokenPair,
  ApiAuthResponse,
  AuthonEventType,
  AuthonEvents,
} from './types';

const DEFAULT_API_URL = 'https://api.authon.dev';

type TokenStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type OAuthFlowMode = 'popup' | 'redirect' | 'auto';

interface ProvidersResponse {
  providers: OAuthProviderType[];
  providerConfigs?: Partial<Record<OAuthProviderType, { oauthFlow?: OAuthFlowMode }>>;
}

const STORAGE_KEY = 'authon-tokens';

export class AuthonMobileClient {
  private apiUrl: string;
  private publishableKey: string;
  private tokens: TokenPair | null = null;
  private user: AuthonUser | null = null;
  private storage: TokenStorage | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  // Cached provider/branding data
  private _providers: OAuthProviderType[] = [];
  private _branding: BrandingConfig | null = null;
  private _initialized = false;

  constructor(config: AuthonReactNativeConfig) {
    this.publishableKey = config.publishableKey;
    this.apiUrl = (config.apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  }

  setStorage(storage: TokenStorage) {
    this.storage = storage;
  }

  // ── Initialization ──

  async initialize(): Promise<TokenPair | null> {
    if (!this.storage) return null;

    const stored = await this.storage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const tokens: TokenPair = JSON.parse(stored);
      if (tokens.expiresAt > Date.now()) {
        this.tokens = tokens;
        this.scheduleRefresh(tokens.expiresAt);
        return tokens;
      }
      // Try refreshing
      return await this.refreshToken(tokens.refreshToken);
    } catch {
      await this.storage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  /** Fetch providers + branding from API (lazy, cached) */
  async ensureInitialized(): Promise<void> {
    if (this._initialized) return;
    try {
      const [branding, providersRes] = await Promise.all([
        this.request('GET', '/v1/auth/branding') as Promise<BrandingConfig>,
        this.request('GET', '/v1/auth/providers') as Promise<ProvidersResponse>,
      ]);
      this._branding = branding;
      this._providers = providersRes.providers;
      this._initialized = true;
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  // ── Auth ──

  async signIn(params: SignInParams): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request('POST', '/v1/auth/signin', params)) as ApiAuthResponse;
    this.tokens = this.toTokenPair(res);
    this.user = res.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', res.user);
    return { tokens: this.tokens, user: res.user };
  }

  async signUp(params: SignUpParams): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request('POST', '/v1/auth/signup', params)) as ApiAuthResponse;
    this.tokens = this.toTokenPair(res);
    this.user = res.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', res.user);
    return { tokens: this.tokens, user: res.user };
  }

  async signOut(): Promise<void> {
    if (this.tokens) {
      try {
        await this.request('POST', '/v1/auth/signout', undefined);
      } catch {
        // Ignore sign-out errors
      }
    }
    this.clearSession();
    this.emit('signedOut');
  }

  async getUser(): Promise<AuthonUser | null> {
    if (!this.tokens) return null;
    try {
      const user = (await this.request('GET', '/v1/auth/me')) as AuthonUser;
      this.user = user;
      return user;
    } catch {
      return null;
    }
  }

  getCachedUser(): AuthonUser | null {
    return this.user;
  }

  // ── Token management ──

  async refreshToken(refreshToken?: string): Promise<TokenPair | null> {
    const token = refreshToken || this.tokens?.refreshToken;
    if (!token) return null;

    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = (await res.json()) as ApiAuthResponse;
      this.tokens = this.toTokenPair(data);
      this.user = data.user;
      await this.persistTokens();
      this.scheduleRefresh(this.tokens.expiresAt);
      this.emit('tokenRefreshed');
      return this.tokens;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.expiresAt > Date.now();
  }

  // ── OAuth ──

  async getProviders(): Promise<OAuthProviderType[]> {
    await this.ensureInitialized();
    return this._providers;
  }

  async getBranding(): Promise<BrandingConfig | null> {
    await this.ensureInitialized();
    return this._branding;
  }

  async getOAuthUrl(
    provider: string,
    redirectUri: string,
  ): Promise<{ url: string; state: string }> {
    const params = new URLSearchParams({ redirectUri, flow: 'redirect' });
    return (await this.request(
      'GET',
      `/v1/auth/oauth/${provider}/url?${params.toString()}`,
    )) as { url: string; state: string };
  }

  async pollOAuth(state: string): Promise<ApiAuthResponse | null> {
    try {
      const res = await fetch(
        `${this.apiUrl}/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`,
        { headers: { 'x-api-key': this.publishableKey } },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as Record<string, unknown>;
      if (data.status === 'completed' && data.accessToken) {
        return data as unknown as ApiAuthResponse;
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Poll for OAuth completion (3 minute timeout, matching JS SDK) */
  async completeOAuth(state: string): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const maxAttempts = 360; // 3 minutes at 500ms intervals
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.pollOAuth(state);
      if (result) {
        this.tokens = this.toTokenPair(result);
        this.user = result.user;
        await this.persistTokens();
        this.scheduleRefresh(this.tokens.expiresAt);
        this.emit('signedIn', result.user);
        return { tokens: this.tokens, user: result.user };
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error('OAuth timeout');
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  // ── Event system ──

  on<K extends AuthonEventType>(event: K, listener: AuthonEvents[K]): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const set = this.listeners.get(event)!;
    set.add(listener as (...args: unknown[]) => void);
    return () => set.delete(listener as (...args: unknown[]) => void);
  }

  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  // ── Cleanup ──

  destroy(): void {
    this.clearRefreshTimer();
    this.listeners.clear();
  }

  // ── Private ──

  private clearSession(): void {
    this.tokens = null;
    this.user = null;
    this.clearRefreshTimer();
    if (this.storage) {
      this.storage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /** Schedule auto-refresh 60 seconds before token expiry (like JS SDK) */
  private scheduleRefresh(expiresAt: number): void {
    this.clearRefreshTimer();
    const refreshIn = Math.max(expiresAt - Date.now() - 60_000, 30_000);
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(() => {});
    }, refreshIn);
  }

  private async persistTokens(): Promise<void> {
    if (this.storage && this.tokens) {
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tokens));
    }
  }

  private toTokenPair(res: ApiAuthResponse): TokenPair {
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: Date.now() + res.expiresIn * 1000,
    };
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.publishableKey,
    };

    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    const res = await fetch(`${this.apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      const msg = Array.isArray(error.message)
        ? error.message[0]
        : error.message || `Request failed with status ${res.status}`;
      throw new Error(msg);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
  }
}
