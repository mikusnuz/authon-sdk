import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const exampleDirectories = ['angular', 'nextjs', 'nuxt', 'react', 'svelte', 'vanilla-js', 'vue'];

describe('workspace build foundation', () => {
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
});
