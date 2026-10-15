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
  /**
   * Where Authon sends the OAuth result: your app deep link (e.g. `myapp://oauth-callback`, with
   * `myapp://` in the project's allowed origins) or an https bridge page on an allowed origin.
   * Used when startOAuth() is called without returnTo.
   */
  oauthReturnTo?: string;
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

export type OAuthFlowMode = 'popup' | 'redirect' | 'auto';

export interface StartOAuthOptions {
  redirectUri?: string;
  /** App deep link or allowed https bridge that receives the one-time code. */
  returnTo?: string;
  /** Ignored: native sign-in always returns through returnTo. Kept for compatibility. */
  flow?: OAuthFlowMode;
}

export type AuthonEventType = 'signedIn' | 'signedOut' | 'error' | 'tokenRefreshed' | 'mfaRequired';

export interface AuthonEvents {
  signedIn: (user: AuthonUser) => void;
  signedOut: () => void;
  error: (error: Error) => void;
  tokenRefreshed: () => void;
  /** A sign-in needs a TOTP/backup code. Continue with verifyMfa(mfaToken, code). */
  mfaRequired: (mfaToken: string) => void;
}

/**
 * Thrown by OAuth completion (handleOAuthCallback / completeOAuth) when the user has MFA enabled.
 * No session exists yet: call verifyMfa(error.mfaToken, code) with the user's TOTP or backup code.
 * Same contract as AuthonMfaRequiredError in @authon/js.
 */
export class AuthonMfaRequiredError extends Error {
  readonly mfaToken: string;
  readonly mfaMethods: string[];
  constructor(mfaToken: string, mfaMethods: string[] = ['totp']) {
    super('MFA verification required');
    this.name = 'AuthonMfaRequiredError';
    this.mfaToken = mfaToken;
    this.mfaMethods = mfaMethods;
  }
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

export interface OAuthCompletedResponse extends ApiAuthResponse {
  status: 'completed';
}

export interface OAuthErrorResponse {
  status: 'error';
  message: string;
}
