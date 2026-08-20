import { beforeEach, describe, expect, it, vi } from 'vitest';

const kit = vi.hoisted(() => ({
  addImports: vi.fn(),
  addPlugin: vi.fn(),
  addRouteMiddleware: vi.fn(),
  createResolver: vi.fn(() => ({
    resolve: (path: string) => `/resolved/${path.replace(/^\.\//, '')}`,
  })),
  defineNuxtModule: vi.fn((definition) => definition),
}));

vi.mock('@nuxt/kit', () => kit);

import authonModule from './module';

const moduleDefinition = authonModule as unknown as {
  meta: Record<string, unknown>;
  defaults: Record<string, unknown>;
  setup: (options: {
    publishableKey: string;
    config: Record<string, unknown>;
    globalMiddleware: boolean;
  }, nuxt: {
    options: { runtimeConfig: { public: Record<string, unknown> } };
  }) => void;
};

describe('Authon Nuxt module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('declares Nuxt module metadata and defaults', () => {
    expect(moduleDefinition.meta).toEqual({
      name: '@authon/nuxt',
      configKey: 'authon',
      compatibility: { nuxt: '^3.0.0' },
    });
    expect(moduleDefinition.defaults).toEqual({
      publishableKey: '',
      config: {},
      globalMiddleware: false,
    });
  });

  it('registers its runtime plugin and composables', () => {
    const nuxt = { options: { runtimeConfig: { public: {} as Record<string, unknown> } } };

    moduleDefinition.setup({
      publishableKey: 'pk_live_module-test',
      config: { theme: 'dark' },
      globalMiddleware: false,
    }, nuxt);

    expect(nuxt.options.runtimeConfig.public.authon).toEqual({
      publishableKey: 'pk_live_module-test',
      config: { theme: 'dark' },
    });
    expect(kit.addPlugin).toHaveBeenCalledWith('/resolved/runtime/plugin');
    expect(kit.addImports).toHaveBeenCalledWith([
      { name: 'useAuthon', as: 'useAuthon', from: '/resolved/runtime/composables' },
      { name: 'useUser', as: 'useUser', from: '/resolved/runtime/composables' },
    ]);
    expect(kit.addRouteMiddleware).not.toHaveBeenCalled();
  });

  it('registers global middleware only when opted in', () => {
    const nuxt = { options: { runtimeConfig: { public: {} as Record<string, unknown> } } };

    moduleDefinition.setup({
      publishableKey: 'pk_test_module-test',
      config: {},
      globalMiddleware: true,
    }, nuxt);

    expect(kit.addRouteMiddleware).toHaveBeenCalledWith({
      name: 'authon',
      path: '/resolved/runtime/middleware',
      global: true,
    });
  });

  it('uses a publishable key declared through public runtime config', () => {
    const nuxt = {
      options: {
        runtimeConfig: {
          public: {
            authon: { publishableKey: 'pk_live_runtime-config', config: { locale: 'ko' } },
          } as Record<string, unknown>,
        },
      },
    };

    moduleDefinition.setup({ publishableKey: '', config: {}, globalMiddleware: false }, nuxt);

    expect(nuxt.options.runtimeConfig.public.authon).toEqual({
      publishableKey: 'pk_live_runtime-config',
      config: { locale: 'ko' },
    });
  });

  it.each([
    ['', 'requires authon.publishableKey'],
    ['secret_value', 'must start with pk_live_ or pk_test_'],
    ['pk_live_', 'must include a key value after pk_live_'],
  ])('rejects an invalid publishable key %j', (publishableKey, message) => {
    const nuxt = { options: { runtimeConfig: { public: {} as Record<string, unknown> } } };

    expect(() => moduleDefinition.setup({
      publishableKey,
      config: {},
      globalMiddleware: false,
    }, nuxt)).toThrow(message);
  });
});
