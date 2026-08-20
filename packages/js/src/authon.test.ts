// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';
import { Authon } from './authon';
import type { SessionChange } from './session';
import type { AuthonEvents } from './types';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function user(overrides: Partial<AuthonUser> = {}): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function jwt(expiresInSeconds: number): string {
  const encode = (value: unknown) => btoa(JSON.stringify(value))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.sig`;
}

function tokens(expiresInSeconds = 3600, overrides: Partial<AuthTokens> = {}): AuthTokens {
  return {
    accessToken: jwt(expiresInSeconds),
    refreshToken: 'refresh_1',
    expiresIn: expiresInSeconds,
    user: user(),
    ...overrides,
  };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Authon session event contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T00:00:00.000Z'));
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('emits signedIn and sessionChanged exactly once from a successful setSession path', async () => {
    const authon = new Authon('pk_live_authon-events');
    const signedIn = vi.fn();
    const changes: SessionChange[] = [];
    authon.on('signedIn', signedIn);
    authon.onSessionChange((change) => changes.push(change));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));

    await authon.signInWithEmail('person@example.com', 'secret');

    expect(signedIn).toHaveBeenCalledTimes(1);
    expect(signedIn).toHaveBeenCalledWith(expect.objectContaining({ id: 'user_1' }));
    expect(changes).toEqual([
      expect.objectContaining({ reason: 'setSession', user: expect.objectContaining({ id: 'user_1' }) }),
    ]);
  });

  it('emits tokenRefreshed and sessionChanged exactly once after refresh', async () => {
    const authon = new Authon('pk_live_authon-refresh');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    await authon.signInWithEmail('person@example.com', 'secret');
    const tokenRefreshed = vi.fn();
    const changes: SessionChange[] = [];
    authon.on('tokenRefreshed', tokenRefreshed);
    authon.onSessionChange((change) => changes.push(change));
    const refreshed = tokens(7200, { accessToken: jwt(7200), refreshToken: 'refresh_2' });
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(refreshed));

    const session = (authon as unknown as { session: { refresh(): Promise<AuthTokens | null> } }).session;
    await session.refresh();

    expect(tokenRefreshed).toHaveBeenCalledTimes(1);
    expect(tokenRefreshed).toHaveBeenCalledWith(refreshed.accessToken);
    expect(changes).toEqual([
      expect.objectContaining({ reason: 'tokenRefresh', accessToken: refreshed.accessToken }),
    ]);
  });

  it('emits signedOut and sessionChanged exactly once for explicit signOut', async () => {
    const authon = new Authon('pk_live_authon-signout');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    await authon.signInWithEmail('person@example.com', 'secret');
    const signedOut = vi.fn();
    const changes: SessionChange[] = [];
    authon.on('signedOut', signedOut);
    authon.onSessionChange((change) => changes.push(change));
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await authon.signOut();

    expect(signedOut).toHaveBeenCalledTimes(1);
    expect(changes).toEqual([
      expect.objectContaining({ reason: 'signOut', accessToken: null, user: null }),
    ]);
  });

  it('publishes verificationRequired with the email payload declared by AuthonEvents', async () => {
    const authon = new Authon('pk_live_authon-verification');
    const listener: AuthonEvents['verificationRequired'] = vi.fn();
    authon.on('verificationRequired', listener);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({
      needsVerification: true,
      email: 'verify@example.com',
    }));

    await expect(authon.signInWithEmail('verify@example.com', 'secret')).resolves.toEqual({
      needsVerification: true,
      email: 'verify@example.com',
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith('verify@example.com');
  });

  it('forwards readiness and hides an expired restored session until refresh resolves', async () => {
    const seed = new Authon('pk_live_authon-ready');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens(-10, { expiresIn: -10 })));
    await seed.signInWithEmail('person@example.com', 'secret');
    seed.destroy();

    let resolveRefresh!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise((resolve) => { resolveRefresh = resolve; }));
    const restored = new Authon('pk_live_authon-ready');

    expect(restored.isReady()).toBe(false);
    expect(restored.getToken()).toBeNull();
    expect(restored.getUser()).toBeNull();
    resolveRefresh(jsonResponse(tokens(3600)));
    await restored.waitUntilReady();
    expect(restored.isReady()).toBe(true);
    expect(restored.getUser()?.id).toBe('user_1');
  });

  it('isolates public listener errors and unsubscribe stops session notifications', async () => {
    const authon = new Authon('pk_live_authon-listeners');
    const observed = vi.fn();
    authon.on('signedIn', () => { throw new Error('listener failed'); });
    authon.on('signedIn', observed);
    const sessionObserved = vi.fn();
    const unsubscribe = authon.onSessionChange(sessionObserved);
    unsubscribe();
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));

    await expect(authon.signInWithEmail('person@example.com', 'secret')).resolves.toMatchObject({ id: 'user_1' });
    expect(observed).toHaveBeenCalledOnce();
    expect(sessionObserved).not.toHaveBeenCalled();
  });
});
