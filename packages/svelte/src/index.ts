export { createAuthonStore } from './store';
export type { AuthonStore } from './store';
export { initAuthon, getAuthon } from './context';
export { renderSocialButtons } from './SocialButtons';
export type { SocialButtonsOptions } from './SocialButtons';
export type {
  PasskeyCredential,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
} from '@authon/shared';

// Svelte components are exported as raw .svelte source for the consumer's compiler.
// Import them directly:
//   import SignIn from '@authon/svelte/SignIn.svelte'
//   import SignUp from '@authon/svelte/SignUp.svelte'
