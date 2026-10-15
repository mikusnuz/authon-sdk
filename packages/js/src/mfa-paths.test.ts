// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Authon } from './authon';
import { AuthonMfaRequiredError } from './types';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

const MFA = { mfaRequired: true, mfaToken: 'mfa-token-1', mfaMethods: ['totp'] };

describe('mfaRequired on passwordless and Web3 sign-in (same as password sign-in)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('email code: emits mfaRequired and rejects with AuthonMfaRequiredError, no session', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(MFA));
    const authon = new Authon('pk_live_mfa-otp');
    const onMfa = vi.fn();
    authon.on('mfaRequired', onMfa);
    const error = await authon.verifyPasswordless({ email: 'a@example.com', code: '123456' }).catch((e) => e);
    expect(error).toBeInstanceOf(AuthonMfaRequiredError);
    expect(error.mfaToken).toBe('mfa-token-1');
    expect(onMfa).toHaveBeenCalledWith('mfa-token-1');
    expect(authon.getUser()).toBeNull();
  });

  it('Web3: same contract', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(MFA));
    const authon = new Authon('pk_live_mfa-web3');
    const onMfa = vi.fn();
    authon.on('mfaRequired', onMfa);
    await expect(authon.web3Verify('msg', '0xsig', '0xabc', 'evm', 'metamask')).rejects.toBeInstanceOf(AuthonMfaRequiredError);
    expect(onMfa).toHaveBeenCalledWith('mfa-token-1');
    expect(authon.getUser()).toBeNull();
  });

  it('magic link on page load: mfaRequired, not an error, resolves to null', async () => {
    window.history.replaceState({}, '', `/welcome#authon_magic_link=1&token=${'M'.repeat(43)}`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(MFA));
    const authon = new Authon('pk_live_mfa-link');
    const onMfa = vi.fn();
    const onError = vi.fn();
    authon.on('mfaRequired', onMfa);
    authon.on('error', onError);
    await expect(authon.handleMagicLink()).resolves.toBeNull();
    expect(onMfa).toHaveBeenCalledWith('mfa-token-1');
    expect(onError).not.toHaveBeenCalled();
    expect(authon.getUser()).toBeNull();
  });
});
