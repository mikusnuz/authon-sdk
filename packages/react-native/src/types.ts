import type {
  AuthonUser as SharedAuthonUser,
  BrandingConfig,
  OAuthProviderType,
} from '@authon/shared';

export type { BrandingConfig, OAuthProviderType };

export type AuthonUser = SharedAuthonUser;

export interface AuthonReactNativeConfig {
  publishableKey: string;
  apiUrl?: string;
}

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  accessToken: string | null;
}

export interface SignInParams {
  strategy: 'email_password' | 'oauth';
  email?: string;
  password?: string;
  provider?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  displayName?: string;
}

export type AuthonEventType = 'signedIn' | 'signedOut' | 'error' | 'tokenRefreshed';

export interface AuthonEvents {
  signedIn: (user: AuthonUser) => void;
  signedOut: () => void;
  error: (error: Error) => void;
  tokenRefreshed: () => void;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthonUser;
}
