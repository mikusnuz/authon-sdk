import { useCallback, useContext, useState } from 'react';
import type { PasskeyCredential } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';
import type { AuthonUser, TokenPair } from './types';

export interface UseAuthonPasskeysReturn {
  startRegister: (name?: string) => Promise<{ options: Record<string, unknown> } | null>;
  completeRegister: (credential: Record<string, unknown>) => Promise<PasskeyCredential | null>;
  startAuth: (email?: string) => Promise<{ options: Record<string, unknown> } | null>;
  completeAuth: (
    credential: Record<string, unknown>,
  ) => Promise<{ tokens: TokenPair; user: AuthonUser } | null>;
  listPasskeys: () => Promise<PasskeyCredential[] | null>;
  deletePasskey: (credentialId: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuthonPasskeys(): UseAuthonPasskeysReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonPasskeys must be used within <AuthonProvider>');

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

  const startRegister = useCallback(
    (name?: string) => wrap(() => ctx.client.passkeyStartRegister(name)),
    [ctx.client, wrap],
  );

  const completeRegister = useCallback(
    (credential: Record<string, unknown>) =>
      wrap(() => ctx.client.passkeyCompleteRegister(credential)),
    [ctx.client, wrap],
  );

  const startAuth = useCallback(
    (email?: string) => wrap(() => ctx.client.passkeyStartAuth(email)),
    [ctx.client, wrap],
  );

  const completeAuth = useCallback(
    (credential: Record<string, unknown>) =>
      wrap(() => ctx.client.passkeyCompleteAuth(credential)),
    [ctx.client, wrap],
  );

  const listPasskeys = useCallback(
    () => wrap(() => ctx.client.passkeyList()),
    [ctx.client, wrap],
  );

  const deletePasskey = useCallback(
    async (credentialId: string) => {
      const result = await wrap(() => ctx.client.passkeyDelete(credentialId));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  return {
    startRegister,
    completeRegister,
    startAuth,
    completeAuth,
    listPasskeys,
    deletePasskey,
    isLoading,
    error,
  };
}
