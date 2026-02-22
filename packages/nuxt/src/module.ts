import type { AuthonConfig } from '@authon/js';

export interface AuthonModuleOptions {
  publishableKey: string;
  config?: Omit<AuthonConfig, 'mode'>;
  globalMiddleware?: boolean;
}

/**
 * Nuxt 3 module definition for Authon.
 *
 * Usage in nuxt.config.ts:
 * ```ts
 * export default defineNuxtConfig({
 *   modules: ['@authon/nuxt'],
 *   authon: {
 *     publishableKey: 'pk_live_...',
 *     globalMiddleware: false,
 *   }
 * })
 * ```
 *
 * Since tsup can't process Nuxt module macros (defineNuxtModule, etc.),
 * this module exports a setup function that users call in their Nuxt plugin.
 */
export function authonModule(options: AuthonModuleOptions) {
  return {
    name: '@authon/nuxt',
    options,
  };
}
