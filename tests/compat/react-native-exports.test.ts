import { describe, expect, it } from 'vitest';

describe('published React Native runtime exports', () => {
  it('keeps the existing values while allowing additive exports', async () => {
    const reactNative = await import('../../packages/react-native/src/index');

    expect(Object.keys(reactNative)).toEqual(expect.arrayContaining([
      'AuthonContext',
      'AuthonMobileClient',
      'AuthonProvider',
      'ProviderIcon',
      'SocialButton',
      'SocialButtons',
      'useAuthon',
      'useAuthonPasskeys',
      'useAuthonPasswordless',
      'useAuthonWeb3',
      'useUser',
    ]));
  });
});
