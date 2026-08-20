import { useNuxtApp } from 'nuxt/app';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { AuthonUser } from '@authon/shared';
import type { AuthonNuxtState } from './state';

export function useAuthon(): AuthonNuxtState {
  const authon = useNuxtApp().$authon as AuthonNuxtState | undefined;
  if (!authon) {
    throw new Error(
      '@authon/nuxt runtime plugin is not installed. Add @authon/nuxt to modules in nuxt.config.',
    );
  }
  return authon;
}

export function useUser(): {
  user: ComputedRef<AuthonUser | null>;
  isLoading: ComputedRef<boolean>;
  isSignedIn: ComputedRef<boolean>;
} {
  const authon = useAuthon();
  return {
    user: computed(() => authon.user),
    isLoading: computed(() => authon.isLoading),
    isSignedIn: computed(() => authon.isSignedIn),
  };
}
