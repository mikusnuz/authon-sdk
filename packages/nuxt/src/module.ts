import {
  addImports,
  addPlugin,
  addRouteMiddleware,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit';
import type { AuthonConfig } from '@authon/js';

export interface AuthonModuleOptions {
  publishableKey?: string;
  config?: Omit<AuthonConfig, 'mode'>;
  globalMiddleware?: boolean;
}

function validatePublishableKey(publishableKey: string): void {
  if (!publishableKey) {
    throw new Error('@authon/nuxt requires authon.publishableKey');
  }

  const prefix = publishableKey.startsWith('pk_live_')
    ? 'pk_live_'
    : publishableKey.startsWith('pk_test_')
      ? 'pk_test_'
      : null;

  if (!prefix) {
    throw new Error('@authon/nuxt publishableKey must start with pk_live_ or pk_test_');
  }
  if (publishableKey.length === prefix.length) {
    throw new Error(`@authon/nuxt publishableKey must include a key value after ${prefix}`);
  }
}

export const authonModule = defineNuxtModule<AuthonModuleOptions>({
  meta: {
    name: '@authon/nuxt',
    configKey: 'authon',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    publishableKey: '',
    config: {},
    globalMiddleware: false,
  },
  setup(options, nuxt) {
    const existing = nuxt.options.runtimeConfig.public.authon as {
      publishableKey?: string;
      config?: Omit<AuthonConfig, 'mode'>;
    } | undefined;
    const publishableKey = options.publishableKey || existing?.publishableKey || '';
    validatePublishableKey(publishableKey);

    const resolver = createResolver(
      typeof __filename === 'string' ? __filename : import.meta.url,
    );
    nuxt.options.runtimeConfig.public.authon = {
      publishableKey,
      config: Object.keys(options.config ?? {}).length > 0
        ? options.config
        : existing?.config ?? {},
    };

    addPlugin(resolver.resolve('./runtime/plugin'));
    addImports([
      { name: 'useAuthon', as: 'useAuthon', from: resolver.resolve('./runtime/composables') },
      { name: 'useUser', as: 'useUser', from: resolver.resolve('./runtime/composables') },
    ]);

    if (options.globalMiddleware) {
      addRouteMiddleware({
        name: 'authon',
        path: resolver.resolve('./runtime/middleware'),
        global: true,
      });
    }
  },
});

export default authonModule;
