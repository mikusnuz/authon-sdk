import type { App } from 'vue';
import { reactive } from 'vue';
import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type { AuthonUser } from '@authon/shared';

export const AUTHON_KEY = Symbol('authon');

export interface AuthonState {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AuthonUser | null;
  client: Authon | null;
}

export interface AuthonPluginOptions {
  publishableKey: string;
  config?: AuthonConfig;
}

export function createAuthon(options: AuthonPluginOptions) {
  const state = reactive<AuthonState>({
    isSignedIn: false,
    isLoading: true,
    user: null,
    client: null,
  });

  return {
    install(app: App) {
      const client = new Authon(options.publishableKey, options.config);
      state.client = client as unknown as Authon;

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

      app.provide(AUTHON_KEY, state);

      app.config.globalProperties.$authon = state;
    },
  };
}
