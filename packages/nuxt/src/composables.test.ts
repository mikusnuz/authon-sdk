import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isRef, shallowReactive } from 'vue';
import type { AuthonNuxtState } from './runtime/state';
import { useAuthon, useUser } from './composables';

beforeEach(() => {
  vi.stubGlobal('useNuxtApp', () => globalThis.__AUTHON_TEST_NUXT_APP__ ?? {});
});

afterEach(() => {
  delete globalThis.__AUTHON_TEST_NUXT_APP__;
  vi.unstubAllGlobals();
});

describe('Nuxt composables', () => {
  it('returns the injected SSR-safe runtime state', () => {
    const state = shallowReactive<AuthonNuxtState>({
      client: null,
      user: null,
      isSignedIn: false,
      isLoading: true,
    });
    globalThis.__AUTHON_TEST_NUXT_APP__ = { $authon: state };

    expect(useAuthon()).toBe(state);
  });

  it('exposes reactive user state', () => {
    const state = shallowReactive<AuthonNuxtState>({
      client: null,
      user: null,
      isSignedIn: false,
      isLoading: true,
    });
    globalThis.__AUTHON_TEST_NUXT_APP__ = { $authon: state };

    const result = useUser();
    expect(isRef(result.user)).toBe(true);
    expect(isRef(result.isLoading)).toBe(true);
    expect(isRef(result.isSignedIn)).toBe(true);
    expect(result.isLoading.value).toBe(true);

    state.isLoading = false;
    state.isSignedIn = true;
    expect(result.isLoading.value).toBe(false);
    expect(result.isSignedIn.value).toBe(true);
  });

  it('throws only when the runtime plugin is absent', () => {
    globalThis.__AUTHON_TEST_NUXT_APP__ = {};

    expect(() => useAuthon()).toThrow(
      '@authon/nuxt runtime plugin is not installed. Add @authon/nuxt to modules in nuxt.config.',
    );
  });

  it('uses the exact same composables for public imports and module auto-imports', async () => {
    const runtimeComposables = await import('./runtime/composables');

    expect(runtimeComposables.useAuthon).toBe(useAuthon);
    expect(runtimeComposables.useUser).toBe(useUser);
  });
});
