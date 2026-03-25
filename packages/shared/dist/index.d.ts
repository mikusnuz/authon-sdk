interface AuthonUser {
    id: string;
    projectId: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    phone: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    isBanned: boolean;
    publicMetadata: Record<string, unknown> | null;
    lastSignInAt: string | null;
    signInCount: number;
    createdAt: string;
    updatedAt: string;
}
interface AuthonSession {
    id: string;
    userId: string;
    ipAddress: string | null;
    userAgent: string | null;
    deviceName: string | null;
    lastActiveAt: string | null;
    createdAt: string;
    expiresAt: string;
}
interface AuthonProvider {
    provider: string;
    enabled: boolean;
    sortOrder: number;
    configured: boolean;
}
interface BrandingConfig {
    logoDataUrl?: string;
    brandName?: string;
    primaryColorStart?: string;
    primaryColorEnd?: string;
    lightBg?: string;
    lightText?: string;
    darkBg?: string;
    darkText?: string;
    borderRadius?: number;
    providerOrder?: string[];
    hiddenProviders?: string[];
    showEmailPassword?: boolean;
    showDivider?: boolean;
    termsUrl?: string;
    privacyUrl?: string;
    customCss?: string;
    locale?: string;
    showSecuredBy?: boolean;
    showWeb3?: boolean;
    showPasswordless?: boolean;
    showPasskey?: boolean;
    passwordlessMethod?: 'magic_link' | 'email_otp' | 'both';
}
interface SessionConfig {
    accessTokenTtl?: number;
    refreshTokenTtl?: number;
    maxSessions?: number;
    singleSession?: boolean;
}
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthonUser;
}
interface WebhookEvent {
    id: string;
    type: string;
    projectId: string;
    timestamp: string;
    data: Record<string, unknown>;
}
interface MfaSetupResponse {
    secret: string;
    qrCodeUri: string;
    backupCodes: string[];
}
interface MfaStatus {
    enabled: boolean;
    backupCodesRemaining: number;
}
interface MfaVerifyResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthonUser;
}
interface PasswordlessResult {
    message: string;
}
interface PasskeyCredential {
    id: string;
    name: string | null;
    createdAt: string;
    lastUsedAt: string | null;
}
type Web3Chain = 'evm' | 'solana';
type Web3WalletType = 'metamask' | 'pexus' | 'walletconnect' | 'coinbase' | 'phantom' | 'trust' | 'other';
interface Web3Wallet {
    id: string;
    address: string;
    chain: Web3Chain;
    walletType: Web3WalletType;
    chainId: number | null;
    createdAt: string;
}
interface Web3NonceResponse {
    message: string;
    nonce: string;
}
interface SessionInfo {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    lastActiveAt: string | null;
}
interface AuthonOrganization {
    id: string;
    projectId: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    metadata: Record<string, any> | null;
    maxMembers: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    createdAt: string;
}
interface OrganizationInvitation {
    id: string;
    organizationId: string;
    email: string;
    role: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    invitedBy: string;
    expiresAt: string;
    createdAt: string;
}
interface CreateOrganizationParams {
    name: string;
    slug?: string;
    logoUrl?: string;
    metadata?: Record<string, any>;
    maxMembers?: number;
}
interface UpdateOrganizationParams {
    name?: string;
    slug?: string;
    logoUrl?: string;
    metadata?: Record<string, any>;
    maxMembers?: number;
}
interface InviteMemberParams {
    email: string;
    role?: 'admin' | 'member';
}
interface OrganizationListResponse {
    data: AuthonOrganization[];
    total: number;
    page: number;
    limit: number;
}
interface AuditLogEntry {
    id: string;
    projectId: string;
    actorType: 'user' | 'admin' | 'system' | 'api_key';
    actorId: string | null;
    event: string;
    targetType: string | null;
    targetId: string | null;
    metadata: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}
interface AuditLogQueryParams {
    event?: string;
    actorId?: string;
    targetId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
interface AuditLogListResponse {
    data: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
}
interface AuditLogStats {
    [eventType: string]: number;
}
interface JwtClaimMapping {
    key: string;
    source?: string;
    value?: string;
}
interface JwtTemplate {
    id: string;
    projectId: string;
    name: string;
    isDefault: boolean;
    claims: JwtClaimMapping[];
    allowedLifetime: number | null;
    createdAt: string;
    updatedAt: string;
}
interface CreateJwtTemplateParams {
    name: string;
    claims: JwtClaimMapping[];
    allowedLifetime?: number;
}
interface UpdateJwtTemplateParams {
    name?: string;
    claims?: JwtClaimMapping[];
    allowedLifetime?: number | null;
}
interface JwtPreviewResponse {
    token: string;
    decoded: Record<string, any>;
}
declare const OAUTH_PROVIDERS: readonly ["google", "apple", "kakao", "naver", "facebook", "github", "discord", "x", "line", "microsoft"];
type OAuthProviderType = (typeof OAUTH_PROVIDERS)[number];
declare const PROVIDER_DISPLAY_NAMES: Record<OAuthProviderType, string>;
declare const PROVIDER_COLORS: Record<OAuthProviderType, {
    bg: string;
    text: string;
}>;
declare const WEBHOOK_EVENTS: readonly ["user.created", "user.updated", "user.deleted", "user.banned", "user.unbanned", "session.created", "session.ended", "session.revoked", "provider.linked", "provider.unlinked"];
type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];
declare const API_KEY_PREFIXES: {
    readonly PUBLISHABLE_LIVE: "pk_live_";
    readonly PUBLISHABLE_TEST: "pk_test_";
    readonly SECRET_LIVE: "sk_live_";
    readonly SECRET_TEST: "sk_test_";
};
declare const DEFAULT_BRANDING: BrandingConfig;
declare const DEFAULT_SESSION_CONFIG: SessionConfig;
declare const AUDIT_EVENTS: {
    readonly AUTH_SIGNUP: "auth.signup";
    readonly AUTH_SIGNIN: "auth.signin";
    readonly AUTH_SIGNIN_FAILED: "auth.signin.failed";
    readonly AUTH_SIGNOUT: "auth.signout";
    readonly AUTH_TOKEN_REFRESH: "auth.token.refresh";
    readonly AUTH_MFA_SETUP: "auth.mfa.setup";
    readonly AUTH_MFA_VERIFY: "auth.mfa.verify";
    readonly AUTH_PASSKEY_REGISTER: "auth.passkey.register";
    readonly AUTH_WEB3_VERIFY: "auth.web3.verify";
    readonly ADMIN_USER_BANNED: "admin.user.banned";
    readonly ADMIN_USER_UNBANNED: "admin.user.unbanned";
    readonly ADMIN_USER_DELETED: "admin.user.deleted";
    readonly ORG_CREATED: "org.created";
    readonly ORG_DELETED: "org.deleted";
    readonly ORG_MEMBER_ADDED: "org.member.added";
    readonly ORG_MEMBER_REMOVED: "org.member.removed";
    readonly ORG_MEMBER_ROLE_CHANGED: "org.member.role_changed";
    readonly ORG_INVITATION_SENT: "org.invitation.sent";
    readonly ORG_INVITATION_ACCEPTED: "org.invitation.accepted";
};

export { API_KEY_PREFIXES, AUDIT_EVENTS, type AuditLogEntry, type AuditLogListResponse, type AuditLogQueryParams, type AuditLogStats, type AuthTokens, type AuthonOrganization, type AuthonProvider, type AuthonSession, type AuthonUser, type BrandingConfig, type CreateJwtTemplateParams, type CreateOrganizationParams, DEFAULT_BRANDING, DEFAULT_SESSION_CONFIG, type InviteMemberParams, type JwtClaimMapping, type JwtPreviewResponse, type JwtTemplate, type MfaSetupResponse, type MfaStatus, type MfaVerifyResponse, OAUTH_PROVIDERS, type OAuthProviderType, type OrganizationInvitation, type OrganizationListResponse, type OrganizationMember, PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES, type PasskeyCredential, type PasswordlessResult, type SessionConfig, type SessionInfo, type UpdateJwtTemplateParams, type UpdateOrganizationParams, WEBHOOK_EVENTS, type Web3Chain, type Web3NonceResponse, type Web3Wallet, type Web3WalletType, type WebhookEvent, type WebhookEventType };
