import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  delete globalThis.__AUTHON_TEST_RUNTIME_CONFIG__;
});

describe('Nuxt runtime plugin', () => {
  it('injects a stable Authon state during SSR', async () => {
    globalThis.__AUTHON_TEST_RUNTIME_CONFIG__ = {
      public: {
        authon: {
          publishableKey: 'pk_live_plugin-ssr',
          config: { theme: 'dark' },
        },
      },
    };
    const onUnmount = vi.fn();
    const pluginModule = await import('./plugin').catch(() => null);
    expect(pluginModule).not.toBeNull();

    const plugin = pluginModule!.default as unknown as (app: unknown) => {
      provide: { authon: Record<string, unknown> };
    };
    const result = plugin({ vueApp: { onUnmount } });

    expect(result.provide.authon).toMatchObject({
      client: null,
      user: null,
      isSignedIn: false,
      isLoading: true,
    });
    expect(onUnmount).toHaveBeenCalledOnce();
  });

  it('fails clearly when runtime config is absent', async () => {
    globalThis.__AUTHON_TEST_RUNTIME_CONFIG__ = { public: {} };
    const pluginModule = await import('./plugin').catch(() => null);
    expect(pluginModule).not.toBeNull();

    const plugin = pluginModule!.default as unknown as (app: unknown) => unknown;
    expect(() => plugin({ vueApp: { onUnmount: vi.fn() } }))
      .toThrow('@authon/nuxt runtime config is missing publishableKey');
  });
});
