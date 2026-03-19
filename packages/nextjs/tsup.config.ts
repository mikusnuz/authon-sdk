import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    sourcemap: true,
    external: ['next', 'react', 'react-dom'],
    banner: {
      js: '"use client";',
    },
  },
  {
    entry: ['src/server.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    sourcemap: true,
    external: ['next', 'react', 'react-dom'],
  },
]);
