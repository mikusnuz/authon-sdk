import type { AuthorizationCodeOptions, AuthorizationCodeResult, AuthonUser, BrandingConfig, PasskeyCredential, Web3Wallet } from '@authon/shared';
import type { SessionChange } from './session';
import type { AuthonWalletError, EmbeddedWallet } from './wallet';

export type OAuthFlowMode = 'auto' | 'popup' | 'redirect';

export interface AuthonConfig {
  apiUrl?: string;
  mode?: 'popup' | 'embedded';
  containerId?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  appearance?: Partial<BrandingConfig>;
  sessionMode?: 'browser' | 'bff';
  wallet?: AuthonWalletConfig;
}

export interface AuthonWalletConfig {
  /**
   * Origin of the wallet frame. Defaults to https://wallet.authon.dev when apiUrl is the
   * default Authon API; required when a custom apiUrl is used.
   */
  origin?: string;
  /** Create the embedded wallet in the background after sign-in when the project enables wallets. */
  autoCreate?: boolean;
  /** Text and colors of the one-tap confirmation shown before the passkey prompt (protect/restore). */
  ui?: WalletConfirmUi;
}

/**
 * Appearance of the small confirmation card the wallet frame shows right before
 * the system passkey prompt. Browsers only allow the prompt after a click inside
 * the wallet frame, so this single tap cannot be skipped.
 */
export interface WalletConfirmUi {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hex color such as #2563eb */
  accentColor?: string;
  theme?: 'light' | 'dark';
}

export interface OAuthSignInOptions {
  flowMode?: OAuthFlowMode;
}

export interface AuthonEvents {
  signedIn: (user: AuthonUser) => void;
  signedOut: () => void;
  sessionChanged: (change: SessionChange) => void;
  tokenRefreshed: (token: string) => void;
  verificationRequired: (email: string) => void;
  mfaRequired: (mfaToken: string) => void;
  passkeyRegistered: (credential: PasskeyCredential) => void;
  web3Connected: (wallet: Web3Wallet) => void;
  error: (error: Error) => void;
  walletChanged: (wallet: EmbeddedWallet | null) => void;
  walletError: (error: AuthonWalletError) => void;
  authorizationCompleted: (result: AuthorizationCodeResult) => void;
}

export type OpenSignInOptions = AuthorizationCodeOptions | { responseType?: 'token' };

export type AuthonEventType = keyof AuthonEvents;

export class AuthonMfaRequiredError extends Error {
  readonly mfaToken: string;
  constructor(mfaToken: string) {
    super('MFA verification required');
    this.name = 'AuthonMfaRequiredError';
    this.mfaToken = mfaToken;
  }
}
