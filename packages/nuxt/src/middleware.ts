import type { AuthupPluginState } from './plugin';

/**
 * Route middleware factory for protecting authenticated routes.
 *
 * Usage in middleware/auth.ts:
 * ```ts
 * import { createAuthMiddleware } from '@authup/nuxt'
 *
 * export default defineNuxtRouteMiddleware((to, from) => {
 *   const { $authup } = useNuxtApp()
 *   return createAuthMiddleware($authup, '/login')(to, from)
 * })
 * ```
 */
export function createAuthMiddleware(
  authup: AuthupPluginState,
  redirectTo = '/sign-in',
) {
  return (
    to: { path: string; fullPath: string },
    _from: { path: string },
  ): { path: string; query: { redirect: string } } | undefined => {
    if (to.path === redirectTo) return undefined;

    if (!authup.isSignedIn) {
      return {
        path: redirectTo,
        query: { redirect: to.fullPath },
      };
    }

    return undefined;
  };
}
