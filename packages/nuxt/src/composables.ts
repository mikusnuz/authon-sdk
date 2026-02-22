import type { AuthupUser } from '@authup/shared';
import type { AuthupPluginState } from './plugin';

/**
 * Access the Authup client and auth state.
 *
 * Requires the Authup plugin to be installed via `createAuthupPlugin`.
 *
 * Usage:
 * ```ts
 * const { isSignedIn, user, client } = useAuthup()
 * await client.openSignIn()
 * ```
 */
export function useAuthup(): AuthupPluginState {
  // In a real Nuxt app, users access this via useNuxtApp().$authup
  // This composable is a convenience wrapper that users should adapt
  // to their own plugin setup.
  throw new Error(
    'useAuthup() must be used within a Nuxt app with the Authup plugin installed. ' +
    'Access the client via useNuxtApp().$authup instead.',
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
export function useUser(): { user: AuthupUser | null; isLoading: boolean } {
  const { user, isLoading } = useAuthup();
  return { user, isLoading };
}
