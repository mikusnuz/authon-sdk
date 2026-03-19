import { select, input, checkbox } from '@inquirer/prompts';
import type { CliArgs } from './args.js';

export type FrameworkTemplate =
  | 'nextjs-app'
  | 'nextjs-pages'
  | 'react-vite'
  | 'vue-vite'
  | 'nuxt'
  | 'svelte'
  | 'express'
  | 'node';

export interface ProjectOptions {
  template: FrameworkTemplate;
  projectName: string;
  features: {
    oauth: boolean;
    oauthProviders: string[];
    emailPassword: boolean;
    mfa: boolean;
    passkeys: boolean;
  };
}

const VALID_TEMPLATES: FrameworkTemplate[] = [
  'nextjs-app',
  'nextjs-pages',
  'react-vite',
  'vue-vite',
  'nuxt',
  'svelte',
  'express',
  'node',
];

const DEFAULT_FEATURES = {
  oauth: true,
  oauthProviders: ['google', 'github'],
  emailPassword: true,
  mfa: false,
  passkeys: false,
};

export async function collectOptions(cliArgs: CliArgs): Promise<ProjectOptions> {
  // Non-interactive mode: use defaults for everything not provided
  if (cliArgs.yes) {
    const template = (cliArgs.template || 'nextjs-app') as FrameworkTemplate;
    if (!VALID_TEMPLATES.includes(template)) {
      throw new Error(
        `Invalid template "${cliArgs.template}". Valid options: ${VALID_TEMPLATES.join(', ')}`
      );
    }
    return {
      template,
      projectName: cliArgs.projectName || 'my-authon-app',
      features: { ...DEFAULT_FEATURES },
    };
  }

  let template: FrameworkTemplate;

  if (cliArgs.template) {
    if (!VALID_TEMPLATES.includes(cliArgs.template as FrameworkTemplate)) {
      throw new Error(
        `Invalid template "${cliArgs.template}". Valid options: ${VALID_TEMPLATES.join(', ')}`
      );
    }
    template = cliArgs.template as FrameworkTemplate;
  } else {
    template = await select<FrameworkTemplate>({
      message: 'Select a framework:',
      choices: [
        { value: 'nextjs-app', name: 'Next.js (App Router)' },
        { value: 'nextjs-pages', name: 'Next.js (Pages Router)' },
        { value: 'react-vite', name: 'React (Vite)' },
        { value: 'vue-vite', name: 'Vue (Vite)' },
        { value: 'nuxt', name: 'Nuxt' },
        { value: 'svelte', name: 'SvelteKit' },
        { value: 'express', name: 'Express' },
        { value: 'node', name: 'Node.js (plain)' },
      ],
    });
  }

  const projectName = cliArgs.projectName || await input({
    message: 'Project name:',
    default: 'my-authon-app',
    validate: (val) => {
      if (!val.trim()) return 'Project name is required';
      if (/[^a-z0-9\-_.]/.test(val)) return 'Use lowercase letters, numbers, hyphens, underscores, or dots';
      return true;
    },
  });

  const authFeatures = await checkbox({
    message: 'Select auth features:',
    choices: [
      { value: 'emailPassword', name: 'Email / Password', checked: true },
      { value: 'oauth', name: 'OAuth providers (Google, GitHub, etc.)' },
      { value: 'mfa', name: 'Multi-Factor Authentication (TOTP)' },
      { value: 'passkeys', name: 'Passkeys (WebAuthn)' },
    ],
  });

  let oauthProviders: string[] = [];
  if (authFeatures.includes('oauth')) {
    oauthProviders = await checkbox({
      message: 'Select OAuth providers:',
      choices: [
        { value: 'google', name: 'Google', checked: true },
        { value: 'github', name: 'GitHub', checked: true },
        { value: 'apple', name: 'Apple' },
        { value: 'discord', name: 'Discord' },
        { value: 'facebook', name: 'Facebook' },
        { value: 'microsoft', name: 'Microsoft' },
        { value: 'kakao', name: 'Kakao' },
        { value: 'naver', name: 'Naver' },
        { value: 'line', name: 'LINE' },
        { value: 'x', name: 'X (Twitter)' },
      ],
    });
  }

  return {
    template,
    projectName,
    features: {
      oauth: authFeatures.includes('oauth'),
      oauthProviders,
      emailPassword: authFeatures.includes('emailPassword'),
      mfa: authFeatures.includes('mfa'),
      passkeys: authFeatures.includes('passkeys'),
    },
  };
}
