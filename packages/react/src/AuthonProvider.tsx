import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Authon } from '@authon/js';
import type { AuthonConfig, OpenSignInOptions } from '@authon/js';
import type { AuthonUser, AuthonOrganization } from '@authon/shared';

export interface AuthonContextValue {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AuthonUser | null;
  activeOrganization: AuthonOrganization | null;
  setActiveOrganization: (org: AuthonOrganization | null) => void;
  signOut: () => Promise<void>;
  openSignIn: (options?: OpenSignInOptions) => Promise<void>;
  openSignUp: (options?: OpenSignInOptions) => Promise<void>;
  getToken: () => string | null;
  client: Authon | null;
}

export const AuthonContext = createContext<AuthonContextValue | null>(null);

interface AuthonProviderProps {
  publishableKey: string;
  children: ReactNode;
  config?: Omit<AuthonConfig, 'mode'>;
}

interface SessionChangeSnapshot {
  user: AuthonUser | null;
}

type SessionAwareAuthon = Authon & {
  waitUntilReady(): Promise<void>;
  onSessionChange(listener: (change: SessionChangeSnapshot) => void): () => void;
};

export function AuthonProvider({ publishableKey, children, config }: AuthonProviderProps) {
  const [user, setUser] = useState<AuthonUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrganization, setActiveOrganization] = useState<AuthonOrganization | null>(null);
  const clientRef = useRef<Authon | null>(null);

  useEffect(() => {
    let active = true;
    let receivedSessionChange = false;
    const client = new Authon(publishableKey, config);
    const sessionClient = client as SessionAwareAuthon;
    clientRef.current = client;

    const unsubscribeSession = sessionClient.onSessionChange((change) => {
      if (!active) return;
      receivedSessionChange = true;
      setUser(change.user);
      setIsLoading(false);
      if (!change.user) setActiveOrganization(null);
    });

    client.on('error', () => {
      setIsLoading(false);
    });

    void sessionClient.waitUntilReady().then(() => {
      if (!active) return;
      if (!receivedSessionChange) setUser(client.getUser());
      setIsLoading(false);
    });

    return () => {
      active = false;
      unsubscribeSession();
      client.destroy();
      clientRef.current = null;
    };
  }, [publishableKey]);

  const signOut = useCallback(async () => {
    await clientRef.current?.signOut();
  }, []);

  const openSignIn = useCallback(async (options?: OpenSignInOptions) => {
    await clientRef.current?.openSignIn(options);
  }, []);

  const openSignUp = useCallback(async (options?: OpenSignInOptions) => {
    await clientRef.current?.openSignUp(options);
  }, []);

  const getToken = useCallback(() => {
    return clientRef.current?.getToken() ?? null;
  }, []);

  const value = useMemo<AuthonContextValue>(
    () => ({
      isSignedIn: !!user,
      isLoading,
      user,
      activeOrganization,
      setActiveOrganization,
      signOut,
      openSignIn,
      openSignUp,
      getToken,
      client: clientRef.current,
    }),
    [user, isLoading, activeOrganization, signOut, openSignIn, openSignUp, getToken],
  );

  return <AuthonContext.Provider value={value}>{children}</AuthonContext.Provider>;
}
