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
  /**
   * When the page URL carries a magic link (`#authon_magic_link=1&token=...`, or the older
   * `?token=...&authon_magic_link=1`), remove it from the URL and finish sign-in on load.
   * Default true (browser session mode only).
   *
   * The link signs in silently only in the browser that asked for it and only when nobody is
   * signed in yet. Otherwise nothing is signed in: `magicLinkConfirmationRequired` fires and the
   * app asks "Sign in as x@y?" before calling `confirmMagicLink()`.
   * Set false to handle the link yourself with `handleMagicLink()` or `verifyPasswordless({ token })`.
   */
  autoHandleMagicLink?: boolean;
}

export interface SendMagicLinkOptions {
  /**
   * Page the link should open. Defaults to the current page when `autoHandleMagicLink` is on.
   * Authon only uses it when its origin is in the project's allowed origins and the project has
   * no callback URL or domain set.
   */
  redirectUrl?: string;
}

/**
 * Why a magic link on this page was not used automatically:
 * - `unrecognized_browser`: it was requested in another browser or device (or by an older SDK),
 *   so it could have been sent by someone else to sign you in to their account.
 * - `signed_in`: someone is already signed in here; the link would replace that session.
 */
export type MagicLinkConfirmationReason = 'unrecognized_browser' | 'signed_in';

/** A magic link waiting for the person to confirm. The link is still unused. */
export interface PendingMagicLink {
  /** Account the link signs in to. Show it: "Sign in as {email}?" */
  email: string;
  reason: MagicLinkConfirmationReason;
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
  /**
   * Supplies the token the wallet sends to Authon. Required with sessionMode 'bff',
   * where the browser holds no Authon session: fetch a short-lived wallet token
   * from your server (see createAuthonWalletToken in @authon/nextjs/server).
   */
  getToken?: () => Promise<string | null | undefined>;
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
  /** A magic link on this page needs the person's OK; call `confirmMagicLink()` or `dismissMagicLink()`. */
  magicLinkConfirmationRequired: (pending: PendingMagicLink) => void;
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
