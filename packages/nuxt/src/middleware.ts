import type { AuthonPluginState } from './plugin';

/**
 * Route middleware factory for protecting authenticated routes.
 *
 * Usage in middleware/auth.ts:
 * ```ts
 * import { createAuthMiddleware } from '@authon/nuxt'
 *
 * export default defineNuxtRouteMiddleware((to, from) => {
 *   const { $authon } = useNuxtApp()
 *   return createAuthMiddleware($authon, '/login')(to, from)
 * })
 * ```
 */
export function createAuthMiddleware(
  authon: AuthonPluginState,
  redirectTo = '/sign-in',
) {
  return (
    to: { path: string; fullPath: string },
    _from: { path: string },
  ): { path: string; query: { redirect: string } } | undefined => {
    if (to.path === redirectTo) return undefined;

    if (!authon.isSignedIn) {
      return {
        path: redirectTo,
        query: { redirect: to.fullPath },
      };
    }

    return undefined;
  };
}
