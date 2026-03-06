export { createAuthon, AUTHON_KEY } from './plugin';
export type { AuthonState, AuthonPluginOptions } from './plugin';
export { useAuthon, useUser } from './composables';
export { useAuthonWeb3 } from './useAuthonWeb3';
export type { UseAuthonWeb3Return, LinkWalletParams } from './useAuthonWeb3';
export { useAuthonPasswordless } from './useAuthonPasswordless';
export type { UseAuthonPasswordlessReturn } from './useAuthonPasswordless';
export { useAuthonPasskeys } from './useAuthonPasskeys';
export type { UseAuthonPasskeysReturn } from './useAuthonPasskeys';
export {
  AuthonSignIn,
  AuthonSignUp,
  AuthonUserButton,
  AuthonSignedIn,
  AuthonSignedOut,
} from './components';
export { AuthonSocialButton, AuthonSocialButtons } from './SocialButton';
