import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Authup } from '@authup/js';
import type { AuthupConfig } from '@authup/js';
import type { AuthupUser } from '@authup/shared';

export interface AuthupContextValue {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AuthupUser | null;
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
  client: Authup | null;
}

export const AuthupContext = createContext<AuthupContextValue | null>(null);

interface AuthupProviderProps {
  publishableKey: string;
  children: ReactNode;
  config?: Omit<AuthupConfig, 'mode'>;
}

export function AuthupProvider({ publishableKey, children, config }: AuthupProviderProps) {
  const [user, setUser] = useState<AuthupUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clientRef = useRef<Authup | null>(null);

  useEffect(() => {
    const client = new Authup(publishableKey, config);
    clientRef.current = client;

    client.on('signedIn', (u) => {
      setUser(u as AuthupUser);
      setIsLoading(false);
    });

    client.on('signedOut', () => {
      setUser(null);
    });

    client.on('error', () => {
      setIsLoading(false);
    });

    setIsLoading(false);

    return () => {
      client.destroy();
      clientRef.current = null;
    };
  }, [publishableKey]);

  const signOut = useCallback(async () => {
    await clientRef.current?.signOut();
    setUser(null);
  }, []);

  const openSignIn = useCallback(async () => {
    await clientRef.current?.openSignIn();
  }, []);

  const openSignUp = useCallback(async () => {
    await clientRef.current?.openSignUp();
  }, []);

  const getToken = useCallback(() => {
    return clientRef.current?.getToken() ?? null;
  }, []);

  const value = useMemo<AuthupContextValue>(
    () => ({
      isSignedIn: !!user,
      isLoading,
      user,
      signOut,
      openSignIn,
      openSignUp,
      getToken,
      client: clientRef.current,
    }),
    [user, isLoading, signOut, openSignIn, openSignUp, getToken],
  );

  return <AuthupContext.Provider value={value}>{children}</AuthupContext.Provider>;
}
