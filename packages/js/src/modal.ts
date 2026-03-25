import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import { DEFAULT_BRANDING } from '@authon/shared';
import { getProviderButtonConfig } from './providers';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const WALLET_OPTIONS = [
  { id: 'pexus', name: 'Pexus', color: '#7c3aed' },
  { id: 'metamask', name: 'MetaMask', color: '#f6851b' },
  { id: 'phantom', name: 'Phantom', color: '#ab9ff2' },
] as const;

function walletIconSvg(id: string): string {
  switch (id) {
    case 'pexus':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#7c3aed"/><path d="M7 8h4v8H7V8zm6 0h4v8h-4V8z" fill="#fff"/></svg>`;
    case 'metamask':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#f6851b"/><path d="M17.2 4L12 8.5l1 .7L17.2 4zM6.8 4l5.1 5.3-1-0.6L6.8 4zM16 16.2l-1.4 2.1 3 .8.8-2.9h-2.4zM5.6 16.2l.9 2.8 3-.8-1.4-2h-2.5z" fill="#fff"/></svg>`;
    case 'phantom':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#ab9ff2"/><circle cx="9" cy="11" r="1.5" fill="#fff"/><circle cx="15" cy="11" r="1.5" fill="#fff"/><path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6v2c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-2z" stroke="#fff" stroke-width="1.5" fill="none"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#666"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="12">${id[0]?.toUpperCase() ?? 'W'}</text></svg>`;
  }
}

export class ModalRenderer {
  private shadowRoot: ShadowRoot | null = null;
  private hostElement: HTMLDivElement | null = null;
  private containerElement: HTMLElement | null = null;
  private containerId: string | null = null;
  private mode: 'popup' | 'embedded';
  private theme: 'light' | 'dark' | 'auto';
  private branding: BrandingConfig;
  private themeObserver: MutationObserver | null = null;
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;
  private enabledProviders: OAuthProviderType[] = [];
  private currentView: 'signIn' | 'signUp' = 'signIn';
  private onProviderClick: (provider: OAuthProviderType) => void;
  private onEmailSubmit: (email: string, password: string, isSignUp: boolean) => void;
  private onClose: () => void;
  private onWeb3WalletSelect: (wallet: string) => void;
  private onPasswordlessSubmit: (email: string) => void;
  private onOtpVerify: (email: string, code: string) => void;
  private onPasskeyClick: () => void;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;

  // Overlay state
  private currentOverlay: string = 'none';
  private selectedWallet: string = '';
  private overlayEmail: string = '';
  private overlayError: string = '';

  // Turnstile CAPTCHA
  private captchaSiteKey: string = '';
  private turnstileWidgetId: string | null = null;
  private turnstileToken: string = '';
  private turnstileWrapper: HTMLDivElement | null = null;

  constructor(options: {
    mode: 'popup' | 'embedded';
    theme?: 'light' | 'dark' | 'auto';
    containerId?: string;
    branding?: BrandingConfig;
    captchaSiteKey?: string;
    onProviderClick: (provider: OAuthProviderType) => void;
    onEmailSubmit: (email: string, password: string, isSignUp: boolean) => void;
    onClose: () => void;
    onWeb3WalletSelect?: (wallet: string) => void;
    onPasswordlessSubmit?: (email: string) => void;
    onOtpVerify?: (email: string, code: string) => void;
    onPasskeyClick?: () => void;
  }) {
    this.mode = options.mode;
    this.theme = options.theme || 'auto';
    this.branding = { ...DEFAULT_BRANDING, ...options.branding };
    this.captchaSiteKey = options.captchaSiteKey || '';
    this.onProviderClick = options.onProviderClick;
    this.onEmailSubmit = options.onEmailSubmit;
    this.onClose = options.onClose;
    this.onWeb3WalletSelect = options.onWeb3WalletSelect || (() => {});
    this.onPasswordlessSubmit = options.onPasswordlessSubmit || (() => {});
    this.onOtpVerify = options.onOtpVerify || (() => {});
    this.onPasskeyClick = options.onPasskeyClick || (() => {});

    if (options.mode === 'embedded' && options.containerId) {
      this.containerId = options.containerId;
    }
  }

  private resolveContainerElement(): HTMLElement | null {
    if (this.mode !== 'embedded' || !this.containerId) return null;
    const next = document.getElementById(this.containerId);
    if (this.containerElement !== next) {
      // Container changed (SPA navigation) — discard stale mount
      this.hostElement?.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    this.containerElement = next;
    return next;
  }

  setProviders(providers: OAuthProviderType[]): void {
    this.enabledProviders = providers;
  }

  setBranding(branding: BrandingConfig): void {
    this.branding = { ...DEFAULT_BRANDING, ...branding };
  }

  open(view: 'signIn' | 'signUp' = 'signIn'): void {
    this.resolveContainerElement();

    if (this.hostElement && !this.hostElement.isConnected) {
      this.hostElement = null;
      this.shadowRoot = null;
    }

    if (this.shadowRoot && this.hostElement) {
      // Modal already open — smooth in-place view switch
      this.hideOverlay();
      this.switchView(view);
    } else {
      this.currentView = view;
      this.currentOverlay = 'none';
      this.render(view);
    }
  }

  close(): void {
    this.stopThemeObserver();
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
    // Cleanup turnstile
    if (this.turnstileWidgetId !== null) {
      (window as any).turnstile?.remove(this.turnstileWidgetId);
      this.turnstileWidgetId = null;
      this.turnstileToken = '';
    }
    if (this.turnstileWrapper) {
      this.turnstileWrapper.remove();
      this.turnstileWrapper = null;
    }
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    const liveContainer = this.resolveContainerElement();
    if (liveContainer) {
      liveContainer.replaceChildren();
    }
    this.currentOverlay = 'none';
  }

  getTurnstileToken(): string {
    return this.turnstileToken;
  }

  resetTurnstile(): void {
    if (this.turnstileWidgetId !== null) {
      (window as any).turnstile?.reset(this.turnstileWidgetId);
      this.turnstileToken = '';
    }
  }

  /** Update theme at runtime without destroying form state */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.theme = theme;
    this.updateThemeCSS();
    if (theme === 'auto') {
      this.startThemeObserver();
    } else {
      this.stopThemeObserver();
    }
  }

  private updateThemeCSS(): void {
    if (!this.shadowRoot) return;
    const styleEl = this.shadowRoot.getElementById('authon-theme-style');
    if (styleEl) {
      styleEl.textContent = this.buildCSS();
    }
  }

  private startThemeObserver(): void {
    this.stopThemeObserver();
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    // Watch for data-theme / class changes on <html>
    this.themeObserver = new MutationObserver(() => this.updateThemeCSS());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    // Watch for OS-level prefers-color-scheme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = () => this.updateThemeCSS();
    mq.addEventListener('change', this.mediaQueryListener);
  }

  private stopThemeObserver(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.mediaQueryListener) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }
  }

  showError(message: string): void {
    if (!this.shadowRoot) return;
    this.clearError();
    const errorEl = this.shadowRoot.getElementById('email-form');
    if (errorEl) {
      const errDiv = document.createElement('div');
      errDiv.id = 'authon-error-msg';
      errDiv.className = 'error-msg';
      errDiv.textContent = message;
      errorEl.appendChild(errDiv);
    }
  }

  showBanner(message: string, type: 'error' | 'warning' = 'error'): void {
    if (!this.shadowRoot) return;
    this.clearBanner();
    const inner = this.shadowRoot.getElementById('modal-inner');
    if (!inner) return;
    const banner = document.createElement('div');
    banner.id = 'authon-banner';
    banner.className = type === 'warning' ? 'banner-warning' : 'error-msg';
    banner.textContent = message;
    inner.insertBefore(banner, inner.firstChild);
  }

  clearBanner(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById('authon-banner')?.remove();
  }

  clearError(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById('authon-error-msg')?.remove();
  }

  showLoading(): void {
    if (!this.shadowRoot) return;
    this.hideLoading();
    const overlay = document.createElement('div');
    overlay.id = 'authon-loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="loading-ring"></div>
        <div class="loading-ring"></div>
        <div class="loading-ring"></div>
      </div>
      <div class="loading-text">Signing in<span class="loading-dots"><span></span><span></span><span></span></span></div>
    `;
    this.shadowRoot.querySelector('.modal-container')?.appendChild(overlay);
  }

  hideLoading(): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById('authon-loading-overlay')?.remove();
  }

  // ── Flow Overlay Public API ──

  showOverlay(overlay: string): void {
    this.currentOverlay = overlay;
    this.overlayError = '';
    this.renderOverlay();
  }

  hideOverlay(): void {
    this.currentOverlay = 'none';
    this.overlayError = '';
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById('flow-overlay')?.remove();
  }

  showWeb3Success(walletId: string, address: string): void {
    this.selectedWallet = walletId;
    this.overlayError = '';
    // Store truncated address for rendering
    const truncated = address.length > 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;
    this.currentOverlay = 'web3-success';
    this.renderOverlayWithData({ truncatedAddress: truncated, walletId });
  }

  showPasswordlessSent(): void {
    this.overlayError = '';
    this.currentOverlay = 'passwordless-sent';
    this.renderOverlay();
  }

  showOtpInput(email: string): void {
    this.overlayEmail = email;
    this.overlayError = '';
    this.currentOverlay = 'otp-input';
    this.renderOverlay();
  }

  showPasskeySuccess(): void {
    this.overlayError = '';
    this.currentOverlay = 'passkey-success';
    this.renderOverlay();
  }

  showOverlayError(message: string): void {
    this.overlayError = message;
    // Re-render the current overlay with the error displayed
    if (this.currentOverlay !== 'none') {
      this.renderOverlay();
    }
  }

  // ── Smooth view switch (no flicker) ──

  private switchView(view: 'signIn' | 'signUp'): void {
    if (!this.shadowRoot || view === this.currentView) return;
    this.currentView = view;

    const inner = this.shadowRoot.getElementById('modal-inner');
    if (!inner) return;

    // Cross-fade: fade out -> update -> fade in
    inner.style.opacity = '0';
    inner.style.transform = 'translateY(-4px)';

    setTimeout(() => {
      inner.innerHTML = this.buildInnerContent(view);
      this.attachInnerEvents(view);
      // Trigger reflow, then animate in
      void inner.offsetHeight;
      inner.style.opacity = '1';
      inner.style.transform = 'translateY(0)';
    }, 140);
  }

  // ── Render ──

  private render(view: 'signIn' | 'signUp'): void {
    const host = document.createElement('div');
    host.setAttribute('data-authon-modal', '');
    this.hostElement = host;

    if (this.mode === 'popup') {
      document.body.appendChild(host);
    } else {
      const container = this.resolveContainerElement();
      if (!container) {
        this.hostElement = null;
        throw new Error(`Authon container "#${this.containerId}" not found`);
      }
      container.replaceChildren();
      container.appendChild(host);
    }

    this.shadowRoot = host.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.buildShell(view);
    this.attachInnerEvents(view);
    this.attachShellEvents();

    // Start observing theme changes in auto mode
    if (this.theme === 'auto') {
      this.startThemeObserver();
    }
  }

  // ── HTML builders ──

  /** Shell = style + backdrop + modal-container (stable across view switches) */
  private buildShell(view: 'signIn' | 'signUp'): string {
    const popupWrapper =
      this.mode === 'popup'
        ? `<div class="backdrop" id="backdrop"></div>`
        : '';

    return `
      <style id="authon-theme-style">${this.buildCSS()}</style>
      ${popupWrapper}
      <div class="modal-container" role="dialog" aria-modal="true">
        <div id="modal-inner" class="modal-inner">
          ${this.buildInnerContent(view)}
        </div>
      </div>
    `;
  }

  /** Inner content = everything inside the modal that changes per view */
  private buildInnerContent(view: 'signIn' | 'signUp'): string {
    const b = this.branding;
    const isSignUp = view === 'signUp';
    const title = isSignUp ? 'Create your account' : 'Welcome back';
    const subtitle = isSignUp ? 'Already have an account?' : "Don't have an account?";
    const subtitleLink = isSignUp ? 'Sign in' : 'Sign up';

    const dark = this.isDark();

    // SignUp view: hide providers, show only email form
    const showProviders = !isSignUp;

    const providerButtons = showProviders
      ? this.enabledProviders
          .filter((p) => !b.hiddenProviders?.includes(p))
          .map((p) => {
            const config = getProviderButtonConfig(p);
            const isWhiteBg = config.bgColor === '#ffffff';
            const btnBg = dark && isWhiteBg ? '#f8fafc' : config.bgColor;
            const btnBorder = isWhiteBg ? (dark ? '#475569' : '#e5e7eb') : config.bgColor;
            return `<button class="provider-btn" data-provider="${p}" style="background:${btnBg};color:${config.textColor};border:1px solid ${btnBorder}">
              <span class="provider-icon">${config.iconSvg}</span>
              <span>${config.label}</span>
            </button>`;
          })
          .join('')
      : '';

    const divider =
      showProviders && b.showDivider !== false && b.showEmailPassword !== false
        ? `<div class="divider"><span>or</span></div>`
        : '';

    const emailForm =
      b.showEmailPassword !== false
        ? `<form class="email-form" id="email-form">
          <input type="email" placeholder="Email address" name="email" required class="input" autocomplete="email" />
          <input type="password" placeholder="Password" name="password" required class="input" autocomplete="${isSignUp ? 'new-password' : 'current-password'}" />
          ${isSignUp ? '<p class="password-hint">Must contain uppercase, lowercase, and a number (min 8 chars)</p>' : ''}
          <button type="submit" class="submit-btn">${isSignUp ? 'Sign up' : 'Sign in'}</button>
        </form>`
        : '';

    // Auth method divider and buttons (Web3, Passwordless, Passkey)
    const hasMethodAbove = (showProviders && this.enabledProviders.length > 0) || b.showEmailPassword !== false;
    const hasMethodBelow = b.showWeb3 || b.showPasswordless || b.showPasskey;
    const methodDivider = hasMethodAbove && hasMethodBelow
      ? `<div class="divider"><span>or</span></div>`
      : '';

    const methodButtons: string[] = [];
    if (b.showWeb3) {
      methodButtons.push(`<button class="auth-method-btn web3-btn" id="web3-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
        </svg>
        <span>Connect Wallet</span>
      </button>`);
    }
    if (b.showPasswordless) {
      methodButtons.push(`<button class="auth-method-btn passwordless-btn" id="passwordless-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <span>Continue with Magic Link</span>
      </button>`);
    }
    if (b.showPasskey) {
      methodButtons.push(`<button class="auth-method-btn passkey-btn" id="passkey-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/><path d="M21.7 13.3 19 11"/><path d="m21 15-2.5-1.5"/><path d="m17 17 2.5-1.5"/><path d="M22 9v6a1 1 0 0 1-1 1h-.5"/><circle cx="18" cy="9" r="3"/>
        </svg>
        <span>Sign in with Passkey</span>
      </button>`);
    }
    const authMethods = methodButtons.length > 0
      ? `<div class="auth-methods">${methodButtons.join('')}</div>`
      : '';

    const footer =
      b.termsUrl || b.privacyUrl
        ? `<div class="footer">
          ${b.termsUrl ? `<a href="${b.termsUrl}" target="_blank">Terms of Service</a>` : ''}
          ${b.termsUrl && b.privacyUrl ? ' · ' : ''}
          ${b.privacyUrl ? `<a href="${b.privacyUrl}" target="_blank">Privacy Policy</a>` : ''}
        </div>`
        : '';

    const titleHtml = isSignUp
      ? `<div class="title-row">
          <button class="back-btn" id="back-btn" type="button" aria-label="Back to sign in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </button>
          <h2 class="title">${title}</h2>
        </div>`
      : `<h2 class="title">${title}</h2>`;

    return `
      ${b.logoDataUrl ? `<img src="${b.logoDataUrl}" alt="Logo" class="logo" />` : ''}
      ${titleHtml}
      ${b.brandName ? `<p class="brand-name">${b.brandName}</p>` : ''}
      ${showProviders ? `<div class="providers">${providerButtons}</div>` : ''}
      ${divider}
      ${emailForm}
      ${methodDivider}
      ${authMethods}
      <p class="switch-view">${subtitle} <a href="#" id="switch-link">${subtitleLink}</a></p>
      ${footer}
      ${b.showSecuredBy !== false ? `<div class="secured-by">Secured by <a href="https://authon.dev" target="_blank" rel="noopener noreferrer" class="secured-link">Authon</a></div>` : ''}
    `;
  }

  private renderTurnstile(): void {
    if (!this.captchaSiteKey) return;

    const w = window as any;
    const tryRender = () => {
      if (!w.turnstile) return;
      // Render off-screen in real DOM — invisible unless challenge needed
      this.turnstileWrapper = document.createElement('div');
      this.turnstileWrapper.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:2147483647;';
      document.body.appendChild(this.turnstileWrapper);
      this.turnstileWidgetId = w.turnstile.render(this.turnstileWrapper, {
        sitekey: this.captchaSiteKey,
        callback: (token: string) => { this.turnstileToken = token; },
        'expired-callback': () => { this.turnstileToken = ''; },
        'error-callback': () => { this.turnstileToken = ''; },
        theme: this.isDark() ? 'dark' : 'light',
        appearance: 'interaction-only',
      });
    };

    if (w.turnstile) {
      tryRender();
    } else {
      const interval = setInterval(() => {
        if (w.turnstile) {
          clearInterval(interval);
          tryRender();
        }
      }, 200);
      setTimeout(() => clearInterval(interval), 10000);
    }
  }

  private isDark(): boolean {
    if (this.theme === 'dark') return true;
    if (this.theme === 'light') return false;
    // Auto: check host page's <html> class/attribute first, then OS preference
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      if (html.classList.contains('dark') || html.getAttribute('data-theme') === 'dark') return true;
      if (html.classList.contains('light') || html.getAttribute('data-theme') === 'light') return false;
    }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private buildCSS(): string {
    const b = this.branding;
    const dark = this.isDark();
    const bg = dark ? (b.darkBg || '#0f172a') : (b.lightBg || '#ffffff');
    const text = dark ? (b.darkText || '#f1f5f9') : (b.lightText || '#111827');
    const mutedText = dark ? '#94a3b8' : '#6b7280';
    const dimText = dark ? '#64748b' : '#9ca3af';
    const borderColor = dark ? '#334155' : '#d1d5db';
    const dividerColor = dark ? '#334155' : '#e5e7eb';
    const inputBg = dark ? '#1e293b' : '#ffffff';

    return `
      :host {
        --authon-primary-start: ${b.primaryColorStart || '#7c3aed'};
        --authon-primary-end: ${b.primaryColorEnd || '#4f46e5'};
        --authon-bg: ${bg};
        --authon-text: ${text};
        --authon-muted: ${mutedText};
        --authon-dim: ${dimText};
        --authon-border: ${borderColor};
        --authon-divider: ${dividerColor};
        --authon-input-bg: ${inputBg};
        --authon-overlay-bg: ${hexToRgba(bg, 0.92)};
        --authon-overlay-bg-solid: ${hexToRgba(bg, 0.97)};
        --authon-backdrop-bg: rgba(0,0,0,${dark ? '0.7' : '0.5'});
        --authon-shadow-opacity: ${dark ? '0.5' : '0.25'};
        --authon-radius: ${b.borderRadius ?? 12}px;
        --authon-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-family: var(--authon-font);
        color: var(--authon-text);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .backdrop {
        position: fixed; inset: 0; z-index: 99998;
        background: var(--authon-backdrop-bg); backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease;
      }
      .modal-container {
        ${this.mode === 'popup' ? 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; max-height: 90vh; overflow-y: auto;' : ''}
        background: var(--authon-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: var(--authon-radius);
        padding: 32px;
        width: 400px; max-width: 100%;
        position: ${this.mode === 'popup' ? 'fixed' : 'relative'};
        ${this.mode === 'popup' ? `box-shadow: 0 25px 50px -12px rgba(0,0,0,${dark ? '0.5' : '0.25'}); animation: slideIn 0.3s ease;` : ''}
      }
      .modal-inner {
        transition: opacity 0.14s ease, transform 0.14s ease;
      }
      .logo { display: block; margin: 0 auto 16px; max-height: 48px; }
      .title-row { display: flex; align-items: center; position: relative; margin-bottom: 8px; }
      .title-row .title { flex: 1; margin-bottom: 0; }
      .back-btn {
        position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: var(--authon-muted);
        cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .back-btn:hover { color: var(--authon-text); background: var(--authon-divider); }
      .password-hint { font-size: 11px; color: var(--authon-dim); margin: -4px 0 2px; }
      .title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--authon-text); }
      .brand-name { text-align: center; font-size: 14px; color: var(--authon-muted); margin-bottom: 24px; }
      .providers { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
      .provider-btn {
        display: flex; align-items: center; gap: 12px;
        width: 100%; padding: 10px 16px; border-radius: calc(var(--authon-radius) * 0.67);
        font-size: 14px; font-weight: 500; cursor: pointer;
        transition: opacity 0.15s, transform 0.1s;
        font-family: var(--authon-font);
      }
      .provider-btn:hover { opacity: 0.9; }
      .provider-btn:active { transform: scale(0.98); }
      .provider-icon { display: flex; align-items: center; flex-shrink: 0; }
      .divider {
        display: flex; align-items: center; gap: 12px;
        margin: 16px 0; color: var(--authon-dim); font-size: 13px;
      }
      .divider::before, .divider::after {
        content: ''; flex: 1; height: 1px; background: var(--authon-divider);
      }
      .email-form { display: flex; flex-direction: column; gap: 10px; }
      .input {
        width: 100%; padding: 10px 14px;
        background: var(--authon-input-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border); border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-family: var(--authon-font);
        outline: none; transition: border-color 0.15s;
      }
      .input::placeholder { color: var(--authon-dim); }
      .input:focus { border-color: var(--authon-primary-start); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
      .submit-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none; border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .submit-btn:hover { opacity: 0.9; }
      .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .error-msg {
        margin-top: 8px; padding: 8px 12px;
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 13px; color: #ef4444; text-align: center;
        animation: fadeIn 0.15s ease;
      }
      .banner-warning {
        margin-bottom: 16px; padding: 10px 14px;
        background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 13px; color: #f59e0b; text-align: center;
        animation: fadeIn 0.15s ease;
      }
      .switch-view { text-align: center; margin-top: 16px; font-size: 13px; color: var(--authon-muted); }
      .switch-view a { color: var(--authon-primary-start); text-decoration: none; font-weight: 500; }
      .switch-view a:hover { text-decoration: underline; }
      .footer { text-align: center; margin-top: 12px; font-size: 12px; color: var(--authon-dim); }
      .footer a { color: var(--authon-dim); text-decoration: none; }
      .footer a:hover { text-decoration: underline; }
      .secured-by {
        text-align: center; margin-top: 16px;
        font-size: 11px; color: var(--authon-dim);
      }
      .secured-link { font-weight: 600; color: var(--authon-muted); text-decoration: none; }
      .secured-link:hover { text-decoration: underline; }

      /* Auth method buttons */
      .auth-methods { display: flex; flex-direction: column; gap: 8px; }
      .auth-method-btn {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; padding: 10px 16px;
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-weight: 500; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s, transform 0.1s;
      }
      .auth-method-btn:hover { opacity: 0.85; }
      .auth-method-btn:active { transform: scale(0.98); }
      /* Web3 -- purple */
      .web3-btn {
        background: ${dark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)'};
        border: 1px solid ${dark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.25)'};
        color: ${dark ? '#c4b5fd' : '#7c3aed'};
      }
      /* Passwordless -- cyan */
      .passwordless-btn {
        background: ${dark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)'};
        border: 1px solid ${dark ? 'rgba(6,182,212,0.3)' : 'rgba(6,182,212,0.25)'};
        color: ${dark ? '#67e8f9' : '#0891b2'};
      }
      /* Passkey -- amber */
      .passkey-btn {
        background: ${dark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)'};
        border: 1px solid ${dark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.25)'};
        color: ${dark ? '#fcd34d' : '#b45309'};
      }

      /* Flow overlay */
      .flow-overlay {
        position: absolute; inset: 0; z-index: 10;
        background: var(--authon-overlay-bg-solid);
        backdrop-filter: blur(2px);
        border-radius: var(--authon-radius);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 12px; padding: 24px;
        animation: fadeIn 0.2s ease;
      }
      .flow-overlay .cancel-link {
        font-size: 12px; color: var(--authon-dim); cursor: pointer; border: none;
        background: none; font-family: var(--authon-font); margin-top: 4px;
      }
      .flow-overlay .cancel-link:hover { text-decoration: underline; }
      .flow-overlay .overlay-title {
        font-size: 14px; font-weight: 600; color: var(--authon-text); text-align: center;
      }
      .flow-overlay .overlay-subtitle {
        font-size: 12px; color: var(--authon-muted); text-align: center;
      }
      .flow-overlay .overlay-error {
        padding: 6px 12px; margin-top: 4px;
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 12px; color: #ef4444; text-align: center; width: 100%;
      }

      /* Wallet picker */
      .wallet-picker { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .wallet-btn {
        display: flex; align-items: center; gap: 10px;
        width: 100%; padding: 10px 14px;
        background: ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
        border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-weight: 500; color: var(--authon-text);
        cursor: pointer; font-family: var(--authon-font);
        transition: opacity 0.15s;
      }
      .wallet-btn:hover { opacity: 0.8; }
      .wallet-btn .wallet-icon { display: flex; align-items: center; flex-shrink: 0; }
      .wallet-btn .wallet-icon svg { border-radius: 6px; }

      /* Passwordless email input in overlay */
      .pwless-form { display: flex; flex-direction: column; gap: 10px; width: 100%; }
      .pwless-submit {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        color: #fff; border: none; border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .pwless-submit:hover { opacity: 0.9; }
      .pwless-submit:disabled { opacity: 0.6; cursor: not-allowed; }

      /* OTP input */
      .otp-container { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
      .otp-inputs { display: flex; gap: 8px; justify-content: center; }
      .otp-digit {
        width: 40px; height: 48px; text-align: center;
        font-size: 20px; font-weight: 600; font-family: var(--authon-font);
        background: var(--authon-input-bg); color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.33);
        outline: none; transition: border-color 0.15s;
      }
      .otp-digit:focus {
        border-color: var(--authon-primary-start);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
      }

      /* Success check animation */
      .success-check {
        width: 48px; height: 48px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
      }
      .success-check svg path {
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
        animation: check-draw 0.4s ease-out 0.1s forwards;
      }

      /* Spinner */
      .flow-spinner {
        animation: spin 0.8s linear infinite;
      }

      /* Passkey verifying icon */
      .passkey-icon-pulse {
        width: 48px; height: 48px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(245,158,11,0.15);
        animation: pulse 1.5s ease-in-out infinite;
      }

      /* Wallet connecting icon */
      .wallet-connecting-icon {
        width: 48px; height: 48px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        animation: pulse 1.5s ease-in-out infinite;
      }
      .wallet-connecting-icon svg { border-radius: 6px; }

      /* Address badge */
      .address-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 2px 10px; border-radius: 6px;
        background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
        font-size: 11px; font-family: monospace; color: var(--authon-muted);
      }
      .address-badge .wallet-icon-sm svg { width: 16px; height: 16px; border-radius: 4px; }

      /* Loading overlay */
      #authon-loading-overlay {
        position: absolute; inset: 0; z-index: 10;
        background: var(--authon-overlay-bg);
        backdrop-filter: blur(2px);
        border-radius: var(--authon-radius);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;
        animation: fadeIn 0.15s ease;
      }
      .loading-spinner { position: relative; width: 48px; height: 48px; }
      .loading-ring {
        position: absolute; inset: 0;
        border: 2.5px solid transparent; border-top-color: var(--authon-primary-start);
        border-radius: 50%; animation: spin 1s cubic-bezier(.55,.15,.45,.85) infinite;
      }
      .loading-ring:nth-child(2) {
        inset: 5px; border-top-color: transparent; border-right-color: var(--authon-primary-end);
        animation-duration: 1.2s; animation-direction: reverse; opacity: .7;
      }
      .loading-ring:nth-child(3) {
        inset: 10px; border-top-color: transparent; border-bottom-color: var(--authon-primary-start);
        animation-duration: .8s; opacity: .4;
      }
      .loading-text { font-size: 14px; font-weight: 500; color: var(--authon-muted); }
      .loading-dots { display: inline-flex; gap: 2px; margin-left: 2px; }
      .loading-dots span {
        width: 3px; height: 3px; border-radius: 50%;
        background: var(--authon-muted); animation: blink 1.4s infinite both;
      }
      .loading-dots span:nth-child(2) { animation-delay: .2s; }
      .loading-dots span:nth-child(3) { animation-delay: .4s; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes blink { 0%,80%,100% { opacity: .2; } 40% { opacity: 1; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      @keyframes check-draw { to { stroke-dashoffset: 0; } }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
      ${b.customCss || ''}
    `;
  }

  // ── Flow Overlay Rendering ──

  private renderOverlay(): void {
    this.renderOverlayWithData({});
  }

  private renderOverlayWithData(data: Record<string, string>): void {
    if (!this.shadowRoot) return;
    const container = this.shadowRoot.querySelector('.modal-container');
    if (!container) return;

    // Remove existing overlay
    this.shadowRoot.getElementById('flow-overlay')?.remove();

    if (this.currentOverlay === 'none') return;

    const overlay = document.createElement('div');
    overlay.id = 'flow-overlay';
    overlay.className = 'flow-overlay';
    overlay.innerHTML = this.buildOverlayContent(data);
    container.appendChild(overlay);
    this.attachOverlayEvents(overlay);
  }

  private buildOverlayContent(data: Record<string, string>): string {
    const dark = this.isDark();
    const errorHtml = this.overlayError
      ? `<div class="overlay-error">${this.escapeHtml(this.overlayError)}</div>`
      : '';
    // subtitleColor handled by var(--authon-dim) in CSS

    switch (this.currentOverlay) {
      case 'web3-picker': {
        const walletItems = WALLET_OPTIONS.map(w =>
          `<button class="wallet-btn" data-wallet="${w.id}">
            <span class="wallet-icon">${walletIconSvg(w.id)}</span>
            <span>${w.name}</span>
          </button>`
        ).join('');
        return `
          <div class="overlay-title" style="margin-bottom: 4px;">Select Wallet</div>
          <div class="wallet-picker">${walletItems}</div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }

      case 'web3-connecting': {
        const wallet = WALLET_OPTIONS.find(w => w.id === this.selectedWallet);
        const walletName = wallet?.name ?? this.selectedWallet;
        return `
          <div class="wallet-connecting-icon">${walletIconSvg(this.selectedWallet)}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg class="flow-spinner" width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="none" stroke="${wallet?.color ?? '#7c3aed'}" stroke-width="2" opacity="0.25"/>
              <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="${wallet?.color ?? '#7c3aed'}" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="overlay-subtitle">Connecting ${this.escapeHtml(walletName)}...</span>
          </div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }

      case 'web3-success': {
        const wallet = WALLET_OPTIONS.find(w => w.id === (data.walletId || this.selectedWallet));
        const walletColor = wallet?.color ?? '#8b5cf6';
        const truncAddr = data.truncatedAddress || '0x...';
        return `
          <div class="success-check" style="background:linear-gradient(135deg, ${walletColor}, ${walletColor})">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">Wallet Connected</div>
          <div class="address-badge">
            <span class="wallet-icon-sm">${walletIconSvg(data.walletId || this.selectedWallet)}</span>
            <span>${this.escapeHtml(truncAddr)}</span>
          </div>
        `;
      }

      case 'passwordless-input': {
        return `
          <div class="overlay-title">Enter your email</div>
          <div class="pwless-form">
            <input type="email" placeholder="you@example.com" class="input" id="pwless-email" autocomplete="email" />
            <button class="pwless-submit" id="pwless-submit-btn">Send Magic Link</button>
          </div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }

      case 'passwordless-sending': {
        return `
          <svg class="flow-spinner" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" opacity="0.25"/>
            <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="overlay-subtitle">Sending magic link...</span>
        `;
      }

      case 'passwordless-sent': {
        return `
          <div class="success-check" style="background:linear-gradient(135deg, var(--authon-primary-start, #7c3aed), var(--authon-primary-end, #4f46e5))">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">Magic link sent!</div>
          <span class="overlay-subtitle">Check your email inbox</span>
        `;
      }

      case 'otp-input': {
        const digitInputs = Array.from({ length: 6 }, (_, i) =>
          `<input type="text" inputmode="numeric" maxlength="1" class="otp-digit" data-idx="${i}" autocomplete="one-time-code" />`
        ).join('');
        return `
          <div class="otp-container">
            <div class="overlay-title">Enter verification code</div>
            <span class="overlay-subtitle">6-digit code sent to ${this.escapeHtml(this.overlayEmail)}</span>
            <div class="otp-inputs">${digitInputs}</div>
            ${errorHtml}
            <button class="cancel-link" id="overlay-cancel">Cancel</button>
          </div>
        `;
      }

      case 'passkey-verifying': {
        return `
          <div class="passkey-icon-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/>
              <path d="M21.7 13.3 19 11"/><path d="m21 15-2.5-1.5"/><path d="m17 17 2.5-1.5"/>
              <path d="M22 9v6a1 1 0 0 1-1 1h-.5"/><circle cx="18" cy="9" r="3"/>
            </svg>
          </div>
          <span class="overlay-subtitle">Verifying identity...</span>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }

      case 'passkey-success': {
        return `
          <div class="success-check" style="background:linear-gradient(135deg, var(--authon-primary-start, #7c3aed), var(--authon-primary-end, #4f46e5))">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">Identity verified!</div>
        `;
      }

      default:
        return '';
    }
  }

  private attachOverlayEvents(overlay: HTMLElement): void {
    if (!this.shadowRoot) return;

    // Cancel button
    const cancelBtn = overlay.querySelector('#overlay-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideOverlay());
    }

    // Wallet buttons
    overlay.querySelectorAll('.wallet-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const walletId = (btn as HTMLElement).dataset.wallet;
        if (walletId) {
          this.selectedWallet = walletId;
          this.onWeb3WalletSelect(walletId);
        }
      });
    });

    // Passwordless form submit
    const pwlessSubmit = overlay.querySelector('#pwless-submit-btn');
    const pwlessEmail = overlay.querySelector('#pwless-email') as HTMLInputElement | null;
    if (pwlessSubmit && pwlessEmail) {
      // Focus email input
      setTimeout(() => pwlessEmail.focus(), 50);

      const submitHandler = () => {
        const email = pwlessEmail.value.trim();
        if (!email) return;
        this.overlayEmail = email;
        this.showOverlay('passwordless-sending');
        this.onPasswordlessSubmit(email);
      };
      pwlessSubmit.addEventListener('click', submitHandler);
      pwlessEmail.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitHandler();
        }
      });
    }

    // OTP inputs
    const otpDigits = overlay.querySelectorAll('.otp-digit') as NodeListOf<HTMLInputElement>;
    if (otpDigits.length === 6) {
      // Auto-focus first digit
      setTimeout(() => otpDigits[0].focus(), 50);

      otpDigits.forEach((digit, idx) => {
        // Only allow digits
        digit.addEventListener('input', () => {
          const val = digit.value.replace(/\D/g, '');
          digit.value = val.slice(0, 1);

          if (val && idx < 5) {
            otpDigits[idx + 1].focus();
          }

          // Check if all filled -> auto-submit
          const code = Array.from(otpDigits).map(d => d.value).join('');
          if (code.length === 6) {
            this.onOtpVerify(this.overlayEmail, code);
          }
        });

        // Backspace: move to previous
        digit.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Backspace' && !digit.value && idx > 0) {
            otpDigits[idx - 1].focus();
            otpDigits[idx - 1].value = '';
          }
        });

        // Paste support: fill all 6 from clipboard
        digit.addEventListener('paste', (e: ClipboardEvent) => {
          e.preventDefault();
          const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
          if (pasted.length === 0) return;
          for (let i = 0; i < 6; i++) {
            otpDigits[i].value = pasted[i] || '';
          }
          // Focus last filled or next empty
          const lastIdx = Math.min(pasted.length, 5);
          otpDigits[lastIdx].focus();

          // Auto-submit if full code pasted
          if (pasted.length === 6) {
            this.onOtpVerify(this.overlayEmail, pasted);
          }
        });
      });
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Event binding ──

  /** Attach events to shell elements (backdrop, ESC) -- called once */
  private attachShellEvents(): void {
    if (!this.shadowRoot) return;

    const backdrop = this.shadowRoot.getElementById('backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.onClose());
    }

    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
    }
    if (this.mode === 'popup') {
      this.escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (this.currentOverlay !== 'none') {
            this.hideOverlay();
          } else {
            this.onClose();
          }
        }
      };
      document.addEventListener('keydown', this.escHandler);
    }
  }

  /** Attach events to inner content (buttons, form, switch link) -- called on each view */
  private attachInnerEvents(view: 'signIn' | 'signUp'): void {
    if (!this.shadowRoot) return;

    // Provider buttons
    this.shadowRoot.querySelectorAll('.provider-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const provider = (btn as HTMLElement).dataset.provider as OAuthProviderType;
        this.onProviderClick(provider);
      });
    });

    // Email form
    const form = this.shadowRoot.getElementById('email-form') as HTMLFormElement | null;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        this.onEmailSubmit(
          formData.get('email') as string,
          formData.get('password') as string,
          view === 'signUp',
        );
      });
    }

    // Turnstile CAPTCHA
    this.renderTurnstile();

    // Back button (signUp -> signIn)
    const backBtn = this.shadowRoot.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.open('signIn');
      });
    }

    // Switch view link
    const switchLink = this.shadowRoot.getElementById('switch-link');
    if (switchLink) {
      switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.open(view === 'signIn' ? 'signUp' : 'signIn');
      });
    }

    // Web3 button
    const web3Btn = this.shadowRoot.getElementById('web3-btn');
    if (web3Btn) {
      web3Btn.addEventListener('click', () => this.showOverlay('web3-picker'));
    }

    // Passwordless button
    const pwlessBtn = this.shadowRoot.getElementById('passwordless-btn');
    if (pwlessBtn) {
      pwlessBtn.addEventListener('click', () => this.showOverlay('passwordless-input'));
    }

    // Passkey button
    const passkeyBtn = this.shadowRoot.getElementById('passkey-btn');
    if (passkeyBtn) {
      passkeyBtn.addEventListener('click', () => this.onPasskeyClick());
    }
  }
}
