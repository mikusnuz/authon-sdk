// ── Types ──

export interface AuthonUser {
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

export interface AuthonSession {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface AuthonProvider {
  provider: string;
  enabled: boolean;
  sortOrder: number;
  configured: boolean;
}

export interface BrandingConfig {
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

export interface SessionConfig {
  accessTokenTtl?: number;
  refreshTokenTtl?: number;
  maxSessions?: number;
  singleSession?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthonUser;
}

export interface WebhookEvent {
  id: string;
  type: string;
  projectId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ── MFA Types ──

export interface MfaSetupResponse {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}

export interface MfaStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

export interface MfaVerifyResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthonUser;
}

// ── Passwordless Types ──

export interface PasswordlessResult {
  message: string;
}

// ── Passkey Types ──

export interface PasskeyCredential {
  id: string;
  name: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

// ── Web3 Types ──

export type Web3Chain = 'evm' | 'solana';
export type Web3WalletType =
  | 'metamask'
  | 'pexus'
  | 'walletconnect'
  | 'coinbase'
  | 'phantom'
  | 'trust'
  | 'other';

export interface Web3Wallet {
  id: string;
  address: string;
  chain: Web3Chain;
  walletType: Web3WalletType;
  chainId: number | null;
  createdAt: string;
}

export interface Web3NonceResponse {
  message: string;
  nonce: string;
}

// ── Session Types ──

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActiveAt: string | null;
}

// ── Organization Types ──

export interface AuthonOrganization {
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

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  createdAt: string;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
  logoUrl?: string;
  metadata?: Record<string, any>;
  maxMembers?: number;
}

export interface UpdateOrganizationParams {
  name?: string;
  slug?: string;
  logoUrl?: string;
  metadata?: Record<string, any>;
  maxMembers?: number;
}

export interface InviteMemberParams {
  email: string;
  role?: 'admin' | 'member';
}

export interface OrganizationListResponse {
  data: AuthonOrganization[];
  total: number;
  page: number;
  limit: number;
}

// ── Audit Log Types ──

export interface AuditLogEntry {
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

export interface AuditLogQueryParams {
  event?: string;
  actorId?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogListResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogStats {
  [eventType: string]: number;
}

// ── JWT Template Types ──

export interface JwtClaimMapping {
  key: string;
  source?: string;
  value?: string;
}

export interface JwtTemplate {
  id: string;
  projectId: string;
  name: string;
  isDefault: boolean;
  claims: JwtClaimMapping[];
  allowedLifetime: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJwtTemplateParams {
  name: string;
  claims: JwtClaimMapping[];
  allowedLifetime?: number;
}

export interface UpdateJwtTemplateParams {
  name?: string;
  claims?: JwtClaimMapping[];
  allowedLifetime?: number | null;
}

export interface JwtPreviewResponse {
  token: string;
  decoded: Record<string, any>;
}

// ── Constants ──

export const OAUTH_PROVIDERS = [
  'google',
  'apple',
  'kakao',
  'naver',
  'facebook',
  'github',
  'discord',
  'x',
  'line',
  'microsoft',
] as const;

export type OAuthProviderType = (typeof OAUTH_PROVIDERS)[number];

export const PROVIDER_DISPLAY_NAMES: Record<OAuthProviderType, string> = {
  google: 'Google',
  apple: 'Apple',
  kakao: 'Kakao',
  naver: 'Naver',
  facebook: 'Facebook',
  github: 'GitHub',
  discord: 'Discord',
  x: 'X',
  line: 'LINE',
  microsoft: 'Microsoft',
};

export const PROVIDER_COLORS: Record<OAuthProviderType, { bg: string; text: string }> = {
  google: { bg: '#ffffff', text: '#1f1f1f' },
  apple: { bg: '#000000', text: '#ffffff' },
  kakao: { bg: '#FEE500', text: '#191919' },
  naver: { bg: '#03C75A', text: '#ffffff' },
  facebook: { bg: '#1877F2', text: '#ffffff' },
  github: { bg: '#24292e', text: '#ffffff' },
  discord: { bg: '#5865F2', text: '#ffffff' },
  x: { bg: '#000000', text: '#ffffff' },
  line: { bg: '#06C755', text: '#ffffff' },
  microsoft: { bg: '#ffffff', text: '#1f1f1f' },
};

export const WEBHOOK_EVENTS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'user.banned',
  'user.unbanned',
  'session.created',
  'session.ended',
  'session.revoked',
  'provider.linked',
  'provider.unlinked',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export const API_KEY_PREFIXES = {
  PUBLISHABLE_LIVE: 'pk_live_',
  PUBLISHABLE_TEST: 'pk_test_',
  SECRET_LIVE: 'sk_live_',
  SECRET_TEST: 'sk_test_',
} as const;

export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColorStart: '#7c3aed',
  primaryColorEnd: '#4f46e5',
  lightBg: '#ffffff',
  lightText: '#111827',
  darkBg: '#0f172a',
  darkText: '#f1f5f9',
  borderRadius: 12,
  showEmailPassword: true,
  showDivider: true,
  showSecuredBy: true,
  locale: 'en',
};

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  accessTokenTtl: 900,
  refreshTokenTtl: 604800,
  maxSessions: 5,
  singleSession: false,
};

export const AUDIT_EVENTS = {
  AUTH_SIGNUP: 'auth.signup',
  AUTH_SIGNIN: 'auth.signin',
  AUTH_SIGNIN_FAILED: 'auth.signin.failed',
  AUTH_SIGNOUT: 'auth.signout',
  AUTH_TOKEN_REFRESH: 'auth.token.refresh',
  AUTH_MFA_SETUP: 'auth.mfa.setup',
  AUTH_MFA_VERIFY: 'auth.mfa.verify',
  AUTH_PASSKEY_REGISTER: 'auth.passkey.register',
  AUTH_WEB3_VERIFY: 'auth.web3.verify',
  ADMIN_USER_BANNED: 'admin.user.banned',
  ADMIN_USER_UNBANNED: 'admin.user.unbanned',
  ADMIN_USER_DELETED: 'admin.user.deleted',
  ORG_CREATED: 'org.created',
  ORG_DELETED: 'org.deleted',
  ORG_MEMBER_ADDED: 'org.member.added',
  ORG_MEMBER_REMOVED: 'org.member.removed',
  ORG_MEMBER_ROLE_CHANGED: 'org.member.role_changed',
  ORG_INVITATION_SENT: 'org.invitation.sent',
  ORG_INVITATION_ACCEPTED: 'org.invitation.accepted',
} as const;
