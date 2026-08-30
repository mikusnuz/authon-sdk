import { beforeEach, describe, expect, it, vi } from 'vitest';

const { values, cookieSet, cookieDelete } = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    cookieSet: vi.fn((name: string, value: string) => values.set(name, value)),
    cookieDelete: vi.fn((name: string) => values.delete(name)),
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => values.has(name) ? { value: values.get(name)! } : undefined,
    set: cookieSet,
    delete: cookieDelete,
  })),
}));

import {
  createAuthonAuthorizationRequest,
  handleAuthonAuthorizationCallback,
  revokeAuthonSession,
} from './authorization-code';

const transactionSecret = 'transaction-secret-with-at-least-32-characters';

describe('Next.js BFF authorization helpers', () => {
  beforeEach(() => {
    values.clear();
    cookieSet.mockClear();
    cookieDelete.mockClear();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('stores verifier/state only in an encrypted HttpOnly transaction cookie', async () => {
    const result = await createAuthonAuthorizationRequest({
      redirectUri: 'https://typebla.st/api/v1/web-session/authon/callback',
      transactionSecret,
    });
    expect(result.authorization.codeChallengeMethod).toBe('S256');
    expect(result.authorization.state).toHaveLength(43);
    expect(result.authorization.codeChallenge).toHaveLength(43);
    expect(result).not.toHaveProperty('codeVerifier');
    expect(cookieSet).toHaveBeenCalledWith(
      expect.stringMatching(/^authon-txn-/),
      expect.not.stringContaining(result.authorization.state),
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 }),
    );
  });

  it('validates state, deletes the transaction and exchanges code server-side', async () => {
    const { authorization } = await createAuthonAuthorizationRequest({
      redirectUri: 'https://typebla.st/api/v1/web-session/authon/callback',
      transactionSecret,
    });
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      accessToken: 'access', refreshToken: 'refresh', expiresIn: 900, sessionId: 'session', user: { id: 'user' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const result = await handleAuthonAuthorizationCallback({
      code: 'c'.repeat(43),
      state: authorization.state,
      redirectUri: authorization.redirectUri,
      secretKey: 'sk_live_secret',
      apiUrl: 'https://api.authon.dev',
      transactionSecret,
    });

    expect(result.sessionId).toBe('session');
    expect(cookieDelete).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith('https://api.authon.dev/v1/auth/token/exchange', expect.objectContaining({
      cache: 'no-store',
      headers: expect.objectContaining({ Authorization: 'Bearer sk_live_secret' }),
    }));
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0]?.[1]?.body as string));
    expect(body).toMatchObject({ grantType: 'authorization_code', code: 'c'.repeat(43), redirectUri: authorization.redirectUri });
    expect(body.codeVerifier).toHaveLength(43);
  });

  it('rejects missing, tampered, or mismatched transactions without exchange', async () => {
    const { authorization } = await createAuthonAuthorizationRequest({ redirectUri: 'https://typebla.st/callback', transactionSecret });
    const [name] = values.keys();
    values.set(name!, `${values.get(name!)}tampered`);
    await expect(handleAuthonAuthorizationCallback({
      code: 'c'.repeat(43), state: authorization.state, redirectUri: authorization.redirectUri,
      secretKey: 'sk_live_secret', transactionSecret,
    })).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();

    await expect(handleAuthonAuthorizationCallback({
      code: 'c'.repeat(43), state: 'different-state', redirectUri: authorization.redirectUri,
      secretKey: 'sk_live_secret', transactionSecret,
    })).rejects.toThrow('Missing or expired');
  });

  it('rejects an invalid exchange response instead of forwarding it to the application', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      authorizationCode: 'unexpected-browser-shape',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const { authorization } = await createAuthonAuthorizationRequest({
      redirectUri: 'https://typebla.st/callback',
      transactionSecret,
    });
    await expect(handleAuthonAuthorizationCallback({
      code: 'c'.repeat(43),
      state: authorization.state,
      redirectUri: authorization.redirectUri,
      secretKey: 'sk_live_secret',
      transactionSecret,
    })).rejects.toThrow('invalid response');
  });

  it('revokes a provider session with the secret key', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await revokeAuthonSession({ secretKey: 'sk_live_secret', sessionId: 'session-id' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.authon.dev/v1/auth/sessions/session-id/revoke',
      expect.objectContaining({ method: 'POST', cache: 'no-store' }),
    );
  });
});
