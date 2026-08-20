import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type { AuthonUser } from '@authon/shared';
import { shallowReactive } from 'vue';

export interface AuthonNuxtState {
  client: Authon | null;
  user: AuthonUser | null;
  isSignedIn: boolean;
  isLoading: boolean;
}

interface CreateAuthonRuntimeOptions {
  publishableKey: string;
  config?: Omit<AuthonConfig, 'mode'>;
  client: boolean;
  createClient?: (publishableKey: string, config?: Omit<AuthonConfig, 'mode'>) => Authon;
}

export interface AuthonNuxtRuntime {
  state: AuthonNuxtState;
  ready: Promise<void>;
  dispose: () => void;
}

export function createAuthonRuntime(options: CreateAuthonRuntimeOptions): AuthonNuxtRuntime {
  const state = shallowReactive<AuthonNuxtState>({
    client: null,
    user: null,
    isSignedIn: false,
    isLoading: true,
  });

  if (!options.client) {
    return {
      state,
      ready: Promise.resolve(),
      dispose() {},
    };
  }

  let active = true;
  const client = options.createClient
    ? options.createClient(options.publishableKey, options.config)
    : new Authon(options.publishableKey, options.config);
  state.client = client;

  const updateUser = (nextUser: AuthonUser | null): void => {
    if (!active) return;
    state.user = nextUser;
    state.isSignedIn = nextUser !== null;
    state.isLoading = false;
  };

  const unsubscribe = client.onSessionChange((change) => {
    updateUser(change.user);
  });

  const ready = client.waitUntilReady()
    .then(() => updateUser(client.getUser()))
    .catch(() => updateUser(null));

  return {
    state,
    ready,
    dispose() {
      if (!active) return;
      active = false;
      unsubscribe();
      client.destroy();
    },
  };
}
