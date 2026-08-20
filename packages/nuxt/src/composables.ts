import { computed, inject } from 'vue';
import type { ComputedRef, InjectionKey } from 'vue';
import type { AuthonUser } from '@authon/shared';
import type { AuthonNuxtState } from './runtime/state';

export const AUTHON_NUXT_KEY = Symbol.for('@authon/nuxt') as InjectionKey<AuthonNuxtState>;

/** @deprecated In Nuxt applications, import from `@authon/nuxt/composables` or use auto-imports. */
export function useAuthon(): AuthonNuxtState {
  const authon = inject(AUTHON_NUXT_KEY, undefined);
  if (!authon) {
    throw new Error(
      '@authon/nuxt runtime plugin is not installed. Add @authon/nuxt to modules in nuxt.config.',
    );
  }
  return authon;
}

/** @deprecated In Nuxt applications, import from `@authon/nuxt/composables` or use auto-imports. */
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
