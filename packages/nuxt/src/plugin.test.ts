import { describe, expect, it } from 'vitest';
import { isRef } from 'vue';
import { createAuthonPlugin } from './plugin';

describe('legacy createAuthonPlugin', () => {
  it('keeps its plain-value AuthonPluginState contract', () => {
    const state = createAuthonPlugin('pk_live_legacy-nuxt');

    expect(isRef(state.user)).toBe(false);
    expect(isRef(state.isSignedIn)).toBe(false);
    expect(isRef(state.isLoading)).toBe(false);
    expect(state).toMatchObject({
      user: null,
      isSignedIn: false,
      isLoading: false,
    });
    expect(state.client).toBeDefined();

    state.client.destroy();
  });
});
