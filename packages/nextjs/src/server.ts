import type { AuthupUser } from '@authup/shared';

async function getTokenFromCookies(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('authup-token')?.value ?? null;
  } catch {
    return null;
  }
}

async function verifyTokenWithApi(
  token: string,
  secretKey?: string,
  apiUrl?: string,
): Promise<AuthupUser | null> {
  const url = apiUrl || process.env['AUTHUP_API_URL'] || 'https://api.authup.dev';
  const key = secretKey || process.env['AUTHUP_SECRET_KEY'];
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
    return res.json() as Promise<AuthupUser>;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<AuthupUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyTokenWithApi(token);
}

export async function auth(): Promise<{
  userId: string | null;
  user: AuthupUser | null;
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
