import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@authon/js': fileURLToPath(new URL('./packages/js/src/index.ts', import.meta.url)),
      '@authon/shared': fileURLToPath(new URL('./packages/shared/src/index.ts', import.meta.url)),
      '#app': fileURLToPath(new URL('./tests/stubs/nuxt-app.ts', import.meta.url)),
      'nuxt/app': fileURLToPath(new URL('./tests/stubs/nuxt-app.ts', import.meta.url)),
      'react-native': fileURLToPath(new URL('./tests/stubs/react-native.ts', import.meta.url)),
      'react-native-svg': fileURLToPath(new URL('./tests/stubs/react-native-svg.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['packages/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
  },
});
