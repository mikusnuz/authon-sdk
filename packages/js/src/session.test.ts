// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';
import { SessionManager } from './session';

const DEFAULT_API_URL = 'https://api.authon.dev';

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
    id: 'user_1',
    projectId: 'project_1',
    email: 'person@example.com',
    displayName: 'Person',
    avatarUrl: null,
    phone: null,
    emailVerified: true,
    phoneVerified: false,
    isBanned: false,
    publicMetadata: null,
    lastSignInAt: null,
    signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function jwt(expiresInSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds }))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${header}.${payload}.signature`;
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

function sessionStorageKeys(): string[] {
  return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
    .filter((key): key is string => key?.startsWith('authon_session_') === true);
}

describe('SessionManager lifecycle and restoration', () => {
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

  it('preserves persisted session state when destroyed and restored by a new instance', async () => {
    const first = new SessionManager('pk_live_destroy-preservation', DEFAULT_API_URL);
    first.setSession(tokens());
    const storedBeforeDestroy = sessionStorageKeys().map((key) => localStorage.getItem(key));

    first.destroy();

    expect(sessionStorageKeys().map((key) => localStorage.getItem(key))).toEqual(storedBeforeDestroy);
    const remounted = new SessionManager('pk_live_destroy-preservation', DEFAULT_API_URL);
    await remounted.waitUntilReady();
    expect(remounted.getUser()?.id).toBe('user_1');
    expect(remounted.getToken()).not.toBeNull();
  });

  it('restores a valid stored token synchronously as ready', async () => {
    const first = new SessionManager('pk_live_valid-restore', DEFAULT_API_URL);
    first.setSession(tokens());
    first.destroy();

    const restored = new SessionManager('pk_live_valid-restore', `${DEFAULT_API_URL}/`);

    expect(restored.isReady()).toBe(true);
    expect(restored.getUser()?.id).toBe('user_1');
    await expect(restored.waitUntilReady()).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('hides an expired stored session and refreshes it immediately before becoming ready', async () => {
    const first = new SessionManager('pk_live_expired-restore', DEFAULT_API_URL);
    first.setSession(tokens(-10, { expiresIn: -10 }));
    first.destroy();
    const refreshed = tokens(3600, { accessToken: jwt(3600), refreshToken: 'refresh_2' });
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(refreshed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    const restored = new SessionManager('pk_live_expired-restore', DEFAULT_API_URL);

    expect(restored.isReady()).toBe(false);
    expect(restored.getToken()).toBeNull();
    expect(restored.getUser()).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    await restored.waitUntilReady();
    expect(restored.isReady()).toBe(true);
    expect(restored.getToken()).toBe(refreshed.accessToken);
    expect(restored.getUser()?.id).toBe('user_1');
  });

  it('clears an expired restored session when refresh is rejected', async () => {
    const first = new SessionManager('pk_live_rejected-restore', DEFAULT_API_URL);
    first.setSession(tokens(-10, { expiresIn: -10 }));
    first.destroy();
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 401 }));

    const restored = new SessionManager('pk_live_rejected-restore', DEFAULT_API_URL);
    await restored.waitUntilReady();

    expect(restored.getToken()).toBeNull();
    expect(restored.getUser()).toBeNull();
    expect(sessionStorageKeys()).toHaveLength(0);
  });

  it('ignores corrupt storage without throwing or exposing a session', async () => {
    const seeded = new SessionManager('pk_live_corrupt', DEFAULT_API_URL);
    seeded.setSession(tokens());
    const storageKey = sessionStorageKeys()[0];
    localStorage.setItem(storageKey, '{not-json');
    seeded.destroy();

    const restored = new SessionManager('pk_live_corrupt', DEFAULT_API_URL);

    await expect(restored.waitUntilReady()).resolves.toBeUndefined();
    expect(restored.isReady()).toBe(true);
    expect(restored.getToken()).toBeNull();
    expect(restored.getUser()).toBeNull();
  });

  it('refreshes short-lived sessions without imposing a 30 second minimum delay', async () => {
    const manager = new SessionManager('pk_live_short-ttl', DEFAULT_API_URL);
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(tokens(3600)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    manager.setSession(tokens(20));
    expect(fetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('uses the complete publishable key and normalized API URL in the storage namespace', () => {
    const commonPrefix = 'pk_live_12345678';
    const first = new SessionManager(`${commonPrefix}_first`, 'https://api.example.com/');
    const second = new SessionManager(`${commonPrefix}_second`, 'https://api.example.com');
    const customApi = new SessionManager(`${commonPrefix}_first`, 'https://tenant.example.com');

    first.setSession(tokens(3600, { refreshToken: 'first' }));
    second.setSession(tokens(3600, { refreshToken: 'second' }));
    customApi.setSession(tokens(3600, { refreshToken: 'custom' }));

    expect(sessionStorageKeys()).toHaveLength(3);
    expect(new Set(sessionStorageKeys()).size).toBe(3);
    expect(sessionStorageKeys().every((key) => key.startsWith('authon_session_v2_'))).toBe(true);
  });

  it('migrates a valid legacy session only for the default API and removes it after persistence', async () => {
    const publishableKey = 'pk_live_legacy-owner';
    const legacyKey = `authon_session_${publishableKey.slice(0, 16)}`;
    localStorage.setItem(legacyKey, JSON.stringify(tokens()));

    const restored = new SessionManager(publishableKey, DEFAULT_API_URL);
    await restored.waitUntilReady();

    expect(restored.getUser()?.id).toBe('user_1');
    expect(localStorage.getItem(legacyKey)).toBeNull();
    expect(sessionStorageKeys()).toHaveLength(1);
  });

  it('does not claim a legacy session for a custom API URL', async () => {
    const publishableKey = 'pk_live_legacy-custom';
    const legacyKey = `authon_session_${publishableKey.slice(0, 16)}`;
    localStorage.setItem(legacyKey, JSON.stringify(tokens()));

    const restored = new SessionManager(publishableKey, 'https://tenant.example.com');
    await restored.waitUntilReady();

    expect(restored.getUser()).toBeNull();
    expect(localStorage.getItem(legacyKey)).not.toBeNull();
  });
});

describe('SessionManager change subscriptions', () => {
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

  it('notifies once for setSession, refresh, updateUser, explicit clear, and signOut', async () => {
    const manager = new SessionManager('pk_live_changes', DEFAULT_API_URL);
    const changes: string[] = [];
    manager.subscribe((change) => changes.push(change.reason));

    manager.setSession(tokens());
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(tokens(3600, {
      accessToken: jwt(7200),
      refreshToken: 'refresh_2',
    })), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await manager.refresh();
    manager.updateUser(user({ displayName: 'Updated' }));
    manager.clearSession();
    manager.setSession(tokens());
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await manager.signOut();

    expect(changes).toEqual([
      'setSession',
      'tokenRefresh',
      'updateUser',
      'clearSession',
      'setSession',
      'signOut',
    ]);
  });

  it('persists updateUser and isolates listener errors while supporting unsubscribe', async () => {
    const manager = new SessionManager('pk_live_listener-isolation', DEFAULT_API_URL);
    manager.setSession(tokens());
    const observed: string[] = [];
    manager.subscribe(() => { throw new Error('listener failure'); });
    const unsubscribe = manager.subscribe((change) => observed.push(change.user?.displayName ?? 'none'));

    expect(() => manager.updateUser(user({ displayName: 'Persisted' }))).not.toThrow();
    unsubscribe();
    manager.updateUser(user({ displayName: 'Not observed' }));
    manager.destroy();

    const restored = new SessionManager('pk_live_listener-isolation', DEFAULT_API_URL);
    await restored.waitUntilReady();
    expect(restored.getUser()?.displayName).toBe('Not observed');
    expect(observed).toEqual(['Persisted']);
  });
});
