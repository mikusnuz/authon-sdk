import { afterEach, describe, expect, it } from 'vitest';
import { shallowReactive } from 'vue';
import type { AuthonNuxtState } from './state';

afterEach(() => {
  delete globalThis.__AUTHON_TEST_NUXT_APP__;
});

describe('global Authon middleware', () => {
  it('does not redirect the SSR loading state', async () => {
    globalThis.__AUTHON_TEST_NUXT_APP__ = {
      $authon: shallowReactive<AuthonNuxtState>({
        client: null,
        user: null,
        isSignedIn: false,
        isLoading: true,
      }),
    };
    const middlewareModule = await import('./middleware').catch(() => null);
    expect(middlewareModule).not.toBeNull();

    await expect(middlewareModule!.default(
      { path: '/account', fullPath: '/account' } as never,
      {} as never,
    ))
      .resolves.toBeUndefined();
  });

  it('redirects a ready signed-out client and preserves the destination', async () => {
    globalThis.__AUTHON_TEST_NUXT_APP__ = {
      $authon: shallowReactive<AuthonNuxtState>({
        client: null,
        user: null,
        isSignedIn: false,
        isLoading: false,
      }),
    };
    const middlewareModule = await import('./middleware').catch(() => null);
    expect(middlewareModule).not.toBeNull();

    await expect(middlewareModule!.default(
      { path: '/account', fullPath: '/account?tab=billing' } as never,
      {} as never,
    ))
      .resolves.toEqual({ path: '/sign-in', query: { redirect: '/account?tab=billing' } });
  });
});
