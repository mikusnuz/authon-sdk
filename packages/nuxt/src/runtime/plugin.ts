import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import type { AuthonConfig } from '@authon/js';
import { AUTHON_NUXT_KEY } from '../composables';
import { createAuthonRuntime } from './state';

interface AuthonPublicRuntimeConfig {
  publishableKey: string;
  config?: Omit<AuthonConfig, 'mode'>;
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const options = runtimeConfig.public.authon as AuthonPublicRuntimeConfig | undefined;
  if (!options || typeof options.publishableKey !== 'string' || !options.publishableKey) {
    throw new Error('@authon/nuxt runtime config is missing publishableKey');
  }

  const runtime = createAuthonRuntime({
    publishableKey: options.publishableKey,
    config: options.config,
    client: import.meta.client === true,
  });

  nuxtApp.vueApp.onUnmount(runtime.dispose);
  nuxtApp.vueApp.provide(AUTHON_NUXT_KEY, runtime.state);
  const hot = (import.meta as ImportMeta & {
    hot?: { dispose: (callback: () => void) => void };
  }).hot;
  hot?.dispose(runtime.dispose);

  return {
    provide: {
      authon: runtime.state,
    },
  };
});
