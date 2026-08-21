import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ProjectOptions } from '../prompts.js';
import { generateNextjsApp } from './nextjs-app/index.js';
import { generateNextjsPages } from './nextjs-pages/index.js';
import { generateNuxt } from './nuxt/index.js';
import { generateReactVite } from './react-vite/index.js';
import { generateSvelte } from './svelte/index.js';
import { generateVueVite } from './vue-vite/index.js';

const features: ProjectOptions['features'] = {
  oauth: true,
  oauthProviders: ['google', 'github'],
  emailPassword: true,
  mfa: false,
  passkeys: false,
};

const templates = [
  ['nextjs-app', generateNextjsApp, '@authon/nextjs', 'nextjs'],
  ['nextjs-pages', generateNextjsPages, '@authon/nextjs', 'nextjs'],
  ['react-vite', generateReactVite, '@authon/react', 'react'],
  ['vue-vite', generateVueVite, '@authon/vue', 'vue'],
  ['nuxt', generateNuxt, '@authon/nuxt', 'nuxt'],
  ['svelte', generateSvelte, '@authon/svelte', 'svelte'],
] as const;

describe('create-app SDK dependency versions', () => {
  it.each(templates)(
    '%s installs its current SDK release line',
    async (template, generate, dependency, packageDirectory) => {
      const options = { template, projectName: 'version-contract', features } as ProjectOptions;
      const packageFile = generate(options).find((entry) => entry.path === 'package.json');
      if (!packageFile) throw new Error(`${template} did not generate package.json`);

      const generated = JSON.parse(packageFile.content) as {
        dependencies: Record<string, string>;
      };
      const published = JSON.parse(
        await readFile(
          join(process.cwd(), 'packages', packageDirectory, 'package.json'),
          'utf8',
        ),
      ) as { version: string };

      expect(generated.dependencies[dependency]).toBe(`^${published.version}`);
    },
  );
});
