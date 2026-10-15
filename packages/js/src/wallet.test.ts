// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';
import { Authon } from './authon';
import { AuthonWalletError, WalletClient } from './wallet';

const ORIGIN = 'https://wallet.test';
const WALLET = { address: '0xabc', protected: false, needsRestore: false, backupUpgradeRecommended: false, devices: [] };

type Handler = (message: { id: string; type: string; payload: Record<string, unknown> }, win: Window) => unknown;

function makeClient(overrides: Partial<ConstructorParameters<typeof WalletClient>[0]> = {}) {
  return new WalletClient({
    publishableKey: 'pk_test_wallet',
    walletOrigin: ORIGIN,
    getToken: async () => 'token_1',
    timeoutMs: 200,
    popupTimeoutMs: 400,
    ...overrides,
  });
}

function reply(source: MessageEventSource | null, id: string, body: Record<string, unknown>, origin = ORIGIN): void {
  window.dispatchEvent(new MessageEvent('message', { data: { v: 1, id, ...body }, origin, source }));
}

/** Attaches a fake wallet frame: answers each posted request using `handler`. */
async function attachFrame(handler: Handler): Promise<HTMLIFrameElement> {
  const iframe = await vi.waitFor(() => {
    const found = document.querySelector('iframe');
    if (!found) throw new Error('no iframe');
    return found;
  });
  const win = iframe.contentWindow!;
  vi.spyOn(win, 'postMessage').mockImplementation(((message: any) => {
    queueMicrotask(() => {
      const out = handler(message, win);
      if (out === undefined) return;
      if (out instanceof AuthonWalletError) reply(win, message.id, { ok: false, error: { code: out.code, message: out.message } });
      else reply(win, message.id, { ok: true, result: out });
    });
  }) as any);
  iframe.dispatchEvent(new Event('load'));
  return iframe;
}

describe('WalletClient frame protocol', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('creates one hidden iframe lazily with passkey permissions and matches responses by id', async () => {
    const client = makeClient();
    expect(document.querySelector('iframe')).toBeNull();
    const seen: Array<{ type: string; payload: Record<string, unknown> }> = [];
    const pending = client.get();
    await attachFrame((message) => {
      seen.push(message);
      return WALLET;
    });
    await expect(pending).resolves.toEqual(WALLET);
    await client.get();
    const frames = document.querySelectorAll('iframe');
    expect(frames).toHaveLength(1);
    const src = new URL(frames[0].src);
    expect(src.origin).toBe(ORIGIN);
    expect(src.pathname).toBe('/frame');
    expect(src.searchParams.get('pk')).toBe('pk_test_wallet');
    expect(src.searchParams.get('origin')).toBe(window.location.origin);
    expect(frames[0].getAttribute('allow')).toBe('publickey-credentials-create; publickey-credentials-get');
    expect(seen[0]).toMatchObject({ type: 'wallet.status', payload: { token: 'token_1' } });
  });

  it('ignores messages from other origins and sources', async () => {
    const client = makeClient();
    const pending = client.signMessage('hi');
    const iframe = await attachFrame((message, win) => {
      reply(win, message.id, { ok: true, result: '0xevil' }, 'https://evil.test');
      reply(window, message.id, { ok: true, result: '0xevil2' });
      queueMicrotask(() => reply(win, message.id, { ok: true, result: '0xgood' }));
      return undefined;
    });
    await expect(pending).resolves.toBe('0xgood');
    expect(iframe).toBeTruthy();
  });

  it('rejects with TIMEOUT when the frame never answers', async () => {
    const client = makeClient({ timeoutMs: 50 });
    const pending = client.get();
    const assertion = expect(pending).rejects.toMatchObject({ code: 'TIMEOUT' });
    await attachFrame(() => undefined);
    await assertion;
  });

  it('signing waits for the in-frame confirmation and shows the frame while the card is open', async () => {
    const client = makeClient({ timeoutMs: 50, popupTimeoutMs: 2000 });
    let shown = '';
    const pending = client.signMessage('hi');
    const iframe = await attachFrame((message, win) => {
      window.dispatchEvent(new MessageEvent('message', { data: { v: 1, type: 'wallet.ui', state: 'show' }, origin: ORIGIN, source: win }));
      shown = document.querySelector('iframe')!.style.pointerEvents;
      setTimeout(() => {
        window.dispatchEvent(new MessageEvent('message', { data: { v: 1, type: 'wallet.ui', state: 'hide' }, origin: ORIGIN, source: win }));
        reply(win, message.id, { ok: true, result: '0xsigned' });
      }, 200);
      return undefined;
    });
    await expect(pending).resolves.toBe('0xsigned');
    expect(shown).toBe('auto');
    expect(iframe.style.pointerEvents).toBe('none');
  });

  it('a wallet.ui message from another window does not reveal the frame', async () => {
    const client = makeClient();
    const pending = client.get();
    const iframe = await attachFrame(() => WALLET);
    await pending;
    window.dispatchEvent(new MessageEvent('message', { data: { v: 1, type: 'wallet.ui', state: 'show' }, origin: ORIGIN, source: window }));
    expect(iframe.style.pointerEvents).toBe('none');
  });

  it('isProtected reflects the wallet state', async () => {
    const client = makeClient();
    const pending = client.isProtected();
    await attachFrame(() => ({ ...WALLET, protected: true }));
    await expect(pending).resolves.toBe(true);
  });

  it('maps frame errors to AuthonWalletError and get() returns null on NOT_FOUND', async () => {
    const client = makeClient();
    const missing = client.get();
    await attachFrame(() => new AuthonWalletError('NOT_FOUND', 'none'));
    await expect(missing).resolves.toBeNull();
    await expect(client.signMessage('x')).rejects.toMatchObject({ name: 'AuthonWalletError', code: 'NOT_FOUND' });
  });

  it('fails with NOT_SIGNED_IN without a token and NOT_CONFIGURED without an origin', async () => {
    await expect(makeClient({ getToken: async () => null }).get()).rejects.toMatchObject({ code: 'NOT_SIGNED_IN' });
    await expect(makeClient({ walletOrigin: null }).get()).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
  });

  it('opens the passkey popup on NEEDS_POPUP and completes the request there', async () => {
    const client = makeClient();
    const popupWin = { closed: false, close: vi.fn(), postMessage: vi.fn() } as unknown as Window;
    const open = vi.spyOn(window, 'open').mockImplementation(() => {
      setTimeout(() => window.dispatchEvent(new MessageEvent('message', {
        data: { v: 1, type: 'wallet.ready' }, origin: ORIGIN, source: popupWin,
      })), 10);
      return popupWin;
    });
    vi.mocked(popupWin.postMessage).mockImplementation(((message: any) => {
      queueMicrotask(() => reply(popupWin, message.id, { ok: true, result: null }));
    }) as any);
    const protectCall = client.protect();
    await attachFrame((message) => {
      if (message.type === 'wallet.protect') return new AuthonWalletError('NEEDS_POPUP');
      return { ...WALLET, protected: true };
    });
    const changes: unknown[] = [];
    client.onChange((wallet) => changes.push(wallet));
    await protectCall;
    const url = new URL(open.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe(`${ORIGIN}/passkey`);
    expect(popupWin.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ v: 1, type: 'wallet.protect', payload: { token: 'token_1' } }),
      ORIGIN,
    );
    expect(popupWin.close).toHaveBeenCalled();
  });

  it('reports POPUP_BLOCKED when window.open returns null', async () => {
    const client = makeClient();
    vi.spyOn(window, 'open').mockReturnValue(null);
    const pending = client.restore();
    const assertion = expect(pending).rejects.toMatchObject({ code: 'POPUP_BLOCKED' });
    await attachFrame(() => new AuthonWalletError('NEEDS_POPUP'));
    await assertion;
  });

  it('notifies onChange after protect and revokeDevice with the latest wallet', async () => {
    const client = makeClient();
    const changes: unknown[] = [];
    client.onChange((wallet) => changes.push(wallet));
    const pending = client.revokeDevice('dev_1');
    await attachFrame((message) => (message.type === 'wallet.status' ? { ...WALLET, protected: true } : null));
    await pending;
    expect(changes).toEqual([{ ...WALLET, protected: true }]);
  });

  it('upgradeBackup asks the frame, waits interactively and reports the upgraded wallet', async () => {
    const client = makeClient();
    const changes: unknown[] = [];
    client.onChange((wallet) => changes.push(wallet));
    const seen: string[] = [];
    const pending = client.upgradeBackup({ ui: { accentColor: '#123456' } });
    await attachFrame((message) => {
      seen.push(message.type);
      if (message.type === 'wallet.upgradeBackup') {
        expect(message.payload).toMatchObject({ token: 'token_1', ui: { accentColor: '#123456' } });
        return { protected: true, shareVersion: 3 };
      }
      return { ...WALLET, protected: true };
    });
    await pending;
    expect(seen).toEqual(['wallet.upgradeBackup', 'wallet.status']);
    expect(changes).toEqual([{ ...WALLET, protected: true }]);
  });

  it('exposes backupUpgradeRecommended from the frame', async () => {
    const client = makeClient();
    const pending = client.get();
    await attachFrame(() => ({ ...WALLET, protected: true, backupUpgradeRecommended: true }));
    await expect(pending).resolves.toMatchObject({ protected: true, backupUpgradeRecommended: true });
  });

  it('surfaces approval-window and size errors without opening a window from the page', async () => {
    const open = vi.spyOn(window, 'open');
    for (const code of ['CONFIRM_WINDOW_BLOCKED', 'CONFIRM_WINDOW_CLOSED', 'MESSAGE_TOO_LARGE', 'FRAME_OUTDATED']) {
      document.body.innerHTML = '';
      const client = makeClient();
      const pending = client.signTransaction({ chainId: 1, to: '0x0000000000000000000000000000000000000001', value: 1n });
      await attachFrame(() => new AuthonWalletError(code));
      await expect(pending).rejects.toMatchObject({ code });
      client.dispose();
    }
    // The approval window is opened by the frame (from a click inside it), never by the SDK.
    expect(open).not.toHaveBeenCalled();
  });

  it('dispose removes the iframe, rejects in-flight calls and notifies null', async () => {
    const client = makeClient({ timeoutMs: 5000 });
    const changes: unknown[] = [];
    client.onChange((wallet) => changes.push(wallet));
    const pending = client.signMessage('hi');
    const assertion = expect(pending).rejects.toMatchObject({ code: 'DISPOSED' });
    await attachFrame(() => undefined);
    await vi.waitFor(() => expect(vi.mocked(document.querySelector('iframe')!.contentWindow!.postMessage)).toHaveBeenCalled());
    client.dispose();
    await assertion;
    expect(document.querySelector('iframe')).toBeNull();
    expect(changes).toEqual([null]);
  });
});

describe('EIP-1193 provider', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('maps supported methods to frame requests', async () => {
    const client = makeClient({ timeoutMs: 2000 });
    const provider = client.provider(137);
    const seen: Array<{ type: string; payload: Record<string, unknown> }> = [];
    const handler: Handler = (message) => {
      seen.push(message);
      if (message.type === 'wallet.status') return WALLET;
      return '0xsig';
    };
    expect(await provider.request({ method: 'eth_chainId' })).toBe('0x89');
    const accounts = provider.request({ method: 'eth_accounts' });
    await attachFrame(handler);
    expect(await accounts).toEqual(['0xabc']);
    expect(await provider.request({ method: 'eth_requestAccounts' })).toEqual(['0xabc']);
    expect(await provider.request({ method: 'personal_sign', params: ['0x68656c6c6f', '0xabc'] })).toBe('0xsig');
    const typed = { domain: {}, types: {}, primaryType: 'A', message: {} };
    await provider.request({ method: 'eth_signTypedData_v4', params: ['0xabc', JSON.stringify(typed)] });
    await provider.request({ method: 'eth_signTransaction', params: [{ to: '0x1', value: '0x1' }] });
    expect(seen.find((m) => m.type === 'wallet.signMessage')?.payload).toMatchObject({ message: { raw: '0x68656c6c6f' } });
    expect(seen.find((m) => m.type === 'wallet.signTypedData')?.payload).toMatchObject({ typedData: typed });
    expect(seen.find((m) => m.type === 'wallet.signTransaction')?.payload).toMatchObject({
      tx: { chainId: '0x89', to: '0x1', value: '0x1' },
    });
  });

  it('rejects other methods with code 4200', async () => {
    const provider = makeClient().provider(1);
    await expect(provider.request({ method: 'eth_sendTransaction', params: [] })).rejects.toMatchObject({ code: 4200 });
  });
});

describe('Authon wallet integration', () => {
  class MemoryStorage implements Storage {
    private values = new Map<string, string>();
    get length(): number { return this.values.size; }
    clear(): void { this.values.clear(); }
    getItem(key: string): string | null { return this.values.get(key) ?? null; }
    key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
    removeItem(key: string): void { this.values.delete(key); }
    setItem(key: string, value: string): void { this.values.set(key, String(value)); }
  }
  const jwt = () => {
    const encode = (value: unknown) => btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
  };
  const authTokens = (): AuthTokens => ({
    accessToken: jwt(),
    refreshToken: 'refresh_1',
    expiresIn: 3600,
    user: { id: 'user_1', projectId: 'p', email: 'a@b.c', displayName: null } as unknown as AuthonUser,
  });
  const json = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });

  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (String(url).endsWith('/v1/auth/branding')) return json({ walletEnabled: true });
      if (String(url).endsWith('/v1/auth/providers')) return json({ providers: [] });
      return json(authTokens());
    }));
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the default wallet origin and requires an explicit one for custom apiUrl', async () => {
    const auto = new Authon('pk_test_default');
    await auto.signInWithEmail('a@b.c', 'pw');
    const pending = auto.wallet.get().catch(() => null);
    await vi.waitFor(() => expect(document.querySelector('iframe')).not.toBeNull());
    expect(new URL(document.querySelector('iframe')!.src).origin).toBe('https://wallet.authon.dev');
    auto.destroy();
    await pending;
    const custom = new Authon('pk_test_custom', { apiUrl: 'https://api.example.com' });
    await custom.signInWithEmail('a@b.c', 'pw');
    await expect(custom.wallet.get()).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
  });

  it('calls ensure() after sign-in when autoCreate is on and keeps the session if it fails', async () => {
    const authon = new Authon('pk_test_auto', { wallet: { origin: ORIGIN, autoCreate: true } });
    const ensure = vi.spyOn(authon.wallet, 'ensure').mockRejectedValue(new AuthonWalletError('PRF_UNSUPPORTED', 'no'));
    const walletError = vi.fn();
    authon.on('walletError', walletError);
    await authon.signInWithEmail('a@b.c', 'pw');
    await vi.waitFor(() => expect(walletError).toHaveBeenCalledTimes(1));
    expect(ensure).toHaveBeenCalledTimes(1);
    expect(walletError.mock.calls[0][0]).toMatchObject({ code: 'PRF_UNSUPPORTED' });
    expect(authon.getUser()).not.toBeNull();
  });

  it('skips autoCreate when the project has wallets disabled or autoCreate is off', async () => {
    vi.mocked(fetch).mockImplementation((async (url: string) => {
      if (String(url).endsWith('/v1/auth/branding')) return json({ walletEnabled: false });
      if (String(url).endsWith('/v1/auth/providers')) return json({ providers: [] });
      return json(authTokens());
    }) as any);
    const disabled = new Authon('pk_test_off1', { wallet: { origin: ORIGIN, autoCreate: true } });
    const spyDisabled = vi.spyOn(disabled.wallet, 'ensure');
    await disabled.signInWithEmail('a@b.c', 'pw');
    const manual = new Authon('pk_test_off2', { wallet: { origin: ORIGIN } });
    const spyManual = vi.spyOn(manual.wallet, 'ensure');
    await manual.signInWithEmail('a@b.c', 'pw');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(spyDisabled).not.toHaveBeenCalled();
    expect(spyManual).not.toHaveBeenCalled();
  });

  it('removes the wallet iframe on sign-out', async () => {
    const authon = new Authon('pk_test_logout', { wallet: { origin: ORIGIN } });
    await authon.signInWithEmail('a@b.c', 'pw');
    const pending = authon.wallet.get().catch(() => null);
    await vi.waitFor(() => expect(document.querySelector('iframe')).not.toBeNull());
    await authon.signOut();
    expect(document.querySelector('iframe')).toBeNull();
    await pending;
  });
});
