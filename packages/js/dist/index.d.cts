import { AuthonUser, BrandingConfig, AuthorizationCodeOptions, PasskeyCredential, Web3Wallet, AuthorizationCodeResult, OAuthProviderType, MfaSetupResponse, MfaStatus, Web3Chain, Web3WalletType, Web3NonceResponse, SessionInfo, OrganizationListResponse, CreateOrganizationParams, AuthonOrganization, UpdateOrganizationParams, OrganizationMember, InviteMemberParams, OrganizationInvitation } from '@authon/shared';

type SessionChangeReason = 'setSession' | 'tokenRefresh' | 'updateUser' | 'clearSession' | 'signOut' | 'refreshFailed';
interface SessionChange {
    reason: SessionChangeReason;
    accessToken: string | null;
    user: AuthonUser | null;
}
type SessionChangeListener = (change: SessionChange) => void;

type WalletErrorCode = 'NOT_FOUND' | 'NEEDS_RESTORE' | 'NOT_PROTECTED' | 'PRF_UNSUPPORTED' | 'ORIGIN_NOT_ALLOWED' | 'USER_CANCELLED' | 'TIMEOUT' | 'NEEDS_POPUP' | 'POPUP_BLOCKED' | 'NOT_SIGNED_IN' | 'NOT_CONFIGURED' | 'UNSUPPORTED_METHOD' | 'INVALID_PARAMS' | 'DISPOSED'
/** The last device of an unprotected wallet cannot be revoked (the wallet would be lost). */
 | 'LAST_DEVICE'
/** This call needs a token from a signed-in session (not an impersonation or unbound BFF token). */
 | 'SESSION_REQUIRED'
/** The frame could not keep the device key share in this browser's storage. */
 | 'STORAGE_UNAVAILABLE'
/**
 * A high-risk signature needs the Authon approval window, and it could not be opened
 * (popup blocked, sandboxed iframe). Nothing was signed.
 */
 | 'CONFIRM_WINDOW_BLOCKED'
/** The Authon approval window was closed (or timed out) before the user approved. Nothing was signed. */
 | 'CONFIRM_WINDOW_CLOSED'
/** The message or typed data is too long to show in full (over 16,384 characters); the wallet refuses to sign it. */
 | 'MESSAGE_TOO_LARGE'
/** The wallet API no longer serves this frame version; reload the page. */
 | 'FRAME_OUTDATED'
/** The new backup passkey did not report a usable public key. */
 | 'BACKUP_KEY_REQUIRED'
/** upgradeBackup() was called but the backup is already verifiable. */
 | 'ALREADY_UPGRADED' | (string & {});
declare class AuthonWalletError extends Error {
    readonly code: WalletErrorCode;
    constructor(code: WalletErrorCode, message?: string);
}
type Hex = `0x${string}`;
interface EmbeddedWalletDevice {
    id: string;
    label: string;
    createdAt: string;
    lastUsedAt: string | null;
    current: boolean;
}
interface EmbeddedWallet {
    address: string;
    /**
     * True once the wallet has a passkey backup (`protect()`). An unprotected wallet
     * exists only as this browser's device share plus the server share: clearing site
     * data, Safari's storage eviction or a lost device makes it unrecoverable. Do not
     * let users receive funds until `protected` is true.
     */
    protected: boolean;
    /** True when the server has a wallet but this browser holds no device share. */
    needsRestore: boolean;
    /**
     * True for a passkey backup made before the wallet stored passkey public keys.
     * Restoring such a backup is less protected; call `upgradeBackup()` from a click
     * on a device where the wallet works (`needsRestore` false).
     */
    backupUpgradeRecommended: boolean;
    devices: EmbeddedWalletDevice[];
}
type WalletChangeListener = (wallet: EmbeddedWallet | null) => void;
interface TypedDataPayload {
    domain: Record<string, unknown>;
    types: Record<string, Array<{
        name: string;
        type: string;
    }>>;
    primaryType: string;
    message: Record<string, unknown>;
}
interface WalletTransactionRequest {
    to?: string;
    from?: string;
    value?: string | number | bigint;
    data?: string;
    nonce?: string | number;
    gas?: string | number | bigint;
    gasLimit?: string | number | bigint;
    gasPrice?: string | number | bigint;
    maxFeePerGas?: string | number | bigint;
    maxPriorityFeePerGas?: string | number | bigint;
    chainId?: string | number;
    type?: string | number;
}
type WalletMessage = string | {
    raw: string;
};
interface EIP1193RequestArguments {
    method: string;
    params?: unknown[] | Record<string, unknown>;
}
interface EIP1193Provider {
    request(args: EIP1193RequestArguments): Promise<unknown>;
}
interface WalletClientOptions {
    publishableKey: string;
    walletOrigin: string | null;
    /** Resolves a valid session token, refreshing it when needed. */
    getToken: () => Promise<string | null>;
    timeoutMs?: number;
    popupTimeoutMs?: number;
    /** Default appearance of the protect/restore confirmation card. */
    ui?: WalletConfirmUi;
}
declare class WalletClient {
    private readonly options;
    private readonly listeners;
    private readonly pending;
    private iframe;
    private frameReady;
    private abortFrame;
    private listening;
    private ensuring;
    private counter;
    constructor(options: WalletClientOptions);
    get(): Promise<EmbeddedWallet | null>;
    ensure(): Promise<EmbeddedWallet>;
    /** True when the wallet exists and has a passkey backup. See `EmbeddedWallet.protected`. */
    isProtected(): Promise<boolean>;
    /**
     * Every signature needs the user's approval; a project can turn this off only in its
     * server-side wallet settings, never from the page.
     * - Low-risk requests (personal messages, typed data that grants nothing) show a card
     *   inside the wallet frame with the requesting site and the full text. Sign is
     *   enabled only after the text was scrolled to the end.
     * - High-risk requests (transactions with value or call data, approvals, permits,
     *   orders, meta-transactions) show a small card whose button opens an Authon window
     *   (`<wallet origin>/confirm`); the user approves there, outside this page. The click
     *   happens inside the frame, so this method does not need to run in a click handler.
     * Rejecting gives USER_CANCELLED; a blocked or closed window gives
     * CONFIRM_WINDOW_BLOCKED / CONFIRM_WINDOW_CLOSED; text over 16,384 characters gives
     * MESSAGE_TOO_LARGE. None of these ever signs.
     */
    signMessage(message: WalletMessage): Promise<Hex>;
    signTypedData(typedData: TypedDataPayload): Promise<Hex>;
    signTransaction(tx: WalletTransactionRequest): Promise<Hex>;
    /**
     * Creates a passkey and backs up the wallet. Must be called from a user click
     * handler: the browser only allows the passkey prompt (or the popup fallback)
     * during a user gesture.
     */
    protect(options?: {
        ui?: WalletConfirmUi;
    }): Promise<void>;
    /**
     * Replaces a legacy passkey backup (`backupUpgradeRecommended`) with a new passkey
     * whose public key the server keeps, so later restores are verified by the server.
     * Must be called from a user click handler, on a browser where the wallet works.
     * The key shares are rotated: other devices and sites restore once with the new
     * passkey. Not available in the popup fallback.
     */
    upgradeBackup(options?: {
        ui?: WalletConfirmUi;
    }): Promise<void>;
    /**
     * Restores the wallet on this browser with the passkey (one confirmation tap and
     * the system prompt). By default this browser is added as another device and
     * other devices keep working. Pass `resetOtherDevices: true` when a device was
     * lost: the key is re-split and every other device must restore again. The reset
     * card always shows the wallet's own warning text (custom `ui` text is ignored),
     * and reset is not available in the popup fallback.
     */
    restore(options?: {
        ui?: WalletConfirmUi;
        resetOtherDevices?: boolean;
    }): Promise<void>;
    /**
     * Revokes a device. Must run in a browser that holds a trusted device share (the
     * frame signs the request with it). The last device of an unprotected wallet
     * cannot be revoked (LAST_DEVICE).
     */
    revokeDevice(deviceId: string): Promise<void>;
    onChange(listener: WalletChangeListener): () => void;
    provider(chainId: number): EIP1193Provider;
    /** Removes the frame and rejects in-flight requests. Called on sign-out. */
    dispose(): void;
    private refresh;
    private notify;
    private normalize;
    private requireOrigin;
    private frameUrl;
    private ensureFrame;
    private setFrameVisible;
    private listen;
    private onMessage;
    private send;
    /** Signing, protect, restore and upgrade wait for a person (in the frame or the Authon window). */
    private interactiveTimeout;
    private call;
    private callViaPopup;
    private waitForPopupReady;
}

type OAuthFlowMode = 'auto' | 'popup' | 'redirect';
interface AuthonConfig {
    apiUrl?: string;
    mode?: 'popup' | 'embedded';
    containerId?: string;
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
    appearance?: Partial<BrandingConfig>;
    sessionMode?: 'browser' | 'bff';
    wallet?: AuthonWalletConfig;
    /**
     * When the page URL carries a magic link (`#authon_magic_link=1&token=...`, or the older
     * `?token=...&authon_magic_link=1`), remove it from the URL and finish sign-in on load.
     * Default true (browser session mode only).
     *
     * The link signs in silently only in the browser that asked for it and only when nobody is
     * signed in yet. Otherwise nothing is signed in: `magicLinkConfirmationRequired` fires and the
     * app asks "Sign in as x@y?" before calling `confirmMagicLink()`.
     * Set false to handle the link yourself with `handleMagicLink()` or `verifyPasswordless({ token })`.
     */
    autoHandleMagicLink?: boolean;
}
interface SendMagicLinkOptions {
    /**
     * Page the link should open. Defaults to the current page when `autoHandleMagicLink` is on.
     * Authon only uses it when its origin is in the project's allowed origins and the project has
     * no callback URL or domain set.
     */
    redirectUrl?: string;
}
/**
 * Why a magic link on this page was not used automatically:
 * - `unrecognized_browser`: it was requested in another browser or device (or by an older SDK),
 *   so it could have been sent by someone else to sign you in to their account.
 * - `signed_in`: someone is already signed in here; the link would replace that session.
 */
type MagicLinkConfirmationReason = 'unrecognized_browser' | 'signed_in';
/** A magic link waiting for the person to confirm. The link is still unused. */
interface PendingMagicLink {
    /** Account the link signs in to. Show it: "Sign in as {email}?" */
    email: string;
    reason: MagicLinkConfirmationReason;
}
interface AuthonWalletConfig {
    /**
     * Origin of the wallet frame. Defaults to https://wallet.authon.dev when apiUrl is the
     * default Authon API; required when a custom apiUrl is used.
     */
    origin?: string;
    /** Create the embedded wallet in the background after sign-in when the project enables wallets. */
    autoCreate?: boolean;
    /** Text and colors of the one-tap confirmation shown before the passkey prompt (protect/restore). */
    ui?: WalletConfirmUi;
    /**
     * Supplies the token the wallet sends to Authon. Required with sessionMode 'bff',
     * where the browser holds no Authon session: fetch a short-lived wallet token
     * from your server (see createAuthonWalletToken in @authon/nextjs/server).
     */
    getToken?: () => Promise<string | null | undefined>;
}
/**
 * Appearance of the small confirmation card the wallet frame shows right before
 * the system passkey prompt. Browsers only allow the prompt after a click inside
 * the wallet frame, so this single tap cannot be skipped.
 */
interface WalletConfirmUi {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Hex color such as #2563eb */
    accentColor?: string;
    theme?: 'light' | 'dark';
}
interface OAuthSignInOptions {
    flowMode?: OAuthFlowMode;
}
interface AuthonEvents {
    signedIn: (user: AuthonUser) => void;
    signedOut: () => void;
    sessionChanged: (change: SessionChange) => void;
    tokenRefreshed: (token: string) => void;
    verificationRequired: (email: string) => void;
    mfaRequired: (mfaToken: string) => void;
    passkeyRegistered: (credential: PasskeyCredential) => void;
    /** A magic link on this page needs the person's OK; call `confirmMagicLink()` or `dismissMagicLink()`. */
    magicLinkConfirmationRequired: (pending: PendingMagicLink) => void;
    web3Connected: (wallet: Web3Wallet) => void;
    error: (error: Error) => void;
    walletChanged: (wallet: EmbeddedWallet | null) => void;
    walletError: (error: AuthonWalletError) => void;
    authorizationCompleted: (result: AuthorizationCodeResult) => void;
}
type OpenSignInOptions = AuthorizationCodeOptions | {
    responseType?: 'token';
};
type AuthonEventType = keyof AuthonEvents;
declare class AuthonMfaRequiredError extends Error {
    readonly mfaToken: string;
    constructor(mfaToken: string);
}

/** Query flag Authon adds to magic links; `token` alone is too generic to claim. */
declare const MAGIC_LINK_PARAM = "authon_magic_link";
declare class Authon {
    private publishableKey;
    private config;
    private session;
    readonly wallet: WalletClient;
    private walletAutoCreate;
    private walletEnabled;
    private modal;
    private profile;
    private listeners;
    private branding;
    private providers;
    private providerFlowModes;
    private initialized;
    private captchaEnabled;
    private turnstileSiteKey;
    private authorizationContext;
    private verificationToken;
    private magicLinkResult;
    private pendingMagicLink;
    constructor(publishableKey: string, config?: AuthonConfig);
    getProviders(): Promise<OAuthProviderType[]>;
    openSignIn(options?: OpenSignInOptions): Promise<void>;
    openSignUp(options?: OpenSignInOptions): Promise<void>;
    private prepareAuthorization;
    private authorizationRequestBody;
    /**
     * Every sign-in path (password, magic link, email code, wallet, passkey, OAuth) ends here. An
     * `mfaRequired` body is handled the same way for all of them: `mfaRequired` event +
     * AuthonMfaRequiredError carrying the token for `verifyMfa()`. In authorization code mode the
     * request stays open and `verifyMfa()` finishes it.
     */
    private handleAuthCompletion;
    openProfile(): Promise<void>;
    closeProfile(): void;
    /** Update theme at runtime without destroying form state */
    setTheme(theme: 'light' | 'dark' | 'auto'): void;
    signInWithOAuth(provider: OAuthProviderType, options?: OAuthSignInOptions): Promise<void>;
    signInWithEmail(email: string, password: string, turnstileToken?: string): Promise<AuthonUser | {
        needsVerification: true;
        email: string;
    }>;
    signUpWithEmail(email: string, password: string, meta?: {
        displayName?: string;
        turnstileToken?: string;
    }): Promise<AuthonUser | {
        needsVerification: true;
        email: string;
    }>;
    verifyEmail(email: string, code: string): Promise<AuthonUser>;
    resendVerificationCode(email: string): Promise<void>;
    signOut(): Promise<void>;
    getUser(): AuthonUser | null;
    getToken(): string | null;
    /** Whether persisted session validation (including any required refresh) has completed. */
    isReady(): boolean;
    /** Wait until persisted session validation (including any required refresh) has completed. */
    waitUntilReady(): Promise<void>;
    /** Check if the current access token is valid (JWT exp not passed) */
    isTokenValid(): boolean;
    /** Ensure a valid token is available — refreshes if expired. Returns true if a valid token exists after the call. */
    ensureValidToken(): Promise<boolean>;
    on<K extends AuthonEventType>(event: K, listener: AuthonEvents[K]): () => void;
    /** Subscribe to every session mutation with its reason and validated public snapshot. */
    onSessionChange(listener: SessionChangeListener): () => void;
    setupMfa(): Promise<MfaSetupResponse & {
        qrCodeSvg: string;
    }>;
    verifyMfaSetup(code: string): Promise<void>;
    verifyMfa(mfaToken: string, code: string): Promise<AuthonUser>;
    disableMfa(code: string): Promise<void>;
    getMfaStatus(): Promise<MfaStatus>;
    regenerateBackupCodes(code: string): Promise<string[]>;
    sendMagicLink(email: string, options?: SendMagicLinkOptions): Promise<void>;
    /**
     * Finish a magic link sign-in from the current URL. With `autoHandleMagicLink` on (default) this
     * returns the verification already started on page load. Resolves to null when the URL has no link,
     * the link could not be used (the reason is emitted as an `error` event), or the link needs the
     * person's confirmation first (see `getPendingMagicLink()` / `magicLinkConfirmationRequired`).
     */
    handleMagicLink(): Promise<AuthonUser | null>;
    /**
     * The magic link from this page that was not used automatically because it was requested in
     * another browser, or someone is already signed in here. Show "Sign in as {email}?" and call
     * `confirmMagicLink()` or `dismissMagicLink()`.
     */
    getPendingMagicLink(): PendingMagicLink | null;
    /** Sign in with the pending magic link after the person agreed. Replaces any current session. */
    confirmMagicLink(): Promise<AuthonUser>;
    /** Forget the pending magic link without signing in. The link itself stays unused. */
    dismissMagicLink(): void;
    sendEmailOtp(email: string): Promise<void>;
    verifyPasswordless(options: {
        token?: string;
        email?: string;
        code?: string;
    }): Promise<AuthonUser>;
    registerPasskey(name?: string): Promise<PasskeyCredential>;
    authenticateWithPasskey(email?: string): Promise<AuthonUser>;
    listPasskeys(): Promise<PasskeyCredential[]>;
    renamePasskey(passkeyId: string, name: string): Promise<PasskeyCredential>;
    revokePasskey(passkeyId: string): Promise<void>;
    web3GetNonce(address: string, chain: Web3Chain, walletType: Web3WalletType, chainId?: number): Promise<Web3NonceResponse>;
    web3Verify(message: string, signature: string, address: string, chain: Web3Chain, walletType: Web3WalletType): Promise<AuthonUser>;
    listWallets(): Promise<Web3Wallet[]>;
    linkWallet(params: {
        address: string;
        chain: Web3Chain;
        walletType: Web3WalletType;
        chainId?: number;
        message: string;
        signature: string;
    }): Promise<Web3Wallet>;
    unlinkWallet(walletId: string): Promise<void>;
    updateProfile(data: {
        displayName?: string;
        avatarUrl?: string;
        phone?: string;
        publicMetadata?: Record<string, unknown>;
    }): Promise<AuthonUser>;
    listSessions(): Promise<SessionInfo[]>;
    revokeSession(sessionId: string): Promise<void>;
    organizations: {
        list: () => Promise<OrganizationListResponse>;
        create: (params: CreateOrganizationParams) => Promise<AuthonOrganization>;
        get: (orgId: string) => Promise<AuthonOrganization>;
        update: (orgId: string, params: UpdateOrganizationParams) => Promise<AuthonOrganization>;
        delete: (orgId: string) => Promise<void>;
        getMembers: (orgId: string) => Promise<OrganizationMember[]>;
        invite: (orgId: string, params: InviteMemberParams) => Promise<OrganizationInvitation>;
        getInvitations: (orgId: string) => Promise<OrganizationInvitation[]>;
        acceptInvitation: (token: string) => Promise<OrganizationMember>;
        rejectInvitation: (token: string) => Promise<void>;
        removeMember: (orgId: string, memberId: string) => Promise<void>;
        updateMemberRole: (orgId: string, memberId: string, role: string) => Promise<OrganizationMember>;
        leave: (orgId: string) => Promise<void>;
    };
    /** Testing utilities — only available when initialized with a pk_test_ key */
    get testing(): {
        signIn(params: {
            email: string;
            nickname?: string;
        }): Promise<AuthonUser>;
    } | undefined;
    destroy(): void;
    private loadTurnstileScript;
    private emit;
    private ensureInitialized;
    private autoCreateWallet;
    private showBuiltInMagicLinkConfirm;
    private getModal;
    private startOAuthFlow;
    /**
     * Exchanges a one-time OAuth code from Authon for a session. Requires the verifier generated by
     * the SDK instance that started the flow. A wrong verifier counts as a failed attempt; Authon
     * burns the code after 3. Throws AuthonMfaRequiredError (and emits `mfaRequired`) when the user
     * has MFA enabled; finish with verifyMfa(error.mfaToken, code).
     */
    private redeemOAuthCode;
    private normalizeFlowMode;
    private requestOAuthAuthorization;
    private startRedirectOAuthFlow;
    /** Pending redirect sign-in started from this tab, if the page was opened with its result. */
    private oauthRedirectResult;
    private consumeRedirectResultFromUrl;
    private apiGet;
    private apiPost;
    private apiPostAuth;
    private apiGetAuth;
    private apiPatchAuth;
    private apiDeleteAuth;
    private getWalletAddress;
    private requestWalletSignature;
    /** Current page (without hash or magic link params) as the link target, when this instance handles links. */
    private magicLinkReturnUrl;
    private magicLinkRequestKey;
    private sharedMagicLinkRequest;
    private magicLinkNonceKey;
    /**
     * New random value for a link request, kept in this origin's localStorage (shared by its tabs, so
     * the link may open in a new tab). Null when there is no browser storage; such links always ask
     * for confirmation.
     */
    private createMagicLinkNonce;
    private readMagicLinkNonce;
    private restoreMagicLinkNonce;
    private clearMagicLinkNonce;
    /**
     * Read a magic link token from the URL (fragment form first, then the older query form) and
     * remove it from the address bar and history right away, before any request is made.
     */
    private takeMagicLinkTokenFromUrl;
    /**
     * Page-load handling. The link finishes silently only when this browser holds the value sent with
     * the request and nobody is signed in; otherwise it is left unused and the app is asked to confirm.
     * That stops a link someone else requested (for their own account) from signing this browser in.
     */
    private consumeMagicLinkFromUrl;
    /** Authon returns WebAuthn options at the top level; very old servers wrapped them in `options`. */
    private unwrapWebAuthnOptions;
    private credentialBase;
    private bufferToBase64url;
    private base64urlToBuffer;
    private deserializeCreationOptions;
    private deserializeRequestOptions;
    private parseApiError;
}

type AuthonLocale = keyof typeof translations;
declare const translations: {
    readonly en: {
        readonly welcomeBack: "Welcome back";
        readonly createAccount: "Create your account";
        readonly alreadyHaveAccount: "Already have an account?";
        readonly dontHaveAccount: "Don't have an account?";
        readonly signIn: "Sign in";
        readonly signUp: "Sign up";
        readonly or: "or";
        readonly emailAddress: "Email address";
        readonly password: "Password";
        readonly passwordHint: "Must contain uppercase, lowercase, and a number (min 8 chars)";
        readonly continueWith: "Continue with";
        readonly connectWallet: "Connect Wallet";
        readonly magicLink: "Continue with Magic Link";
        readonly passkey: "Sign in with Passkey";
        readonly securedBy: "Secured by";
        readonly backToSignIn: "Back to sign in";
        readonly profile: "Profile";
        readonly editProfile: "Edit Profile";
        readonly displayName: "Display Name";
        readonly save: "Save";
        readonly signOut: "Sign Out";
        readonly sessions: "Active Sessions";
        readonly emailCode: "Continue with email code";
        readonly enterEmail: "Enter your email";
        readonly sendMagicLink: "Send Magic Link";
        readonly sendCode: "Send code";
        readonly sendingMagicLink: "Sending magic link...";
        readonly sendingCode: "Sending code...";
        readonly magicLinkSent: "Magic link sent!";
        readonly checkInbox: "Check your email inbox";
        readonly enterCode: "Enter verification code";
        readonly codeSentTo: "6-digit code sent to {email}";
        readonly cancel: "Cancel";
        readonly magicLinkConfirmTitle: "Sign in with this account?";
        readonly magicLinkConfirmBody: "You will be signed in as {email}. Cancel if you did not request this link.";
        readonly magicLinkConfirmButton: "Sign in";
    };
    readonly ko: {
        readonly welcomeBack: "다시 오신 걸 환영합니다";
        readonly createAccount: "계정 만들기";
        readonly alreadyHaveAccount: "이미 계정이 있으신가요?";
        readonly dontHaveAccount: "계정이 없으신가요?";
        readonly signIn: "로그인";
        readonly signUp: "회원가입";
        readonly or: "또는";
        readonly emailAddress: "이메일 주소";
        readonly password: "비밀번호";
        readonly passwordHint: "대문자, 소문자, 숫자 포함 (최소 8자)";
        readonly continueWith: "(으)로 계속하기";
        readonly connectWallet: "지갑 연결";
        readonly magicLink: "매직 링크로 계속하기";
        readonly passkey: "패스키로 로그인";
        readonly securedBy: "보안 제공";
        readonly backToSignIn: "로그인으로 돌아가기";
        readonly profile: "프로필";
        readonly editProfile: "프로필 편집";
        readonly displayName: "표시 이름";
        readonly save: "저장";
        readonly signOut: "로그아웃";
        readonly sessions: "활성 세션";
        readonly emailCode: "이메일 코드로 계속하기";
        readonly enterEmail: "이메일을 입력하세요";
        readonly sendMagicLink: "매직 링크 보내기";
        readonly sendCode: "코드 보내기";
        readonly sendingMagicLink: "매직 링크를 보내는 중...";
        readonly sendingCode: "코드를 보내는 중...";
        readonly magicLinkSent: "매직 링크를 보냈습니다";
        readonly checkInbox: "메일함에서 링크를 눌러 주세요";
        readonly enterCode: "받은 코드를 입력하세요";
        readonly codeSentTo: "{email}(으)로 6자리 코드를 보냈습니다";
        readonly cancel: "취소";
        readonly magicLinkConfirmTitle: "이 계정으로 로그인할까요?";
        readonly magicLinkConfirmBody: "{email} 계정으로 로그인합니다. 직접 요청한 링크가 아니면 취소를 눌러 주세요.";
        readonly magicLinkConfirmButton: "로그인";
    };
    readonly ja: {
        readonly welcomeBack: "おかえりなさい";
        readonly createAccount: "アカウントを作成";
        readonly alreadyHaveAccount: "すでにアカウントをお持ちですか？";
        readonly dontHaveAccount: "アカウントをお持ちでないですか？";
        readonly signIn: "ログイン";
        readonly signUp: "新規登録";
        readonly or: "または";
        readonly emailAddress: "メールアドレス";
        readonly password: "パスワード";
        readonly passwordHint: "大文字、小文字、数字を含む（8文字以上）";
        readonly continueWith: "で続行";
        readonly connectWallet: "ウォレット接続";
        readonly magicLink: "マジックリンクで続行";
        readonly passkey: "パスキーでログイン";
        readonly securedBy: "セキュリティ提供";
        readonly backToSignIn: "ログインに戻る";
        readonly profile: "プロフィール";
        readonly editProfile: "プロフィール編集";
        readonly displayName: "表示名";
        readonly save: "保存";
        readonly signOut: "サインアウト";
        readonly sessions: "アクティブセッション";
        readonly emailCode: "メールコードで続行";
        readonly enterEmail: "メールアドレスを入力";
        readonly sendMagicLink: "マジックリンクを送信";
        readonly sendCode: "コードを送信";
        readonly sendingMagicLink: "マジックリンクを送信中...";
        readonly sendingCode: "コードを送信中...";
        readonly magicLinkSent: "マジックリンクを送信しました";
        readonly checkInbox: "メールの受信トレイを確認してください";
        readonly enterCode: "認証コードを入力";
        readonly codeSentTo: "{email} に6桁のコードを送信しました";
        readonly cancel: "キャンセル";
        readonly magicLinkConfirmTitle: "このアカウントでログインしますか？";
        readonly magicLinkConfirmBody: "{email} としてログインします。このマジックリンクをリクエストしていない場合は、キャンセルしてください。";
        readonly magicLinkConfirmButton: "ログイン";
    };
    readonly 'zh-CN': {
        readonly welcomeBack: "欢迎回来";
        readonly createAccount: "创建账户";
        readonly alreadyHaveAccount: "已有账户？";
        readonly dontHaveAccount: "没有账户？";
        readonly signIn: "登录";
        readonly signUp: "注册";
        readonly or: "或";
        readonly emailAddress: "邮箱地址";
        readonly password: "密码";
        readonly passwordHint: "需包含大写、小写字母和数字（至少8位）";
        readonly continueWith: "继续使用";
        readonly connectWallet: "连接钱包";
        readonly magicLink: "使用魔法链接继续";
        readonly passkey: "使用通行密钥登录";
        readonly securedBy: "安全保障";
        readonly backToSignIn: "返回登录";
        readonly profile: "个人资料";
        readonly editProfile: "编辑资料";
        readonly displayName: "显示名称";
        readonly save: "保存";
        readonly signOut: "退出登录";
        readonly sessions: "活跃会话";
        readonly emailCode: "使用邮箱验证码继续";
        readonly enterEmail: "请输入邮箱";
        readonly sendMagicLink: "发送魔法链接";
        readonly sendCode: "发送验证码";
        readonly sendingMagicLink: "正在发送魔法链接...";
        readonly sendingCode: "正在发送验证码...";
        readonly magicLinkSent: "魔法链接已发送！";
        readonly checkInbox: "请查看邮箱收件箱";
        readonly enterCode: "输入验证码";
        readonly codeSentTo: "6 位验证码已发送至 {email}";
        readonly cancel: "取消";
        readonly magicLinkConfirmTitle: "要使用此账号登录吗？";
        readonly magicLinkConfirmBody: "将以 {email} 的身份登录。如果并非本人请求此魔法链接，请取消。";
        readonly magicLinkConfirmButton: "登录";
    };
    readonly 'zh-TW': {
        readonly welcomeBack: "歡迎回來";
        readonly createAccount: "建立帳戶";
        readonly alreadyHaveAccount: "已有帳戶？";
        readonly dontHaveAccount: "沒有帳戶？";
        readonly signIn: "登入";
        readonly signUp: "註冊";
        readonly or: "或";
        readonly emailAddress: "電子郵件";
        readonly password: "密碼";
        readonly passwordHint: "需包含大寫、小寫字母和數字（至少8位）";
        readonly continueWith: "繼續使用";
        readonly connectWallet: "連接錢包";
        readonly magicLink: "使用魔法連結繼續";
        readonly passkey: "使用通行金鑰登入";
        readonly securedBy: "安全保障";
        readonly backToSignIn: "返回登入";
        readonly profile: "個人資料";
        readonly editProfile: "編輯資料";
        readonly displayName: "顯示名稱";
        readonly save: "儲存";
        readonly signOut: "登出";
        readonly sessions: "活躍工作階段";
        readonly emailCode: "使用電子郵件驗證碼繼續";
        readonly enterEmail: "請輸入電子郵件";
        readonly sendMagicLink: "傳送魔法連結";
        readonly sendCode: "傳送驗證碼";
        readonly sendingMagicLink: "正在傳送魔法連結...";
        readonly sendingCode: "正在傳送驗證碼...";
        readonly magicLinkSent: "魔法連結已傳送！";
        readonly checkInbox: "請查看電子郵件收件匣";
        readonly enterCode: "輸入驗證碼";
        readonly codeSentTo: "6 位數驗證碼已傳送至 {email}";
        readonly cancel: "取消";
        readonly magicLinkConfirmTitle: "要使用此帳號登入嗎？";
        readonly magicLinkConfirmBody: "將以 {email} 的身分登入。若並非本人請求此魔法連結，請取消。";
        readonly magicLinkConfirmButton: "登入";
    };
    readonly 'pt-BR': {
        readonly welcomeBack: "Bem-vindo de volta";
        readonly createAccount: "Crie sua conta";
        readonly alreadyHaveAccount: "Ja tem uma conta?";
        readonly dontHaveAccount: "Nao tem uma conta?";
        readonly signIn: "Entrar";
        readonly signUp: "Cadastrar";
        readonly or: "ou";
        readonly emailAddress: "Endereco de e-mail";
        readonly password: "Senha";
        readonly passwordHint: "Deve conter maiusculas, minusculas e numeros (min 8 caracteres)";
        readonly continueWith: "Continuar com";
        readonly connectWallet: "Conectar carteira";
        readonly magicLink: "Continuar com Magic Link";
        readonly passkey: "Entrar com Passkey";
        readonly securedBy: "Protegido por";
        readonly backToSignIn: "Voltar ao login";
        readonly profile: "Perfil";
        readonly editProfile: "Editar perfil";
        readonly displayName: "Nome de exibicao";
        readonly save: "Salvar";
        readonly signOut: "Sair";
        readonly sessions: "Sessoes ativas";
        readonly emailCode: "Continuar com codigo por e-mail";
        readonly enterEmail: "Digite seu e-mail";
        readonly sendMagicLink: "Enviar Magic Link";
        readonly sendCode: "Enviar codigo";
        readonly sendingMagicLink: "Enviando magic link...";
        readonly sendingCode: "Enviando codigo...";
        readonly magicLinkSent: "Magic link enviado!";
        readonly checkInbox: "Verifique sua caixa de entrada";
        readonly enterCode: "Digite o codigo de verificacao";
        readonly codeSentTo: "Codigo de 6 digitos enviado para {email}";
        readonly cancel: "Cancelar";
        readonly magicLinkConfirmTitle: "Entrar com esta conta?";
        readonly magicLinkConfirmBody: "Voce entrara como {email}. Cancele se nao foi voce quem solicitou este Magic Link.";
        readonly magicLinkConfirmButton: "Entrar";
    };
    readonly es: {
        readonly welcomeBack: "Bienvenido de nuevo";
        readonly createAccount: "Crea tu cuenta";
        readonly alreadyHaveAccount: "Ya tienes una cuenta?";
        readonly dontHaveAccount: "No tienes una cuenta?";
        readonly signIn: "Iniciar sesion";
        readonly signUp: "Registrarse";
        readonly or: "o";
        readonly emailAddress: "Correo electronico";
        readonly password: "Contrasena";
        readonly passwordHint: "Debe contener mayusculas, minusculas y numeros (min 8 caracteres)";
        readonly continueWith: "Continuar con";
        readonly connectWallet: "Conectar billetera";
        readonly magicLink: "Continuar con Magic Link";
        readonly passkey: "Iniciar con Passkey";
        readonly securedBy: "Protegido por";
        readonly backToSignIn: "Volver al inicio de sesion";
        readonly profile: "Perfil";
        readonly editProfile: "Editar perfil";
        readonly displayName: "Nombre de visualizacion";
        readonly save: "Guardar";
        readonly signOut: "Cerrar sesion";
        readonly sessions: "Sesiones activas";
        readonly emailCode: "Continuar con codigo por correo";
        readonly enterEmail: "Introduce tu correo electronico";
        readonly sendMagicLink: "Enviar Magic Link";
        readonly sendCode: "Enviar codigo";
        readonly sendingMagicLink: "Enviando magic link...";
        readonly sendingCode: "Enviando codigo...";
        readonly magicLinkSent: "Magic link enviado!";
        readonly checkInbox: "Revisa tu bandeja de entrada";
        readonly enterCode: "Introduce el codigo de verificacion";
        readonly codeSentTo: "Codigo de 6 digitos enviado a {email}";
        readonly cancel: "Cancelar";
        readonly magicLinkConfirmTitle: "Iniciar sesion con esta cuenta?";
        readonly magicLinkConfirmBody: "Iniciaras sesion como {email}. Cancela si no solicitaste este Magic Link.";
        readonly magicLinkConfirmButton: "Iniciar sesion";
    };
    readonly de: {
        readonly welcomeBack: "Willkommen zuruck";
        readonly createAccount: "Konto erstellen";
        readonly alreadyHaveAccount: "Bereits ein Konto?";
        readonly dontHaveAccount: "Noch kein Konto?";
        readonly signIn: "Anmelden";
        readonly signUp: "Registrieren";
        readonly or: "oder";
        readonly emailAddress: "E-Mail-Adresse";
        readonly password: "Passwort";
        readonly passwordHint: "Gross-/Kleinbuchstaben und Zahl erforderlich (mind. 8 Zeichen)";
        readonly continueWith: "Weiter mit";
        readonly connectWallet: "Wallet verbinden";
        readonly magicLink: "Weiter mit Magic Link";
        readonly passkey: "Mit Passkey anmelden";
        readonly securedBy: "Gesichert durch";
        readonly backToSignIn: "Zuruck zur Anmeldung";
        readonly profile: "Profil";
        readonly editProfile: "Profil bearbeiten";
        readonly displayName: "Anzeigename";
        readonly save: "Speichern";
        readonly signOut: "Abmelden";
        readonly sessions: "Aktive Sitzungen";
        readonly emailCode: "Weiter mit E-Mail-Code";
        readonly enterEmail: "E-Mail-Adresse eingeben";
        readonly sendMagicLink: "Magic Link senden";
        readonly sendCode: "Code senden";
        readonly sendingMagicLink: "Magic Link wird gesendet...";
        readonly sendingCode: "Code wird gesendet...";
        readonly magicLinkSent: "Magic Link gesendet!";
        readonly checkInbox: "Prufe dein E-Mail-Postfach";
        readonly enterCode: "Bestatigungscode eingeben";
        readonly codeSentTo: "6-stelliger Code an {email} gesendet";
        readonly cancel: "Abbrechen";
        readonly magicLinkConfirmTitle: "Mit diesem Konto anmelden?";
        readonly magicLinkConfirmBody: "Sie werden als {email} angemeldet. Brechen Sie ab, wenn Sie diesen Magic Link nicht angefordert haben.";
        readonly magicLinkConfirmButton: "Anmelden";
    };
    readonly fr: {
        readonly welcomeBack: "Bon retour";
        readonly createAccount: "Creez votre compte";
        readonly alreadyHaveAccount: "Vous avez deja un compte ?";
        readonly dontHaveAccount: "Vous n'avez pas de compte ?";
        readonly signIn: "Se connecter";
        readonly signUp: "S'inscrire";
        readonly or: "ou";
        readonly emailAddress: "Adresse e-mail";
        readonly password: "Mot de passe";
        readonly passwordHint: "Doit contenir majuscules, minuscules et chiffres (min 8 caracteres)";
        readonly continueWith: "Continuer avec";
        readonly connectWallet: "Connecter le portefeuille";
        readonly magicLink: "Continuer avec Magic Link";
        readonly passkey: "Se connecter avec Passkey";
        readonly securedBy: "Securise par";
        readonly backToSignIn: "Retour a la connexion";
        readonly profile: "Profil";
        readonly editProfile: "Modifier le profil";
        readonly displayName: "Nom d'affichage";
        readonly save: "Enregistrer";
        readonly signOut: "Se deconnecter";
        readonly sessions: "Sessions actives";
        readonly emailCode: "Continuer avec un code par e-mail";
        readonly enterEmail: "Saisissez votre e-mail";
        readonly sendMagicLink: "Envoyer le Magic Link";
        readonly sendCode: "Envoyer le code";
        readonly sendingMagicLink: "Envoi du magic link...";
        readonly sendingCode: "Envoi du code...";
        readonly magicLinkSent: "Magic link envoye !";
        readonly checkInbox: "Verifiez votre boite de reception";
        readonly enterCode: "Saisissez le code de verification";
        readonly codeSentTo: "Code a 6 chiffres envoye a {email}";
        readonly cancel: "Annuler";
        readonly magicLinkConfirmTitle: "Se connecter avec ce compte ?";
        readonly magicLinkConfirmBody: "Vous serez connecte en tant que {email}. Annulez si ce Magic Link ne vient pas de vous.";
        readonly magicLinkConfirmButton: "Se connecter";
    };
    readonly hi: {
        readonly welcomeBack: "वापसी पर स्वागत है";
        readonly createAccount: "अपना खाता बनाएं";
        readonly alreadyHaveAccount: "पहले से खाता है?";
        readonly dontHaveAccount: "खाता नहीं है?";
        readonly signIn: "साइन इन";
        readonly signUp: "साइन अप";
        readonly or: "या";
        readonly emailAddress: "ईमेल पता";
        readonly password: "पासवर्ड";
        readonly passwordHint: "बड़े, छोटे अक्षर और संख्या आवश्यक (कम से कम 8 अक्षर)";
        readonly continueWith: "से जारी रखें";
        readonly connectWallet: "वॉलेट कनेक्ट करें";
        readonly magicLink: "मैजिक लिंक से जारी रखें";
        readonly passkey: "पासकी से साइन इन";
        readonly securedBy: "सुरक्षा प्रदाता";
        readonly backToSignIn: "साइन इन पर वापस जाएं";
        readonly profile: "प्रोफ़ाइल";
        readonly editProfile: "प्रोफ़ाइल संपादित करें";
        readonly displayName: "प्रदर्शन नाम";
        readonly save: "सहेजें";
        readonly signOut: "साइन आउट";
        readonly sessions: "सक्रिय सत्र";
        readonly emailCode: "ईमेल कोड से जारी रखें";
        readonly enterEmail: "अपना ईमेल दर्ज करें";
        readonly sendMagicLink: "मैजिक लिंक भेजें";
        readonly sendCode: "कोड भेजें";
        readonly sendingMagicLink: "मैजिक लिंक भेजा जा रहा है...";
        readonly sendingCode: "कोड भेजा जा रहा है...";
        readonly magicLinkSent: "मैजिक लिंक भेज दिया गया!";
        readonly checkInbox: "अपना ईमेल इनबॉक्स देखें";
        readonly enterCode: "सत्यापन कोड दर्ज करें";
        readonly codeSentTo: "{email} पर 6 अंकों का कोड भेजा गया";
        readonly cancel: "रद्द करें";
        readonly magicLinkConfirmTitle: "क्या इस खाते से साइन इन करें?";
        readonly magicLinkConfirmBody: "आप {email} के रूप में साइन इन होंगे। अगर आपने यह मैजिक लिंक नहीं मँगाया है, तो रद्द करें।";
        readonly magicLinkConfirmButton: "साइन इन";
    };
    readonly tr: {
        readonly welcomeBack: "Tekrar hos geldiniz";
        readonly createAccount: "Hesap olusturun";
        readonly alreadyHaveAccount: "Zaten bir hesabiniz var mi?";
        readonly dontHaveAccount: "Hesabiniz yok mu?";
        readonly signIn: "Giris yap";
        readonly signUp: "Kaydol";
        readonly or: "veya";
        readonly emailAddress: "E-posta adresi";
        readonly password: "Sifre";
        readonly passwordHint: "Buyuk, kucuk harf ve rakam icermeli (en az 8 karakter)";
        readonly continueWith: "ile devam et";
        readonly connectWallet: "Cuzdan bagla";
        readonly magicLink: "Magic Link ile devam et";
        readonly passkey: "Passkey ile giris yap";
        readonly securedBy: "Guvenlik saglayici";
        readonly backToSignIn: "Girise don";
        readonly profile: "Profil";
        readonly editProfile: "Profili duzenle";
        readonly displayName: "Goruntu adi";
        readonly save: "Kaydet";
        readonly signOut: "Cikis yap";
        readonly sessions: "Aktif oturumlar";
        readonly emailCode: "E-posta kodu ile devam et";
        readonly enterEmail: "E-posta adresinizi girin";
        readonly sendMagicLink: "Magic Link gonder";
        readonly sendCode: "Kod gonder";
        readonly sendingMagicLink: "Magic Link gonderiliyor...";
        readonly sendingCode: "Kod gonderiliyor...";
        readonly magicLinkSent: "Magic Link gonderildi!";
        readonly checkInbox: "E-posta kutunuzu kontrol edin";
        readonly enterCode: "Dogrulama kodunu girin";
        readonly codeSentTo: "{email} adresine 6 haneli kod gonderildi";
        readonly cancel: "Iptal";
        readonly magicLinkConfirmTitle: "Bu hesapla giris yapilsin mi?";
        readonly magicLinkConfirmBody: "{email} olarak giris yapacaksiniz. Bu Magic Link istegini siz yapmadiysaniz iptal edin.";
        readonly magicLinkConfirmButton: "Giris yap";
    };
    readonly id: {
        readonly welcomeBack: "Selamat datang kembali";
        readonly createAccount: "Buat akun Anda";
        readonly alreadyHaveAccount: "Sudah punya akun?";
        readonly dontHaveAccount: "Belum punya akun?";
        readonly signIn: "Masuk";
        readonly signUp: "Daftar";
        readonly or: "atau";
        readonly emailAddress: "Alamat email";
        readonly password: "Kata sandi";
        readonly passwordHint: "Harus mengandung huruf besar, kecil, dan angka (min 8 karakter)";
        readonly continueWith: "Lanjutkan dengan";
        readonly connectWallet: "Hubungkan dompet";
        readonly magicLink: "Lanjutkan dengan Magic Link";
        readonly passkey: "Masuk dengan Passkey";
        readonly securedBy: "Diamankan oleh";
        readonly backToSignIn: "Kembali ke login";
        readonly profile: "Profil";
        readonly editProfile: "Edit profil";
        readonly displayName: "Nama tampilan";
        readonly save: "Simpan";
        readonly signOut: "Keluar";
        readonly sessions: "Sesi aktif";
        readonly emailCode: "Lanjutkan dengan kode email";
        readonly enterEmail: "Masukkan email Anda";
        readonly sendMagicLink: "Kirim Magic Link";
        readonly sendCode: "Kirim kode";
        readonly sendingMagicLink: "Mengirim magic link...";
        readonly sendingCode: "Mengirim kode...";
        readonly magicLinkSent: "Magic link terkirim!";
        readonly checkInbox: "Periksa kotak masuk email Anda";
        readonly enterCode: "Masukkan kode verifikasi";
        readonly codeSentTo: "Kode 6 digit dikirim ke {email}";
        readonly cancel: "Batal";
        readonly magicLinkConfirmTitle: "Masuk dengan akun ini?";
        readonly magicLinkConfirmBody: "Anda akan masuk sebagai {email}. Pilih Batal jika Anda tidak meminta Magic link ini.";
        readonly magicLinkConfirmButton: "Masuk";
    };
    readonly vi: {
        readonly welcomeBack: "Chao mung tro lai";
        readonly createAccount: "Tao tai khoan";
        readonly alreadyHaveAccount: "Da co tai khoan?";
        readonly dontHaveAccount: "Chua co tai khoan?";
        readonly signIn: "Dang nhap";
        readonly signUp: "Dang ky";
        readonly or: "hoac";
        readonly emailAddress: "Dia chi email";
        readonly password: "Mat khau";
        readonly passwordHint: "Can chu hoa, chu thuong va so (toi thieu 8 ky tu)";
        readonly continueWith: "Tiep tuc voi";
        readonly connectWallet: "Ket noi vi";
        readonly magicLink: "Tiep tuc voi Magic Link";
        readonly passkey: "Dang nhap voi Passkey";
        readonly securedBy: "Bao mat boi";
        readonly backToSignIn: "Quay lai dang nhap";
        readonly profile: "Ho so";
        readonly editProfile: "Chinh sua ho so";
        readonly displayName: "Ten hien thi";
        readonly save: "Luu";
        readonly signOut: "Dang xuat";
        readonly sessions: "Phien dang nhap hoat dong";
        readonly emailCode: "Tiep tuc voi ma qua email";
        readonly enterEmail: "Nhap email cua ban";
        readonly sendMagicLink: "Gui Magic Link";
        readonly sendCode: "Gui ma";
        readonly sendingMagicLink: "Dang gui magic link...";
        readonly sendingCode: "Dang gui ma...";
        readonly magicLinkSent: "Da gui magic link!";
        readonly checkInbox: "Kiem tra hop thu email cua ban";
        readonly enterCode: "Nhap ma xac minh";
        readonly codeSentTo: "Ma 6 chu so da gui den {email}";
        readonly cancel: "Huy";
        readonly magicLinkConfirmTitle: "Dang nhap bang tai khoan nay?";
        readonly magicLinkConfirmBody: "Ban se dang nhap voi tu cach {email}. Hay chon Huy neu ban khong yeu cau magic link nay.";
        readonly magicLinkConfirmButton: "Dang nhap";
    };
    readonly th: {
        readonly welcomeBack: "ยินดีต้อนรับกลับ";
        readonly createAccount: "สร้างบัญชี";
        readonly alreadyHaveAccount: "มีบัญชีอยู่แล้ว?";
        readonly dontHaveAccount: "ยังไม่มีบัญชี?";
        readonly signIn: "เข้าสู่ระบบ";
        readonly signUp: "สมัครสมาชิก";
        readonly or: "หรือ";
        readonly emailAddress: "อีเมล";
        readonly password: "รหัสผ่าน";
        readonly passwordHint: "ต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข (อย่างน้อย 8 ตัว)";
        readonly continueWith: "ดำเนินการต่อด้วย";
        readonly connectWallet: "เชื่อมต่อกระเป๋า";
        readonly magicLink: "ดำเนินการต่อด้วย Magic Link";
        readonly passkey: "เข้าสู่ระบบด้วย Passkey";
        readonly securedBy: "รักษาความปลอดภัยโดย";
        readonly backToSignIn: "กลับไปเข้าสู่ระบบ";
        readonly profile: "โปรไฟล์";
        readonly editProfile: "แก้ไขโปรไฟล์";
        readonly displayName: "ชื่อที่แสดง";
        readonly save: "บันทึก";
        readonly signOut: "ออกจากระบบ";
        readonly sessions: "เซสชันที่ใช้งานอยู่";
        readonly emailCode: "ดำเนินการต่อด้วยรหัสทางอีเมล";
        readonly enterEmail: "กรอกอีเมลของคุณ";
        readonly sendMagicLink: "ส่ง Magic Link";
        readonly sendCode: "ส่งรหัส";
        readonly sendingMagicLink: "กำลังส่ง Magic Link...";
        readonly sendingCode: "กำลังส่งรหัส...";
        readonly magicLinkSent: "ส่ง Magic Link แล้ว!";
        readonly checkInbox: "ตรวจสอบกล่องจดหมายอีเมลของคุณ";
        readonly enterCode: "กรอกรหัสยืนยัน";
        readonly codeSentTo: "ส่งรหัส 6 หลักไปที่ {email} แล้ว";
        readonly cancel: "ยกเลิก";
        readonly magicLinkConfirmTitle: "เข้าสู่ระบบด้วยบัญชีนี้หรือไม่?";
        readonly magicLinkConfirmBody: "คุณจะเข้าสู่ระบบในชื่อ {email} หากคุณไม่ได้ขอ Magic Link นี้ ให้กดยกเลิก";
        readonly magicLinkConfirmButton: "เข้าสู่ระบบ";
    };
    readonly ru: {
        readonly welcomeBack: "С возвращением";
        readonly createAccount: "Создайте аккаунт";
        readonly alreadyHaveAccount: "Уже есть аккаунт?";
        readonly dontHaveAccount: "Нет аккаунта?";
        readonly signIn: "Войти";
        readonly signUp: "Зарегистрироваться";
        readonly or: "или";
        readonly emailAddress: "Электронная почта";
        readonly password: "Пароль";
        readonly passwordHint: "Заглавные, строчные буквы и цифры (мин. 8 символов)";
        readonly continueWith: "Продолжить с";
        readonly connectWallet: "Подключить кошелек";
        readonly magicLink: "Продолжить с Magic Link";
        readonly passkey: "Войти с Passkey";
        readonly securedBy: "Защищено";
        readonly backToSignIn: "Вернуться к входу";
        readonly profile: "Профиль";
        readonly editProfile: "Редактировать профиль";
        readonly displayName: "Отображаемое имя";
        readonly save: "Сохранить";
        readonly signOut: "Выйти";
        readonly sessions: "Активные сеансы";
        readonly emailCode: "Продолжить с кодом из письма";
        readonly enterEmail: "Введите адрес электронной почты";
        readonly sendMagicLink: "Отправить Magic Link";
        readonly sendCode: "Отправить код";
        readonly sendingMagicLink: "Отправка Magic Link...";
        readonly sendingCode: "Отправка кода...";
        readonly magicLinkSent: "Magic Link отправлен!";
        readonly checkInbox: "Проверьте входящие письма";
        readonly enterCode: "Введите код подтверждения";
        readonly codeSentTo: "6-значный код отправлен на {email}";
        readonly cancel: "Отмена";
        readonly magicLinkConfirmTitle: "Войти с этой учетной записью?";
        readonly magicLinkConfirmBody: "Вы войдете как {email}. Нажмите «Отмена», если вы не запрашивали этот Magic Link.";
        readonly magicLinkConfirmButton: "Войти";
    };
    readonly it: {
        readonly welcomeBack: "Bentornato";
        readonly createAccount: "Crea il tuo account";
        readonly alreadyHaveAccount: "Hai gia un account?";
        readonly dontHaveAccount: "Non hai un account?";
        readonly signIn: "Accedi";
        readonly signUp: "Registrati";
        readonly or: "o";
        readonly emailAddress: "Indirizzo email";
        readonly password: "Password";
        readonly passwordHint: "Deve contenere maiuscole, minuscole e numeri (min 8 caratteri)";
        readonly continueWith: "Continua con";
        readonly connectWallet: "Connetti portafoglio";
        readonly magicLink: "Continua con Magic Link";
        readonly passkey: "Accedi con Passkey";
        readonly securedBy: "Protetto da";
        readonly backToSignIn: "Torna all'accesso";
        readonly profile: "Profilo";
        readonly editProfile: "Modifica profilo";
        readonly displayName: "Nome visualizzato";
        readonly save: "Salva";
        readonly signOut: "Esci";
        readonly sessions: "Sessioni attive";
        readonly emailCode: "Continua con codice via email";
        readonly enterEmail: "Inserisci la tua email";
        readonly sendMagicLink: "Invia Magic Link";
        readonly sendCode: "Invia codice";
        readonly sendingMagicLink: "Invio del magic link...";
        readonly sendingCode: "Invio del codice...";
        readonly magicLinkSent: "Magic link inviato!";
        readonly checkInbox: "Controlla la tua casella email";
        readonly enterCode: "Inserisci il codice di verifica";
        readonly codeSentTo: "Codice a 6 cifre inviato a {email}";
        readonly cancel: "Annulla";
        readonly magicLinkConfirmTitle: "Accedere con questo account?";
        readonly magicLinkConfirmBody: "Accederai come {email}. Annulla se non hai richiesto questo Magic link.";
        readonly magicLinkConfirmButton: "Accedi";
    };
    readonly pl: {
        readonly welcomeBack: "Witaj ponownie";
        readonly createAccount: "Utworz konto";
        readonly alreadyHaveAccount: "Masz juz konto?";
        readonly dontHaveAccount: "Nie masz konta?";
        readonly signIn: "Zaloguj sie";
        readonly signUp: "Zarejestruj sie";
        readonly or: "lub";
        readonly emailAddress: "Adres e-mail";
        readonly password: "Haslo";
        readonly passwordHint: "Wielkie, male litery i cyfry (min 8 znakow)";
        readonly continueWith: "Kontynuuj z";
        readonly connectWallet: "Polacz portfel";
        readonly magicLink: "Kontynuuj z Magic Link";
        readonly passkey: "Zaloguj sie z Passkey";
        readonly securedBy: "Zabezpieczone przez";
        readonly backToSignIn: "Powrot do logowania";
        readonly profile: "Profil";
        readonly editProfile: "Edytuj profil";
        readonly displayName: "Nazwa wyswietlana";
        readonly save: "Zapisz";
        readonly signOut: "Wyloguj sie";
        readonly sessions: "Aktywne sesje";
        readonly emailCode: "Kontynuuj z kodem e-mail";
        readonly enterEmail: "Wpisz swoj e-mail";
        readonly sendMagicLink: "Wyslij Magic Link";
        readonly sendCode: "Wyslij kod";
        readonly sendingMagicLink: "Wysylanie magic linku...";
        readonly sendingCode: "Wysylanie kodu...";
        readonly magicLinkSent: "Magic Link wyslany!";
        readonly checkInbox: "Sprawdz swoja skrzynke e-mail";
        readonly enterCode: "Wpisz kod weryfikacyjny";
        readonly codeSentTo: "6-cyfrowy kod wyslano na {email}";
        readonly cancel: "Anuluj";
        readonly magicLinkConfirmTitle: "Zalogowac sie na to konto?";
        readonly magicLinkConfirmBody: "Zostaniesz zalogowany jako {email}. Anuluj, jesli nie prosiles o ten Magic Link.";
        readonly magicLinkConfirmButton: "Zaloguj sie";
    };
    readonly nl: {
        readonly welcomeBack: "Welkom terug";
        readonly createAccount: "Maak je account aan";
        readonly alreadyHaveAccount: "Heb je al een account?";
        readonly dontHaveAccount: "Nog geen account?";
        readonly signIn: "Inloggen";
        readonly signUp: "Registreren";
        readonly or: "of";
        readonly emailAddress: "E-mailadres";
        readonly password: "Wachtwoord";
        readonly passwordHint: "Hoofdletters, kleine letters en cijfers vereist (min 8 tekens)";
        readonly continueWith: "Doorgaan met";
        readonly connectWallet: "Portemonnee verbinden";
        readonly magicLink: "Doorgaan met Magic Link";
        readonly passkey: "Inloggen met Passkey";
        readonly securedBy: "Beveiligd door";
        readonly backToSignIn: "Terug naar inloggen";
        readonly profile: "Profiel";
        readonly editProfile: "Profiel bewerken";
        readonly displayName: "Weergavenaam";
        readonly save: "Opslaan";
        readonly signOut: "Uitloggen";
        readonly sessions: "Actieve sessies";
        readonly emailCode: "Doorgaan met e-mailcode";
        readonly enterEmail: "Voer je e-mailadres in";
        readonly sendMagicLink: "Magic Link versturen";
        readonly sendCode: "Code versturen";
        readonly sendingMagicLink: "Magic Link wordt verstuurd...";
        readonly sendingCode: "Code wordt verstuurd...";
        readonly magicLinkSent: "Magic Link verstuurd!";
        readonly checkInbox: "Controleer je e-mailinbox";
        readonly enterCode: "Voer de verificatiecode in";
        readonly codeSentTo: "Code van 6 cijfers verstuurd naar {email}";
        readonly cancel: "Annuleren";
        readonly magicLinkConfirmTitle: "Inloggen met dit account?";
        readonly magicLinkConfirmBody: "Je wordt ingelogd als {email}. Annuleer als je deze Magic Link niet hebt aangevraagd.";
        readonly magicLinkConfirmButton: "Inloggen";
    };
    readonly ar: {
        readonly welcomeBack: "مرحبًا بعودتك";
        readonly createAccount: "أنشئ حسابك";
        readonly alreadyHaveAccount: "لديك حساب بالفعل؟";
        readonly dontHaveAccount: "ليس لديك حساب؟";
        readonly signIn: "تسجيل الدخول";
        readonly signUp: "إنشاء حساب";
        readonly or: "أو";
        readonly emailAddress: "البريد الإلكتروني";
        readonly password: "كلمة المرور";
        readonly passwordHint: "يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام (8 أحرف على الأقل)";
        readonly continueWith: "المتابعة باستخدام";
        readonly connectWallet: "ربط المحفظة";
        readonly magicLink: "المتابعة باستخدام Magic Link";
        readonly passkey: "تسجيل الدخول باستخدام Passkey";
        readonly securedBy: "محمي بواسطة";
        readonly backToSignIn: "العودة لتسجيل الدخول";
        readonly profile: "الملف الشخصي";
        readonly editProfile: "تعديل الملف الشخصي";
        readonly displayName: "الاسم المعروض";
        readonly save: "حفظ";
        readonly signOut: "تسجيل الخروج";
        readonly sessions: "الجلسات النشطة";
        readonly emailCode: "المتابعة باستخدام رمز البريد الإلكتروني";
        readonly enterEmail: "أدخل بريدك الإلكتروني";
        readonly sendMagicLink: "إرسال Magic Link";
        readonly sendCode: "إرسال الرمز";
        readonly sendingMagicLink: "جارٍ إرسال Magic Link...";
        readonly sendingCode: "جارٍ إرسال الرمز...";
        readonly magicLinkSent: "تم إرسال Magic Link!";
        readonly checkInbox: "تحقق من صندوق بريدك الإلكتروني";
        readonly enterCode: "أدخل رمز التحقق";
        readonly codeSentTo: "تم إرسال رمز من 6 أرقام إلى {email}";
        readonly cancel: "إلغاء";
        readonly magicLinkConfirmTitle: "تسجيل الدخول بهذا الحساب؟";
        readonly magicLinkConfirmBody: "سيتم تسجيل دخولك باسم {email}. ألغِ العملية إذا لم تطلب Magic Link هذا.";
        readonly magicLinkConfirmButton: "تسجيل الدخول";
    };
    readonly sv: {
        readonly welcomeBack: "Valkommen tillbaka";
        readonly createAccount: "Skapa ditt konto";
        readonly alreadyHaveAccount: "Har du redan ett konto?";
        readonly dontHaveAccount: "Har du inget konto?";
        readonly signIn: "Logga in";
        readonly signUp: "Registrera dig";
        readonly or: "eller";
        readonly emailAddress: "E-postadress";
        readonly password: "Losenord";
        readonly passwordHint: "Stora, sma bokstaver och siffror kravs (minst 8 tecken)";
        readonly continueWith: "Fortsatt med";
        readonly connectWallet: "Anslut planbok";
        readonly magicLink: "Fortsatt med Magic Link";
        readonly passkey: "Logga in med Passkey";
        readonly securedBy: "Sakrad av";
        readonly backToSignIn: "Tillbaka till inloggning";
        readonly profile: "Profil";
        readonly editProfile: "Redigera profil";
        readonly displayName: "Visningsnamn";
        readonly save: "Spara";
        readonly signOut: "Logga ut";
        readonly sessions: "Aktiva sessioner";
        readonly emailCode: "Fortsatt med e-postkod";
        readonly enterEmail: "Ange din e-post";
        readonly sendMagicLink: "Skicka Magic Link";
        readonly sendCode: "Skicka kod";
        readonly sendingMagicLink: "Skickar magic link...";
        readonly sendingCode: "Skickar kod...";
        readonly magicLinkSent: "Magic link skickad!";
        readonly checkInbox: "Kontrollera din inkorg";
        readonly enterCode: "Ange verifieringskod";
        readonly codeSentTo: "6-siffrig kod skickad till {email}";
        readonly cancel: "Avbryt";
        readonly magicLinkConfirmTitle: "Logga in med det har kontot?";
        readonly magicLinkConfirmBody: "Du loggas in som {email}. Avbryt om du inte har begart denna Magic link.";
        readonly magicLinkConfirmButton: "Logga in";
    };
    readonly uk: {
        readonly welcomeBack: "З поверненням";
        readonly createAccount: "Створіть обліковий запис";
        readonly alreadyHaveAccount: "Вже є обліковий запис?";
        readonly dontHaveAccount: "Немає облікового запису?";
        readonly signIn: "Увійти";
        readonly signUp: "Зареєструватися";
        readonly or: "або";
        readonly emailAddress: "Електронна пошта";
        readonly password: "Пароль";
        readonly passwordHint: "Великі, малі літери та цифри (мін. 8 символів)";
        readonly continueWith: "Продовжити з";
        readonly connectWallet: "Підключити гаманець";
        readonly magicLink: "Продовжити з Magic Link";
        readonly passkey: "Увійти з Passkey";
        readonly securedBy: "Захищено";
        readonly backToSignIn: "Повернутися до входу";
        readonly profile: "Профіль";
        readonly editProfile: "Редагувати профіль";
        readonly displayName: "Відображуване ім'я";
        readonly save: "Зберегти";
        readonly signOut: "Вийти";
        readonly sessions: "Активні сеанси";
        readonly emailCode: "Продовжити з кодом з листа";
        readonly enterEmail: "Введіть електронну пошту";
        readonly sendMagicLink: "Надіслати Magic Link";
        readonly sendCode: "Надіслати код";
        readonly sendingMagicLink: "Надсилання Magic Link...";
        readonly sendingCode: "Надсилання коду...";
        readonly magicLinkSent: "Magic Link надіслано!";
        readonly checkInbox: "Перевірте вхідні листи";
        readonly enterCode: "Введіть код підтвердження";
        readonly codeSentTo: "6-значний код надіслано на {email}";
        readonly cancel: "Скасувати";
        readonly magicLinkConfirmTitle: "Увійти з цим обліковим записом?";
        readonly magicLinkConfirmBody: "Ви увійдете як {email}. Натисніть «Скасувати», якщо ви не запитували цей Magic Link.";
        readonly magicLinkConfirmButton: "Увійти";
    };
};
interface TranslationStrings {
    welcomeBack: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    signIn: string;
    signUp: string;
    or: string;
    emailAddress: string;
    password: string;
    passwordHint: string;
    continueWith: string;
    connectWallet: string;
    magicLink: string;
    passkey: string;
    securedBy: string;
    backToSignIn: string;
    profile: string;
    editProfile: string;
    displayName: string;
    save: string;
    signOut: string;
    sessions: string;
    emailCode: string;
    enterEmail: string;
    sendMagicLink: string;
    sendCode: string;
    sendingMagicLink: string;
    sendingCode: string;
    magicLinkSent: string;
    checkInbox: string;
    enterCode: string;
    /** `{email}` is replaced with the address. */
    codeSentTo: string;
    cancel: string;
    magicLinkConfirmTitle: string;
    magicLinkConfirmBody: string;
    magicLinkConfirmButton: string;
}
/** Strings missing in a locale fall back to English. */
declare function getStrings(locale: string): TranslationStrings;

interface ProviderButtonConfig {
    provider: OAuthProviderType;
    label: string;
    bgColor: string;
    textColor: string;
    iconSvg: string;
}
declare function getProviderButtonConfig(provider: OAuthProviderType, t?: Pick<TranslationStrings, 'continueWith'>): ProviderButtonConfig;

/**
 * Minimal QR Code SVG generator — byte mode, EC Level L, versions 1–13.
 * Zero dependencies. Produces a standalone SVG string.
 */
declare function generateQrSvg(text: string, moduleSize?: number): string;

declare class ProfileRenderer {
    private shadowRoot;
    private hostElement;
    private containerElement;
    private containerId;
    private mode;
    private theme;
    private branding;
    private themeObserver;
    private mediaQueryListener;
    private t;
    private user;
    private sessions;
    private isEditMode;
    private onSave;
    private onSignOut;
    private onRevokeSession;
    private onClose;
    private escHandler;
    constructor(options: {
        mode: 'popup' | 'embedded';
        theme?: 'light' | 'dark' | 'auto';
        containerId?: string;
        branding?: BrandingConfig;
        locale?: string;
        user: AuthonUser;
        sessions?: SessionInfo[];
        onSave: (data: {
            displayName?: string;
            avatarUrl?: string;
        }) => Promise<void>;
        onSignOut: () => Promise<void>;
        onRevokeSession: (sessionId: string) => Promise<void>;
        onClose: () => void;
    });
    private resolveContainerElement;
    open(): void;
    close(): void;
    updateUser(user: AuthonUser): void;
    updateSessions(sessions: SessionInfo[]): void;
    setTheme(theme: 'light' | 'dark' | 'auto'): void;
    showSaving(): void;
    showSaveError(message: string): void;
    private showInlineError;
    private updateThemeCSS;
    private startThemeObserver;
    private stopThemeObserver;
    private isDark;
    private render;
    private rerender;
    private buildShell;
    private buildInnerContent;
    private buildViewContent;
    private buildEditContent;
    private buildCSS;
    private attachEvents;
    private attachBackdropEvent;
    private attachInnerEvents;
}

/** Returns the normalized URL when it parses as an absolute http(s) URL, otherwise null. */
declare function safeHttpUrl(value: unknown): string | null;
/**
 * Returns the value when it is a base64 data URL of an allowed raster/SVG image type,
 * otherwise null. Callers must only use the result as an <img src> (never inline SVG),
 * which keeps SVG scripts from executing.
 */
declare function safeImageDataUrl(value: unknown): string | null;

export { Authon, type AuthonConfig, type AuthonEventType, type AuthonEvents, type AuthonLocale, AuthonMfaRequiredError, type AuthonWalletConfig, AuthonWalletError, type EIP1193Provider, type EIP1193RequestArguments, type EmbeddedWallet, type EmbeddedWalletDevice, type Hex, MAGIC_LINK_PARAM, type MagicLinkConfirmationReason, type OAuthFlowMode, type OAuthSignInOptions, type OpenSignInOptions, type PendingMagicLink, ProfileRenderer, type ProviderButtonConfig, type SendMagicLinkOptions, type SessionChange, type SessionChangeListener, type SessionChangeReason, type TranslationStrings, type TypedDataPayload, type WalletChangeListener, WalletClient, type WalletConfirmUi, type WalletErrorCode, type WalletMessage, type WalletTransactionRequest, generateQrSvg, getProviderButtonConfig, getStrings, safeHttpUrl, safeImageDataUrl, translations };
