import { useCallback, useContext, useState } from 'react';
import { AuthonContext } from './AuthonProvider';
import type { AuthonUser, TokenPair } from './types';

export interface UseAuthonPasswordlessReturn {
  sendCode: (identifier: string, type?: 'email' | 'sms') => Promise<boolean>;
  verifyCode: (
    identifier: string,
    code: string,
  ) => Promise<{ tokens: TokenPair; user: AuthonUser } | null>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuthonPasswordless(): UseAuthonPasswordlessReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonPasswordless must be used within <AuthonProvider>');

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

  const sendCode = useCallback(
    async (identifier: string, type: 'email' | 'sms' = 'email') => {
      const result = await wrap(() => ctx.client.passwordlessSendCode(identifier, type));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const verifyCode = useCallback(
    (identifier: string, code: string) =>
      wrap(() => ctx.client.passwordlessVerifyCode(identifier, code)),
    [ctx.client, wrap],
  );

  return {
    sendCode,
    verifyCode,
    isLoading,
    error,
  };
}
