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
