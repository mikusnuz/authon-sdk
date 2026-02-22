import type { AuthonUser } from '@authon/shared';

async function getTokenFromCookies(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('authon-token')?.value ?? null;
  } catch {
    return null;
  }
}

async function verifyTokenWithApi(
  token: string,
  secretKey?: string,
  apiUrl?: string,
): Promise<AuthonUser | null> {
  const url = apiUrl || process.env['AUTHON_API_URL'] || 'https://api.authon.dev';
  const key = secretKey || process.env['AUTHON_SECRET_KEY'];
  if (!key) return null;

  try {
    const res = await fetch(`${url}/v1/auth/token/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': key,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    return res.json() as Promise<AuthonUser>;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<AuthonUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyTokenWithApi(token);
}

export async function auth(): Promise<{
  userId: string | null;
  user: AuthonUser | null;
  getToken: () => string | null;
}> {
  const token = await getTokenFromCookies();
  if (!token) return { userId: null, user: null, getToken: () => null };

  const user = await verifyTokenWithApi(token);
  return {
    userId: user?.id ?? null,
    user,
    getToken: () => token,
  };
}
