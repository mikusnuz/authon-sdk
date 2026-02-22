import { inject, computed } from 'vue';
import type { ComputedRef } from 'vue';
import { AUTHON_KEY } from './plugin';
import type { AuthonState } from './plugin';
import type { AuthonUser } from '@authon/shared';

function requireState(): AuthonState {
  const state = inject<AuthonState>(AUTHON_KEY);
  if (!state) {
    throw new Error('useAuthon() must be called inside a component tree with createAuthon() installed');
  }
  return state;
}

export function useAuthon(): AuthonState & {
  signOut: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  getToken: () => string | null;
} {
  const s = requireState();

  async function signOut(): Promise<void> {
    await s.client?.signOut();
    s.user = null;
    s.isSignedIn = false;
  }

  async function openSignIn(): Promise<void> {
    await s.client?.openSignIn();
  }

  async function openSignUp(): Promise<void> {
    await s.client?.openSignUp();
  }

  function getToken(): string | null {
    return s.client?.getToken() ?? null;
  }

  return {
    ...s,
    signOut,
    openSignIn,
    openSignUp,
    getToken,
  };
}

export function useUser(): { user: ComputedRef<AuthonUser | null>; isLoading: ComputedRef<boolean> } {
  const s = requireState();
  return {
    user: computed(() => s.user),
    isLoading: computed(() => s.isLoading),
  };
}
