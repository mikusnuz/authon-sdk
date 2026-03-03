import { useCallback, useContext, useState } from 'react';
import type { MfaSetupResponse, MfaStatus } from '@authon/shared';
import { AuthonContext } from './AuthonProvider';

export interface UseAuthonMfaReturn {
  /** Start MFA setup — returns secret, QR code SVG, and backup codes */
  setupMfa: () => Promise<(MfaSetupResponse & { qrCodeSvg: string }) | null>;
  /** Verify TOTP code to complete MFA setup */
  verifyMfaSetup: (code: string) => Promise<boolean>;
  /** Verify TOTP code during sign-in (after receiving mfaToken) */
  verifyMfa: (mfaToken: string, code: string) => Promise<boolean>;
  /** Disable MFA (requires current TOTP code) */
  disableMfa: (code: string) => Promise<boolean>;
  /** Get current MFA status */
  getMfaStatus: () => Promise<MfaStatus | null>;
  /** Regenerate backup codes (requires current TOTP code) */
  regenerateBackupCodes: (code: string) => Promise<string[] | null>;
  /** Loading state */
  isLoading: boolean;
  /** Last error */
  error: Error | null;
}

export function useAuthonMfa(): UseAuthonMfaReturn {
  const ctx = useContext(AuthonContext);
  if (!ctx) throw new Error('useAuthonMfa must be used within <AuthonProvider>');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fn();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const setupMfa = useCallback(async () => {
    return wrap(() => ctx.client!.setupMfa());
  }, [ctx.client, wrap]);

  const verifyMfaSetup = useCallback(
    async (code: string) => {
      const result = await wrap(() => ctx.client!.verifyMfaSetup(code));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const verifyMfa = useCallback(
    async (mfaToken: string, code: string) => {
      const result = await wrap(() => ctx.client!.verifyMfa(mfaToken, code));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const disableMfa = useCallback(
    async (code: string) => {
      const result = await wrap(() => ctx.client!.disableMfa(code));
      return result !== null;
    },
    [ctx.client, wrap],
  );

  const getMfaStatus = useCallback(async () => {
    return wrap(() => ctx.client!.getMfaStatus());
  }, [ctx.client, wrap]);

  const regenerateBackupCodes = useCallback(
    async (code: string) => {
      return wrap(() => ctx.client!.regenerateBackupCodes(code));
    },
    [ctx.client, wrap],
  );

  return {
    setupMfa,
    verifyMfaSetup,
    verifyMfa,
    disableMfa,
    getMfaStatus,
    regenerateBackupCodes,
    isLoading,
    error,
  };
}
