import { useCallback, useContext, useState } from 'react';
import type { PasskeyCredential } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';

export interface UseAuthonPasskeysReturn {
  registerPasskey: (name?: string) => Promise<PasskeyCredential | null>;
  authenticateWithPasskey: (email?: string) => Promise<boolean>;
  listPasskeys: () => Promise<PasskeyCredential[] | null>;
  renamePasskey: (id: string, name: string) => Promise<PasskeyCredential | null>;
  revokePasskey: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuthonPasskeys(): UseAuthonPasskeysReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonPasskeys must be used within <AuthonProvider>');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
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
    },
    [],
  );

  const registerPasskey = useCallback(
    (name?: string) => wrap(() => ctx.client!.registerPasskey(name)),
    [ctx.client, wrap],
  );

  const authenticateWithPasskey = useCallback(
    async (email?: string) => {
      const result = await wrap(() => ctx.client!.authenticateWithPasskey(email));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const listPasskeys = useCallback(
    () => wrap(() => ctx.client!.listPasskeys()),
    [ctx.client, wrap],
  );

  const renamePasskey = useCallback(
    (id: string, name: string) => wrap(() => ctx.client!.renamePasskey(id, name)),
    [ctx.client, wrap],
  );

  const revokePasskey = useCallback(
    async (id: string) => {
      const result = await wrap(() => ctx.client!.revokePasskey(id));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  return {
    registerPasskey,
    authenticateWithPasskey,
    listPasskeys,
    renamePasskey,
    revokePasskey,
    isLoading,
    error,
  };
}
