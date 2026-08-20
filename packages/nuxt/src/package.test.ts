import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('@authon/nuxt package formats', () => {
  it('publishes matching ESM and CommonJS root entries', () => {
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    const tsupConfig = readFileSync(new URL('../tsup.config.ts', import.meta.url), 'utf8');

    expect(packageJson.main).toBe('./dist/index.cjs');
    expect(packageJson.exports['.'].require).toBe('./dist/index.cjs');
    expect(packageJson.exports['./composables']).toEqual({
      types: './dist/runtime/composables.d.ts',
      import: './dist/runtime/composables.js',
      require: './dist/runtime/composables.cjs',
    });
    expect(tsupConfig).toContain("format: ['esm', 'cjs']");
  });

  it('binds supported runtime composables to Nuxt instead of a test global', () => {
    const runtimeSource = readFileSync(new URL('./runtime/composables.ts', import.meta.url), 'utf8');
    const legacySource = readFileSync(new URL('./composables.ts', import.meta.url), 'utf8');

    expect(runtimeSource).toContain("import { useNuxtApp } from 'nuxt/app'");
    expect(runtimeSource).not.toContain("from '../composables'");
    expect(legacySource).toContain('@deprecated');
  });
});
