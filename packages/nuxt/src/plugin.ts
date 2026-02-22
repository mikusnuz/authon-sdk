import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type { AuthonUser } from '@authon/shared';

export interface AuthonPluginState {
  client: Authon;
  user: AuthonUser | null;
  isSignedIn: boolean;
  isLoading: boolean;
}

/**
 * Creates an Authon client instance for use as a Nuxt plugin.
 *
 * Usage in plugins/authon.client.ts:
 * ```ts
 * import { createAuthonPlugin } from '@authon/nuxt'
 *
 * export default defineNuxtPlugin(() => {
 *   const authon = createAuthonPlugin('pk_live_...', { theme: 'auto' })
 *   return { provide: { authon } }
 * })
 * ```
 */
export function createAuthonPlugin(
  publishableKey: string,
  config?: Omit<AuthonConfig, 'mode'>,
): AuthonPluginState {
  const client = new Authon(publishableKey, config);
  const state: AuthonPluginState = {
    client,
    user: null,
    isSignedIn: false,
    isLoading: true,
  };

  client.on('signedIn', (user) => {
    state.user = user as AuthonUser;
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
