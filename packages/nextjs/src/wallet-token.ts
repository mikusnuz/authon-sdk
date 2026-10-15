const DEFAULT_API_URL = 'https://api.authon.dev';

export interface CreateAuthonWalletTokenOptions {
  /** Authon user id of the signed-in user (from your server session). */
  userId: string;
  secretKey: string;
  apiUrl?: string;
  /**
   * The user's Authon access token held by your server. When given, the wallet token
   * is bound to that session: it stops working when the session is revoked, and it
   * is accepted for creating, restoring and revoking (which reject unbound tokens).
   */
  accessToken?: string;
}

export interface AuthonWalletToken {
  token: string;
  expiresAt: string;
  /** True when the token is bound to the session of `accessToken`. */
  sessionBound?: boolean;
}

/**
 * Mints a five-minute token that only the Authon wallet API accepts. Use it in
 * BFF apps (sessionMode: 'bff'), where the Authon session never reaches the
 * browser: return this token from a route handler and pass a function that
 * fetches it as `wallet.getToken` to `@authon/js`.
 */
export async function createAuthonWalletToken(options: CreateAuthonWalletTokenOptions): Promise<AuthonWalletToken> {
  if (!/^sk_(live|test)_/.test(options.secretKey)) throw new Error('A server-side Authon secret key is required');
  const base = (options.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');
  const response = await fetch(`${base}/v1/backend/users/${encodeURIComponent(options.userId)}/wallet-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${options.secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(options.accessToken ? { accessToken: options.accessToken } : {}),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Authon wallet token request failed (${response.status})`);
  const body = (await response.json()) as Partial<AuthonWalletToken>;
  if (typeof body.token !== 'string' || typeof body.expiresAt !== 'string') {
    throw new Error('Authon wallet token response is malformed');
  }
  return { token: body.token, expiresAt: body.expiresAt, sessionBound: body.sessionBound === true };
}
