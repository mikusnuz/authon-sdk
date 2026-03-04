import type { AuthonUser, BrandingConfig, PasskeyCredential, Web3Wallet } from '@authon/shared';

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
  mfaRequired: (mfaToken: string) => void;
  passkeyRegistered: (credential: PasskeyCredential) => void;
  web3Connected: (wallet: Web3Wallet) => void;
  error: (error: Error) => void;
}

export type AuthonEventType = keyof AuthonEvents;

export class AuthonMfaRequiredError extends Error {
  readonly mfaToken: string;
  constructor(mfaToken: string) {
    super('MFA verification required');
    this.name = 'AuthonMfaRequiredError';
    this.mfaToken = mfaToken;
  }
}
