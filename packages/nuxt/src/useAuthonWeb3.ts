import { ref } from 'vue';
import type { Ref } from 'vue';
import type { Web3Chain, Web3NonceResponse, Web3Wallet, Web3WalletType } from '@authon/shared';
import type { AuthonPluginState } from './plugin';

export interface LinkWalletParams {
  address: string;
  chain: Web3Chain;
  walletType: Web3WalletType;
  chainId?: number;
  message: string;
  signature: string;
}

export interface UseAuthonWeb3Return {
  getNonce: (
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
    chainId?: number,
  ) => Promise<Web3NonceResponse | null>;
  verify: (
    message: string,
    signature: string,
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
  ) => Promise<boolean>;
  listWallets: () => Promise<Web3Wallet[] | null>;
  linkWallet: (params: LinkWalletParams) => Promise<Web3Wallet | null>;
  unlinkWallet: (walletId: string) => Promise<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
}

export function useAuthonWeb3(state: AuthonPluginState): UseAuthonWeb3Return {
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  async function wrap<T>(fn: () => Promise<T>): Promise<T | null> {
    isLoading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function getNonce(
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
    chainId?: number,
  ): Promise<Web3NonceResponse | null> {
    return wrap(() => state.client.web3GetNonce(address, chain, walletType, chainId));
  }

  async function verify(
    message: string,
    signature: string,
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
  ): Promise<boolean> {
    const result = await wrap(() =>
      state.client.web3Verify(message, signature, address, chain, walletType),
    );
    return result !== null;
  }

  async function listWallets(): Promise<Web3Wallet[] | null> {
    return wrap(() => state.client.listWallets());
  }

  async function linkWallet(params: LinkWalletParams): Promise<Web3Wallet | null> {
    return wrap(() => state.client.linkWallet(params));
  }

  async function unlinkWallet(walletId: string): Promise<boolean> {
    const result = await wrap(() => state.client.unlinkWallet(walletId));
    return result !== null;
  }

  return {
    getNonce,
    verify,
    listWallets,
    linkWallet,
    unlinkWallet,
    isLoading,
    error,
  };
}
