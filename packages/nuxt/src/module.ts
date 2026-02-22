import type { AuthupConfig } from '@authup/js';

export interface AuthupModuleOptions {
  publishableKey: string;
  config?: Omit<AuthupConfig, 'mode'>;
  globalMiddleware?: boolean;
}

/**
 * Nuxt 3 module definition for Authup.
 *
 * Usage in nuxt.config.ts:
 * ```ts
 * export default defineNuxtConfig({
 *   modules: ['@authup/nuxt'],
 *   authup: {
 *     publishableKey: 'pk_live_...',
 *     globalMiddleware: false,
 *   }
 * })
 * ```
 *
 * Since tsup can't process Nuxt module macros (defineNuxtModule, etc.),
 * this module exports a setup function that users call in their Nuxt plugin.
 */
export function authupModule(options: AuthupModuleOptions) {
  return {
    name: '@authup/nuxt',
    options,
  };
}
