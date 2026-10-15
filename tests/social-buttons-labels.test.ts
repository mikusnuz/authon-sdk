// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { renderSocialButtons as renderSvelte } from '../packages/svelte/src/SocialButtons';
import { renderSocialButtons as renderNuxt } from '../packages/nuxt/src/SocialButtons';
import { renderSocialButtons as renderAngular } from '../packages/angular/src/SocialButtons';

const evilLabel = '<img src=x onerror="window.__xss=1">Google';

const renderers = {
  svelte: renderSvelte,
  nuxt: renderNuxt,
  angular: renderAngular,
} as const;

afterEach(() => {
  document.body.innerHTML = '';
});

describe.each(Object.entries(renderers))('%s SocialButtons labels', (_name, render) => {
  it('renders custom labels as text, never as HTML', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const client = {
      getProviders: async () => ['google'],
      signInWithOAuth: async () => {},
    };
    const cleanup = (render as (o: any) => () => void)({
      client,
      container,
      labels: { google: evilLabel },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(button?.textContent).toBe(evilLabel);
    expect(button?.querySelector('svg')).not.toBeNull();
    cleanup();
  });
});
