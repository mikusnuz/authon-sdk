import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type { AuthonUser } from '@authon/shared';

export interface AuthonContextValue {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AuthonUser | null;
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
  client: Authon | null;
}

export const AuthonContext = createContext<AuthonContextValue | null>(null);

interface AuthonProviderProps {
  publishableKey: string;
  children: ReactNode;
  config?: Omit<AuthonConfig, 'mode'>;
}

export function AuthonProvider({ publishableKey, children, config }: AuthonProviderProps) {
  const [user, setUser] = useState<AuthonUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const clientRef = useRef<Authon | null>(null);

  useEffect(() => {
    const client = new Authon(publishableKey, config);
    clientRef.current = client;

    client.on('signedIn', (u) => {
      setUser(u as AuthonUser);
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

  const value = useMemo<AuthonContextValue>(
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

  return <AuthonContext.Provider value={value}>{children}</AuthonContext.Provider>;
}
