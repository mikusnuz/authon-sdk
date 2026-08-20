type TestNuxtApp = Record<string, unknown>;

declare global {
  var __AUTHON_TEST_NUXT_APP__: TestNuxtApp | undefined;
  var __AUTHON_TEST_RUNTIME_CONFIG__: Record<string, unknown> | undefined;
}

export function useNuxtApp(): TestNuxtApp {
  return globalThis.__AUTHON_TEST_NUXT_APP__ ?? {};
}

export function useRuntimeConfig(): Record<string, unknown> {
  return globalThis.__AUTHON_TEST_RUNTIME_CONFIG__ ?? { public: {} };
}

export function defineNuxtPlugin<T>(plugin: T): T {
  return plugin;
}

export function defineNuxtRouteMiddleware<T>(middleware: T): T {
  return middleware;
}

export function navigateTo(path: unknown): unknown {
  return path;
}
