import type { AuthonUser } from '@authon/shared';
import type { AuthonPluginState } from './plugin';

/**
 * Access the Authon client and auth state.
 *
 * Requires the Authon plugin to be installed via `createAuthonPlugin`.
 *
 * Usage:
 * ```ts
 * const { isSignedIn, user, client } = useAuthon()
 * await client.openSignIn()
 * ```
 */
export function useAuthon(): AuthonPluginState {
  // In a real Nuxt app, users access this via useNuxtApp().$authon
  // This composable is a convenience wrapper that users should adapt
  // to their own plugin setup.
  throw new Error(
    'useAuthon() must be used within a Nuxt app with the Authon plugin installed. ' +
    'Access the client via useNuxtApp().$authon instead.',
  );
}

/**
 * Get the current user and loading state.
 *
 * Usage:
 * ```ts
 * const { user, isLoading } = useUser()
 * ```
 */
export function useUser(): { user: AuthonUser | null; isLoading: boolean } {
  const { user, isLoading } = useAuthon();
  return { user, isLoading };
}
