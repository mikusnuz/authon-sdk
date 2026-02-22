import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthupMobileClient } from './client';
import type { AuthState, AuthupReactNativeConfig, AuthupUser, SignInParams, SignUpParams } from './types';

export interface AuthupContextValue extends AuthState {
  user: AuthupUser | null;
  signIn: (params: SignInParams) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => string | null;
}

export const AuthupContext = createContext<AuthupContextValue | null>(null);

interface AuthupProviderProps extends AuthupReactNativeConfig {
  children: React.ReactNode;
  storage?: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
}

export function AuthupProvider({ children, storage, ...config }: AuthupProviderProps) {
  const clientRef = useRef<AuthupMobileClient | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    accessToken: null,
  });
  const [user, setUser] = useState<AuthupUser | null>(null);

  if (!clientRef.current) {
    clientRef.current = new AuthupMobileClient(config);
  }

  const client = clientRef.current;

  useEffect(() => {
    if (storage) {
      client.setStorage(storage);
    }

    client.initialize().then(async (tokens) => {
      if (tokens) {
        const u = await client.getUser();
        setUser(u);
        setAuthState({
          isLoaded: true,
          isSignedIn: true,
          userId: u?.id || null,
          sessionId: null,
          accessToken: tokens.accessToken,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoaded: true }));
      }
    });
  }, []);

  const signIn = useCallback(async (params: SignInParams) => {
    const tokens = await client.signIn(params);
    const u = await client.getUser();
    setUser(u);
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      userId: u?.id || null,
      sessionId: null,
      accessToken: tokens.accessToken,
    });
  }, [client]);

  const signUp = useCallback(async (params: SignUpParams) => {
    const tokens = await client.signUp(params);
    const u = await client.getUser();
    setUser(u);
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      userId: u?.id || null,
      sessionId: null,
      accessToken: tokens.accessToken,
    });
  }, [client]);

  const signOut = useCallback(async () => {
    await client.signOut();
    setUser(null);
    setAuthState({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      accessToken: null,
    });
  }, [client]);

  const getToken = useCallback(() => {
    return client.getAccessToken();
  }, [client]);

  const value = useMemo<AuthupContextValue>(
    () => ({
      ...authState,
      user,
      signIn,
      signUp,
      signOut,
      getToken,
    }),
    [authState, user, signIn, signUp, signOut, getToken],
  );

  return <AuthupContext.Provider value={value}>{children}</AuthupContext.Provider>;
}
