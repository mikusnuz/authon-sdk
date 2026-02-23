import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import { DEFAULT_BRANDING } from '@authon/shared';
import { getProviderButtonConfig } from './providers';

export class ModalRenderer {
  private shadowRoot: ShadowRoot | null = null;
  private hostElement: HTMLDivElement | null = null;
  private containerElement: HTMLElement | null = null;
  private mode: 'popup' | 'embedded';
  private theme: 'light' | 'dark' | 'auto';
  private branding: BrandingConfig;
  private enabledProviders: OAuthProviderType[] = [];
  private currentView: 'signIn' | 'signUp' = 'signIn';
  private onProviderClick: (provider: OAuthProviderType) => void;
  private onEmailSubmit: (email: string, password: string, isSignUp: boolean) => void;
  private onClose: () => void;
  private escHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: {
    mode: 'popup' | 'embedded';
    theme?: 'light' | 'dark' | 'auto';
    containerId?: string;
    branding?: BrandingConfig;
    onProviderClick: (provider: OAuthProviderType) => void;
    onEmailSubmit: (email: string, password: string, isSignUp: boolean) => void;
    onClose: () => void;
  }) {
    this.mode = options.mode;
    this.theme = options.theme || 'auto';
    this.branding = { ...DEFAULT_BRANDING, ...options.branding };
    this.onProviderClick = options.onProviderClick;
    this.onEmailSubmit = options.onEmailSubmit;
    this.onClose = options.onClose;

    if (options.mode === 'embedded' && options.containerId) {
      this.containerElement = document.getElementById(options.containerId);
    }
  }

  setProviders(providers: OAuthProviderType[]): void {
    this.enabledProviders = providers;
  }

  setBranding(branding: BrandingConfig): void {
    this.branding = { ...DEFAULT_BRANDING, ...branding };
  }

  open(view: 'signIn' | 'signUp' = 'signIn'): void {
    if (this.shadowRoot && this.hostElement) {
      // Modal already open — smooth in-place view switch
      this.switchView(view);
    } else {
      this.currentView = view;
      this.render(view);
    }
  }

  close(): void {
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
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

  // ── Smooth view switch (no flicker) ──

  private switchView(view: 'signIn' | 'signUp'): void {
    if (!this.shadowRoot || view === this.currentView) return;
    this.currentView = view;

    const inner = this.shadowRoot.getElementById('modal-inner');
    if (!inner) return;

    // Cross-fade: fade out → update → fade in
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
    } else if (this.containerElement) {
      this.containerElement.appendChild(host);
    }

    this.shadowRoot = host.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.buildShell(view);
    this.attachInnerEvents(view);
    this.attachShellEvents();
  }

  // ── HTML builders ──

  /** Shell = style + backdrop + modal-container (stable across view switches) */
  private buildShell(view: 'signIn' | 'signUp'): string {
    const popupWrapper =
      this.mode === 'popup'
        ? `<div class="backdrop" id="backdrop"></div>`
        : '';

    return `
      <style>${this.buildCSS()}</style>
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
      <p class="switch-view">${subtitle} <a href="#" id="switch-link">${subtitleLink}</a></p>
      ${footer}
      ${b.showSecuredBy !== false ? `<div class="secured-by">Secured by <a href="https://authon.dev" target="_blank" rel="noopener noreferrer" class="secured-link">Authon</a></div>` : ''}
    `;
  }

  private isDark(): boolean {
    if (this.theme === 'dark') return true;
    if (this.theme === 'light') return false;
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
        --authon-radius: ${b.borderRadius ?? 12}px;
        --authon-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-family: var(--authon-font);
        color: var(--authon-text);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .backdrop {
        position: fixed; inset: 0; z-index: 99998;
        background: rgba(0,0,0,${dark ? '0.7' : '0.5'}); backdrop-filter: blur(4px);
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
      /* Loading overlay */
      #authon-loading-overlay {
        position: absolute; inset: 0; z-index: 10;
        background: ${dark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)'};
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
      ${b.customCss || ''}
    `;
  }

  // ── Event binding ──

  /** Attach events to shell elements (backdrop, ESC) — called once */
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
        if (e.key === 'Escape') this.onClose();
      };
      document.addEventListener('keydown', this.escHandler);
    }
  }

  /** Attach events to inner content (buttons, form, switch link) — called on each view */
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

    // Back button (signUp → signIn)
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
  }
}
