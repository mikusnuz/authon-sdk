import { createHash, randomBytes, webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthonMobileClient } from './client';
import { base64Url, parseOAuthCallback, sha256Ascii } from './pkce';
import { AuthonMfaRequiredError } from './types';

const API = 'https://api.authon.dev';
const CODE = 'C'.repeat(43);

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

const user = { id: 'user_1', email: 'person@example.com' };

function installFetch(poll: unknown = { status: 'pending' }) {
  const calls = { url: [] as URL[], token: [] as Array<{ code: string; codeVerifier: string }> };
  vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    if (url.pathname === '/v1/auth/oauth/google/url') {
      calls.url.push(url);
      return json({ url: 'https://accounts.example/auth', state: `state-${calls.url.length}` });
    }
    if (url.pathname === '/v1/auth/oauth/poll') return json(poll);
    if (url.pathname === '/v1/auth/oauth/token') {
      calls.token.push(JSON.parse(String(init?.body)));
      return json({ accessToken: 'access', refreshToken: 'refresh', expiresIn: 900, user });
    }
    return json({});
  }));
  return calls;
}

beforeEach(() => {
  if (!(globalThis as any).crypto?.getRandomValues) vi.stubGlobal('crypto', webcrypto);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('React Native PKCE helpers', () => {
  it('computes SHA-256 like node for various lengths', () => {
    for (const len of [0, 1, 43, 55, 56, 63, 64, 65, 128, 200]) {
      const input = randomBytes(len).toString('base64url').slice(0, len).padEnd(len, 'a');
      expect(base64Url(sha256Ascii(input))).toBe(createHash('sha256').update(input, 'ascii').digest('base64url'));
    }
  });

  it('parses deep links and bridge forwards', () => {
    expect(parseOAuthCallback(`myapp://oauth-callback?authon_code=${CODE}&authon_oauth_state=s1`)).toEqual({ code: CODE, state: 's1', error: null });
    expect(parseOAuthCallback(`myapp://oauth-callback?authon_code=${CODE}&state=s2`)).toEqual({ code: CODE, state: 's2', error: null });
    expect(parseOAuthCallback('myapp://oauth-callback')).toBeNull();
  });
});

describe('React Native OAuth (PKCE)', () => {
  it('requires a return target and sends an S256 challenge', async () => {
    const calls = installFetch();
    const client = new AuthonMobileClient({ publishableKey: 'pk_live_x', apiUrl: API });
    await expect(client.getOAuthUrl('google')).rejects.toThrow(/returnTo/);
    await client.getOAuthUrl('google', { returnTo: 'myapp://oauth-callback' });
    const params = calls.url[0].searchParams;
    expect(params.get('flow')).toBe('redirect');
    expect(params.get('returnTo')).toBe('myapp://oauth-callback');
    expect(params.get('codeChallengeMethod')).toBe('S256');
    expect(params.get('codeChallenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('exchanges the deep-link code with the verifier of this flow, once', async () => {
    const calls = installFetch();
    const client = new AuthonMobileClient({ publishableKey: 'pk_live_x', apiUrl: API, oauthReturnTo: 'myapp://oauth-callback' });
    const { state } = await client.getOAuthUrl('google');
    const waiting = client.completeOAuth(state);
    const result = await client.handleOAuthCallback(`myapp://oauth-callback?authon_code=${CODE}&authon_oauth_state=${state}`);
    expect(result.user).toEqual(user);
    await expect(waiting).resolves.toMatchObject({ user });
    const challenge = calls.url[0].searchParams.get('codeChallenge');
    expect(createHash('sha256').update(calls.token[0].codeVerifier, 'ascii').digest('base64url')).toBe(challenge);
    await expect(client.handleOAuthCallback(`myapp://oauth-callback?authon_code=${CODE}&authon_oauth_state=${state}`)).rejects.toThrow(/No OAuth sign-in/);
    expect(calls.token).toHaveLength(1);
  });

  it('ignores callbacks for flows it did not start and never takes tokens from the poll', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout'] });
    const calls = installFetch({ status: 'completed', accessToken: 'forged', refreshToken: 'forged', expiresIn: 900, user });
    const client = new AuthonMobileClient({ publishableKey: 'pk_live_x', apiUrl: API, oauthReturnTo: 'myapp://cb' });
    await expect(client.handleOAuthCallback(`myapp://cb?authon_code=${CODE}&authon_oauth_state=attacker-state`)).rejects.toThrow();
    const { state } = await client.getOAuthUrl('google');
    const waiting = client.completeOAuth(state);
    let settled = false;
    waiting.then(() => { settled = true; }, () => { settled = true; });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(settled).toBe(false);
    expect(client.getAccessToken()).toBeNull();
    expect(calls.token).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(180_000);
    await expect(waiting).rejects.toThrow('OAuth timeout');
  });

  it('surfaces MFA as a typed error carrying the token, then finishes with verifyMfa', async () => {
    const tokenBodies: unknown[] = [];
    const mfaBodies: unknown[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input);
      if (url.pathname === '/v1/auth/oauth/google/url') return json({ url: 'https://accounts.example/auth', state: 'mfa-state' });
      if (url.pathname === '/v1/auth/oauth/poll') return json({ status: 'pending' });
      if (url.pathname === '/v1/auth/oauth/token') {
        tokenBodies.push(JSON.parse(String(init?.body)));
        return json({ mfaRequired: true, mfaToken: 'mfa-token-1', mfaMethods: ['totp'] });
      }
      if (url.pathname === '/v1/auth/mfa/verify') {
        mfaBodies.push(JSON.parse(String(init?.body)));
        return json({ accessToken: 'access', refreshToken: 'refresh', expiresIn: 900, user });
      }
      return json({});
    }));
    const client = new AuthonMobileClient({ publishableKey: 'pk_live_x', apiUrl: API, oauthReturnTo: 'myapp://cb' });
    const onMfa = vi.fn();
    const onSignedIn = vi.fn();
    client.on('mfaRequired', onMfa);
    client.on('signedIn', onSignedIn);
    const { state } = await client.getOAuthUrl('google');
    const waiting = client.completeOAuth(state).catch((e) => e);
    const error = await client.handleOAuthCallback(`myapp://cb?authon_code=${CODE}&authon_oauth_state=${state}`).catch((e) => e);
    expect(error).toBeInstanceOf(AuthonMfaRequiredError);
    expect(error).toMatchObject({ mfaToken: 'mfa-token-1', mfaMethods: ['totp'] });
    await expect(waiting).resolves.toBe(error);
    expect(onMfa).toHaveBeenCalledWith('mfa-token-1');
    expect(onSignedIn).not.toHaveBeenCalled();
    expect(client.getAccessToken()).toBeNull();
    expect(tokenBodies).toHaveLength(1);

    await expect(client.verifyMfa('mfa-token-1', '123456')).resolves.toMatchObject({ user });
    expect(mfaBodies).toEqual([{ mfaToken: 'mfa-token-1', code: '123456' }]);
    expect(client.getAccessToken()).toBe('access');
    expect(onSignedIn).toHaveBeenCalledWith(user);
  });
});
