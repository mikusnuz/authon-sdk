import { writable, derived, type Readable } from 'svelte/store';
import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type {
  AuthonUser,
  PasskeyCredential,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
} from '@authon/shared';

export interface AuthonStore {
  user: Readable<AuthonUser | null>;
  isSignedIn: Readable<boolean>;
  isLoading: Readable<boolean>;
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
  destroy: () => void;
  client: Authon;
  // Web3
  web3GetNonce: (address: string, chain: Web3Chain, walletType: Web3WalletType, chainId?: number) => Promise<Web3NonceResponse>;
  web3Verify: (message: string, signature: string, address: string, chain: Web3Chain, walletType: Web3WalletType) => Promise<AuthonUser>;
  web3LinkWallet: (params: { address: string; chain: Web3Chain; walletType: Web3WalletType; chainId?: number; message: string; signature: string }) => Promise<Web3Wallet>;
  web3UnlinkWallet: (walletId: string) => Promise<void>;
  web3GetWallets: () => Promise<Web3Wallet[]>;
  // Passwordless
  passwordlessSendCode: (email: string, type?: 'magic-link' | 'otp') => Promise<void>;
  passwordlessVerifyCode: (email: string, code: string) => Promise<AuthonUser>;
  // Passkeys
  passkeyRegister: (name?: string) => Promise<PasskeyCredential>;
  passkeyAuthenticate: (email?: string) => Promise<AuthonUser>;
  passkeyList: () => Promise<PasskeyCredential[]>;
  passkeyDelete: (credentialId: string) => Promise<void>;
}

/**
 * Creates an Authon store with reactive Svelte stores.
 *
 * Usage:
 * ```ts
 * import { createAuthonStore } from '@authon/svelte'
 *
 * const authon = createAuthonStore('pk_live_...')
 *
 * // In your component:
 * $: user = $authon.user
 * $: isSignedIn = $authon.isSignedIn
 * ```
 */
export function createAuthonStore(
  publishableKey: string,
  config?: Omit<AuthonConfig, 'mode'>,
): AuthonStore {
  const client = new Authon(publishableKey, config);
  const userStore = writable<AuthonUser | null>(null);
  const isLoadingStore = writable(true);

  const isSignedIn = derived(userStore, ($user) => $user !== null);

  client.on('signedIn', (user) => {
    userStore.set(user as AuthonUser);
    isLoadingStore.set(false);
  });

  client.on('signedOut', () => {
    userStore.set(null);
  });

  client.on('error', () => {
    isLoadingStore.set(false);
  });

  const existingUser = client.getUser();
  if (existingUser) {
    userStore.set(existingUser);
  }
  isLoadingStore.set(false);

  return {
    user: { subscribe: userStore.subscribe },
    isSignedIn,
    isLoading: { subscribe: isLoadingStore.subscribe },
    signOut: async () => {
      await client.signOut();
      userStore.set(null);
    },
    openSignIn: () => client.openSignIn(),
    openSignUp: () => client.openSignUp(),
    getToken: () => client.getToken(),
    destroy: () => client.destroy(),
    client,
    // Web3
    web3GetNonce: (address, chain, walletType, chainId?) =>
      client.web3GetNonce(address, chain, walletType, chainId),
    web3Verify: (message, signature, address, chain, walletType) =>
      client.web3Verify(message, signature, address, chain, walletType),
    web3LinkWallet: (params) => client.linkWallet(params),
    web3UnlinkWallet: (walletId) => client.unlinkWallet(walletId),
    web3GetWallets: () => client.listWallets(),
    // Passwordless
    passwordlessSendCode: (email, type = 'otp') =>
      type === 'magic-link' ? client.sendMagicLink(email) : client.sendEmailOtp(email),
    passwordlessVerifyCode: (email, code) => client.verifyPasswordless({ email, code }),
    // Passkeys
    passkeyRegister: (name?) => client.registerPasskey(name),
    passkeyAuthenticate: (email?) => client.authenticateWithPasskey(email),
    passkeyList: () => client.listPasskeys(),
    passkeyDelete: (credentialId) => client.revokePasskey(credentialId),
  };
}
