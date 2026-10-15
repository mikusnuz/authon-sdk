import type { WalletConfirmUi } from './types';

export type WalletErrorCode =
  | 'NOT_FOUND'
  | 'NEEDS_RESTORE'
  | 'NOT_PROTECTED'
  | 'PRF_UNSUPPORTED'
  | 'ORIGIN_NOT_ALLOWED'
  | 'USER_CANCELLED'
  | 'TIMEOUT'
  | 'NEEDS_POPUP'
  | 'POPUP_BLOCKED'
  | 'NOT_SIGNED_IN'
  | 'NOT_CONFIGURED'
  | 'UNSUPPORTED_METHOD'
  | 'INVALID_PARAMS'
  | 'DISPOSED'
  /** The last device of an unprotected wallet cannot be revoked (the wallet would be lost). */
  | 'LAST_DEVICE'
  /** This call needs a token from a signed-in session (not an impersonation or unbound BFF token). */
  | 'SESSION_REQUIRED'
  /** The frame could not keep the device key share in this browser's storage. */
  | 'STORAGE_UNAVAILABLE'
  /**
   * A high-risk signature needs the Authon approval window, and it could not be opened
   * (popup blocked, sandboxed iframe). Nothing was signed.
   */
  | 'CONFIRM_WINDOW_BLOCKED'
  /** The Authon approval window was closed (or timed out) before the user approved. Nothing was signed. */
  | 'CONFIRM_WINDOW_CLOSED'
  /** The message or typed data is too long to show in full (over 16,384 characters); the wallet refuses to sign it. */
  | 'MESSAGE_TOO_LARGE'
  /** The wallet API no longer serves this frame version; reload the page. */
  | 'FRAME_OUTDATED'
  /** The new backup passkey did not report a usable public key. */
  | 'BACKUP_KEY_REQUIRED'
  /** upgradeBackup() was called but the backup is already verifiable. */
  | 'ALREADY_UPGRADED'
  | (string & {});

export class AuthonWalletError extends Error {
  readonly code: WalletErrorCode;
  constructor(code: WalletErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AuthonWalletError';
    this.code = code;
  }
}

export type Hex = `0x${string}`;

export interface EmbeddedWalletDevice {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
  current: boolean;
}

export interface EmbeddedWallet {
  address: string;
  /**
   * True once the wallet has a passkey backup (`protect()`). An unprotected wallet
   * exists only as this browser's device share plus the server share: clearing site
   * data, Safari's storage eviction or a lost device makes it unrecoverable. Do not
   * let users receive funds until `protected` is true.
   */
  protected: boolean;
  /** True when the server has a wallet but this browser holds no device share. */
  needsRestore: boolean;
  /**
   * True for a passkey backup made before the wallet stored passkey public keys.
   * Restoring such a backup is less protected; call `upgradeBackup()` from a click
   * on a device where the wallet works (`needsRestore` false).
   */
  backupUpgradeRecommended: boolean;
  devices: EmbeddedWalletDevice[];
}

export type WalletChangeListener = (wallet: EmbeddedWallet | null) => void;

export interface TypedDataPayload {
  domain: Record<string, unknown>;
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
}

export interface WalletTransactionRequest {
  to?: string;
  from?: string;
  value?: string | number | bigint;
  data?: string;
  nonce?: string | number;
  gas?: string | number | bigint;
  gasLimit?: string | number | bigint;
  gasPrice?: string | number | bigint;
  maxFeePerGas?: string | number | bigint;
  maxPriorityFeePerGas?: string | number | bigint;
  chainId?: string | number;
  type?: string | number;
}

export type WalletMessage = string | { raw: string };

export interface EIP1193RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface EIP1193Provider {
  request(args: EIP1193RequestArguments): Promise<unknown>;
}

export interface WalletClientOptions {
  publishableKey: string;
  walletOrigin: string | null;
  /** Resolves a valid session token, refreshing it when needed. */
  getToken: () => Promise<string | null>;
  timeoutMs?: number;
  popupTimeoutMs?: number;
  /** Default appearance of the protect/restore confirmation card. */
  ui?: WalletConfirmUi;
}

interface FrameResponse {
  v: 1;
  id: string;
  ok: boolean;
  result?: unknown;
  error?: { code?: string; message?: string };
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: AuthonWalletError) => void;
  source: () => MessageEventSource | null;
  timer: ReturnType<typeof setTimeout>;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_POPUP_TIMEOUT_MS = 180_000;
const POPUP_FEATURES = 'popup=yes,width=420,height=620';
const FRAME_HIDDEN_STYLE = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;';
/** Full-viewport overlay while the frame shows its confirmation card. */
const FRAME_VISIBLE_STYLE =
  'position:fixed;inset:0;width:100vw;height:100vh;border:0;opacity:1;pointer-events:auto;z-index:2147483647;background:transparent;color-scheme:normal;';

const toError = (error: FrameResponse['error']): AuthonWalletError =>
  new AuthonWalletError(error?.code || 'UNKNOWN', error?.message || error?.code || 'Wallet request failed');

const toBigIntHex = (value: unknown): unknown =>
  typeof value === 'bigint' ? `0x${value.toString(16)}` : value;

export class WalletClient {
  private readonly options: WalletClientOptions;
  private readonly listeners = new Set<WalletChangeListener>();
  private readonly pending = new Map<string, Pending>();
  private iframe: HTMLIFrameElement | null = null;
  private frameReady: Promise<Window> | null = null;
  private abortFrame: ((error: AuthonWalletError) => void) | null = null;
  private listening = false;
  private ensuring: Promise<EmbeddedWallet> | null = null;
  private counter = 0;

  constructor(options: WalletClientOptions) {
    this.options = options;
  }

  async get(): Promise<EmbeddedWallet | null> {
    try {
      return this.normalize(await this.call('wallet.status'));
    } catch (error) {
      if (error instanceof AuthonWalletError && error.code === 'NOT_FOUND') return null;
      throw error;
    }
  }

  ensure(): Promise<EmbeddedWallet> {
    if (this.ensuring) return this.ensuring;
    const run = (async () => {
      const existing = await this.get();
      if (existing) return existing;
      const created = this.normalize(await this.call('wallet.create'));
      if (!created) throw new AuthonWalletError('NOT_FOUND', 'Wallet creation returned no wallet');
      this.notify(created);
      return created;
    })();
    this.ensuring = run;
    const clear = () => { if (this.ensuring === run) this.ensuring = null; };
    run.then(clear, clear);
    return run;
  }

  /** True when the wallet exists and has a passkey backup. See `EmbeddedWallet.protected`. */
  async isProtected(): Promise<boolean> {
    return (await this.get())?.protected === true;
  }

  /**
   * Every signature needs the user's approval; a project can turn this off only in its
   * server-side wallet settings, never from the page.
   * - Low-risk requests (personal messages, typed data that grants nothing) show a card
   *   inside the wallet frame with the requesting site and the full text. Sign is
   *   enabled only after the text was scrolled to the end.
   * - High-risk requests (transactions with value or call data, approvals, permits,
   *   orders, meta-transactions) show a small card whose button opens an Authon window
   *   (`<wallet origin>/confirm`); the user approves there, outside this page. The click
   *   happens inside the frame, so this method does not need to run in a click handler.
   * Rejecting gives USER_CANCELLED; a blocked or closed window gives
   * CONFIRM_WINDOW_BLOCKED / CONFIRM_WINDOW_CLOSED; text over 16,384 characters gives
   * MESSAGE_TOO_LARGE. None of these ever signs.
   */
  async signMessage(message: WalletMessage): Promise<Hex> {
    return this.call<Hex>('wallet.signMessage', { message }, this.interactiveTimeout());
  }

  async signTypedData(typedData: TypedDataPayload): Promise<Hex> {
    return this.call<Hex>('wallet.signTypedData', { typedData }, this.interactiveTimeout());
  }

  async signTransaction(tx: WalletTransactionRequest): Promise<Hex> {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(tx)) normalized[key] = toBigIntHex(value);
    return this.call<Hex>('wallet.signTransaction', { tx: normalized }, this.interactiveTimeout());
  }

  /**
   * Creates a passkey and backs up the wallet. Must be called from a user click
   * handler: the browser only allows the passkey prompt (or the popup fallback)
   * during a user gesture.
   */
  async protect(options: { ui?: WalletConfirmUi } = {}): Promise<void> {
    await this.call('wallet.protect', { ui: options.ui ?? this.options.ui }, this.interactiveTimeout());
    await this.refresh();
  }

  /**
   * Replaces a legacy passkey backup (`backupUpgradeRecommended`) with a new passkey
   * whose public key the server keeps, so later restores are verified by the server.
   * Must be called from a user click handler, on a browser where the wallet works.
   * The key shares are rotated: other devices and sites restore once with the new
   * passkey. Not available in the popup fallback.
   */
  async upgradeBackup(options: { ui?: WalletConfirmUi } = {}): Promise<void> {
    await this.call('wallet.upgradeBackup', { ui: options.ui ?? this.options.ui }, this.interactiveTimeout());
    await this.refresh();
  }

  /**
   * Restores the wallet on this browser with the passkey (one confirmation tap and
   * the system prompt). By default this browser is added as another device and
   * other devices keep working. Pass `resetOtherDevices: true` when a device was
   * lost: the key is re-split and every other device must restore again. The reset
   * card always shows the wallet's own warning text (custom `ui` text is ignored),
   * and reset is not available in the popup fallback.
   */
  async restore(options: { ui?: WalletConfirmUi; resetOtherDevices?: boolean } = {}): Promise<void> {
    await this.call(
      'wallet.restore',
      { ui: options.ui ?? this.options.ui, reset: options.resetOtherDevices === true },
      this.interactiveTimeout(),
    );
    await this.refresh();
  }

  /**
   * Revokes a device. Must run in a browser that holds a trusted device share (the
   * frame signs the request with it). The last device of an unprotected wallet
   * cannot be revoked (LAST_DEVICE).
   */
  async revokeDevice(deviceId: string): Promise<void> {
    await this.call('wallet.revokeDevice', { deviceId });
    await this.refresh();
  }

  onChange(listener: WalletChangeListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  provider(chainId: number): EIP1193Provider {
    const hexChainId = `0x${chainId.toString(16)}`;
    const unsupported = (method: string) =>
      Object.assign(new AuthonWalletError('UNSUPPORTED_METHOD', `Method ${method} is not supported`), { code: 4200 });
    return {
      request: async ({ method, params }) => {
        const list = Array.isArray(params) ? params : [];
        switch (method) {
          case 'eth_chainId':
            return hexChainId;
          case 'eth_accounts': {
            const wallet = await this.get();
            return wallet ? [wallet.address] : [];
          }
          case 'eth_requestAccounts':
            return [(await this.ensure()).address];
          case 'personal_sign': {
            const data = list[0];
            if (typeof data !== 'string') throw new AuthonWalletError('INVALID_PARAMS', 'personal_sign requires a message');
            return this.signMessage({ raw: data });
          }
          case 'eth_signTypedData_v4': {
            const raw = list[1];
            const typed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!typed || typeof typed !== 'object') throw new AuthonWalletError('INVALID_PARAMS', 'eth_signTypedData_v4 requires typed data');
            return this.signTypedData(typed as TypedDataPayload);
          }
          case 'eth_signTransaction': {
            const tx = list[0];
            if (!tx || typeof tx !== 'object') throw new AuthonWalletError('INVALID_PARAMS', 'eth_signTransaction requires a transaction');
            return this.signTransaction({ chainId: hexChainId, ...(tx as WalletTransactionRequest) });
          }
          default:
            throw unsupported(method);
        }
      },
    };
  }

  /** Removes the frame and rejects in-flight requests. Called on sign-out. */
  dispose(): void {
    for (const [id, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(new AuthonWalletError('DISPOSED', 'Wallet was disposed'));
      this.pending.delete(id);
    }
    if (this.listening && typeof window !== 'undefined') window.removeEventListener('message', this.onMessage);
    this.listening = false;
    this.abortFrame?.(new AuthonWalletError('DISPOSED', 'Wallet was disposed'));
    this.abortFrame = null;
    this.iframe?.remove();
    this.iframe = null;
    this.frameReady = null;
    this.ensuring = null;
    this.notify(null);
  }

  private async refresh(): Promise<void> {
    const wallet = await this.get();
    this.notify(wallet);
  }

  private notify(wallet: EmbeddedWallet | null): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(wallet);
      } catch {
        // Listener failures must not affect wallet operations.
      }
    }
  }

  private normalize(result: unknown): EmbeddedWallet | null {
    if (!result || typeof result !== 'object') return null;
    const raw = result as Partial<EmbeddedWallet> & { exists?: boolean };
    if (raw.exists === false || typeof raw.address !== 'string') return null;
    return {
      address: raw.address,
      protected: !!raw.protected,
      needsRestore: !!raw.needsRestore,
      backupUpgradeRecommended: !!raw.backupUpgradeRecommended,
      devices: Array.isArray(raw.devices) ? raw.devices : [],
    };
  }

  private requireOrigin(): string {
    if (!this.options.walletOrigin) {
      throw new AuthonWalletError('NOT_CONFIGURED', "Set wallet.origin in AuthonConfig when using a custom apiUrl");
    }
    return this.options.walletOrigin;
  }

  private frameUrl(path: 'frame' | 'passkey'): string {
    const origin = this.requireOrigin();
    const url = new URL(`/${path}`, origin);
    url.searchParams.set('pk', this.options.publishableKey);
    url.searchParams.set('origin', window.location.origin);
    return url.toString();
  }

  private ensureFrame(): Promise<Window> {
    if (this.frameReady) return this.frameReady;
    const src = this.frameUrl('frame');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('allow', 'publickey-credentials-create; publickey-credentials-get');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.title = 'Authon wallet';
    iframe.style.cssText = FRAME_HIDDEN_STYLE;
    this.iframe = iframe;
    this.listen();
    this.frameReady = new Promise<Window>((resolve, reject) => {
      this.abortFrame = reject;
      const timer = setTimeout(() => reject(new AuthonWalletError('TIMEOUT', 'Wallet frame did not load')), this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
      iframe.addEventListener('load', () => {
        clearTimeout(timer);
        if (iframe.contentWindow) resolve(iframe.contentWindow);
        else reject(new AuthonWalletError('NOT_CONFIGURED', 'Wallet frame has no window'));
      }, { once: true });
    });
    this.frameReady.catch(() => {
      if (this.iframe === iframe) {
        iframe.remove();
        this.iframe = null;
        this.frameReady = null;
      }
    });
    iframe.src = src;
    document.body.appendChild(iframe);
    return this.frameReady;
  }

  private setFrameVisible(visible: boolean): void {
    const iframe = this.iframe;
    if (!iframe) return;
    iframe.style.cssText = visible ? FRAME_VISIBLE_STYLE : FRAME_HIDDEN_STYLE;
    if (visible) {
      iframe.removeAttribute('aria-hidden');
      iframe.tabIndex = 0;
      iframe.focus();
    } else {
      iframe.setAttribute('aria-hidden', 'true');
      iframe.tabIndex = -1;
    }
  }

  private listen(): void {
    if (this.listening) return;
    window.addEventListener('message', this.onMessage);
    this.listening = true;
  }

  private onMessage = (event: MessageEvent): void => {
    if (event.origin !== this.options.walletOrigin) return;
    const ui = event.data as { v?: unknown; type?: unknown; state?: unknown } | null;
    if (ui && ui.v === 1 && ui.type === 'wallet.ui') {
      if (this.iframe && event.source === this.iframe.contentWindow) this.setFrameVisible(ui.state === 'show');
      return;
    }
    const data = event.data as Partial<FrameResponse> | null;
    if (!data || data.v !== 1 || typeof data.id !== 'string') return;
    const entry = this.pending.get(data.id);
    if (!entry) return;
    const expected = entry.source();
    if (expected && event.source !== expected) return;
    this.pending.delete(data.id);
    clearTimeout(entry.timer);
    if (data.ok) entry.resolve(data.result);
    else entry.reject(toError(data.error));
  };

  private send<T>(target: () => Window | null, post: Window, type: string, payload: Record<string, unknown>, timeoutMs: number): Promise<T> {
    const id = `w${Date.now().toString(36)}${(this.counter++).toString(36)}`;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new AuthonWalletError('TIMEOUT', `Wallet request ${type} timed out`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        source: target,
        timer,
      });
      post.postMessage({ v: 1, id, type, payload }, this.requireOrigin());
    });
  }

  /** Signing, protect, restore and upgrade wait for a person (in the frame or the Authon window). */
  private interactiveTimeout(): number {
    return this.options.popupTimeoutMs ?? DEFAULT_POPUP_TIMEOUT_MS;
  }

  private async call<T = unknown>(type: string, extra: Record<string, unknown> = {}, timeoutMs?: number): Promise<T> {
    const token = await this.options.getToken();
    if (!token) throw new AuthonWalletError('NOT_SIGNED_IN', 'Sign in before using the wallet');
    const payload = { ...extra, token };
    const frame = await this.ensureFrame();
    try {
      return await this.send<T>(() => frame, frame, type, payload, timeoutMs ?? this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    } catch (error) {
      if (error instanceof AuthonWalletError && error.code === 'NEEDS_POPUP') {
        return this.callViaPopup<T>(type, payload);
      }
      throw error;
    }
  }

  private async callViaPopup<T>(type: string, payload: Record<string, unknown>): Promise<T> {
    const popup = window.open(this.frameUrl('passkey'), 'authon-wallet', POPUP_FEATURES);
    if (!popup) throw new AuthonWalletError('POPUP_BLOCKED', 'Call this from a user click so the passkey window can open');
    const popupTimeout = this.options.popupTimeoutMs ?? DEFAULT_POPUP_TIMEOUT_MS;
    try {
      await this.waitForPopupReady(popup, popupTimeout);
      const request = this.send<T>(() => popup, popup, type, payload, popupTimeout);
      const closed = new Promise<never>((_, reject) => {
        const poll = setInterval(() => {
          if (popup.closed) {
            clearInterval(poll);
            reject(new AuthonWalletError('USER_CANCELLED', 'Passkey window was closed'));
          }
        }, 500);
        request.then(() => clearInterval(poll), () => clearInterval(poll));
      });
      return await Promise.race([request, closed]);
    } finally {
      if (!popup.closed) popup.close();
    }
  }

  private waitForPopupReady(popup: Window, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const done = (fn: () => void) => {
        clearTimeout(timer);
        clearInterval(poll);
        window.removeEventListener('message', handler);
        fn();
      };
      const handler = (event: MessageEvent) => {
        if (event.origin !== this.options.walletOrigin || event.source !== popup) return;
        const data = event.data as { v?: number; type?: string } | null;
        if (data?.v === 1 && data.type === 'wallet.ready') done(resolve);
      };
      const timer = setTimeout(() => done(() => reject(new AuthonWalletError('TIMEOUT', 'Passkey window did not respond'))), timeoutMs);
      const poll = setInterval(() => {
        if (popup.closed) done(() => reject(new AuthonWalletError('USER_CANCELLED', 'Passkey window was closed')));
      }, 500);
      window.addEventListener('message', handler);
    });
  }
}
