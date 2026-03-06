import { useCallback, useContext, useState } from 'react';
import type { Web3Chain, Web3NonceResponse, Web3Wallet, Web3WalletType } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';

export interface Web3LinkWalletParams {
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
  getWallets: () => Promise<Web3Wallet[] | null>;
  linkWallet: (params: Web3LinkWalletParams) => Promise<Web3Wallet | null>;
  unlinkWallet: (walletId: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuthonWeb3(): UseAuthonWeb3Return {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonWeb3 must be used within <AuthonProvider>');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrap = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNonce = useCallback(
    (address: string, chain: Web3Chain, walletType: Web3WalletType, chainId?: number) =>
      wrap(() => ctx.client.web3GetNonce(address, chain, walletType, chainId)),
    [ctx.client, wrap],
  );

  const verify = useCallback(
    async (
      message: string,
      signature: string,
      address: string,
      chain: Web3Chain,
      walletType: Web3WalletType,
    ) => {
      const result = await wrap(() =>
        ctx.client.web3Verify(message, signature, address, chain, walletType),
      );
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const getWallets = useCallback(
    () => wrap(() => ctx.client.web3GetWallets()),
    [ctx.client, wrap],
  );

  const linkWallet = useCallback(
    (params: Web3LinkWalletParams) => wrap(() => ctx.client.web3LinkWallet(params)),
    [ctx.client, wrap],
  );

  const unlinkWallet = useCallback(
    async (walletId: string) => {
      const result = await wrap(() => ctx.client.web3UnlinkWallet(walletId));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  return {
    getNonce,
    verify,
    getWallets,
    linkWallet,
    unlinkWallet,
    isLoading,
    error,
  };
}
