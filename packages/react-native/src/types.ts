export interface AuthupReactNativeConfig {
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

export interface AuthupUser {
  id: string;
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  banned: boolean;
  metadata?: Record<string, unknown>;
  externalAccounts?: Array<{
    provider: string;
    providerId: string;
    email?: string;
  }>;
  createdAt: string;
  updatedAt: string;
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
  firstName?: string;
  lastName?: string;
  username?: string;
}
