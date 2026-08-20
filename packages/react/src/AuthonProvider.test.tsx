// @vitest-environment jsdom

import { StrictMode, useContext } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';
import { Authon } from '@authon/js';

vi.mock('@authon/js', async () => vi.importActual(new URL('../../js/src/index.ts', import.meta.url).pathname));

import { AuthonContext, AuthonProvider } from './AuthonProvider';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function jwt(expiresInSeconds: number): string {
  const encode = (value: unknown) => btoa(JSON.stringify(value))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.sig`;
}

function user(): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function tokens(expiresInSeconds: number): AuthTokens {
  return { accessToken: jwt(expiresInSeconds), refreshToken: 'refresh_1', expiresIn: expiresInSeconds, user: user() };
}

function Status() {
  const context = useContext(AuthonContext)!;
  return <div data-testid="status">{context.isLoading ? 'loading' : context.user?.id ?? 'signed-out'}</div>;
}

function ProfileStatus() {
  const context = useContext(AuthonContext)!;
  return (
    <button
      data-testid="profile"
      onClick={() => { void context.client?.updateProfile({ displayName: 'Updated' }); }}
    >
      {context.user?.displayName ?? 'none'}
    </button>
  );
}

describe('AuthonProvider session lifecycle', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('stays loading while an expired restored session is being refreshed', async () => {
    const seed = new Authon('pk_live_provider-ready');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(tokens(-10)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    await seed.signInWithEmail('person@example.com', 'secret');
    seed.destroy();
    let resolveRefresh!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise((resolve) => { resolveRefresh = resolve; }));

    render(<AuthonProvider publishableKey="pk_live_provider-ready"><Status /></AuthonProvider>);

    expect(screen.getByTestId('status').textContent).toBe('loading');
    await act(async () => {
      resolveRefresh(new Response(JSON.stringify(tokens(3600)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('user_1'));
  });

  it('preserves a valid stored session through Strict Mode cleanup and unmount', async () => {
    const seed = new Authon('pk_live_provider-strict');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(tokens(3600)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    await seed.signInWithEmail('person@example.com', 'secret');
    seed.destroy();

    const view = render(
      <StrictMode>
        <AuthonProvider publishableKey="pk_live_provider-strict"><Status /></AuthonProvider>
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('user_1'));
    view.unmount();

    const restored = new Authon('pk_live_provider-strict');
    await (restored as Authon & { waitUntilReady(): Promise<void> }).waitUntilReady();
    expect(restored.getUser()?.id).toBe('user_1');
  });

  it('leaves loading after an initial transient failure and updates on the scheduled retry', async () => {
    vi.useFakeTimers();
    const seed = new Authon('pk_live_provider-retry');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(tokens(-10)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    await seed.signInWithEmail('person@example.com', 'secret');
    seed.destroy();
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 500 }));

    render(<AuthonProvider publishableKey="pk_live_provider-retry"><Status /></AuthonProvider>);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId('status').textContent).toBe('signed-out');

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(tokens(3600)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    await act(async () => { await vi.advanceTimersByTimeAsync(3_000); });
    expect(screen.getByTestId('status').textContent).toBe('user_1');
    vi.useRealTimers();
  });

  it('reflects updateProfile changes from the sessionChanged subscription', async () => {
    const seed = new Authon('pk_live_provider-profile');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(tokens(3600)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    await seed.signInWithEmail('person@example.com', 'secret');
    seed.destroy();
    render(<AuthonProvider publishableKey="pk_live_provider-profile"><ProfileStatus /></AuthonProvider>);
    await waitFor(() => expect(screen.getByTestId('profile').textContent).toBe('Person'));
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ...user(),
      displayName: 'Updated',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    fireEvent.click(screen.getByTestId('profile'));

    await waitFor(() => expect(screen.getByTestId('profile').textContent).toBe('Updated'));
  });
});
