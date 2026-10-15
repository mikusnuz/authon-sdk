// @vitest-environment jsdom

import { createHash } from 'node:crypto';
import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';
import { Authon } from './authon';
import { handoffKey } from './oauth-pkce';

const API = 'https://api.authon.dev';
let STATE = 'provider-state-0';
let stateCounter = 0;
const CODE = 'C'.repeat(43);

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function user(): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function jwt(): string {
  const encode = (value: unknown) => btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
}

function tokens(): AuthTokens {
  return { accessToken: jwt(), refreshToken: 'refresh_1', expiresIn: 3600, user: user() };
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

const s256 = (verifier: string) => createHash('sha256').update(verifier, 'ascii').digest('base64url');

interface Calls {
  urlRequests: URL[];
  tokenBodies: Array<{ code: string; codeVerifier: string }>;
}

function installFetch(options: { poll?: unknown; token?: () => unknown } = {}): Calls {
  const calls: Calls = { urlRequests: [], tokenBodies: [] };
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.pathname === '/v1/auth/branding') return json({});
    if (url.pathname === '/v1/auth/providers') return json({ providers: ['google'], providerConfigs: { google: { oauthFlow: 'popup' } } });
    if (url.pathname === '/v1/auth/oauth/google/url') {
      calls.urlRequests.push(url);
      return json({ url: `https://accounts.example/auth?state=${STATE}`, state: STATE, flowMode: url.searchParams.get('flow') });
    }
    if (url.pathname === '/v1/auth/oauth/poll') return json(options.poll ?? { status: 'pending' });
    if (url.pathname === '/v1/auth/oauth/token') {
      const body = JSON.parse(String(init?.body));
      calls.tokenBodies.push(body);
      return json(options.token ? options.token() : tokens());
    }
    if (url.pathname === '/v1/auth/mfa/verify') return json(tokens());
    return json({});
  }));
  return calls;
}

function fakePopup() {
  return { closed: false, close: vi.fn(function (this: { closed: boolean }) { this.closed = true; }) };
}

async function flush(times = 10) {
  for (let i = 0; i < times; i++) await Promise.resolve();
}

beforeEach(() => {
  // Earlier tests leave pending flows listening; give every test its own OAuth state.
  STATE = `provider-state-${++stateCounter}`;
  vi.stubGlobal('localStorage', new MemoryStorage());
  vi.stubGlobal('sessionStorage', new MemoryStorage());
  if (!globalThis.crypto?.subtle) vi.stubGlobal('crypto', webcrypto);
  window.history.replaceState({}, '', '/login?next=1');
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('OAuth popup (PKCE mode)', () => {
  async function startPopup(calls: Calls) {
    const popup = fakePopup();
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    const authon = new Authon('pk_live_oauth-test', { apiUrl: API });
    const signedIn = vi.fn();
    authon.on('signedIn', signedIn);
    await authon.signInWithOAuth('google', { flowMode: 'popup' });
    await vi.waitFor(() => expect(calls.urlRequests).toHaveLength(1));
    return { authon, popup, signedIn };
  }

  it('sends an S256 challenge with the URL request and redeems the code with the matching verifier', async () => {
    const calls = installFetch();
    const { popup, signedIn } = await startPopup(calls);
    const request = calls.urlRequests[0];
    expect(request.searchParams.get('codeChallengeMethod')).toBe('S256');
    const challenge = request.searchParams.get('codeChallenge')!;
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(request.searchParams.get('returnTo')).toBe(`${window.location.origin}/login?next=1`);

    window.dispatchEvent(new MessageEvent('message', {
      origin: API,
      source: popup as unknown as Window,
      data: { type: 'authon-oauth-pkce', code: CODE, state: STATE, expiresIn: 60 },
    }));
    await vi.waitFor(() => expect(signedIn).toHaveBeenCalledTimes(1));
    expect(calls.tokenBodies).toHaveLength(1);
    expect(calls.tokenBodies[0].code).toBe(CODE);
    expect(s256(calls.tokenBodies[0].codeVerifier)).toBe(challenge);
    expect(popup.close).toHaveBeenCalled();
  });

  it('ignores messages from other origins, other windows or other flows', async () => {
    const calls = installFetch();
    const { popup, signedIn } = await startPopup(calls);
    const data = { type: 'authon-oauth-pkce', code: CODE, state: STATE, expiresIn: 60 };
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://evil.com', source: popup as unknown as Window, data }));
    window.dispatchEvent(new MessageEvent('message', { origin: API, source: window, data }));
    window.dispatchEvent(new MessageEvent('message', { origin: API, source: popup as unknown as Window, data: { ...data, state: 'other-state' } }));
    // Old token-shaped messages are not accepted any more.
    window.dispatchEvent(new MessageEvent('message', { origin: API, source: popup as unknown as Window, data: { type: 'authon-oauth-callback', tokens: tokens(), state: STATE } }));
    await flush();
    expect(calls.tokenBodies).toHaveLength(0);
    expect(signedIn).not.toHaveBeenCalled();
  });

  it('never signs in from a poll response, even a token-shaped one', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout'] });
    const calls = installFetch({ poll: { status: 'completed', ...tokens(), authorizationCode: 'x' } });
    const { signedIn } = await startPopup(calls);
    await vi.advanceTimersByTimeAsync(5000);
    expect(signedIn).not.toHaveBeenCalled();
    expect(calls.tokenBodies).toHaveLength(0);
  });

  it('an MFA user gets mfaRequired with the token (no session) and finishes with verifyMfa', async () => {
    const calls = installFetch({ token: () => ({ mfaRequired: true, mfaToken: 'mfa-token-1', mfaMethods: ['totp'] }) });
    const { authon, popup, signedIn } = await startPopup(calls);
    const onMfa = vi.fn();
    authon.on('mfaRequired', onMfa);
    window.dispatchEvent(new MessageEvent('message', {
      origin: API,
      source: popup as unknown as Window,
      data: { type: 'authon-oauth-pkce', code: CODE, state: STATE, expiresIn: 60 },
    }));
    await vi.waitFor(() => expect(onMfa).toHaveBeenCalledWith('mfa-token-1'));
    expect(signedIn).not.toHaveBeenCalled();
    expect(authon.getUser()).toBeNull();
    await authon.verifyMfa('mfa-token-1', '123456');
    expect(signedIn).toHaveBeenCalledTimes(1);
  });

  it('redeems a same-origin storage handoff from a popup that lost its opener', async () => {
    const calls = installFetch();
    const { signedIn } = await startPopup(calls);
    const key = handoffKey(STATE);
    const value = JSON.stringify({ code: CODE, at: Date.now() });
    localStorage.setItem(key, value);
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
    await vi.waitFor(() => expect(signedIn).toHaveBeenCalledTimes(1));
    expect(calls.tokenBodies).toHaveLength(1);
    expect(localStorage.getItem(key)).toBeNull();
  });
});

describe('OAuth redirect (PKCE mode)', () => {
  it('keeps the verifier in this tab and redeems the returned code once', async () => {
    const calls = installFetch();
    const assign = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, href: window.location.href, origin: window.location.origin, assign } as Location);
    const first = new Authon('pk_live_oauth-test', { apiUrl: API });
    await first.signInWithOAuth('google', { flowMode: 'redirect' });
    await vi.waitFor(() => expect(assign).toHaveBeenCalled());
    const challenge = calls.urlRequests[0].searchParams.get('codeChallenge')!;
    vi.restoreAllMocks();

    window.history.replaceState({}, '', `/login?authon_code=${CODE}&authon_oauth_state=${STATE}&keep=1`);
    const second = new Authon('pk_live_oauth-test', { apiUrl: API });
    const signedIn = vi.fn();
    second.on('signedIn', signedIn);
    await vi.waitFor(() => expect(signedIn).toHaveBeenCalledTimes(1));
    expect(s256(calls.tokenBodies[0].codeVerifier)).toBe(challenge);
    expect(window.location.search).toBe('?keep=1');

    // Reloading the same URL cannot redeem again: the verifier was single-use.
    window.history.replaceState({}, '', `/login?authon_code=${CODE}&authon_oauth_state=${STATE}`);
    const third = new Authon('pk_live_oauth-test', { apiUrl: API });
    await flush();
    await vi.waitFor(() => expect(calls.tokenBodies).toHaveLength(2));
    expect(s256(calls.tokenBodies[1].codeVerifier)).not.toBe(challenge);
    void third;
  });

  it('burns a code this tab did not ask for instead of redeeming it', async () => {
    const calls = installFetch();
    window.history.replaceState({}, '', `/login?authon_code=${CODE}&authon_oauth_state=${STATE}`);
    const authon = new Authon('pk_live_oauth-test', { apiUrl: API });
    await vi.waitFor(() => expect(calls.tokenBodies).toHaveLength(1));
    expect(calls.tokenBodies[0].code).toBe(CODE);
    expect(authon.getUser()).toBeNull();
    expect(window.location.search).toBe('');
  });

  it('a popup page that lost its opener only hands the code to its own origin', async () => {
    const calls = installFetch();
    const close = vi.spyOn(window, 'close').mockImplementation(() => undefined);
    window.history.replaceState({}, '', `/login?authon_code=${CODE}&authon_oauth_state=${STATE}&authon_oauth_popup=1`);
    new Authon('pk_live_oauth-test', { apiUrl: API });
    await flush();
    expect(calls.tokenBodies).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem(handoffKey(STATE))!)).toMatchObject({ code: CODE });
    expect(close).toHaveBeenCalled();
    expect(window.location.search).toBe('');
  });
});
