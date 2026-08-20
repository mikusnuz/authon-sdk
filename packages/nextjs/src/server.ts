import type { AuthonUser } from '@authon/shared';
import { verifyAuthonToken } from './verify';
import type { TokenVerificationOptions } from './verify';

const DEFAULT_COOKIE_NAME = 'authon-token';

export interface AuthonServerOptions extends TokenVerificationOptions {
  cookieName?: string;
}

async function getTokenFromCookies(cookieName: string): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(cookieName)?.value ?? null;
  } catch {
    return null;
  }
}

export async function currentUser(options: AuthonServerOptions = {}): Promise<AuthonUser | null> {
  const token = await getTokenFromCookies(options.cookieName ?? DEFAULT_COOKIE_NAME);
  if (!token) return null;
  return (await verifyAuthonToken(token, options))?.user ?? null;
}

export async function auth(options: AuthonServerOptions = {}): Promise<{
  userId: string | null;
  user: AuthonUser | null;
  getToken: () => string | null;
}> {
  const token = await getTokenFromCookies(options.cookieName ?? DEFAULT_COOKIE_NAME);
  if (!token) return { userId: null, user: null, getToken: () => null };

  const verified = await verifyAuthonToken(token, options);
  if (!verified) return { userId: null, user: null, getToken: () => null };

  const payloadSubject = verified.payload?.sub;
  return {
    userId: verified.user?.id ?? (typeof payloadSubject === 'string' ? payloadSubject : null),
    user: verified.user,
    getToken: () => token,
  };
}
