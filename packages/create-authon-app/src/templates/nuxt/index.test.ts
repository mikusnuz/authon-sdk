import { describe, expect, it } from 'vitest';

import type { ProjectOptions } from '../../prompts.js';
import { generateNuxt } from './index.js';

const options: ProjectOptions = {
  template: 'nuxt',
  projectName: 'nuxt-contract',
  features: {
    oauth: false,
    oauthProviders: [],
    emailPassword: true,
    mfa: false,
    passkeys: false,
  },
};

function generated(path: string): string {
  const file = generateNuxt(options).find((entry) => entry.path === path);
  if (!file) throw new Error(`Missing generated file: ${path}`);
  return file.content;
}

describe('Nuxt create-app template', () => {
  it('generates a client-ready auth guard that leaves SSR undecided', () => {
    const middleware = generated('middleware/auth.ts');

    expect(middleware).toContain('import.meta.server');
    expect(middleware).toContain('await authon.client.waitUntilReady()');
    expect(middleware).toMatch(/!authon\.isSignedIn[\s\S]*navigateTo\(['"]\/sign-in/);
  });

  it('attaches the auth middleware to the dashboard', () => {
    expect(generated('pages/dashboard.vue'))
      .toContain("definePageMeta({ middleware: 'auth' })");
  });

  it('generates the sign-in destination used by the auth guard', () => {
    const signIn = generated('pages/sign-in.vue');

    expect(signIn).toContain('authon.client?.openSignIn()');
    expect(signIn).toContain('route.query.redirect_url');
  });

  it('uses module-registered components instead of importing the protected module entry', () => {
    for (const path of ['pages/index.vue', 'pages/dashboard.vue']) {
      const page = generated(path);

      expect(page).not.toMatch(/from ['"]@authon\/nuxt['"]/);
      expect(page).toContain('<Authon');
    }
  });
});
