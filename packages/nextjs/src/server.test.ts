import type { AuthonUser } from '@authon/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet } = vi.hoisted(() => ({ cookieGet: vi.fn() }));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));

import { auth, currentUser } from './server';

function user(): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('Next.js server auth helpers', () => {
  beforeEach(() => {
    cookieGet.mockReset();
    cookieGet.mockReturnValue({ value: 'session-token' });
    vi.stubGlobal('fetch', vi.fn());
  });

  function respondWithJson(body: unknown, status = 200): void {
    vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify(body), { status }));
  }

  it('parses a valid wrapped user response without requiring a secret key', async () => {
    respondWithJson({
      valid: true,
      payload: { sub: 'payload-user' },
      user: user(),
    });

    await expect(currentUser()).resolves.toEqual(user());
    await expect(auth()).resolves.toMatchObject({ userId: 'user_1', user: user() });
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({
      headers: expect.not.objectContaining({ 'x-api-key': expect.anything() }),
    });
  });

  it('uses a valid payload subject for auth while currentUser remains null', async () => {
    respondWithJson({
      valid: true,
      payload: { sub: 'payload-user' },
    });

    await expect(currentUser()).resolves.toBeNull();
    const result = await auth();
    expect(result.userId).toBe('payload-user');
    expect(result.user).toBeNull();
    expect(result.getToken()).toBe('session-token');
  });

  it.each([
    { valid: false },
    {},
    { valid: 'true', payload: { sub: 'payload-user' } },
    { valid: true, user: { id: 42 } },
  ])('fails closed for invalid or malformed response %#', async (body) => {
    respondWithJson(body);

    await expect(currentUser()).resolves.toBeNull();
    await expect(auth()).resolves.toMatchObject({ userId: null, user: null });
  });

  it.each([
    () => Promise.reject(new Error('offline')),
    () => Promise.resolve(new Response('bad json')),
    () => Promise.resolve(new Response('{}', { status: 503 })),
  ])('fails closed on network, JSON, or non-2xx failures', async (response) => {
    vi.mocked(fetch).mockImplementation(response as typeof fetch);

    await expect(auth()).resolves.toMatchObject({ userId: null, user: null });
  });

  it('aborts verification after the configured timeout', async () => {
    vi.mocked(fetch).mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));

    const pending = auth({ timeoutMs: 10 });

    await expect(pending).resolves.toMatchObject({ userId: null, user: null });
  });

  it('supports configurable API, key, and cookie names', async () => {
    cookieGet.mockImplementation((name: string) => name === 'project-b-token'
      ? { value: 'project-token' }
      : undefined);
    respondWithJson({ valid: true, payload: { sub: 'user_2' } });

    const result = await auth({
      apiUrl: 'https://auth.example/base/',
      secretKey: 'sk_test',
      cookieName: 'project-b-token',
    });

    expect(result.userId).toBe('user_2');
    expect(fetch).toHaveBeenCalledWith('https://auth.example/base/v1/auth/token/verify', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer project-token',
        'x-api-key': 'sk_test',
      }),
    }));
  });
});
