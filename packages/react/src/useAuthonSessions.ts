import { useCallback, useContext, useState } from 'react';
import type { SessionInfo } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';

export interface UseAuthonSessionsReturn {
  listSessions: () => Promise<SessionInfo[] | null>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuthonSessions(): UseAuthonSessionsReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonSessions must be used within <AuthonProvider>');

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

  const listSessions = useCallback(
    () => wrap(() => ctx.client!.listSessions()),
    [ctx.client, wrap],
  );

  const revokeSession = useCallback(
    async (sessionId: string) => {
      const result = await wrap(() => ctx.client!.revokeSession(sessionId));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  return {
    listSessions,
    revokeSession,
    isLoading,
    error,
  };
}
