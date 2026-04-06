import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import { AuthonMobileClient } from './client';
import type {
  AuthState,
  AuthonReactNativeConfig,
  AuthonUser,
  SignInParams,
  SignUpParams,
  StartOAuthOptions,
  AuthonEventType,
  AuthonEvents,
} from './types';

export interface AuthonContextValue extends AuthState {
  user: AuthonUser | null;
  signIn: (params: SignInParams) => Promise<any>;
  signUp: (params: SignUpParams) => Promise<any>;
  signOut: () => Promise<void>;
  getToken: () => string | null;
  /** Available OAuth providers (fetched from API) */
  providers: OAuthProviderType[];
  /** Branding config (fetched from API) */
  branding: BrandingConfig | null;
  /** Start OAuth flow — returns { url, state }. Open url in browser, then call completeOAuth(state) */
  startOAuth: (
    provider: OAuthProviderType,
    options?: string | StartOAuthOptions,
  ) => Promise<{ url: string; state: string }>;
  /** Poll for OAuth result after user completes browser flow */
  completeOAuth: (state: string) => Promise<void>;
  /** Subscribe to auth events */
  on: <K extends AuthonEventType>(event: K, listener: AuthonEvents[K]) => () => void;
  /** Get the underlying client instance */
  client: AuthonMobileClient;
}

export const AuthonContext = createContext<AuthonContextValue | null>(null);

interface AuthonProviderProps extends AuthonReactNativeConfig {
  children: React.ReactNode;
  storage?: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
}

export function AuthonProvider({ children, storage, ...config }: AuthonProviderProps) {
  const clientRef = useRef<AuthonMobileClient | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    sessionId: null,
    accessToken: null,
  });
  const [user, setUser] = useState<AuthonUser | null>(null);
  const [providers, setProviders] = useState<OAuthProviderType[]>([]);
  const [branding, setBranding] = useState<BrandingConfig | null>(null);

  if (!clientRef.current) {
    clientRef.current = new AuthonMobileClient(config);
  }

  const client = clientRef.current;

  useEffect(() => {
    if (storage) {
      client.setStorage(storage);
    }

    const init = async () => {
      // Initialize tokens from storage
      const tokens = await client.initialize();

      // Fetch providers + branding in parallel
      await client.ensureInitialized();
      const p = await client.getProviders();
      const b = await client.getBranding();
      setProviders(p);
      setBranding(b);

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
    };

    init();

    // Listen for auth events to keep state in sync
    const unsubs = [
      client.on('signedOut', () => {
        setUser(null);
        setAuthState({
          isLoaded: true,
          isSignedIn: false,
          userId: null,
          sessionId: null,
          accessToken: null,
        });
      }),
      client.on('tokenRefreshed', () => {
        const token = client.getAccessToken();
        if (token) {
          setAuthState((prev) => ({ ...prev, accessToken: token }));
        }
      }),
    ];

    return () => {
      unsubs.forEach((fn) => fn());
      client.destroy();
    };
  }, []);

  const signIn = useCallback(async (params: SignInParams) => {
    const result = await client.signIn(params);
    if ('needsVerification' in result || 'mfaRequired' in result) return result;
    setUser(result.user);
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      userId: result.user?.id || null,
      sessionId: null,
      accessToken: result.tokens.accessToken,
    });
    return result;
  }, [client]);

  const signUp = useCallback(async (params: SignUpParams) => {
    const result = await client.signUp(params);
    if ('needsVerification' in result) return result;
    setUser(result.user);
    setAuthState({
      isLoaded: true,
      isSignedIn: true,
      userId: result.user?.id || null,
      sessionId: null,
      accessToken: result.tokens.accessToken,
    });
    return result;
  }, [client]);

  const signOut = useCallback(async () => {
    await client.signOut();
    // State is updated via the 'signedOut' event listener
  }, [client]);

  const getToken = useCallback(() => {
    return client.getAccessToken();
  }, [client]);

  const startOAuth = useCallback(
    async (provider: OAuthProviderType, options?: string | StartOAuthOptions) => {
      return client.getOAuthUrl(provider, options);
    },
    [client],
  );

  const completeOAuthCb = useCallback(
    async (state: string) => {
      const { tokens, user: u } = await client.completeOAuth(state);
      setUser(u);
      setAuthState({
        isLoaded: true,
        isSignedIn: true,
        userId: u?.id || null,
        sessionId: null,
        accessToken: tokens.accessToken,
      });
    },
    [client],
  );

  const on = useCallback(
    <K extends AuthonEventType>(event: K, listener: AuthonEvents[K]) => {
      return client.on(event, listener);
    },
    [client],
  );

  const value = useMemo<AuthonContextValue>(
    () => ({
      ...authState,
      user,
      signIn,
      signUp,
      signOut,
      getToken,
      providers,
      branding,
      startOAuth,
      completeOAuth: completeOAuthCb,
      on,
      client,
    }),
    [authState, user, signIn, signUp, signOut, getToken, providers, branding, startOAuth, completeOAuthCb, on, client],
  );

  return <AuthonContext.Provider value={value}>{children}</AuthonContext.Provider>;
}
