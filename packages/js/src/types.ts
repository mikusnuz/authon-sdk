import type { AuthupUser, BrandingConfig } from '@authup/shared';

export interface AuthupConfig {
  apiUrl?: string;
  mode?: 'popup' | 'embedded';
  containerId?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  appearance?: Partial<BrandingConfig>;
}

export interface AuthupEvents {
  signedIn: (user: AuthupUser) => void;
  signedOut: () => void;
  tokenRefreshed: (token: string) => void;
  error: (error: Error) => void;
}

export type AuthupEventType = keyof AuthupEvents;
