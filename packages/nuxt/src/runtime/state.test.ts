// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Authon } from '@authon/js';
import type { AuthonUser } from '@authon/shared';

const user: AuthonUser = {
  id: 'user_nuxt',
  projectId: 'project_nuxt',
  email: 'nuxt@example.com',
  emailVerified: true,
  displayName: 'Nuxt User',
  avatarUrl: null,
  phone: null,
  phoneVerified: false,
  isBanned: false,
  publicMetadata: null,
  lastSignInAt: null,
  signInCount: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Nuxt runtime state', () => {
  it('provides a stable loading state during SSR without creating a client', async () => {
    const runtimeModule = await import('./state').catch(() => null);
    expect(runtimeModule).not.toBeNull();

    const createClient = vi.fn();
    const runtime = runtimeModule!.createAuthonRuntime({
      publishableKey: 'pk_live_ssr',
      config: {},
      client: false,
      createClient,
    });

    expect(runtime.state).toMatchObject({
      client: null,
      user: null,
      isSignedIn: false,
      isLoading: true,
    });
    expect(createClient).not.toHaveBeenCalled();
    await expect(runtime.ready).resolves.toBeUndefined();
    runtime.dispose();
  });

  it('hydrates from readiness and tracks every session change', async () => {
    let resolveReady!: () => void;
    let sessionListener!: (change: { user: AuthonUser | null }) => void;
    let currentUser: AuthonUser | null = null;
    const unsubscribe = vi.fn();
    const destroy = vi.fn();
    const client = {
      getUser: () => currentUser,
      waitUntilReady: () => new Promise<void>((resolve) => { resolveReady = resolve; }),
      onSessionChange: (listener: typeof sessionListener) => {
        sessionListener = listener;
        return unsubscribe;
      },
      destroy,
    } as unknown as Authon;

    const { createAuthonRuntime } = await import('./state');
    const runtime = createAuthonRuntime({
      publishableKey: 'pk_live_hydration',
      config: { theme: 'dark' },
      client: true,
      createClient: () => client,
    });

    expect(runtime.state.client).toBe(client);
    expect(runtime.state.isLoading).toBe(true);

    currentUser = user;
    resolveReady();
    await runtime.ready;
    expect(runtime.state.user).toBe(user);
    expect(runtime.state.isSignedIn).toBe(true);
    expect(runtime.state.isLoading).toBe(false);

    sessionListener({ user: null });
    expect(runtime.state.user).toBeNull();
    expect(runtime.state.isSignedIn).toBe(false);

    sessionListener({ user });
    expect(runtime.state.user).toBe(user);
    expect(runtime.state.isSignedIn).toBe(true);

    runtime.dispose();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('destroys runtime resources without deleting the persisted session', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({ exp: now + 3600 }));
    const token = `header.${payload}.signature`;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      accessToken: token,
      refreshToken: 'refresh_nuxt',
      user,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })));

    const { createAuthonRuntime } = await import('./state');
    const first = createAuthonRuntime({
      publishableKey: 'pk_test_nuxt-persistence',
      config: {},
      client: true,
    });
    await first.state.client!.testing!.signIn({ email: user.email! });
    expect(first.state.user).toEqual(user);

    first.dispose();

    const restored = createAuthonRuntime({
      publishableKey: 'pk_test_nuxt-persistence',
      config: {},
      client: true,
    });
    await restored.ready;
    expect(restored.state.user).toEqual(user);
    expect(restored.state.isSignedIn).toBe(true);
    restored.dispose();
  });
});
