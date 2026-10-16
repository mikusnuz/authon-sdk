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
  OAuthErrorResponse,
  AuthonEventType,
  AuthonEvents,
} from './types';
import { AuthonMfaRequiredError } from './types';
import { createPkcePair, parseOAuthCallback } from './pkce';

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

interface PendingOAuthFlow {
  verifier: string;
  createdAt: number;
  waiters: Array<{
    resolve: (value: { tokens: TokenPair; user: AuthonUser }) => void;
    reject: (error: Error) => void;
  }>;
}

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
  private refreshRetryCount = 0;
  private static readonly MAX_REFRESH_RETRIES = 3;
  private static readonly RETRY_DELAYS = [3, 10, 30]; // seconds
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  // Cached provider/branding data
  private _providers: OAuthProviderType[] = [];
  private _branding: BrandingConfig | null = null;
  private _initialized = false;
  private oauthReturnTo: string | undefined;
  /** In-flight OAuth sign-ins by state. The PKCE verifier never leaves this object. */
  private oauthFlows = new Map<string, PendingOAuthFlow>();

  constructor(config: AuthonReactNativeConfig) {
    this.publishableKey = config.publishableKey;
    this.oauthReturnTo = config.oauthReturnTo;
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

  /**
   * Second step of a sign-in that answered mfaRequired (password sign-in, or OAuth via
   * AuthonMfaRequiredError): trade the mfaToken plus the user's TOTP or backup code for a session.
   */
  async verifyMfa(mfaToken: string, code: string): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const res = (await this.request('POST', '/v1/auth/mfa/verify', { mfaToken, code })) as ApiAuthResponse;
    if (!res?.accessToken || !res.refreshToken || !res.user) throw new Error('Invalid MFA response');
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
          this.refreshRetryCount = 0;
          this.clearSession();
          this.emit('signedOut');
          return null;
        }
        // Other errors (500, network) — retry with backoff
        this.retryRefresh();
        return null;
      }

      const data = (await res.json()) as ApiAuthResponse;
      this.refreshRetryCount = 0;
      this.tokens = this.toTokenPair(data);
      this.user = data.user;
      await this.persistTokens();
      this.scheduleRefresh(this.tokens.expiresAt);
      this.emit('tokenRefreshed');
      return this.tokens;
    } catch {
      // Network error — retry with backoff, do NOT clear session
      this.retryRefresh();
      return null;
    }
  }

  private retryRefresh(): void {
    const delay = this.refreshRetryCount < AuthonMobileClient.MAX_REFRESH_RETRIES
      ? AuthonMobileClient.RETRY_DELAYS[
          Math.min(this.refreshRetryCount, AuthonMobileClient.RETRY_DELAYS.length - 1)
        ]
      : 60; // slow retry after fast retries exhausted — network likely down
    this.refreshRetryCount++;
    this.clearRefreshTimer();
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(() => {});
    }, delay * 1000);
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

  /**
   * Starts an OAuth sign-in. Returns the provider URL to open (use an auth session such as
   * expo-web-browser `openAuthSessionAsync(url, returnTo)`) and the flow state.
   *
   * `returnTo` (or `oauthReturnTo` in the config) must be your app's deep link, e.g.
   * `myapp://oauth-callback`, with the scheme listed in the project's allowed origins
   * (`myapp://`), or an https bridge page on an allowed origin that forwards the query to the
   * deep link. Authon sends a one-time code there; only this client, which holds the PKCE
   * verifier, can trade it for a session.
   */
  async getOAuthUrl(
    provider: string,
    options?: string | StartOAuthOptions,
  ): Promise<{ url: string; state: string }> {
    const normalized =
      typeof options === 'string'
        ? { redirectUri: options }
        : (options ?? {});
    const returnTo = normalized.returnTo || this.oauthReturnTo;
    if (!returnTo) {
      throw new Error(
        'Authon OAuth needs returnTo: pass startOAuth(provider, { returnTo: "myapp://oauth-callback" }) or set oauthReturnTo on AuthonProvider, and add "myapp://" to the project\'s allowed origins.',
      );
    }
    const redirectUri = normalized.redirectUri || `${this.apiUrl}/v1/auth/oauth/redirect`;
    const pkce = createPkcePair();
    const params = new URLSearchParams({
      redirectUri,
      flow: 'redirect',
      returnTo,
      codeChallenge: pkce.challenge,
      codeChallengeMethod: 'S256',
    });
    const result = (await this.request(
      'GET',
      `/v1/auth/oauth/${provider}/url?${params.toString()}`,
    )) as { url: string; state: string };
    this.pruneOAuthFlows();
    this.oauthFlows.set(result.state, { verifier: pkce.verifier, createdAt: Date.now(), waiters: [] });
    return result;
  }

  /** Status of a flow: pending, completed or error. Never returns tokens or codes. */
  async pollOAuth(state: string): Promise<OAuthErrorResponse | { status: 'pending' | 'completed' } | null> {
    try {
      const res = await fetch(
        `${this.apiUrl}/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`,
        { headers: { 'x-api-key': this.publishableKey } },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as Record<string, unknown>;
      if (data.status === 'error') {
        return {
          status: 'error',
          message: typeof data.message === 'string' ? data.message : 'OAuth failed',
        };
      }
      if (data.status === 'completed') return { status: 'completed' };
      return { status: 'pending' };
    } catch {
      return null;
    }
  }

  /**
   * Finishes an OAuth sign-in from the callback URL your app received (deep link), exchanging the
   * one-time code with this client's PKCE verifier.
   * Throws AuthonMfaRequiredError (and emits `mfaRequired`) when the user has MFA enabled; finish
   * with verifyMfa(error.mfaToken, code).
   */
  async handleOAuthCallback(url: string): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    const parsed = parseOAuthCallback(url);
    if (!parsed?.state) throw new Error('Not an Authon OAuth callback URL');
    const flow = this.oauthFlows.get(parsed.state);
    if (!flow) throw new Error('No OAuth sign-in in progress for this callback');
    this.oauthFlows.delete(parsed.state);
    const settle = (error: Error | null, value?: { tokens: TokenPair; user: AuthonUser }) => {
      for (const waiter of flow.waiters) {
        if (error) waiter.reject(error);
        else waiter.resolve(value!);
      }
    };
    try {
      if (parsed.error || !parsed.code) throw new Error(parsed.error || 'OAuth failed');
      const res = (await this.request('POST', '/v1/auth/oauth/token', {
        code: parsed.code,
        codeVerifier: flow.verifier,
      })) as ApiAuthResponse & { mfaRequired?: boolean; mfaToken?: string; mfaMethods?: string[] };
      if (res.mfaRequired) {
        if (typeof res.mfaToken !== 'string' || !res.mfaToken) throw new Error('Invalid MFA response');
        this.emit('mfaRequired', res.mfaToken);
        throw new AuthonMfaRequiredError(res.mfaToken, Array.isArray(res.mfaMethods) ? res.mfaMethods : ['totp']);
      }
      this.tokens = this.toTokenPair(res);
      this.user = res.user;
      await this.persistTokens();
      this.scheduleRefresh(this.tokens.expiresAt);
      this.emit('signedIn', res.user);
      const value = { tokens: this.tokens, user: res.user };
      settle(null, value);
      return value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      settle(error);
      throw error;
    }
  }

  /**
   * Completes OAuth. Pass the callback URL your app received to finish immediately, or the
   * state to wait (3 minute timeout) until handleOAuthCallback(url) is called with it.
   * The state alone can no longer fetch tokens from Authon.
   */
  async completeOAuth(stateOrCallbackUrl: string): Promise<{ tokens: TokenPair; user: AuthonUser }> {
    if (stateOrCallbackUrl.includes('://') || stateOrCallbackUrl.includes('?')) {
      return this.handleOAuthCallback(stateOrCallbackUrl);
    }
    const state = stateOrCallbackUrl;
    const flow = this.oauthFlows.get(state);
    if (!flow) throw new Error('No OAuth sign-in in progress for this state');
    return new Promise((resolve, reject) => {
      let done = false;
      const timeout = setTimeout(() => finish(new Error('OAuth timeout')), 180_000);
      const poll = setInterval(async () => {
        const status = await this.pollOAuth(state);
        if (status?.status === 'error') finish(new Error(status.message || 'OAuth failed'));
      }, 1500);
      const finish = (error: Error | null, value?: { tokens: TokenPair; user: AuthonUser }) => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        clearInterval(poll);
        if (error) {
          if (this.oauthFlows.get(state) === flow) this.oauthFlows.delete(state);
          reject(error);
        } else resolve(value!);
      };
      flow.waiters.push({ resolve: (value) => finish(null, value), reject: (error) => finish(error) });
    });
  }

  private pruneOAuthFlows(): void {
    const now = Date.now();
    for (const [state, flow] of this.oauthFlows) {
      if (now - flow.createdAt > 10 * 60 * 1000) this.oauthFlows.delete(state);
    }
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
      mfaCapable: true,
    })) as ApiAuthResponse & { mfaRequired?: boolean; mfaToken?: string; mfaMethods?: string[] };
    if (res.mfaRequired) {
      // Account has a second factor: finish with verifyMfa(error.mfaToken, code), as for password/OAuth.
      if (typeof res.mfaToken !== 'string' || !res.mfaToken) throw new Error('Invalid MFA response');
      this.emit('mfaRequired', res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken, Array.isArray(res.mfaMethods) ? res.mfaMethods : ['totp']);
    }
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
      mfaCapable: true,
    })) as ApiAuthResponse & { mfaRequired?: boolean; mfaToken?: string; mfaMethods?: string[] };
    if (res.mfaRequired) {
      // Account has a second factor: finish with verifyMfa(error.mfaToken, code), as for password/OAuth.
      if (typeof res.mfaToken !== 'string' || !res.mfaToken) throw new Error('Invalid MFA response');
      this.emit('mfaRequired', res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken, Array.isArray(res.mfaMethods) ? res.mfaMethods : ['totp']);
    }
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
    this.refreshRetryCount = 0;
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
