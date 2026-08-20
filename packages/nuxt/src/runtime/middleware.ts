import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from 'nuxt/app';
import type { AuthonNuxtState } from './state';

export default defineNuxtRouteMiddleware(async (to) => {
  const authon = useNuxtApp().$authon as AuthonNuxtState;
  if (authon.isLoading) {
    if (!authon.client) return undefined;
    await authon.client.waitUntilReady();
    await Promise.resolve();
  }

  if (authon.isSignedIn || to.path === '/sign-in') return undefined;

  return navigateTo({
    path: '/sign-in',
    query: { redirect: to.fullPath },
  });
});
