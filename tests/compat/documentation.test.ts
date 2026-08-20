import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const documentationRoots = [
  'README.md',
  'README.ko.md',
  'AGENTS.md',
  'CLAUDE.md',
  'llms.txt',
  'llms-full.txt',
  'packages',
  'skills',
  'templates',
  'examples',
];
const includedExtensions = new Set(['.md', '.txt', '.ts', '.tsx', '.vue', '.svelte', '.yml']);
const includedNames = new Set(['.env.example', 'Dockerfile']);

async function collectFiles(path: string): Promise<string[]> {
  const absolute = join(root, path);
  const entries = await readdir(absolute, { withFileTypes: true }).catch(() => null);
  if (!entries) return [path];

  const files: string[] = [];
  for (const entry of entries) {
    if (['node_modules', 'dist', '.nuxt', '.next', '.svelte-kit'].includes(entry.name)) continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(child));
    else if (includedExtensions.has(extname(entry.name)) || includedNames.has(entry.name)) files.push(child);
  }
  return files;
}

describe('documentation contracts', () => {
  it('contains no stale middleware names or publishable-key environment variables', async () => {
    const files = (await Promise.all(documentationRoots.map(collectFiles))).flat();
    const stale = [
      /\bauthMiddleware\b/,
      /NEXT_PUBLIC_AUTHON_KEY/,
      /NUXT_PUBLIC_AUTHON_KEY/,
      /VITE_AUTHON_KEY/,
      /AUTHON_PROJECT_ID/,
      /AUTHON_API_KEY/,
      /your-project-id/,
      /your-api-key/,
      /authonProjectId/,
    ];
    const violations: string[] = [];

    for (const file of files) {
      const content = await readFile(join(root, file), 'utf8');
      for (const pattern of stale) {
        if (pattern.test(content)) violations.push(`${relative(root, join(root, file))}: ${pattern}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('documents the current Next.js security and verification contract', async () => {
    const readmes = `${await readFile(join(root, 'README.md'), 'utf8')}\n${await readFile(join(root, 'packages/nextjs/README.md'), 'utf8')}`;

    expect(readmes).toContain('authonMiddleware');
    expect(readmes).toMatch(/JavaScript-readable/i);
    expect(readmes).toMatch(/not HttpOnly/i);
    expect(readmes).toMatch(/XSS/i);
    expect(readmes).toMatch(/verifyToken.*opt-in|opt-in.*verifyToken/is);
    expect(readmes).toMatch(/fail-closed/i);
    expect(readmes).toMatch(/protectApiRoutes.*opt-in|opt-in.*protectApiRoutes/is);
    expect(readmes).toMatch(/currentUser/);
    expect(readmes).toMatch(/auth\(\)/);
  });

  it('documents and scaffolds the Nuxt module while deprecating the manual plugin', async () => {
    const nuxtReadme = await readFile(join(root, 'packages/nuxt/README.md'), 'utf8');
    const nuxtTemplate = await readFile(
      join(root, 'packages/create-authon-app/src/templates/nuxt/index.ts'),
      'utf8',
    );

    expect(nuxtReadme).toContain("modules: ['@authon/nuxt']");
    expect(nuxtReadme).toContain('@authon/nuxt/composables');
    expect(nuxtReadme).toMatch(/createAuthonPlugin.*deprecated|deprecated.*createAuthonPlugin/is);
    expect(nuxtTemplate).toContain("modules: ['@authon/nuxt']");
    expect(nuxtTemplate).toContain('@authon/nuxt/composables');
    expect(nuxtTemplate).not.toContain('createAuthonPlugin');
  });

  it('scaffolds framework-conventional public environment variables', async () => {
    const shared = await readFile(join(root, 'packages/create-authon-app/src/templates/shared.ts'), 'utf8');
    const svelte = await readFile(join(root, 'packages/create-authon-app/src/templates/svelte/index.ts'), 'utf8');

    expect(shared).toContain('NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY');
    expect(shared).toContain('VITE_AUTHON_PUBLISHABLE_KEY');
    expect(shared).toContain('NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY');
    expect(shared).toContain('PUBLIC_AUTHON_PUBLISHABLE_KEY');
    expect(svelte).toContain('PUBLIC_AUTHON_PUBLISHABLE_KEY');
    expect(svelte).not.toContain('VITE_AUTHON_PUBLISHABLE_KEY');
  });
});
