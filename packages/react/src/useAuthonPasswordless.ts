import { useCallback, useContext, useState } from 'react';
import { AuthonContext } from './AuthonProvider';

export interface UseAuthonPasswordlessReturn {
  sendMagicLink: (email: string) => Promise<boolean>;
  sendEmailOtp: (email: string) => Promise<boolean>;
  verifyPasswordless: (opts: { token?: string; email?: string; code?: string }) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuthonPasswordless(): UseAuthonPasswordlessReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonPasswordless must be used within <AuthonProvider>');

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

  const sendMagicLink = useCallback(
    async (email: string) => {
      const result = await wrap(() => ctx.client!.sendMagicLink(email));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const sendEmailOtp = useCallback(
    async (email: string) => {
      const result = await wrap(() => ctx.client!.sendEmailOtp(email));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const verifyPasswordless = useCallback(
    async (opts: { token?: string; email?: string; code?: string }) => {
      const result = await wrap(() => ctx.client!.verifyPasswordless(opts));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  return {
    sendMagicLink,
    sendEmailOtp,
    verifyPasswordless,
    isLoading,
    error,
  };
}
