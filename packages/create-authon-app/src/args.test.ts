import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readPackageVersion } from './args.js';

describe('create-app CLI metadata', () => {
  it('reads the version users install from the package manifest', async () => {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), 'packages/create-authon-app/package.json'), 'utf8'),
    ) as { version: string };

    expect(readPackageVersion()).toBe(manifest.version);
  });
});
