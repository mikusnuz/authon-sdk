import { writable, derived, type Readable } from 'svelte/store';
import { Authup } from '@authup/js';
import type { AuthupConfig } from '@authup/js';
import type { AuthupUser } from '@authup/shared';

export interface AuthupStore {
  user: Readable<AuthupUser | null>;
  isSignedIn: Readable<boolean>;
  isLoading: Readable<boolean>;
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
  destroy: () => void;
  client: Authup;
}

/**
 * Creates an Authup store with reactive Svelte stores.
 *
 * Usage:
 * ```ts
 * import { createAuthupStore } from '@authup/svelte'
 *
 * const authup = createAuthupStore('pk_live_...')
 *
 * // In your component:
 * $: user = $authup.user
 * $: isSignedIn = $authup.isSignedIn
 * ```
 */
export function createAuthupStore(
  publishableKey: string,
  config?: Omit<AuthupConfig, 'mode'>,
): AuthupStore {
  const client = new Authup(publishableKey, config);
  const userStore = writable<AuthupUser | null>(null);
  const isLoadingStore = writable(true);

  const isSignedIn = derived(userStore, ($user) => $user !== null);

  client.on('signedIn', (user) => {
    userStore.set(user as AuthupUser);
    isLoadingStore.set(false);
  });

  client.on('signedOut', () => {
    userStore.set(null);
  });

  client.on('error', () => {
    isLoadingStore.set(false);
  });

  isLoadingStore.set(false);

  return {
    user: { subscribe: userStore.subscribe },
    isSignedIn,
    isLoading: { subscribe: isLoadingStore.subscribe },
    signOut: async () => {
      await client.signOut();
      userStore.set(null);
    },
    openSignIn: () => client.openSignIn(),
    openSignUp: () => client.openSignUp(),
    getToken: () => client.getToken(),
    destroy: () => client.destroy(),
    client,
  };
}
