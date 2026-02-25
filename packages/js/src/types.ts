import type { AuthonUser, BrandingConfig } from '@authon/shared';

export type OAuthFlowMode = 'auto' | 'popup' | 'redirect';

export interface AuthonConfig {
  apiUrl?: string;
  mode?: 'popup' | 'embedded';
  containerId?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  appearance?: Partial<BrandingConfig>;
}

export interface OAuthSignInOptions {
  flowMode?: OAuthFlowMode;
}

export interface AuthonEvents {
  signedIn: (user: AuthonUser) => void;
  signedOut: () => void;
  tokenRefreshed: (token: string) => void;
  error: (error: Error) => void;
}

export type AuthonEventType = keyof AuthonEvents;
