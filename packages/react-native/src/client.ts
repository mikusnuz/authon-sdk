import type {
  BrandingConfig,
  OAuthProviderType,
  PasskeyCredential,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
} from '@authon/shared';
import type {
  AuthonReactNativeConfig,
  AuthonUser,
  SignInParams,
  SignUpParams,
  StartOAuthOptions,
  TokenPair,
  ApiAuthResponse,
  OAuthCompletedResponse,
  OAuthErrorResponse,
  AuthonEventType,
  AuthonEvents,
} from './types';

const DEFAULT_API_URL = 'https://api.authon.dev';

type TokenStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

interface ProvidersResponse {
  providers: OAuthProviderType[];
  providerConfigs?: Partial<Record<OAuthProviderType, { oauthFlow?: StartOAuthOptions['flow'] }>>;
}

type OAuthPollResponse = OAuthCompletedResponse | OAuthErrorResponse;

function getStorageKey(publishableKey: string): string {
  return `authon_session_${publishableKey.slice(0, 16)}`;
}

export class AuthonMobileClient {
  private apiUrl: string;
  private publishableKey: string;
  private storageKey: string;
  private tokens: TokenPair | null = null;
  private user: AuthonUser | null = null;
  private storage: TokenStorage | null = null;
  private refreshInFlight: Promise<TokenPair | null> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  // Cached provider/branding data
  private _providers: OAuthProviderType[] = [];
  private _branding: BrandingConfig | null = null;
  private _initialized = false;

  constructor(config: AuthonReactNativeConfig) {
    this.publishableKey = config.publishableKey;
    this.apiUrl = (config.apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
    this.storageKey = getStorageKey(config.publishableKey);
  }

  setStorage(storage: TokenStorage) {
    this.storage = storage;
  }

  // ── Initialization ──

  async initialize(): Promise<TokenPair | null> {
    if (!this.storage) return null;

    const stored = await this.storage.getItem(this.storageKey);
    if (!stored) return null;

    try {
      const tokens: TokenPair = JSON.parse(stored);
      if (tokens.expiresAt > Date.now()) {
        this.tokens = tokens;
        this.scheduleRefresh(tokens.expiresAt);
        return tokens;
      }
      // Try refreshing — preserve storage on failure for next retry
      return await this.refreshToken(tokens.refreshToken);
    } catch {
      // Corrupt storage — only case where deletion is justified
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

  async signIn(
    params: SignInParams,
  ): Promise<
    | { tokens: TokenPair; user: AuthonUser }
    | { needsVerification: true; email: string }
    | { mfaRequired: true; mfaToken: string }
  > {
    const res = (await this.request('POST', '/v1/auth/signin', params)) as any;
    if (res.needsVerification) {
      this.emit('verificationRequired', res.email);
      return { needsVerification: true as const, email: res.email };
    }
    if (res.mfaRequired) {
      this.emit('mfaRequired', res.mfaToken);
      return { mfaRequired: true as const, mfaToken: res.mfaToken };
    }
    const authRes = res as ApiAuthResponse;
    this.tokens = this.toTokenPair(authRes);
    this.user = authRes.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', authRes.user);
    return { tokens: this.tokens, user: authRes.user };
  }

  async signUp(
    params: SignUpParams,
  ): Promise<{ tokens: TokenPair; user: AuthonUser } | { needsVerification: true; email: string }> {
    const res = (await this.request('POST', '/v1/auth/signup', params)) as any;
    if (res.needsVerification) {
      this.emit('verificationRequired', res.email);
      return { needsVerification: true as const, email: res.email };
    }
    const authRes = res as ApiAuthResponse;
    this.tokens = this.toTokenPair(authRes);
    this.user = authRes.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', authRes.user);
    return { tokens: this.tokens, user: authRes.user };
  }

  async verifyEmail(email: string, code: string): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request('POST', '/v1/auth/verify-email', { email, code })) as ApiAuthResponse;
    this.tokens = this.toTokenPair(res);
    this.user = res.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', res.user);
    return { tokens: this.tokens, user: res.user };
  }

  async resendVerificationCode(email: string): Promise<void> {
    await this.request('POST', '/v1/auth/resend-code', { email });
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
    // Single-flight guard
    if (this.refreshInFlight) return this.refreshInFlight;

    const token = refreshToken || this.tokens?.refreshToken;
    if (!token) return null;

    this.refreshInFlight = this._doRefresh(token);
    const result = await this.refreshInFlight;
    this.refreshInFlight = null;
    return result;
  }

  private async _doRefresh(token: string): Promise<TokenPair | null> {

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
        // 401 = refresh token permanently invalid
        if (res.status === 401) {
          this.clearSession();
        }
        // Other errors (500, network) — preserve tokens for retry
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
      // Network error — do NOT clear session
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
    options?: string | StartOAuthOptions,
  ): Promise<{ url: string; state: string }> {
    const normalized =
      typeof options === 'string'
        ? { redirectUri: options }
        : (options ?? {});
    const redirectUri = normalized.redirectUri || `${this.apiUrl}/v1/auth/oauth/redirect`;
    const flow = normalized.flow || 'redirect';
    const params = new URLSearchParams({ redirectUri, flow });
    if (normalized.returnTo) {
      params.set('returnTo', normalized.returnTo);
    }
    return (await this.request(
      'GET',
      `/v1/auth/oauth/${provider}/url?${params.toString()}`,
    )) as { url: string; state: string };
  }

  async pollOAuth(state: string): Promise<OAuthPollResponse | null> {
    try {
      const res = await fetch(
        `${this.apiUrl}/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`,
        { headers: { 'x-api-key': this.publishableKey } },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as Record<string, unknown>;
      if (data.status === 'completed' && data.accessToken) {
        return data as unknown as OAuthCompletedResponse;
      }
      if (data.status === 'error') {
        return {
          status: 'error',
          message: typeof data.message === 'string' ? data.message : 'OAuth failed',
        };
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
        if (result.status === 'error') {
          throw new Error(result.message || 'OAuth failed');
        }
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

  // ── Web3 ──

  async web3GetNonce(
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
    chainId?: number,
  ): Promise<Web3NonceResponse> {
    return this.request('POST', '/v1/auth/web3/nonce', {
      address,
      chain,
      walletType,
      ...(chainId != null ? { chainId } : {}),
    }) as Promise<Web3NonceResponse>;
  }

  async web3Verify(
    message: string,
    signature: string,
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
  ): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request('POST', '/v1/auth/web3/verify', {
      message,
      signature,
      address,
      chain,
      walletType,
    })) as ApiAuthResponse;
    this.tokens = this.toTokenPair(res);
    this.user = res.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', res.user);
    return { tokens: this.tokens, user: res.user };
  }

  async web3GetWallets(): Promise<Web3Wallet[]> {
    return this.request('GET', '/v1/auth/web3/wallets') as Promise<Web3Wallet[]>;
  }

  async web3LinkWallet(params: {
    address: string;
    chain: Web3Chain;
    walletType: Web3WalletType;
    chainId?: number;
    message: string;
    signature: string;
  }): Promise<Web3Wallet> {
    return this.request('POST', '/v1/auth/web3/wallets/link', params) as Promise<Web3Wallet>;
  }

  async web3UnlinkWallet(walletId: string): Promise<void> {
    await this.requestAuth('DELETE', `/v1/auth/web3/wallets/${walletId}`);
  }

  // ── Passwordless ──

  async passwordlessSendCode(identifier: string, type: 'email' | 'sms' = 'email'): Promise<void> {
    if (type === 'sms') {
      await this.request('POST', '/v1/auth/passwordless/sms-otp', { phone: identifier });
    } else {
      await this.request('POST', '/v1/auth/passwordless/email-otp', { email: identifier });
    }
  }

  async passwordlessVerifyCode(
    identifier: string,
    code: string,
  ): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request('POST', '/v1/auth/passwordless/verify', {
      email: identifier,
      code,
    })) as ApiAuthResponse;
    this.tokens = this.toTokenPair(res);
    this.user = res.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', res.user);
    return { tokens: this.tokens, user: res.user };
  }

  // ── Passkeys ──

  async passkeyStartRegister(name?: string): Promise<{ options: Record<string, unknown> }> {
    return this.requestAuth(
      'POST',
      '/v1/auth/passkeys/register/options',
      name ? { name } : undefined,
    ) as Promise<{ options: Record<string, unknown> }>;
  }

  async passkeyCompleteRegister(credential: Record<string, unknown>): Promise<PasskeyCredential> {
    return this.requestAuth(
      'POST',
      '/v1/auth/passkeys/register/verify',
      credential,
    ) as Promise<PasskeyCredential>;
  }

  async passkeyStartAuth(email?: string): Promise<{ options: Record<string, unknown> }> {
    return this.request(
      'POST',
      '/v1/auth/passkeys/authenticate/options',
      email ? { email } : undefined,
    ) as Promise<{ options: Record<string, unknown> }>;
  }

  async passkeyCompleteAuth(
    credential: Record<string, unknown>,
  ): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request(
      'POST',
      '/v1/auth/passkeys/authenticate/verify',
      credential,
    )) as ApiAuthResponse;
    this.tokens = this.toTokenPair(res);
    this.user = res.user;
    await this.persistTokens();
    this.scheduleRefresh(this.tokens.expiresAt);
    this.emit('signedIn', res.user);
    return { tokens: this.tokens, user: res.user };
  }

  async passkeyList(): Promise<PasskeyCredential[]> {
    return this.requestAuth('GET', '/v1/auth/passkeys') as Promise<PasskeyCredential[]>;
  }

  async passkeyDelete(credentialId: string): Promise<void> {
    await this.requestAuth('DELETE', `/v1/auth/passkeys/${credentialId}`);
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
      this.storage.removeItem(this.storageKey).catch(() => {});
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
      await this.storage.setItem(this.storageKey, JSON.stringify(this.tokens));
    }
  }

  private toTokenPair(res: ApiAuthResponse): TokenPair {
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: Date.now() + res.expiresIn * 1000,
    };
  }

  private async requestAuth(method: string, path: string, body?: unknown): Promise<unknown> {
    if (!this.tokens?.accessToken) throw new Error('Must be signed in');
    return this.request(method, path, body);
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
