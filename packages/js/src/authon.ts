import type {
  AuthonUser,
  AuthonOrganization,
  OrganizationMember,
  OrganizationInvitation,
  OrganizationListResponse,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  InviteMemberParams,
  AuthTokens,
  AuthorizationCodeOptions,
  AuthorizationCodeResult,
  BrandingConfig,
  MfaSetupResponse,
  MfaStatus,
  OAuthProviderType,
  PasskeyCredential,
  SessionInfo,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
} from '@authon/shared';
import type {
  AuthonConfig,
  AuthonEventType,
  AuthonEvents,
  OAuthFlowMode,
  OAuthSignInOptions,
  OpenSignInOptions,
  SendMagicLinkOptions,
  PendingMagicLink,
  MagicLinkConfirmationReason,
} from './types';
import { AuthonMfaRequiredError } from './types';
import { ModalRenderer } from './modal';
import { ProfileRenderer } from './profile';
import { SessionManager } from './session';
import type { SessionChangeListener } from './session';
import { generateQrSvg } from './qrcode';
import { AuthonWalletError, WalletClient } from './wallet';
import {
  OAUTH_CODE_PARAM,
  OAUTH_ERROR_PARAM,
  OAUTH_POPUP_PARAM,
  OAUTH_STATE_PARAM,
  createPkcePair,
  currentReturnUrl,
  generateCodeVerifier,
  handoffKey,
  pruneHandoffs,
  saveRedirectVerifier,
  takeHandoff,
  takeRedirectVerifier,
  writeHandoff,
} from './oauth-pkce';
import type { OAuthHandoff } from './oauth-pkce';

const DEFAULT_API_URL = 'https://api.authon.dev';
const DEFAULT_WALLET_ORIGIN = 'https://wallet.authon.dev';
/** Query flag Authon adds to magic links; `token` alone is too generic to claim. */
export const MAGIC_LINK_PARAM = 'authon_magic_link';

/** Body Authon returns instead of a session when the account has a second factor (any sign-in method). */
interface MfaRequiredResponse {
  mfaRequired: true;
  mfaToken: string;
  mfaMethods?: string[];
}

function isMfaRequired(value: unknown): value is MfaRequiredResponse {
  return !!value && typeof value === 'object'
    && (value as { mfaRequired?: unknown }).mfaRequired === true
    && typeof (value as { mfaToken?: unknown }).mfaToken === 'string';
}

type PasswordlessVerifyResponse = AuthTokens | AuthorizationCodeResult | MfaRequiredResponse;
/** What /verify returns instead of a session when the link must be confirmed first. */
interface MagicLinkConfirmationResponse {
  status: 'confirmation_required';
  email: string;
  reason?: MagicLinkConfirmationReason;
}
type MagicLinkVerifyResponse = PasswordlessVerifyResponse | MagicLinkConfirmationResponse;

function isMagicLinkConfirmation(value: unknown): value is MagicLinkConfirmationResponse {
  return !!value && typeof value === 'object'
    && (value as { status?: unknown }).status === 'confirmation_required'
    && typeof (value as { email?: unknown }).email === 'string';
}

/**
 * In-flight magic link verifications, shared by every Authon instance on the page (React strict
 * mode and app code calling verifyPasswordless({ token }) must not consume the same link twice).
 * Keys end in `|load` (page-load check, finishes only in the requesting browser) or `|confirm`.
 */
const magicLinkResponses = new Map<string, Promise<MagicLinkVerifyResponse>>();

/**
 * Magic link token taken from this page's URL, per apiUrl|publishableKey, until its page-load check
 * settles. The first instance strips the URL at once, so a second instance created meanwhile
 * (React strict mode) joins the same check instead of seeing no link.
 */
const pageMagicLinkTokens = new Map<string, string>();

/** localStorage key of the random value that ties a requested magic link to this browser. */
const MAGIC_LINK_NONCE_KEY = 'authon_magic_link_nonce:';

interface ProvidersResponse {
  providers: OAuthProviderType[];
  providerConfigs?: Partial<Record<OAuthProviderType, { oauthFlow?: OAuthFlowMode }>>;
}

export class Authon {
  private publishableKey: string;
  private config: Required<Omit<AuthonConfig, 'containerId' | 'appearance' | 'wallet'>> & {
    containerId?: string;
    appearance?: Partial<BrandingConfig>;
  };
  private session: SessionManager;
  readonly wallet: WalletClient;
  private walletAutoCreate: boolean;
  private walletEnabled = true;
  private modal: ModalRenderer | null = null;
  private profile: ProfileRenderer | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private branding: BrandingConfig | null = null;
  private providers: OAuthProviderType[] = [];
  private providerFlowModes: Partial<Record<OAuthProviderType, OAuthFlowMode>> = {};
  private initialized = false;
  private captchaEnabled = false;
  private turnstileSiteKey = '';
  private authorizationContext: { options: AuthorizationCodeOptions; requestId: string } | null = null;
  private verificationToken: string | null = null;
  private magicLinkResult: Promise<AuthonUser | null> | null = null;
  private pendingMagicLink: (PendingMagicLink & { token: string }) | null = null;

  constructor(publishableKey: string, config?: AuthonConfig) {
    this.publishableKey = publishableKey;
    this.config = {
      apiUrl: config?.apiUrl || DEFAULT_API_URL,
      mode: config?.mode || 'popup',
      theme: config?.theme || 'auto',
      locale: config?.locale || 'en',
      containerId: config?.containerId,
      appearance: config?.appearance,
      sessionMode: config?.sessionMode || 'browser',
      autoHandleMagicLink: config?.autoHandleMagicLink !== false,
    };
    this.session = new SessionManager(publishableKey, this.config.apiUrl, this.config.sessionMode);
    const walletOrigin = config?.wallet?.origin
      || (this.config.apiUrl.replace(/\/+$/, '') === DEFAULT_API_URL ? DEFAULT_WALLET_ORIGIN : null);
    this.walletAutoCreate = !!config?.wallet?.autoCreate;
    this.wallet = new WalletClient({
      publishableKey,
      walletOrigin: walletOrigin ? new URL(walletOrigin).origin : null,
      getToken: config?.wallet?.getToken
        ? async () => (await config.wallet!.getToken!()) ?? null
        : async () => ((await this.ensureValidToken()) ? this.session.getToken() : null),
      ui: config?.wallet?.ui,
    });
    this.wallet.onChange((wallet) => this.emit('walletChanged', wallet));
    this.session.subscribe((change) => {
      this.emit('sessionChanged', change);
      if (change.reason === 'setSession' && change.user) {
        this.emit('signedIn', change.user);
        if (this.walletAutoCreate) void this.autoCreateWallet();
      } else if (change.reason === 'tokenRefresh' && change.accessToken) {
        this.emit('tokenRefreshed', change.accessToken);
      } else if (
        change.reason === 'clearSession'
        || change.reason === 'signOut'
        || change.reason === 'refreshFailed'
      ) {
        this.wallet.dispose();
        this.emit('signedOut');
      }
    });
    if (this.config.sessionMode === 'browser') {
      this.consumeRedirectResultFromUrl();
      if (this.config.autoHandleMagicLink) this.magicLinkResult = this.consumeMagicLinkFromUrl();
    }
  }

  // ── Public API ──

  async getProviders(): Promise<OAuthProviderType[]> {
    await this.ensureInitialized();
    return [...this.providers];
  }

  async openSignIn(options?: OpenSignInOptions): Promise<void> {
    await this.ensureInitialized();
    await this.prepareAuthorization(options);
    this.getModal().open('signIn');
  }

  async openSignUp(options?: OpenSignInOptions): Promise<void> {
    await this.ensureInitialized();
    await this.prepareAuthorization(options);
    this.getModal().open('signUp');
  }

  private async prepareAuthorization(options?: OpenSignInOptions): Promise<void> {
    this.authorizationContext = null;
    this.verificationToken = null;
    if (!options || options.responseType !== 'code') return;
    if (this.config.sessionMode !== 'bff') {
      throw new Error("Authorization code flow requires sessionMode: 'bff'");
    }
    if (options.codeChallengeMethod !== 'S256') throw new Error('Only S256 PKCE is supported');
    const result = await this.apiPost<{ authorizationRequestId: string; expiresIn: number }>(
      '/v1/auth/authorize',
      options,
    );
    this.authorizationContext = {
      options: { ...options },
      requestId: result.authorizationRequestId,
    };
  }

  private authorizationRequestBody(): { authorizationRequestId?: string } {
    return this.authorizationContext ? { authorizationRequestId: this.authorizationContext.requestId } : {};
  }

  /**
   * Every sign-in path (password, magic link, email code, wallet, passkey, OAuth) ends here. An
   * `mfaRequired` body is handled the same way for all of them: `mfaRequired` event +
   * AuthonMfaRequiredError carrying the token for `verifyMfa()`. In authorization code mode the
   * request stays open and `verifyMfa()` finishes it.
   */
  private handleAuthCompletion(response: AuthTokens | AuthorizationCodeResult | MfaRequiredResponse): AuthonUser {
    if (isMfaRequired(response)) {
      this.emit('mfaRequired', response.mfaToken);
      throw new AuthonMfaRequiredError(response.mfaToken);
    }
    if (this.authorizationContext) {
      const candidate = response as Partial<AuthTokens & AuthorizationCodeResult>;
      if (candidate.accessToken || candidate.refreshToken || !candidate.authorizationCode) {
        throw new Error('Authon returned an unsafe token response for authorization code mode');
      }
      if (candidate.state !== this.authorizationContext.options.state) {
        throw new Error('Authorization state mismatch');
      }
      if (!Number.isFinite(candidate.expiresIn) || candidate.expiresIn! <= 0 || candidate.expiresIn! > 60) {
        throw new Error('Invalid authorization code expiry');
      }
      const result: AuthorizationCodeResult = {
        authorizationCode: candidate.authorizationCode,
        state: candidate.state,
        expiresIn: candidate.expiresIn!,
      };
      const redirect = new URL(this.authorizationContext.options.redirectUri);
      redirect.searchParams.set('code', result.authorizationCode);
      redirect.searchParams.set('state', result.state);
      redirect.searchParams.set('expires_in', String(result.expiresIn));
      this.authorizationContext = null;
      this.verificationToken = null;
      this.emit('authorizationCompleted', result);
      window.location.assign(redirect.toString());
      return result as unknown as AuthonUser;
    }
    const tokens = response as AuthTokens;
    if (!tokens.accessToken || !tokens.refreshToken || !tokens.user) throw new Error('Invalid token response');
    this.session.setSession(tokens);
    return tokens.user;
  }

  async openProfile(): Promise<void> {
    const user = this.getUser();
    if (!user) throw new Error('Must be signed in to open profile');

    const token = this.session.getToken();
    let sessions: import('@authon/shared').SessionInfo[] = [];
    if (token) {
      try {
        sessions = await this.listSessions();
      } catch (_) {
        // non-fatal: show profile without sessions
      }
    }

    if (!this.profile) {
      this.profile = new ProfileRenderer({
        mode: this.config.mode,
        theme: this.config.theme,
        locale: this.config.locale,
        containerId: this.config.containerId,
        branding: this.branding || undefined,
        user,
        sessions,
        onSave: async (data) => {
          const updated = await this.updateProfile(data);
          this.profile?.updateUser(updated);
        },
        onSignOut: async () => {
          await this.signOut();
          this.profile = null;
        },
        onRevokeSession: async (sessionId: string) => {
          await this.revokeSession(sessionId);
        },
        onClose: () => {
          this.profile?.close();
          this.profile = null;
        },
      });
    } else {
      this.profile.updateUser(user);
      this.profile.updateSessions(sessions);
    }

    this.profile.open();
  }

  closeProfile(): void {
    this.profile?.close();
    this.profile = null;
  }

  /** Update theme at runtime without destroying form state */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.getModal().setTheme(theme);
    this.profile?.setTheme(theme);
  }

  async signInWithOAuth(provider: OAuthProviderType, options?: OAuthSignInOptions): Promise<void> {
    await this.ensureInitialized();
    await this.startOAuthFlow(provider, options);
  }

  async signInWithEmail(email: string, password: string, turnstileToken?: string): Promise<AuthonUser | { needsVerification: true; email: string }> {
    const body: Record<string, string> = { email, password, ...this.authorizationRequestBody() };
    if (turnstileToken) body.turnstileToken = turnstileToken;
    const res = await this.apiPost<(AuthTokens | AuthorizationCodeResult) & { mfaRequired?: boolean; mfaToken?: string; needsVerification?: boolean; email?: string; verificationToken?: string }>(
      '/v1/auth/signin',
      body,
    );
    if (res.needsVerification) {
      const verificationEmail = res.email || email;
      this.verificationToken = res.verificationToken ?? null;
      this.emit('verificationRequired', verificationEmail);
      return { needsVerification: true, email: verificationEmail };
    }
    if (res.mfaRequired && res.mfaToken) {
      this.emit('mfaRequired', res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken);
    }
    return this.handleAuthCompletion(res);
  }

  async signUpWithEmail(
    email: string,
    password: string,
    meta?: { displayName?: string; turnstileToken?: string },
  ): Promise<AuthonUser | { needsVerification: true; email: string }> {
    const res = await this.apiPost<(AuthTokens | AuthorizationCodeResult) & { needsVerification?: boolean; email?: string; verificationToken?: string }>('/v1/auth/signup', {
      email,
      password,
      ...meta,
      ...this.authorizationRequestBody(),
    });
    if (res.needsVerification) {
      const verificationEmail = res.email || email;
      this.verificationToken = res.verificationToken ?? null;
      this.emit('verificationRequired', verificationEmail);
      return { needsVerification: true, email: verificationEmail };
    }
    return this.handleAuthCompletion(res);
  }

  async verifyEmail(email: string, code: string): Promise<AuthonUser> {
    const res = await this.apiPost<AuthTokens | AuthorizationCodeResult>('/v1/auth/verify-email', {
      email,
      code,
      ...(this.verificationToken ? { verificationToken: this.verificationToken } : {}),
    });
    return this.handleAuthCompletion(res);
  }

  async resendVerificationCode(email: string): Promise<void> {
    const result = await this.apiPost<{ sent: true; verificationToken?: string }>('/v1/auth/resend-code', {
      email,
      ...this.authorizationRequestBody(),
    });
    if (result.verificationToken) this.verificationToken = result.verificationToken;
  }

  async signOut(): Promise<void> {
    await this.session.signOut();
  }

  getUser(): AuthonUser | null {
    return this.session.getUser();
  }

  getToken(): string | null {
    return this.session.getToken();
  }

  /** Whether persisted session validation (including any required refresh) has completed. */
  isReady(): boolean {
    return this.session.isReady();
  }

  /** Wait until persisted session validation (including any required refresh) has completed. */
  waitUntilReady(): Promise<void> {
    return this.session.waitUntilReady();
  }

  /** Check if the current access token is valid (JWT exp not passed) */
  isTokenValid(): boolean {
    return this.session.isTokenValid();
  }

  /** Ensure a valid token is available — refreshes if expired. Returns true if a valid token exists after the call. */
  async ensureValidToken(): Promise<boolean> {
    if (this.session.isTokenValid()) return true;
    const result = await this.session.refresh();
    return result !== null;
  }

  on<K extends AuthonEventType>(event: K, listener: AuthonEvents[K]): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const set = this.listeners.get(event)!;
    set.add(listener as (...args: unknown[]) => void);
    return () => set.delete(listener as (...args: unknown[]) => void);
  }

  /** Subscribe to every session mutation with its reason and validated public snapshot. */
  onSessionChange(listener: SessionChangeListener): () => void {
    return this.on('sessionChanged', listener);
  }

  // ── MFA ──

  async setupMfa(): Promise<MfaSetupResponse & { qrCodeSvg: string }> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to setup MFA');
    const res = await this.apiPostAuth<MfaSetupResponse>('/v1/auth/mfa/totp/setup', undefined, token);
    return { ...res, qrCodeSvg: generateQrSvg(res.qrCodeUri) };
  }

  async verifyMfaSetup(code: string): Promise<void> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to verify MFA setup');
    await this.apiPostAuth<{ success: boolean }>('/v1/auth/mfa/totp/verify-setup', { code }, token);
  }

  async verifyMfa(mfaToken: string, code: string): Promise<AuthonUser> {
    const res = await this.apiPost<AuthTokens | AuthorizationCodeResult>('/v1/auth/mfa/verify', { mfaToken, code });
    return this.handleAuthCompletion(res);
  }

  async disableMfa(code: string): Promise<void> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to disable MFA');
    await this.apiPostAuth<{ success: boolean }>('/v1/auth/mfa/disable', { code }, token);
  }

  async getMfaStatus(): Promise<MfaStatus> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to get MFA status');
    const res = await fetch(`${this.config.apiUrl}/v1/auth/mfa/status`, {
      headers: {
        'x-api-key': this.publishableKey,
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, '/v1/auth/mfa/status'));
    return res.json();
  }

  async regenerateBackupCodes(code: string): Promise<string[]> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to regenerate backup codes');
    const res = await this.apiPostAuth<{ backupCodes: string[] }>(
      '/v1/auth/mfa/backup-codes/regenerate',
      { code },
      token,
    );
    return res.backupCodes;
  }

  // ── Passwordless ──

  async sendMagicLink(email: string, options?: SendMagicLinkOptions): Promise<void> {
    const redirectUrl = options?.redirectUrl ?? this.magicLinkReturnUrl();
    // Code mode links finish on the Authon server and are bound by PKCE/state instead.
    const previousNonce = this.readMagicLinkNonce();
    const browserNonce = this.authorizationContext ? null : this.createMagicLinkNonce();
    try {
      await this.apiPost<{ message: string }>('/v1/auth/passwordless/magic-link', {
        email,
        ...(redirectUrl ? { redirectUrl } : {}),
        ...(browserNonce ? { browserNonce } : {}),
        ...this.authorizationRequestBody(),
      });
    } catch (err) {
      // No new link was sent, so an earlier link from this browser must keep working.
      if (browserNonce) this.restoreMagicLinkNonce(previousNonce);
      throw err;
    }
  }

  /**
   * Finish a magic link sign-in from the current URL. With `autoHandleMagicLink` on (default) this
   * returns the verification already started on page load. Resolves to null when the URL has no link,
   * the link could not be used (the reason is emitted as an `error` event), or the link needs the
   * person's confirmation first (see `getPendingMagicLink()` / `magicLinkConfirmationRequired`).
   */
  handleMagicLink(): Promise<AuthonUser | null> {
    if (!this.magicLinkResult) this.magicLinkResult = this.consumeMagicLinkFromUrl();
    return this.magicLinkResult;
  }

  /**
   * The magic link from this page that was not used automatically because it was requested in
   * another browser, or someone is already signed in here. Show "Sign in as {email}?" and call
   * `confirmMagicLink()` or `dismissMagicLink()`.
   */
  getPendingMagicLink(): PendingMagicLink | null {
    if (!this.pendingMagicLink) return null;
    return { email: this.pendingMagicLink.email, reason: this.pendingMagicLink.reason };
  }

  /** Sign in with the pending magic link after the person agreed. Replaces any current session. */
  async confirmMagicLink(): Promise<AuthonUser> {
    const pending = this.pendingMagicLink;
    if (!pending) throw new Error('No magic link is waiting for confirmation');
    const user = await this.verifyPasswordless({ token: pending.token });
    if (this.pendingMagicLink?.token === pending.token) this.pendingMagicLink = null;
    return user;
  }

  /** Forget the pending magic link without signing in. The link itself stays unused. */
  dismissMagicLink(): void {
    this.pendingMagicLink = null;
  }

  async sendEmailOtp(email: string): Promise<void> {
    await this.apiPost<{ message: string }>('/v1/auth/passwordless/email-otp', { email, ...this.authorizationRequestBody() });
  }

  async verifyPasswordless(options: {
    token?: string;
    email?: string;
    code?: string;
  }): Promise<AuthonUser> {
    if (options.token && !options.email && !options.code) {
      // An explicit call is the app's (or person's) decision, so no same-browser check. If the
      // page-load check for this link already signed in, reuse that instead of a second request.
      const base = this.magicLinkRequestKey(options.token);
      const onLoad = magicLinkResponses.get(`${base}|load`);
      if (onLoad) {
        const loaded = await onLoad.catch(() => null);
        if (loaded && !isMagicLinkConfirmation(loaded)) return this.handleAuthCompletion(loaded);
      }
      const res = await this.sharedMagicLinkRequest(`${base}|confirm`, { token: options.token });
      if (isMagicLinkConfirmation(res)) throw new Error('Magic link needs confirmation');
      if (this.pendingMagicLink?.token === options.token) this.pendingMagicLink = null;
      return this.handleAuthCompletion(res);
    }
    const res = await this.apiPost<PasswordlessVerifyResponse>('/v1/auth/passwordless/verify', { ...options, mfaCapable: true });
    return this.handleAuthCompletion(res);
  }

  // ── Passkeys ──

  async registerPasskey(name?: string): Promise<PasskeyCredential> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to register a passkey');

    const options = await this.apiPostAuth<Record<string, unknown>>(
      '/v1/auth/passkeys/register/options',
      undefined,
      token,
    );

    const credential = await navigator.credentials.create({
      publicKey: this.deserializeCreationOptions(this.unwrapWebAuthnOptions(options)),
    }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey registration was cancelled');

    const attestation = credential.response as AuthenticatorAttestationResponse;
    const transports = typeof attestation.getTransports === 'function' ? attestation.getTransports() : undefined;
    const result = await this.apiPostAuth<PasskeyCredential>(
      '/v1/auth/passkeys/register/verify',
      {
        response: {
          ...this.credentialBase(credential),
          response: {
            attestationObject: this.bufferToBase64url(attestation.attestationObject),
            clientDataJSON: this.bufferToBase64url(attestation.clientDataJSON),
            ...(transports && transports.length > 0 ? { transports } : {}),
          },
        },
        ...(name ? { name } : {}),
      },
      token,
    );

    this.emit('passkeyRegistered', result);
    return result;
  }

  async authenticateWithPasskey(email?: string): Promise<AuthonUser> {
    const options = await this.apiPost<Record<string, unknown>>(
      '/v1/auth/passkeys/authenticate/options',
      { ...(email ? { email } : {}), ...this.authorizationRequestBody() },
    );

    const credential = await navigator.credentials.get({
      publicKey: this.deserializeRequestOptions(this.unwrapWebAuthnOptions(options)),
    }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey sign-in was cancelled');

    const assertion = credential.response as AuthenticatorAssertionResponse;
    const res = await this.apiPost<AuthTokens | AuthorizationCodeResult>('/v1/auth/passkeys/authenticate/verify', {
      response: {
        ...this.credentialBase(credential),
        response: {
          authenticatorData: this.bufferToBase64url(assertion.authenticatorData),
          clientDataJSON: this.bufferToBase64url(assertion.clientDataJSON),
          signature: this.bufferToBase64url(assertion.signature),
          ...(assertion.userHandle ? { userHandle: this.bufferToBase64url(assertion.userHandle) } : {}),
        },
      },
    });

    return this.handleAuthCompletion(res);
  }

  async listPasskeys(): Promise<PasskeyCredential[]> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to list passkeys');
    return this.apiGetAuth<PasskeyCredential[]>('/v1/auth/passkeys', token);
  }

  async renamePasskey(passkeyId: string, name: string): Promise<PasskeyCredential> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to rename a passkey');
    return this.apiPatchAuth<PasskeyCredential>(`/v1/auth/passkeys/${passkeyId}`, { name }, token);
  }

  async revokePasskey(passkeyId: string): Promise<void> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to revoke a passkey');
    await this.apiDeleteAuth(`/v1/auth/passkeys/${passkeyId}`, token);
  }

  // ── Web3 ──

  async web3GetNonce(
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
    chainId?: number,
  ): Promise<Web3NonceResponse> {
    return this.apiPost<Web3NonceResponse>('/v1/auth/web3/nonce', {
      address,
      chain,
      walletType,
      ...(chainId != null ? { chainId } : {}),
      ...this.authorizationRequestBody(),
    });
  }

  async web3Verify(
    message: string,
    signature: string,
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
  ): Promise<AuthonUser> {
    const res = await this.apiPost<AuthTokens | AuthorizationCodeResult | MfaRequiredResponse>('/v1/auth/web3/verify', {
      message,
      signature,
      address,
      chain,
      walletType,
      mfaCapable: true,
    });
    return this.handleAuthCompletion(res);
  }

  async listWallets(): Promise<Web3Wallet[]> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to list wallets');
    return this.apiGetAuth<Web3Wallet[]>('/v1/auth/web3/wallets', token);
  }

  async linkWallet(params: {
    address: string;
    chain: Web3Chain;
    walletType: Web3WalletType;
    chainId?: number;
    message: string;
    signature: string;
  }): Promise<Web3Wallet> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to link a wallet');
    const wallet = await this.apiPostAuth<Web3Wallet>('/v1/auth/web3/wallets/link', params, token);
    this.emit('web3Connected', wallet);
    return wallet;
  }

  async unlinkWallet(walletId: string): Promise<void> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to unlink a wallet');
    await this.apiDeleteAuth(`/v1/auth/web3/wallets/${walletId}`, token);
  }

  // ── User Profile ──

  async updateProfile(data: {
    displayName?: string;
    avatarUrl?: string;
    phone?: string;
    publicMetadata?: Record<string, unknown>;
  }): Promise<AuthonUser> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to update profile');
    const user = await this.apiPatchAuth<AuthonUser>('/v1/auth/me', data, token);
    this.session.updateUser(user);
    return user;
  }

  // ── Session Management ──

  async listSessions(): Promise<SessionInfo[]> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to list sessions');
    return this.apiGetAuth<SessionInfo[]>('/v1/auth/me/sessions', token);
  }

  async revokeSession(sessionId: string): Promise<void> {
    const token = this.session.getToken();
    if (!token) throw new Error('Must be signed in to revoke a session');
    await this.apiDeleteAuth(`/v1/auth/me/sessions/${sessionId}`, token);
  }

  // ── Organizations ──

  organizations = {
    list: async (): Promise<OrganizationListResponse> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to list organizations');
      return this.apiGetAuth<OrganizationListResponse>('/v1/auth/organizations', token);
    },

    create: async (params: CreateOrganizationParams): Promise<AuthonOrganization> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to create an organization');
      return this.apiPostAuth<AuthonOrganization>('/v1/auth/organizations', params, token);
    },

    get: async (orgId: string): Promise<AuthonOrganization> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to get organization');
      return this.apiGetAuth<AuthonOrganization>(`/v1/auth/organizations/${orgId}`, token);
    },

    update: async (orgId: string, params: UpdateOrganizationParams): Promise<AuthonOrganization> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to update organization');
      return this.apiPatchAuth<AuthonOrganization>(`/v1/auth/organizations/${orgId}`, params, token);
    },

    delete: async (orgId: string): Promise<void> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to delete organization');
      await this.apiDeleteAuth(`/v1/auth/organizations/${orgId}`, token);
    },

    getMembers: async (orgId: string): Promise<OrganizationMember[]> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to get organization members');
      return this.apiGetAuth<OrganizationMember[]>(`/v1/auth/organizations/${orgId}/members`, token);
    },

    invite: async (orgId: string, params: InviteMemberParams): Promise<OrganizationInvitation> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to invite a member');
      return this.apiPostAuth<OrganizationInvitation>(`/v1/auth/organizations/${orgId}/invitations`, params, token);
    },

    getInvitations: async (orgId: string): Promise<OrganizationInvitation[]> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to get invitations');
      return this.apiGetAuth<OrganizationInvitation[]>(`/v1/auth/organizations/${orgId}/invitations`, token);
    },

    acceptInvitation: async (token: string): Promise<OrganizationMember> => {
      const authToken = this.session.getToken();
      if (!authToken) throw new Error('Must be signed in to accept an invitation');
      return this.apiPostAuth<OrganizationMember>(`/v1/auth/organizations/invitations/${token}/accept`, undefined, authToken);
    },

    rejectInvitation: async (token: string): Promise<void> => {
      const authToken = this.session.getToken();
      if (!authToken) throw new Error('Must be signed in to reject an invitation');
      await this.apiPostAuth<void>(`/v1/auth/organizations/invitations/${token}/reject`, undefined, authToken);
    },

    removeMember: async (orgId: string, memberId: string): Promise<void> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to remove a member');
      await this.apiDeleteAuth(`/v1/auth/organizations/${orgId}/members/${memberId}`, token);
    },

    updateMemberRole: async (orgId: string, memberId: string, role: string): Promise<OrganizationMember> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to update member role');
      return this.apiPatchAuth<OrganizationMember>(`/v1/auth/organizations/${orgId}/members/${memberId}`, { role }, token);
    },

    leave: async (orgId: string): Promise<void> => {
      const token = this.session.getToken();
      if (!token) throw new Error('Must be signed in to leave organization');
      await this.apiPostAuth<void>(`/v1/auth/organizations/${orgId}/leave`, undefined, token);
    },
  };

  /** Testing utilities — only available when initialized with a pk_test_ key */
  get testing(): { signIn(params: { email: string; nickname?: string }): Promise<AuthonUser> } | undefined {
    if (!this.publishableKey.startsWith('pk_test_')) return undefined;
    return {
      signIn: async (params: { email: string; nickname?: string }): Promise<AuthonUser> => {
        const res = await this.apiPost<AuthTokens>('/v1/auth/testing/token', params);
        this.session.setSession(res);
        return res.user;
      },
    };
  }

  destroy(): void {
    this.modal?.close();
    this.profile?.close();
    this.profile = null;
    this.session.destroy();
    this.wallet.dispose();
    this.listeners.clear();
  }

  // ── Internal ──

  private loadTurnstileScript(): void {
    if (typeof document === 'undefined') return;
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    document.head.appendChild(script);
  }

  private emit(event: string, ...args: unknown[]): void {
    for (const listener of [...(this.listeners.get(event) ?? [])]) {
      try {
        listener(...args);
      } catch {
        // Listener failures must not block other framework adapters.
      }
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    try {
      const [branding, providersRes] = await Promise.all([
        this.apiGet<BrandingConfig>('/v1/auth/branding'),
        this.apiGet<ProvidersResponse>('/v1/auth/providers'),
      ]);
      this.branding = { ...branding, ...this.config.appearance };
      this.captchaEnabled = !!(branding as any).captchaEnabled;
      this.turnstileSiteKey = (branding as any).turnstileSiteKey || '';
      this.walletEnabled = (branding as any).walletEnabled !== false;
      if (this.captchaEnabled && this.turnstileSiteKey) {
        this.loadTurnstileScript();
      }
      this.providers = providersRes.providers;
      this.providerFlowModes = {};
      for (const provider of this.providers) {
        this.providerFlowModes[provider] = this.normalizeFlowMode(
          providersRes.providerConfigs?.[provider]?.oauthFlow,
        );
      }
      this.initialized = true;
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private async autoCreateWallet(): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!this.walletEnabled) return;
      await this.wallet.ensure();
    } catch (err) {
      this.emit('walletError', err instanceof AuthonWalletError ? err : new AuthonWalletError('UNKNOWN', err instanceof Error ? err.message : String(err)));
    }
  }

  private showBuiltInMagicLinkConfirm(email: string): void {
    if (typeof document === 'undefined') return;
    void this.openSignIn()
      .then(() => {
        const modal = this.getModal();
        modal.showMagicLinkConfirm(
          email,
          () => {
            this.confirmMagicLink()
              .then(() => modal.close())
              .catch((err) => modal.showOverlayError(err instanceof Error ? err.message : String(err)));
          },
          () => {
            this.dismissMagicLink();
            modal.close();
          },
        );
      })
      .catch(() => undefined);
  }

  private getModal(): ModalRenderer {
    if (!this.modal) {
      this.modal = new ModalRenderer({
        mode: this.config.mode,
        theme: this.config.theme,
        locale: this.config.locale,
        containerId: this.config.containerId,
        branding: this.branding || undefined,
        captchaSiteKey: this.captchaEnabled ? this.turnstileSiteKey : undefined,
        isTestMode: this.publishableKey.startsWith('pk_test_'),
        onDevTeleport: this.publishableKey.startsWith('pk_test_') ? async (email: string) => {
          this.modal?.clearError();
          try {
            await this.testing!.signIn({ email });
            this.modal?.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.modal?.showError(msg || 'Dev teleport failed');
          }
        } : undefined,
        onProviderClick: (provider) => this.startOAuthFlow(provider),
        onEmailSubmit: (email, password, isSignUp) => {
          this.modal?.clearError();
          const turnstileToken = this.modal?.getTurnstileToken?.() || undefined;
          if (isSignUp) {
            this.signUpWithEmail(email, password, { turnstileToken })
              .then((result) => {
                if ('needsVerification' in result && result.needsVerification) {
                  this.modal?.setSubmitLoading(false);
                  this.modal?.showVerificationInput(email, async (code: string) => {
                    await this.verifyEmail(email, code);
                    this.modal?.close();
                  }, async () => {
                    await this.resendVerificationCode(email);
                  });
                } else {
                  this.modal?.close();
                }
              })
              .catch((err) => {
                this.modal?.resetTurnstile?.();
                this.modal?.setSubmitLoading(false);
                const msg = err instanceof Error ? err.message : String(err);
                this.modal?.showError(msg || 'Authentication failed');
                this.emit('error', err instanceof Error ? err : new Error(msg));
              });
          } else {
            this.signInWithEmail(email, password, turnstileToken)
              .then((result) => {
                if ('needsVerification' in result && result.needsVerification) {
                  this.modal?.setSubmitLoading(false);
                  this.modal?.showVerificationInput(email, async (code: string) => {
                    await this.verifyEmail(email, code);
                    this.modal?.close();
                  }, async () => {
                    await this.resendVerificationCode(email);
                  });
                } else {
                  this.modal?.close();
                }
              })
              .catch((err) => {
                this.modal?.resetTurnstile?.();
                this.modal?.setSubmitLoading(false);
                const msg = err instanceof Error ? err.message : String(err);
                this.modal?.showError(msg || 'Authentication failed');
                this.emit('error', err instanceof Error ? err : new Error(msg));
              });
          }
        },
        onClose: () => this.modal?.close(),
        onWeb3WalletSelect: async (walletId: string) => {
          const chain = walletId === 'phantom' ? 'solana' as const : 'evm' as const;
          try {
            this.modal?.showOverlay?.('web3-connecting');
            const address = await this.getWalletAddress(walletId);
            const { message } = await this.web3GetNonce(address, chain, walletId as any);
            const signature = await this.requestWalletSignature(walletId, message);
            await this.web3Verify(message, signature, address, chain, walletId as any);
            this.modal?.showWeb3Success(walletId, address);
            setTimeout(() => this.modal?.close(), 2500);
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
        onPasswordlessSubmit: async (email: string) => {
          try {
            const method = (this.branding as any)?.passwordlessMethod ?? 'magic_link';
            if (method === 'email_otp' || method === 'both') {
              await this.sendEmailOtp(email);
              this.modal?.showOtpInput(email);
            } else {
              await this.sendMagicLink(email);
              this.modal?.showPasswordlessSent();
            }
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
        onOtpVerify: async (email: string, code: string) => {
          try {
            await this.verifyPasswordless({ email, code });
            this.modal?.close();
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
        onPasskeyClick: async () => {
          try {
            this.modal?.showOverlay?.('passkey-verifying');
            await this.authenticateWithPasskey();
            this.modal?.showPasskeySuccess();
            setTimeout(() => this.modal?.close(), 2500);
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
      });
    }
    if (this.branding) this.modal.setBranding(this.branding);
    this.modal.setProviders(this.providers);
    return this.modal;
  }

  private async startOAuthFlow(provider: OAuthProviderType, options?: OAuthSignInOptions): Promise<void> {
    try {
      const configuredFlow = this.providerFlowModes[provider] ?? 'auto';
      const flowMode = this.normalizeFlowMode(options?.flowMode ?? configuredFlow);

      if (flowMode === 'redirect') {
        this.modal?.showLoading();
        await this.startRedirectOAuthFlow(provider);
        return;
      }

      // BFF code mode (responseType 'code') keeps its own PKCE pair on the app server.
      // Every other flow uses a verifier that only this SDK instance knows.
      const codeMode = Boolean(this.authorizationContext);
      const pkce = codeMode ? null : await createPkcePair();
      const { url, state } = await this.requestOAuthAuthorization(
        provider,
        'popup',
        pkce ? currentReturnUrl() : undefined,
        pkce?.challenge,
      );

      this.modal?.showLoading();

      // Open popup
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        url,
        'authon-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
      );

      if (!popup || popup.closed) {
        if (flowMode === 'auto') {
          this.modal?.showBanner('Popup unavailable. Continuing with redirect sign-in…', 'warning');
          await this.startRedirectOAuthFlow(provider);
          return;
        }
        this.modal?.hideLoading();
        this.modal?.showBanner('Pop-up blocked. Please allow pop-ups for this site and try again.', 'warning');
        this.emit('error', new Error('Popup was blocked by the browser'));
        return;
      }

      let resolved = false;
      let cleaned = false;
      const storageKey = handoffKey(state);

      const closePopup = () => {
        try { if (popup && !popup.closed) popup.close(); } catch { /* ignore */ }
      };

      const resolve = (response: AuthorizationCodeResult) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        closePopup();
        this.handleAuthCompletion(response);
        this.modal?.close();
      };

      const handleError = (msg: string) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        closePopup();
        this.session.clearSession();
        this.modal?.hideLoading();
        this.modal?.showError(msg);
        this.emit('error', new Error(msg));
      };

      // PKCE mode: trade the one-time code for a session with this instance's verifier.
      const redeem = async (code: string) => {
        if (resolved || !pkce) return;
        resolved = true;
        cleanup();
        closePopup();
        try {
          await this.redeemOAuthCode(code, pkce.verifier);
          this.modal?.close();
        } catch (err) {
          if (err instanceof AuthonMfaRequiredError) {
            this.modal?.close();
            return;
          }
          const msg = err instanceof Error ? err.message : String(err);
          this.modal?.hideLoading();
          this.modal?.showError(msg);
          this.emit('error', err instanceof Error ? err : new Error(msg));
        }
      };

      // Status only: the poll never carries tokens or codes. It just reports failures early.
      const pollStatus = async () => {
        if (resolved || cleaned) return;
        try {
          const result = await this.apiGet<{ status: string; message?: string }>(
            `/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`,
          );
          if (result.status === 'error') handleError(result.message || 'Authentication failed');
        } catch {
          // Network error — keep waiting
        }
      };

      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        window.removeEventListener('message', messageHandler);
        window.removeEventListener('storage', storageHandler);
        document.removeEventListener('visibilitychange', visibilityHandler);
        if (apiPollTimer) clearInterval(apiPollTimer);
        if (closePollTimer) clearInterval(closePollTimer);
        if (maxTimer) clearTimeout(maxTimer);
      };

      // 1. postMessage from the Authon popup page (sent only to this exact origin)
      const expectedOrigin = new URL(this.config.apiUrl).origin;
      const messageHandler = (e: MessageEvent) => {
        if (e.origin !== expectedOrigin || e.source !== popup) return;
        if (codeMode) {
          if (e.data?.type === 'authon-oauth-error') {
            handleError('Authentication failed');
            return;
          }
          if (e.data?.type !== 'authon-oauth-code') return;
          if (e.data.state !== this.authorizationContext?.options.state) return;
          if (
            e.data.accessToken
            || e.data.refreshToken
            || typeof e.data.authorizationCode !== 'string'
            || !Number.isFinite(e.data.expiresIn)
            || e.data.expiresIn <= 0
            || e.data.expiresIn > 60
          ) return;
          resolve({ authorizationCode: e.data.authorizationCode, state: e.data.state, expiresIn: e.data.expiresIn });
          return;
        }
        if (e.data?.state !== state) return;
        if (e.data?.type === 'authon-oauth-error') {
          handleError(typeof e.data.error === 'string' ? e.data.error : 'Authentication failed');
          return;
        }
        if (e.data?.type === 'authon-oauth-pkce' && typeof e.data.code === 'string') {
          void redeem(e.data.code);
        }
      };
      window.addEventListener('message', messageHandler);

      // 2. Same-origin handoff (popup lost its opener and finished on this origin)
      const consumeHandoff = (value: OAuthHandoff | null) => {
        if (!value) return;
        if (value.code) void redeem(value.code);
        else if (value.error) handleError(value.error);
      };
      const storageHandler = (e: StorageEvent) => {
        if (e.key !== storageKey || !e.newValue) return;
        consumeHandoff(takeHandoff(state));
      };
      if (!codeMode) {
        window.addEventListener('storage', storageHandler);
        consumeHandoff(takeHandoff(state));
        if (resolved) return;
      }

      // 3. Status polling (error detection only)
      const apiPollTimer = setInterval(pollStatus, 1500);

      // 4. visibilitychange — check immediately when the tab regains focus (mobile)
      const visibilityHandler = () => {
        if (document.visibilityState === 'visible' && !resolved && !cleaned) {
          if (!codeMode) consumeHandoff(takeHandoff(state));
          void pollStatus();
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);

      // 5. Popup close detection. A popup that lost its opener also reports closed, and may still
      // hand the code over through storage, so keep listening until the max timeout.
      const closePollTimer = setInterval(() => {
        if (resolved || cleaned) return;
        try {
          if (popup && popup.closed) {
            clearInterval(closePollTimer);
            void pollStatus();
            setTimeout(() => {
              if (resolved || cleaned) return;
              void pollStatus().then(() => {
                if (resolved || cleaned) return;
                if (codeMode) cleanup();
                this.modal?.hideLoading();
              });
            }, 3000);
          }
        } catch {
          // Cross-origin access error — popup still open
        }
      }, 500);

      // 6. Max timeout (3 minutes)
      const maxTimer = setTimeout(() => {
        if (resolved || cleaned) return;
        cleanup();
        this.modal?.hideLoading();
      }, 180_000);
    } catch (err) {
      this.modal?.hideLoading();
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Exchanges a one-time OAuth code from Authon for a session. Requires the verifier generated by
   * the SDK instance that started the flow. A wrong verifier counts as a failed attempt; Authon
   * burns the code after 3. Throws AuthonMfaRequiredError (and emits `mfaRequired`) when the user
   * has MFA enabled; finish with verifyMfa(error.mfaToken, code).
   */
  private async redeemOAuthCode(code: string, codeVerifier: string): Promise<AuthonUser> {
    const res = await this.apiPost<AuthTokens & { mfaRequired?: boolean; mfaToken?: string }>(
      '/v1/auth/oauth/token',
      { code, codeVerifier },
    );
    if (res.mfaRequired && res.mfaToken) {
      this.emit('mfaRequired', res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken);
    }
    return this.handleAuthCompletion(res);
  }

  private normalizeFlowMode(mode: unknown): OAuthFlowMode {
    if (mode === 'popup' || mode === 'redirect' || mode === 'auto') {
      return mode;
    }
    return 'auto';
  }

  private async requestOAuthAuthorization(
    provider: OAuthProviderType,
    flowMode: 'popup' | 'redirect',
    returnTo?: string,
    codeChallenge?: string,
  ): Promise<{ url: string; state: string; flowMode?: 'popup' | 'redirect' }> {
    const redirectUri = `${this.config.apiUrl}/v1/auth/oauth/redirect`;
    const params = new URLSearchParams({
      redirectUri,
      flow: flowMode,
    });

    if (returnTo) {
      params.set('returnTo', returnTo);
    }
    if (this.authorizationContext) {
      params.set('authorizationRequestId', this.authorizationContext.requestId);
    } else if (codeChallenge) {
      params.set('codeChallenge', codeChallenge);
      params.set('codeChallengeMethod', 'S256');
    }

    return this.apiGet<{ url: string; state: string; flowMode?: 'popup' | 'redirect' }>(
      `/v1/auth/oauth/${provider}/url?${params.toString()}`,
    );
  }

  private async startRedirectOAuthFlow(provider: OAuthProviderType): Promise<void> {
    const pkce = this.authorizationContext ? null : await createPkcePair();
    const { url, state } = await this.requestOAuthAuthorization(
      provider,
      'redirect',
      pkce ? currentReturnUrl() : window.location.href,
      pkce?.challenge,
    );
    if (pkce) saveRedirectVerifier(state, pkce.verifier);
    window.location.assign(url);
  }

  /** Pending redirect sign-in started from this tab, if the page was opened with its result. */
  private oauthRedirectResult: Promise<AuthonUser | null> | null = null;

  private consumeRedirectResultFromUrl(): void {
    if (typeof window === 'undefined') return;

    let currentUrl: URL;
    try {
      currentUrl = new URL(window.location.href);
    } catch {
      return;
    }

    pruneHandoffs();

    const code = currentUrl.searchParams.get(OAUTH_CODE_PARAM);
    const state = currentUrl.searchParams.get(OAUTH_STATE_PARAM);
    const explicitError = currentUrl.searchParams.get(OAUTH_ERROR_PARAM);
    const fromPopup = currentUrl.searchParams.get(OAUTH_POPUP_PARAM) === '1';
    if (!code && !state && !explicitError) return;

    // Remove the one-time values from the address bar and history right away.
    for (const param of [OAUTH_CODE_PARAM, OAUTH_STATE_PARAM, OAUTH_ERROR_PARAM, OAUTH_POPUP_PARAM]) {
      currentUrl.searchParams.delete(param);
    }
    window.history.replaceState({}, '', currentUrl.toString());

    if (fromPopup && state) {
      // This page is the sign-in popup that lost its opener. Hand the result to the SDK instance
      // waiting in the opener tab (same origin only) and close.
      writeHandoff(state, code ? { code } : { error: explicitError || 'Authentication failed' });
      try { window.close(); } catch { /* ignore */ }
      return;
    }

    if (code && state) {
      const verifier = takeRedirectVerifier(state);
      if (verifier) {
        this.oauthRedirectResult = this.redeemOAuthCode(code, verifier).catch((err) => {
          if (!(err instanceof AuthonMfaRequiredError)) {
            this.emit('error', err instanceof Error ? err : new Error(String(err)));
          }
          return null;
        });
        return;
      }
      // Not started from this tab (or forged): never redeem it. The deliberately wrong verifier
      // counts toward the code's failed-attempt limit, after which Authon burns it.
      void this.apiPost('/v1/auth/oauth/token', { code, codeVerifier: generateCodeVerifier() }).catch(() => undefined);
      return;
    }

    if (explicitError) {
      if (state) takeRedirectVerifier(state);
      this.emit('error', new Error(explicitError));
    }
  }

  private async apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      headers: { 'x-api-key': this.publishableKey },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.publishableKey,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async apiPostAuth<T>(path: string, body: unknown, token: string): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.publishableKey,
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async apiGetAuth<T>(path: string, token: string): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      headers: {
        'x-api-key': this.publishableKey,
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async apiPatchAuth<T>(path: string, body: unknown, token: string): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.publishableKey,
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async apiDeleteAuth(path: string, token: string): Promise<void> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': this.publishableKey,
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
  }

  // ── Wallet helpers ──

  private async getWalletAddress(walletId: string): Promise<string> {
    if (walletId === 'phantom') {
      const provider = (window as any).solana;
      if (!provider?.isPhantom) throw new Error('Phantom wallet not detected. Please install it from phantom.app');
      const resp = await provider.connect();
      return resp.publicKey.toString();
    }
    // EVM wallets (MetaMask, Pexus, etc.)
    const provider = (window as any).ethereum;
    if (!provider) throw new Error(`${walletId} wallet not detected. Please install it.`);
    const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  }

  private async requestWalletSignature(walletId: string, message: string): Promise<string> {
    if (walletId === 'phantom') {
      const provider = (window as any).solana;
      const encoded = new TextEncoder().encode(message);
      const signed = await provider.signMessage(encoded, 'utf8');
      return Array.from(new Uint8Array(signed.signature))
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // EVM wallets
    const provider = (window as any).ethereum;
    const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
    return provider.request({ method: 'personal_sign', params: [message, accounts[0]] });
  }

  // ── Magic link helpers ──

  /** Current page (without hash or magic link params) as the link target, when this instance handles links. */
  private magicLinkReturnUrl(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    if (this.config.sessionMode !== 'browser' || !this.config.autoHandleMagicLink || this.authorizationContext) {
      return undefined;
    }
    try {
      const url = new URL(window.location.href);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
      url.hash = '';
      url.searchParams.delete('token');
      url.searchParams.delete(MAGIC_LINK_PARAM);
      const full = url.toString();
      return full.length <= 2048 ? full : `${url.origin}${url.pathname}`.slice(0, 2048);
    } catch {
      return undefined;
    }
  }

  private magicLinkRequestKey(token: string): string {
    return `${this.config.apiUrl}|${this.publishableKey}|${token}`;
  }

  private sharedMagicLinkRequest(key: string, body: Record<string, unknown>): Promise<MagicLinkVerifyResponse> {
    let pending = magicLinkResponses.get(key);
    if (!pending) {
      pending = this.apiPost<MagicLinkVerifyResponse>('/v1/auth/passwordless/verify', { ...body, mfaCapable: true });
      magicLinkResponses.set(key, pending);
      pending.catch(() => undefined);
    }
    return pending;
  }

  private magicLinkNonceKey(): string {
    return `${MAGIC_LINK_NONCE_KEY}${this.config.apiUrl}|${this.publishableKey}`;
  }

  /**
   * New random value for a link request, kept in this origin's localStorage (shared by its tabs, so
   * the link may open in a new tab). Null when there is no browser storage; such links always ask
   * for confirmation.
   */
  private createMagicLinkNonce(): string | null {
    if (typeof window === 'undefined' || this.config.sessionMode !== 'browser') return null;
    try {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const nonce = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      localStorage.setItem(this.magicLinkNonceKey(), nonce);
      return localStorage.getItem(this.magicLinkNonceKey()) === nonce ? nonce : null;
    } catch {
      return null;
    }
  }

  private readMagicLinkNonce(): string | null {
    try {
      return localStorage.getItem(this.magicLinkNonceKey());
    } catch {
      return null;
    }
  }

  private restoreMagicLinkNonce(previous: string | null): void {
    try {
      if (previous) localStorage.setItem(this.magicLinkNonceKey(), previous);
      else localStorage.removeItem(this.magicLinkNonceKey());
    } catch {
      // ignore
    }
  }

  private clearMagicLinkNonce(): void {
    try {
      localStorage.removeItem(this.magicLinkNonceKey());
    } catch {
      // ignore
    }
  }

  /**
   * Read a magic link token from the URL (fragment form first, then the older query form) and
   * remove it from the address bar and history right away, before any request is made.
   */
  private takeMagicLinkTokenFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    let url: URL;
    try {
      url = new URL(window.location.href);
    } catch {
      return null;
    }
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const inHash = hash.get(MAGIC_LINK_PARAM) === '1';
    const inQuery = url.searchParams.get(MAGIC_LINK_PARAM) === '1';
    if (!inHash && !inQuery) return null;
    const token = (inHash ? hash.get('token') : null) || (inQuery ? url.searchParams.get('token') : null);
    if (inQuery) {
      url.searchParams.delete('token');
      url.searchParams.delete(MAGIC_LINK_PARAM);
    }
    if (inHash) {
      hash.delete('token');
      hash.delete(MAGIC_LINK_PARAM);
      const rest = hash.toString();
      url.hash = rest ? `#${rest}` : '';
    }
    try {
      window.history.replaceState(window.history.state, '', url.toString());
    } catch {
      // ignore
    }
    return token || null;
  }

  /**
   * Page-load handling. The link finishes silently only when this browser holds the value sent with
   * the request and nobody is signed in; otherwise it is left unused and the app is asked to confirm.
   * That stops a link someone else requested (for their own account) from signing this browser in.
   */
  private consumeMagicLinkFromUrl(): Promise<AuthonUser | null> {
    const pageKey = `${this.config.apiUrl}|${this.publishableKey}`;
    const fromUrl = this.takeMagicLinkTokenFromUrl();
    const token = fromUrl ?? pageMagicLinkTokens.get(pageKey) ?? null;
    if (!token) return Promise.resolve(null);

    const key = `${this.magicLinkRequestKey(token)}|load`;
    let pending = magicLinkResponses.get(key);
    if (!pending) {
      pageMagicLinkTokens.set(pageKey, token);
      pending = (async (): Promise<MagicLinkVerifyResponse> => {
        try {
          await this.session.waitUntilReady();
        } catch {
          // a failed refresh just means nobody is signed in
        }
        const signedIn = this.session.getUser() !== null;
        const browserNonce = signedIn ? null : this.readMagicLinkNonce();
        const res = await this.apiPost<MagicLinkVerifyResponse>('/v1/auth/passwordless/verify', {
          token,
          requireBrowserBinding: true,
          mfaCapable: true,
          ...(browserNonce ? { browserNonce } : {}),
        });
        if (isMagicLinkConfirmation(res)) return { ...res, reason: signedIn ? 'signed_in' : 'unrecognized_browser' };
        return res;
      })();
      magicLinkResponses.set(key, pending);
      pending.catch(() => undefined).finally(() => {
        if (pageMagicLinkTokens.get(pageKey) === token) pageMagicLinkTokens.delete(pageKey);
      });
    }

    return pending
      .then((res) => {
        if (isMagicLinkConfirmation(res)) {
          const reason = res.reason ?? 'unrecognized_browser';
          this.pendingMagicLink = { token, email: res.email, reason };
          this.emit('magicLinkConfirmationRequired', { email: res.email, reason });
          // Apps that do not handle the event get the built-in confirmation instead of a silent stop.
          if (!this.listeners.get('magicLinkConfirmationRequired')?.size) this.showBuiltInMagicLinkConfirm(res.email);
          return null;
        }
        this.clearMagicLinkNonce();
        return this.handleAuthCompletion(res);
      })
      .catch((err) => {
        // MFA is not a failure: `mfaRequired` was emitted with the token for verifyMfa().
        if (!(err instanceof AuthonMfaRequiredError)) {
          this.emit('error', err instanceof Error ? err : new Error(String(err)));
        }
        return null;
      });
  }

  // ── WebAuthn helpers ──

  /** Authon returns WebAuthn options at the top level; very old servers wrapped them in `options`. */
  private unwrapWebAuthnOptions(raw: Record<string, unknown>): Record<string, unknown> {
    if (raw && typeof raw.challenge !== 'string' && raw.options && typeof raw.options === 'object') {
      return raw.options as Record<string, unknown>;
    }
    return raw;
  }

  private credentialBase(credential: PublicKeyCredential): Record<string, unknown> {
    let clientExtensionResults: Record<string, unknown> = {};
    try {
      clientExtensionResults = (credential.getClientExtensionResults?.() ?? {}) as Record<string, unknown>;
    } catch {
      clientExtensionResults = {};
    }
    const attachment = (credential as PublicKeyCredential & { authenticatorAttachment?: string | null }).authenticatorAttachment;
    return {
      id: credential.id,
      rawId: this.bufferToBase64url(credential.rawId),
      type: credential.type,
      clientExtensionResults,
      ...(attachment ? { authenticatorAttachment: attachment } : {}),
    };
  }

  private bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private deserializeCreationOptions(
    options: Record<string, unknown>,
  ): PublicKeyCredentialCreationOptions {
    const opts = { ...options } as Record<string, unknown>;
    if (typeof opts.challenge === 'string') {
      opts.challenge = this.base64urlToBuffer(opts.challenge);
    }
    if (opts.user && typeof (opts.user as Record<string, unknown>).id === 'string') {
      (opts.user as Record<string, unknown>).id = this.base64urlToBuffer(
        (opts.user as Record<string, unknown>).id as string,
      );
    }
    if (Array.isArray(opts.excludeCredentials)) {
      opts.excludeCredentials = (opts.excludeCredentials as Record<string, unknown>[]).map((c) => ({
        ...c,
        id: typeof c.id === 'string' ? this.base64urlToBuffer(c.id) : c.id,
      }));
    }
    return opts as unknown as PublicKeyCredentialCreationOptions;
  }

  private deserializeRequestOptions(
    options: Record<string, unknown>,
  ): PublicKeyCredentialRequestOptions {
    const opts = { ...options } as Record<string, unknown>;
    if (typeof opts.challenge === 'string') {
      opts.challenge = this.base64urlToBuffer(opts.challenge);
    }
    if (Array.isArray(opts.allowCredentials)) {
      opts.allowCredentials = (opts.allowCredentials as Record<string, unknown>[]).map((c) => ({
        ...c,
        id: typeof c.id === 'string' ? this.base64urlToBuffer(c.id) : c.id,
      }));
    }
    return opts as unknown as PublicKeyCredentialRequestOptions;
  }

  private async parseApiError(res: Response, path: string): Promise<string> {
    try {
      const body = await res.json();
      if (Array.isArray(body.message) && body.message.length > 0) {
        return body.message[0];
      }
      if (typeof body.message === 'string' && body.message !== 'Bad Request') {
        return body.message;
      }
    } catch { /* ignore */ }
    return `API ${path}: ${res.status}`;
  }
}
