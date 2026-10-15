// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthTokens, AuthonUser } from '@authon/shared';
import { Authon } from './authon';
import { ModalRenderer } from './modal';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function user(): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function jwt(expiresInSeconds: number): string {
  const encode = (value: unknown) => btoa(JSON.stringify(value))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.sig`;
}

function tokens(): AuthTokens {
  return { accessToken: jwt(3600), refreshToken: 'refresh_1', expiresIn: 3600, user: user() };
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

const TOKEN = 'A'.repeat(43);

function bodyOf(call: unknown[]): any {
  return JSON.parse(String((call[1] as RequestInit).body));
}

function bytes(...values: number[]): ArrayBuffer {
  return new Uint8Array(values).buffer;
}

describe('magic link handling on page load', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('verifies the link, stores the session and strips only the link params', async () => {
    window.history.replaceState({}, '', `/welcome?next=%2Fcart&token=${TOKEN}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    const authon = new Authon('pk_live_magic-auto');
    // The token leaves the address bar before any request is made.
    expect(window.location.search).toBe('?next=%2Fcart');
    const signedIn = vi.fn();
    authon.on('signedIn', signedIn);

    const result = await authon.handleMagicLink();

    expect(result?.id).toBe('user_1');
    expect(signedIn).toHaveBeenCalledOnce();
    expect(authon.getUser()?.id).toBe('user_1');
    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe('https://api.authon.dev/v1/auth/passwordless/verify');
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ token: TOKEN, requireBrowserBinding: true });
    expect(window.location.search).toBe('?next=%2Fcart');
  });

  it('leaves a plain ?token= alone (no Authon marker)', async () => {
    window.history.replaceState({}, '', `/reset?token=${TOKEN}`);
    const authon = new Authon('pk_live_magic-plain');
    expect(await authon.handleMagicLink()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.location.search).toBe(`?token=${TOKEN}`);
  });

  it('reports a used or expired link as an error and still cleans the URL', async () => {
    window.history.replaceState({}, '', `/?token=${TOKEN}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Invalid or expired magic link' }, 401));
    const authon = new Authon('pk_live_magic-fail');
    const errors: Error[] = [];
    authon.on('error', (e) => errors.push(e));
    expect(await authon.handleMagicLink()).toBeNull();
    expect(errors[0]?.message).toBe('Invalid or expired magic link');
    expect(window.location.search).toBe('');
  });

  it('can be turned off and handled manually later', async () => {
    window.history.replaceState({}, '', `/?token=${TOKEN}&authon_magic_link=1`);
    const authon = new Authon('pk_live_magic-off', { autoHandleMagicLink: false });
    await Promise.resolve();
    expect(fetch).not.toHaveBeenCalled();
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    expect((await authon.handleMagicLink())?.id).toBe('user_1');
  });

  it('consumes a link once even with two instances and an explicit verify call', async () => {
    const token = 'B'.repeat(43);
    window.history.replaceState({}, '', `/?token=${token}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValue(jsonResponse(tokens()));
    const first = new Authon('pk_live_magic-dedupe');
    const second = new Authon('pk_live_magic-dedupe');
    const [a, b, c] = await Promise.all([
      first.handleMagicLink(),
      second.handleMagicLink(),
      second.verifyPasswordless({ token }),
    ]);
    expect([a?.id, b?.id, c.id]).toEqual(['user_1', 'user_1', 'user_1']);
    expect(vi.mocked(fetch)).toHaveBeenCalledOnce();
    expect(second.getUser()?.id).toBe('user_1');
  });

  it('asks Authon to send the link back to the current page', async () => {
    window.history.replaceState({}, '', '/login?next=1#frag');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Magic link sent' }));
    const authon = new Authon('pk_live_magic-send');
    await authon.sendMagicLink('person@example.com');
    expect(bodyOf(vi.mocked(fetch).mock.calls[0])).toEqual({
      email: 'person@example.com',
      redirectUrl: `${window.location.origin}/login?next=1`,
      browserNonce: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
    });
  });

  it('does not send a return URL when automatic handling is off', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Magic link sent' }));
    const authon = new Authon('pk_live_magic-send-off', { autoHandleMagicLink: false });
    await authon.sendMagicLink('person@example.com');
    expect(bodyOf(vi.mocked(fetch).mock.calls[0])).toEqual({
      email: 'person@example.com',
      browserNonce: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
    });
  });
});

describe('magic link login CSRF protection', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends the nonce this browser stored when it asked for the link, then forgets it', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Magic link sent' }));
    const sender = new Authon('pk_live_csrf-bound', { autoHandleMagicLink: false });
    await sender.sendMagicLink('person@example.com');
    const nonce = bodyOf(vi.mocked(fetch).mock.calls[0]).browserNonce;

    const token = 'C'.repeat(43);
    window.history.replaceState({}, '', `/welcome#authon_magic_link=1&token=${token}`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    const authon = new Authon('pk_live_csrf-bound');
    expect(window.location.hash).toBe('');
    expect((await authon.handleMagicLink())?.id).toBe('user_1');
    expect(bodyOf(vi.mocked(fetch).mock.calls[1])).toEqual({ token, requireBrowserBinding: true, browserNonce: nonce });
    expect(window.location.pathname).toBe('/welcome');
    expect([...Array(localStorage.length).keys()].map((i) => localStorage.key(i)).some((k) => k?.startsWith('authon_magic_link_nonce:'))).toBe(false);
  });

  it('keeps other fragment content when it removes a fragment link', async () => {
    const token = 'D'.repeat(43);
    window.history.replaceState({}, '', `/app?x=1#tab=2&authon_magic_link=1&token=${token}`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    const authon = new Authon('pk_live_csrf-hash');
    expect(window.location.search).toBe('?x=1');
    expect(window.location.hash).toBe('#tab=2');
    await authon.handleMagicLink();
  });

  it('does not sign in with a link from another browser; asks to confirm instead', async () => {
    const token = 'E'.repeat(43);
    window.history.replaceState({}, '', `/?token=${token}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ status: 'confirmation_required', email: 'attacker@example.com' }));
    const authon = new Authon('pk_live_csrf-other');
    const asked = vi.fn();
    const signedIn = vi.fn();
    authon.on('magicLinkConfirmationRequired', asked);
    authon.on('signedIn', signedIn);

    expect(await authon.handleMagicLink()).toBeNull();
    expect(asked).toHaveBeenCalledWith({ email: 'attacker@example.com', reason: 'unrecognized_browser' });
    expect(signedIn).not.toHaveBeenCalled();
    expect(authon.getUser()).toBeNull();
    expect(authon.getPendingMagicLink()).toEqual({ email: 'attacker@example.com', reason: 'unrecognized_browser' });

    // Only an explicit OK signs in, with a plain verify call.
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    expect((await authon.confirmMagicLink()).id).toBe('user_1');
    expect(bodyOf(vi.mocked(fetch).mock.calls[1])).toEqual({ token });
    expect(authon.getPendingMagicLink()).toBeNull();
  });

  it('shows the built-in confirmation when the app does not handle the event', async () => {
    const token = 'H'.repeat(43);
    window.history.replaceState({}, '', `/?token=${token}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ status: 'confirmation_required', email: 'x@example.com' }));
    vi.spyOn(Authon.prototype, 'openSignIn').mockResolvedValue();
    const shown = vi.spyOn(ModalRenderer.prototype, 'showMagicLinkConfirm').mockImplementation(() => undefined);
    const close = vi.spyOn(ModalRenderer.prototype, 'close').mockImplementation(() => undefined);
    const authon = new Authon('pk_live_csrf-builtin');

    expect(await authon.handleMagicLink()).toBeNull();
    await vi.waitFor(() => expect(shown).toHaveBeenCalled());
    const [email, onConfirm] = shown.mock.calls[0];
    expect(email).toBe('x@example.com');
    expect(authon.getUser()).toBeNull();

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    onConfirm();
    await vi.waitFor(() => expect(authon.getUser()?.id).toBe('user_1'));
    expect(bodyOf(vi.mocked(fetch).mock.calls[1])).toEqual({ token });
    await vi.waitFor(() => expect(close).toHaveBeenCalled());
  });

  it('does not show the built-in confirmation when the app listens for the event', async () => {
    window.history.replaceState({}, '', `/?token=${'I'.repeat(43)}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ status: 'confirmation_required', email: 'y@example.com' }));
    const open = vi.spyOn(Authon.prototype, 'openSignIn').mockResolvedValue();
    const authon = new Authon('pk_live_csrf-listener');
    authon.on('magicLinkConfirmationRequired', () => undefined);
    await authon.handleMagicLink();
    expect(open).not.toHaveBeenCalled();
  });

  it('dismissMagicLink drops the pending link', async () => {
    window.history.replaceState({}, '', `/?token=${'F'.repeat(43)}&authon_magic_link=1`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ status: 'confirmation_required', email: 'a@example.com' }));
    const authon = new Authon('pk_live_csrf-dismiss');
    await authon.handleMagicLink();
    authon.dismissMagicLink();
    expect(authon.getPendingMagicLink()).toBeNull();
    await expect(authon.confirmMagicLink()).rejects.toThrow('No magic link is waiting for confirmation');
  });

  it('never replaces a signed-in session automatically, even in the requesting browser', async () => {
    const authon = new Authon('pk_live_csrf-signed-in', { autoHandleMagicLink: false });
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Magic link sent' }));
    await authon.sendMagicLink('other@example.com');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    await authon.verifyPasswordless({ email: 'person@example.com', code: '123456' });
    expect(authon.getUser()?.id).toBe('user_1');

    const token = 'G'.repeat(43);
    window.history.replaceState({}, '', `/#authon_magic_link=1&token=${token}`);
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ status: 'confirmation_required', email: 'other@example.com' }));
    expect(await authon.handleMagicLink()).toBeNull();
    // No nonce is sent, so the server cannot finish the link.
    expect(bodyOf(vi.mocked(fetch).mock.calls[2])).toEqual({ token, requireBrowserBinding: true });
    expect(authon.getPendingMagicLink()).toEqual({ email: 'other@example.com', reason: 'signed_in' });
    expect(authon.getUser()?.id).toBe('user_1');
  });

  it('keeps the earlier nonce when sending a new link fails', async () => {
    const authon = new Authon('pk_live_csrf-send-fail', { autoHandleMagicLink: false });
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Magic link sent' }));
    await authon.sendMagicLink('person@example.com');
    const first = bodyOf(vi.mocked(fetch).mock.calls[0]).browserNonce;
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Too many requests' }, 429));
    await expect(authon.sendMagicLink('person@example.com')).rejects.toThrow();
    const stored = [...Array(localStorage.length).keys()]
      .map((i) => localStorage.key(i)!)
      .filter((k) => k.startsWith('authon_magic_link_nonce:'))
      .map((k) => localStorage.getItem(k));
    expect(stored).toEqual([first]);
  });
});

describe('passkey requests', () => {
  let create: ReturnType<typeof vi.fn>;
  let get: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    vi.stubGlobal('fetch', vi.fn());
    create = vi.fn(async () => ({
      id: 'cred-1',
      rawId: bytes(1, 2, 3),
      type: 'public-key',
      authenticatorAttachment: 'platform',
      getClientExtensionResults: () => ({ credProps: { rk: true } }),
      response: {
        attestationObject: bytes(4, 5),
        clientDataJSON: bytes(6, 7),
        getTransports: () => ['internal'],
      },
    }));
    get = vi.fn(async () => ({
      id: 'cred-1',
      rawId: bytes(1, 2, 3),
      type: 'public-key',
      authenticatorAttachment: null,
      getClientExtensionResults: () => ({}),
      response: {
        authenticatorData: bytes(8),
        clientDataJSON: bytes(9),
        signature: bytes(10),
        userHandle: null,
      },
    }));
    Object.defineProperty(navigator, 'credentials', { value: { create, get }, configurable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('registers with top-level options and sends the credential under `response`', async () => {
    const authon = new Authon('pk_live_passkey-register');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(tokens()));
    await authon.signInWithEmail('person@example.com', 'secret');
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({
        challenge: 'AQID',
        rp: { id: 'localhost', name: 'P' },
        user: { id: 'dXNlcg', name: 'person@example.com', displayName: 'Person' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        excludeCredentials: [{ id: 'AQID', type: 'public-key' }],
      }))
      .mockResolvedValueOnce(jsonResponse({ id: 'pk_1', name: 'Laptop', createdAt: 'now', lastUsedAt: null }));

    const registered = await authon.registerPasskey('Laptop');

    expect(registered.id).toBe('pk_1');
    const publicKey = create.mock.calls[0][0].publicKey;
    expect(publicKey.challenge).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(publicKey.challenge)).toEqual(new Uint8Array([1, 2, 3]));
    expect(publicKey.user.id).toBeInstanceOf(ArrayBuffer);
    const optionsCall = vi.mocked(fetch).mock.calls[1];
    expect(String(optionsCall[0])).toContain('/v1/auth/passkeys/register/options');
    expect(bodyOf(vi.mocked(fetch).mock.calls[2])).toEqual({
      name: 'Laptop',
      response: {
        id: 'cred-1',
        rawId: 'AQID',
        type: 'public-key',
        authenticatorAttachment: 'platform',
        clientExtensionResults: { credProps: { rk: true } },
        response: { attestationObject: 'BAU', clientDataJSON: 'Bgc', transports: ['internal'] },
      },
    });
  });

  it('signs in with a passkey and stores the session', async () => {
    const authon = new Authon('pk_live_passkey-auth');
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ challenge: 'AQID', rpId: 'localhost', allowCredentials: [] }))
      .mockResolvedValueOnce(jsonResponse(tokens()));

    const signedIn = await authon.authenticateWithPasskey();

    expect(signedIn.id).toBe('user_1');
    expect(authon.getUser()?.id).toBe('user_1');
    expect(new Uint8Array(get.mock.calls[0][0].publicKey.challenge)).toEqual(new Uint8Array([1, 2, 3]));
    expect(bodyOf(vi.mocked(fetch).mock.calls[1])).toEqual({
      response: {
        id: 'cred-1',
        rawId: 'AQID',
        type: 'public-key',
        clientExtensionResults: {},
        response: { authenticatorData: 'CA', clientDataJSON: 'CQ', signature: 'Cg' },
      },
    });
  });

  it('still understands options wrapped in `options`', async () => {
    const authon = new Authon('pk_live_passkey-wrapped');
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ options: { challenge: 'AQID', rpId: 'localhost' } }))
      .mockResolvedValueOnce(jsonResponse(tokens()));
    await authon.authenticateWithPasskey();
    expect(get.mock.calls[0][0].publicKey.rpId).toBe('localhost');
  });
});

describe('modal passwordless wording', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  function render(method: 'magic_link' | 'email_otp', locale = 'en') {
    const modal = new ModalRenderer({
      mode: 'popup',
      theme: 'light',
      locale,
      branding: { showPasswordless: true, passwordlessMethod: method },
    } as any);
    modal.open('signIn');
    const root = (modal as any).shadowRoot as ShadowRoot;
    const button = () => root.getElementById('passwordless-btn')?.textContent?.trim();
    const openOverlay = () => {
      modal.showOverlay('passwordless-input');
      return root.getElementById('pwless-submit-btn')?.textContent?.trim();
    };
    return { modal, button, openOverlay };
  }

  it('uses magic link wording by default', () => {
    const { button, openOverlay } = render('magic_link');
    expect(button()).toBe('Continue with Magic Link');
    expect(openOverlay()).toBe('Send Magic Link');
  });

  it('switches to email code wording', () => {
    const { button, openOverlay } = render('email_otp');
    expect(button()).toBe('Continue with email code');
    expect(openOverlay()).toBe('Send code');
  });

  it('uses the locale wording (ko, ja)', () => {
    const ko = render('email_otp', 'ko');
    expect(ko.button()).toBe('이메일 코드로 계속하기');
    expect(ko.openOverlay()).toBe('코드 보내기');
    document.body.innerHTML = '';
    const ja = render('email_otp', 'ja');
    expect(ja.openOverlay()).toBe('コードを送信');
  });
});

describe('provider button wording', () => {
  it('follows the modal language, including languages that put the provider first', async () => {
    const { getProviderButtonConfig } = await import('./providers');
    const { getStrings } = await import('./i18n');
    expect(getProviderButtonConfig('google').label).toBe('Continue with Google');
    expect(getProviderButtonConfig('google', getStrings('en')).label).toBe('Continue with Google');
    expect(getProviderButtonConfig('kakao', getStrings('ko')).label).toBe('Kakao(으)로 계속하기');
    expect(getProviderButtonConfig('google', getStrings('ja')).label).toBe('Googleで続行');
    expect(getProviderButtonConfig('github', getStrings('de')).label).toBe('Weiter mit GitHub');
    expect(getProviderButtonConfig('google', getStrings('tr')).label).toBe('Google ile devam et');
  });
});
