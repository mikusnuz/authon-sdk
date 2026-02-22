import { inject, computed } from 'vue';
import type { ComputedRef } from 'vue';
import { AUTHUP_KEY } from './plugin';
import type { AuthupState } from './plugin';
import type { AuthupUser } from '@authup/shared';

function requireState(): AuthupState {
  const state = inject<AuthupState>(AUTHUP_KEY);
  if (!state) {
    throw new Error('useAuthup() must be called inside a component tree with createAuthup() installed');
  }
  return state;
}

export function useAuthup(): AuthupState & {
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

export function useUser(): { user: ComputedRef<AuthupUser | null>; isLoading: ComputedRef<boolean> } {
  const s = requireState();
  return {
    user: computed(() => s.user),
    isLoading: computed(() => s.isLoading),
  };
}
