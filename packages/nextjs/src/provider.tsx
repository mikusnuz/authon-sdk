import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import {
  AuthonProvider as ReactAuthonProvider,
  useAuthon,
} from '@authon/react';
import { isUnexpiredAuthonToken, readAuthonCookie, syncAuthonCookie } from './cookie';

export type AuthonProviderProps = ComponentProps<typeof ReactAuthonProvider> & {
  /** Name of the JavaScript-readable compatibility cookie used by Next server helpers. */
  cookieName?: string;
};

function SessionCookieBridge({ cookieName }: { cookieName?: string }) {
  const { client } = useAuthon();

  useEffect(() => {
    const cookieOptions = {
      cookieName,
      protocol: window.location.protocol,
    };
    const existingToken = readAuthonCookie(cookieName);
    if (existingToken && !isUnexpiredAuthonToken(existingToken)) {
      syncAuthonCookie(null, cookieOptions);
    }
    if (!client) return;
    let active = true;
    const sync = () => {
      if (!active) return;
      syncAuthonCookie(client.getToken(), cookieOptions);
    };
    const unsubscribe = client.onSessionChange(sync);
    void client.waitUntilReady().then(sync);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [client, cookieName]);

  return null;
}

/**
 * React provider with a Next.js server compatibility bridge.
 *
 * The bridge cookie is intentionally JavaScript-readable because the browser SDK
 * owns token refresh. It is not an HttpOnly server session cookie and should be
 * protected with the same XSS controls as the browser access token.
 */
export function AuthonProvider({ cookieName, children, ...props }: AuthonProviderProps) {
  return (
    <ReactAuthonProvider {...props}>
      <SessionCookieBridge cookieName={cookieName} />
      {children}
    </ReactAuthonProvider>
  );
}
