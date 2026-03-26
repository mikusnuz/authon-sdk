import { BrandingConfig, AuthonUser, PasskeyCredential, Web3Wallet, OAuthProviderType, MfaSetupResponse, MfaStatus, Web3Chain, Web3WalletType, Web3NonceResponse, SessionInfo, OrganizationListResponse, CreateOrganizationParams, AuthonOrganization, UpdateOrganizationParams, OrganizationMember, InviteMemberParams, OrganizationInvitation } from '@authon/shared';

type OAuthFlowMode = 'auto' | 'popup' | 'redirect';
interface AuthonConfig {
    apiUrl?: string;
    mode?: 'popup' | 'embedded';
    containerId?: string;
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
    appearance?: Partial<BrandingConfig>;
}
interface OAuthSignInOptions {
    flowMode?: OAuthFlowMode;
}
interface AuthonEvents {
    signedIn: (user: AuthonUser) => void;
    signedOut: () => void;
    tokenRefreshed: (token: string) => void;
    mfaRequired: (mfaToken: string) => void;
    passkeyRegistered: (credential: PasskeyCredential) => void;
    web3Connected: (wallet: Web3Wallet) => void;
    error: (error: Error) => void;
}
type AuthonEventType = keyof AuthonEvents;
declare class AuthonMfaRequiredError extends Error {
    readonly mfaToken: string;
    constructor(mfaToken: string);
}

declare class Authon {
    private publishableKey;
    private config;
    private session;
    private modal;
    private listeners;
    private branding;
    private providers;
    private providerFlowModes;
    private initialized;
    private captchaEnabled;
    private turnstileSiteKey;
    constructor(publishableKey: string, config?: AuthonConfig);
    getProviders(): Promise<OAuthProviderType[]>;
    openSignIn(): Promise<void>;
    openSignUp(): Promise<void>;
    /** Update theme at runtime without destroying form state */
    setTheme(theme: 'light' | 'dark' | 'auto'): void;
    signInWithOAuth(provider: OAuthProviderType, options?: OAuthSignInOptions): Promise<void>;
    signInWithEmail(email: string, password: string, turnstileToken?: string): Promise<AuthonUser>;
    signUpWithEmail(email: string, password: string, meta?: {
        displayName?: string;
        turnstileToken?: string;
    }): Promise<AuthonUser>;
    signOut(): Promise<void>;
    getUser(): AuthonUser | null;
    getToken(): string | null;
    on<K extends AuthonEventType>(event: K, listener: AuthonEvents[K]): () => void;
    setupMfa(): Promise<MfaSetupResponse & {
        qrCodeSvg: string;
    }>;
    verifyMfaSetup(code: string): Promise<void>;
    verifyMfa(mfaToken: string, code: string): Promise<AuthonUser>;
    disableMfa(code: string): Promise<void>;
    getMfaStatus(): Promise<MfaStatus>;
    regenerateBackupCodes(code: string): Promise<string[]>;
    sendMagicLink(email: string): Promise<void>;
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
    private getModal;
    private startOAuthFlow;
    private normalizeFlowMode;
    private requestOAuthAuthorization;
    private startRedirectOAuthFlow;
    private consumeRedirectResultFromUrl;
    private apiGet;
    private apiPost;
    private apiPostAuth;
    private apiGetAuth;
    private apiPatchAuth;
    private apiDeleteAuth;
    private getWalletAddress;
    private requestWalletSignature;
    private bufferToBase64url;
    private base64urlToBuffer;
    private deserializeCreationOptions;
    private deserializeRequestOptions;
    private parseApiError;
}

interface ProviderButtonConfig {
    provider: OAuthProviderType;
    label: string;
    bgColor: string;
    textColor: string;
    iconSvg: string;
}
declare function getProviderButtonConfig(provider: OAuthProviderType): ProviderButtonConfig;

/**
 * Minimal QR Code SVG generator — byte mode, EC Level L, versions 1–13.
 * Zero dependencies. Produces a standalone SVG string.
 */
declare function generateQrSvg(text: string, moduleSize?: number): string;

export { Authon, type AuthonConfig, type AuthonEventType, type AuthonEvents, AuthonMfaRequiredError, type OAuthFlowMode, type OAuthSignInOptions, type ProviderButtonConfig, generateQrSvg, getProviderButtonConfig };
