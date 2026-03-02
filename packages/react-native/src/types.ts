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
