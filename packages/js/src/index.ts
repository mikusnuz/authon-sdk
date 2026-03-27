export { Authon } from './authon';
export type {
  AuthonConfig,
  AuthonEvents,
  AuthonEventType,
  OAuthFlowMode,
  OAuthSignInOptions,
} from './types';
export { AuthonMfaRequiredError } from './types';
export { getProviderButtonConfig } from './providers';
export type { ProviderButtonConfig } from './providers';
export { generateQrSvg } from './qrcode';
export { translations, getStrings } from './i18n';
export type { AuthonLocale } from './i18n';
