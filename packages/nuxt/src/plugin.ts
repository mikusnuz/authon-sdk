import { Authup } from '@authup/js';
import type { AuthupConfig } from '@authup/js';
import type { AuthupUser } from '@authup/shared';

export interface AuthupPluginState {
  client: Authup;
  user: AuthupUser | null;
  isSignedIn: boolean;
  isLoading: boolean;
}

/**
 * Creates an Authup client instance for use as a Nuxt plugin.
 *
 * Usage in plugins/authup.client.ts:
 * ```ts
 * import { createAuthupPlugin } from '@authup/nuxt'
 *
 * export default defineNuxtPlugin(() => {
 *   const authup = createAuthupPlugin('pk_live_...', { theme: 'auto' })
 *   return { provide: { authup } }
 * })
 * ```
 */
export function createAuthupPlugin(
  publishableKey: string,
  config?: Omit<AuthupConfig, 'mode'>,
): AuthupPluginState {
  const client = new Authup(publishableKey, config);
  const state: AuthupPluginState = {
    client,
    user: null,
    isSignedIn: false,
    isLoading: true,
  };

  client.on('signedIn', (user) => {
    state.user = user as AuthupUser;
    state.isSignedIn = true;
    state.isLoading = false;
  });

  client.on('signedOut', () => {
    state.user = null;
    state.isSignedIn = false;
  });

  client.on('error', () => {
    state.isLoading = false;
  });

  state.isLoading = false;

  return state;
}
