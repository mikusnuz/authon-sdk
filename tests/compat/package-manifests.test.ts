import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageDirectories = [
  'angular',
  'js',
  'nextjs',
  'nuxt',
  'react-native',
  'react',
  'shared',
  'svelte',
  'vue',
] as const;

interface PackageManifest {
  files?: string[];
  main?: string;
  module?: string;
  types?: string;
  exports?: Record<string, unknown>;
}

describe('published package manifests', () => {
  it.each(packageDirectories)('%s publishes its existing dist entry points', async (directory) => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'packages', directory, 'package.json'), 'utf8'),
    ) as PackageManifest;

    expect(manifest.files).toContain('dist');
    expect(manifest.main).toBe('./dist/index.cjs');
    expect(manifest.module).toBe('./dist/index.js');
    expect(manifest.types).toBe('./dist/index.d.ts');
    expect(manifest.exports?.['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
    });
  });

  it('keeps the Next.js server subpath', async () => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'packages/nextjs/package.json'), 'utf8'),
    ) as PackageManifest;

    expect(manifest.exports?.['./server']).toEqual({
      types: './dist/server.d.ts',
      import: './dist/server.js',
      require: './dist/server.cjs',
    });
  });

  it('keeps the Svelte component source subpaths', async () => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'packages/svelte/package.json'), 'utf8'),
    ) as PackageManifest;

    expect(manifest.files).toContain('src/components');
    expect(manifest.exports?.['./SignIn.svelte']).toBe('./src/components/SignIn.svelte');
    expect(manifest.exports?.['./SignUp.svelte']).toBe('./src/components/SignUp.svelte');
  });
});
