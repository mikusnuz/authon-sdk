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
});
