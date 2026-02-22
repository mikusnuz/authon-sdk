import { setContext, getContext } from 'svelte';
import type { AuthupConfig } from '@authup/js';
import { createAuthupStore, type AuthupStore } from './store';

const AUTHUP_CONTEXT_KEY = Symbol('authup');

/**
 * Initialize Authup in a Svelte component tree.
 * Call this in your root layout or top-level component.
 *
 * Usage in +layout.svelte:
 * ```svelte
 * <script>
 *   import { initAuthup } from '@authup/svelte'
 *   const authup = initAuthup('pk_live_...')
 * </script>
 * ```
 */
export function initAuthup(
  publishableKey: string,
  config?: Omit<AuthupConfig, 'mode'>,
): AuthupStore {
  const store = createAuthupStore(publishableKey, config);
  setContext(AUTHUP_CONTEXT_KEY, store);
  return store;
}

/**
 * Get the Authup store from Svelte context.
 * Must be called within a component tree where `initAuthup` was called.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { getAuthup } from '@authup/svelte'
 *   const { user, isSignedIn, signOut } = getAuthup()
 * </script>
 * ```
 */
export function getAuthup(): AuthupStore {
  const store = getContext<AuthupStore | undefined>(AUTHUP_CONTEXT_KEY);
  if (!store) {
    throw new Error('getAuthup() must be called within a component tree where initAuthup() was called.');
  }
  return store;
}
