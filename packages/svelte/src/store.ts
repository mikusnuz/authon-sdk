import { writable, derived, type Readable } from 'svelte/store';
import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type { AuthonUser } from '@authon/shared';

export interface AuthonStore {
  user: Readable<AuthonUser | null>;
  isSignedIn: Readable<boolean>;
  isLoading: Readable<boolean>;
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
  destroy: () => void;
  client: Authon;
}

/**
 * Creates an Authon store with reactive Svelte stores.
 *
 * Usage:
 * ```ts
 * import { createAuthonStore } from '@authon/svelte'
 *
 * const authon = createAuthonStore('pk_live_...')
 *
 * // In your component:
 * $: user = $authon.user
 * $: isSignedIn = $authon.isSignedIn
 * ```
 */
export function createAuthonStore(
  publishableKey: string,
  config?: Omit<AuthonConfig, 'mode'>,
): AuthonStore {
  const client = new Authon(publishableKey, config);
  const userStore = writable<AuthonUser | null>(null);
  const isLoadingStore = writable(true);

  const isSignedIn = derived(userStore, ($user) => $user !== null);

  client.on('signedIn', (user) => {
    userStore.set(user as AuthonUser);
    isLoadingStore.set(false);
  });

  client.on('signedOut', () => {
    userStore.set(null);
  });

  client.on('error', () => {
    isLoadingStore.set(false);
  });

  const existingUser = client.getUser();
  if (existingUser) {
    userStore.set(existingUser);
  }
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
