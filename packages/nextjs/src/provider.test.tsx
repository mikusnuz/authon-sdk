// @vitest-environment jsdom

import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';

vi.mock('@authon/react', async () => vi.importActual(new URL('../../react/src/index.ts', import.meta.url).pathname));

import { useAuthon } from '@authon/react';
import { AuthonProvider } from './provider';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function jwt(expiresInSeconds: number, marker: string): string {
  const encode = (value: unknown) => btoa(JSON.stringify(value))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds, marker })}.sig`;
}

function user(): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function tokens(expiresInSeconds: number, marker: string): AuthTokens {
  return {
    accessToken: jwt(expiresInSeconds, marker),
    refreshToken: `refresh_${marker}`,
    expiresIn: expiresInSeconds,
    user: user(),
  };
}

function stableDigest(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function seedSession(publishableKey: string, value: AuthTokens): void {
  const apiUrl = 'https://api.authon.dev';
  const storageKey = `authon_session_v2_${encodeURIComponent(apiUrl)}_${stableDigest(publishableKey)}`;
  localStorage.setItem(storageKey, JSON.stringify({
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    user: value.user,
  }));
}

function SignOutButton() {
  const { signOut } = useAuthon();
  return <button onClick={() => { void signOut(); }}>Sign out</button>;
}

describe('Next.js AuthonProvider compatibility cookie bridge', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn());
    document.cookie = 'authon-token=; Path=/; Max-Age=0';
    document.cookie = 'project-token=; Path=/; Max-Age=0';
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('syncs an initially restored valid token using a configurable cookie name', async () => {
    const initial = tokens(3_600, 'initial');
    await seedSession('pk_live_next-initial', initial);

    render(
      <AuthonProvider publishableKey="pk_live_next-initial" cookieName="project-token">
        <div>child</div>
      </AuthonProvider>,
    );

    await waitFor(() => expect(document.cookie).toContain(`project-token=${initial.accessToken}`));
    expect(document.cookie).not.toContain('authon-token=');
  });

  it('does not expose an expired restored token while refresh is pending', async () => {
    const expired = tokens(-10, 'expired');
    await seedSession('pk_live_next-expired', expired);
    document.cookie = `authon-token=${expired.accessToken}; Path=/; SameSite=Lax`;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {}));

    render(<AuthonProvider publishableKey="pk_live_next-expired"><div>child</div></AuthonProvider>);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    expect(document.cookie).not.toContain('authon-token=');
  });

  it('updates the cookie when the session refreshes', async () => {
    vi.useFakeTimers();
    const initial = tokens(61, 'initial');
    const refreshed = tokens(3_600, 'refreshed');
    await seedSession('pk_live_next-refresh', initial);

    render(<AuthonProvider publishableKey="pk_live_next-refresh"><div>child</div></AuthonProvider>);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(document.cookie).toContain(`authon-token=${initial.accessToken}`);

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(refreshed), {
      headers: { 'Content-Type': 'application/json' },
    }));
    await act(async () => { await vi.advanceTimersByTimeAsync(1_000); });

    expect(document.cookie).toContain(`authon-token=${refreshed.accessToken}`);
    expect(document.cookie).not.toContain(initial.accessToken);
  });

  it('clears the cookie on sign-out', async () => {
    const initial = tokens(3_600, 'initial');
    await seedSession('pk_live_next-signout', initial);
    render(
      <AuthonProvider publishableKey="pk_live_next-signout">
        <SignOutButton />
      </AuthonProvider>,
    );
    await waitFor(() => expect(document.cookie).toContain('authon-token='));

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(document.cookie).not.toContain('authon-token='));
  });

  it('does not duplicate compatibility cookie writes under Strict Mode', async () => {
    const initial = tokens(3_600, 'initial');
    await seedSession('pk_live_next-strict', initial);
    const cookieSetter = vi.spyOn(document, 'cookie', 'set');

    render(
      <StrictMode>
        <AuthonProvider publishableKey="pk_live_next-strict"><div>child</div></AuthonProvider>
      </StrictMode>,
    );
    await waitFor(() => expect(document.cookie).toContain('authon-token='));

    expect(cookieSetter).toHaveBeenCalledTimes(1);
  });
});
