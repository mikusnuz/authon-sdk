import { describe, expect, it } from 'vitest';

import * as shared from '../../packages/shared/src/index';
import * as js from '../../packages/js/src/index';
import * as react from '../../packages/react/src/index';
import * as nextjs from '../../packages/nextjs/src/index';
import * as nextjsServer from '../../packages/nextjs/src/server';
import * as vue from '../../packages/vue/src/index';
import * as nuxt from '../../packages/nuxt/src/index';
import * as svelte from '../../packages/svelte/src/index';
import * as angular from '../../packages/angular/src/index';

describe('published runtime exports', () => {
  it('keeps the shared constants', () => {
    expect(Object.keys(shared)).toEqual(expect.arrayContaining([
      'API_KEY_PREFIXES',
      'AUDIT_EVENTS',
      'DEFAULT_BRANDING',
      'DEFAULT_SESSION_CONFIG',
      'OAUTH_PROVIDERS',
      'PROVIDER_COLORS',
      'PROVIDER_DISPLAY_NAMES',
      'WEBHOOK_EVENTS',
    ]));
  });

  it('keeps the core browser SDK exports', () => {
    expect(Object.keys(js)).toEqual(expect.arrayContaining([
      'Authon',
      'AuthonMfaRequiredError',
      'ProfileRenderer',
      'generateQrSvg',
      'getProviderButtonConfig',
      'getStrings',
      'translations',
    ]));
  });

  it('keeps the React SDK exports', () => {
    expect(Object.keys(react)).toEqual(expect.arrayContaining([
      'AuthonProvider',
      'Button',
      'Divider',
      'Input',
      'Protect',
      'ProviderIcon',
      'SignIn',
      'SignUp',
      'SignedIn',
      'SignedOut',
      'SocialButton',
      'SocialButtons',
      'ThemeProvider',
      'UserButton',
      'UserProfile',
      'useAuthon',
      'useAuthonMfa',
      'useAuthonPasskeys',
      'useAuthonPasswordless',
      'useAuthonSessions',
      'useAuthonWeb3',
      'useBranding',
      'useOrganization',
      'useOrganizationList',
      'useUser',
    ]));
  });

  it('keeps the Next.js root and server exports', () => {
    expect(Object.keys(nextjs)).toEqual(expect.arrayContaining([
      'AuthonProvider',
      'Protect',
      'SignIn',
      'SignUp',
      'SignedIn',
      'SignedOut',
      'SocialButton',
      'SocialButtons',
      'UserButton',
      'UserProfile',
      'authonMiddleware',
      'useAuthon',
      'useAuthonMfa',
      'useAuthonPasskeys',
      'useAuthonPasswordless',
      'useAuthonSessions',
      'useAuthonWeb3',
      'useUser',
    ]));
    expect(Object.keys(nextjsServer)).toEqual(expect.arrayContaining(['auth', 'currentUser']));
  });

  it('keeps the Vue SDK exports', () => {
    expect(Object.keys(vue)).toEqual(expect.arrayContaining([
      'AUTHON_KEY',
      'AuthonSignIn',
      'AuthonSignUp',
      'AuthonSignedIn',
      'AuthonSignedOut',
      'AuthonSocialButton',
      'AuthonSocialButtons',
      'AuthonUserButton',
      'createAuthon',
      'useAuthon',
      'useAuthonPasskeys',
      'useAuthonPasswordless',
      'useAuthonWeb3',
      'useUser',
    ]));
  });

  it('keeps the Nuxt SDK exports', () => {
    expect(Object.keys(nuxt)).toEqual(expect.arrayContaining([
      'AuthonSignIn',
      'AuthonSignUp',
      'AuthonSignedIn',
      'AuthonSignedOut',
      'AuthonUserButton',
      'authonModule',
      'createAuthMiddleware',
      'createAuthonPlugin',
      'default',
      'renderSocialButtons',
      'useAuthon',
      'useAuthonPasskeys',
      'useAuthonPasswordless',
      'useAuthonWeb3',
      'useUser',
    ]));
  });

  it('keeps the Svelte SDK exports', () => {
    expect(Object.keys(svelte)).toEqual(expect.arrayContaining([
      'createAuthonStore',
      'getAuthon',
      'initAuthon',
      'renderSocialButtons',
    ]));
  });

  it('keeps the Angular SDK exports', () => {
    expect(Object.keys(angular)).toEqual(expect.arrayContaining([
      'AUTHON_CONFIG',
      'AuthonService',
      'AuthonSignInComponent',
      'AuthonSignUpComponent',
      'authGuard',
      'provideAuthon',
      'renderSocialButtons',
    ]));
  });
});
