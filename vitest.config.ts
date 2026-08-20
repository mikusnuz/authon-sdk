import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
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
