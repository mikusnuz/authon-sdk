import type { App } from 'vue';
import { reactive } from 'vue';
import { Authup } from '@authup/js';
import type { AuthupConfig } from '@authup/js';
import type { AuthupUser } from '@authup/shared';

export const AUTHUP_KEY = Symbol('authup');

export interface AuthupState {
  isSignedIn: boolean;
  isLoading: boolean;
  user: AuthupUser | null;
  client: Authup | null;
}

export interface AuthupPluginOptions {
  publishableKey: string;
  config?: AuthupConfig;
}

export function createAuthup(options: AuthupPluginOptions) {
  const state = reactive<AuthupState>({
    isSignedIn: false,
    isLoading: true,
    user: null,
    client: null,
  });

  return {
    install(app: App) {
      const client = new Authup(options.publishableKey, options.config);
      state.client = client as unknown as Authup;

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

      app.provide(AUTHUP_KEY, state);

      app.config.globalProperties.$authup = state;
    },
  };
}
