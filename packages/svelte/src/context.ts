import { setContext, getContext } from 'svelte';
import type { AuthonConfig } from '@authon/js';
import { createAuthonStore, type AuthonStore } from './store';

const AUTHON_CONTEXT_KEY = Symbol('authon');

/**
 * Initialize Authon in a Svelte component tree.
 * Call this in your root layout or top-level component.
 *
 * Usage in +layout.svelte:
 * ```svelte
 * <script>
 *   import { initAuthon } from '@authon/svelte'
 *   const authon = initAuthon('pk_live_...')
 * </script>
 * ```
 */
export function initAuthon(
  publishableKey: string,
  config?: Omit<AuthonConfig, 'mode'>,
): AuthonStore {
  const store = createAuthonStore(publishableKey, config);
  setContext(AUTHON_CONTEXT_KEY, store);
  return store;
}

/**
 * Get the Authon store from Svelte context.
 * Must be called within a component tree where `initAuthon` was called.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { getAuthon } from '@authon/svelte'
 *   const { user, isSignedIn, signOut } = getAuthon()
 * </script>
 * ```
 */
export function getAuthon(): AuthonStore {
  const store = getContext<AuthonStore | undefined>(AUTHON_CONTEXT_KEY);
  if (!store) {
    throw new Error('getAuthon() must be called within a component tree where initAuthon() was called.');
  }
  return store;
}
