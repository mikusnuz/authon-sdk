import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const exampleDirectories = ['angular', 'nextjs', 'nuxt', 'react', 'svelte', 'vanilla-js', 'vue'];

describe('workspace build foundation', () => {
  it('prepares the Nuxt example only after the local module can be built', async () => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'examples/nuxt/package.json'), 'utf8'),
    ) as { scripts?: Record<string, string> };

    expect(manifest.scripts?.postinstall).toBeUndefined();
    expect(manifest.scripts?.predev).toContain('pnpm --filter @authon/nuxt build');
    expect(manifest.scripts?.prebuild).toContain('pnpm --filter @authon/nuxt build');
  });

  it('builds packages before examples', async () => {
    const rootManifest = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(rootManifest.scripts['build:packages']).toBe("pnpm --filter './packages/*' build");
    expect(rootManifest.scripts['build:examples']).toBe("pnpm --filter './examples/*' build");
    expect(rootManifest.scripts.build).toBe('pnpm build:packages && pnpm build:examples');
  });

  it.each(exampleDirectories)('%s uses workspace links for internal packages', async (directory) => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'examples', directory, 'package.json'), 'utf8'),
    ) as { dependencies?: Record<string, string> };
    const internalDependencies = Object.entries(manifest.dependencies ?? {}).filter(([name]) =>
      name.startsWith('@authon/'),
    );

    expect(internalDependencies.length).toBeGreaterThan(0);
    expect(internalDependencies.every(([, version]) => version === 'workspace:*')).toBe(true);
  });

  it('injects the Nuxt example key in CI instead of baking one into source', async () => {
    const workflow = await readFile(join(process.cwd(), '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toMatch(
      /- name: Build examples[\s\S]*?env:[\s\S]*?NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY:/,
    );
  });

  it('pins Next.js output tracing to the workspace root', async () => {
    const config = await readFile(join(process.cwd(), 'examples/nextjs/next.config.ts'), 'utf8');

    expect(config).toContain('outputFileTracingRoot');
    expect(config).toContain("path.join(process.cwd(), '../..')");
  });
});
