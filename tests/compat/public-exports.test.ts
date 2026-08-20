import { describe, expect, it } from 'vitest';

import * as shared from '../../packages/shared/src/index';
import * as js from '../../packages/js/src/index';
import * as react from '../../packages/react/src/index';

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
});
