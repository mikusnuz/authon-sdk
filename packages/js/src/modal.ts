import type { BrandingConfig, OAuthProviderType } from '@authon/shared';
import { DEFAULT_BRANDING } from '@authon/shared';
import { getProviderButtonConfig } from './providers';

export class ModalRenderer {
  private shadowRoot: ShadowRoot | null = null;
  private hostElement: HTMLDivElement | null = null;
  private containerElement: HTMLElement | null = null;
  private mode: 'popup' | 'embedded';
  private branding: BrandingConfig;
  private enabledProviders: OAuthProviderType[] = [];
  private onProviderClick: (provider: OAuthProviderType) => void;
  private onEmailSubmit: (email: string, password: string, isSignUp: boolean) => void;
  private onClose: () => void;

  constructor(options: {
    mode: 'popup' | 'embedded';
    containerId?: string;
    branding?: BrandingConfig;
    onProviderClick: (provider: OAuthProviderType) => void;
    onEmailSubmit: (email: string, password: string, isSignUp: boolean) => void;
    onClose: () => void;
  }) {
    this.mode = options.mode;
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
    this.close();
    this.render(view);
  }

  close(): void {
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }
  }

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
    this.shadowRoot.innerHTML = this.buildHTML(view);
    this.attachEvents(view);
  }

  private buildHTML(view: 'signIn' | 'signUp'): string {
    const b = this.branding;
    const isSignUp = view === 'signUp';
    const title = isSignUp ? 'Create your account' : 'Welcome back';
    const subtitle = isSignUp ? 'Already have an account?' : "Don't have an account?";
    const subtitleLink = isSignUp ? 'Sign in' : 'Sign up';

    const providerButtons = this.enabledProviders
      .filter((p) => !b.hiddenProviders?.includes(p))
      .map((p) => {
        const config = getProviderButtonConfig(p);
        return `<button class="provider-btn" data-provider="${p}" style="background:${config.bgColor};color:${config.textColor};border:1px solid ${config.bgColor === '#ffffff' ? '#e5e7eb' : config.bgColor}">
          <span class="provider-icon">${config.iconSvg}</span>
          <span>${config.label}</span>
        </button>`;
      })
      .join('');

    const divider =
      b.showDivider !== false && b.showEmailPassword !== false
        ? `<div class="divider"><span>or</span></div>`
        : '';

    const emailForm =
      b.showEmailPassword !== false
        ? `<form class="email-form" id="email-form">
          <input type="email" placeholder="Email address" name="email" required class="input" />
          <input type="password" placeholder="Password" name="password" required class="input" />
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

    const popupWrapper =
      this.mode === 'popup'
        ? `<div class="backdrop" id="backdrop"></div>`
        : '';

    return `
      <style>${this.buildCSS()}</style>
      ${popupWrapper}
      <div class="modal-container" role="dialog" aria-modal="true">
        ${b.logoDataUrl ? `<img src="${b.logoDataUrl}" alt="Logo" class="logo" />` : ''}
        <h2 class="title">${title}</h2>
        ${b.brandName ? `<p class="brand-name">${b.brandName}</p>` : ''}
        <div class="providers">${providerButtons}</div>
        ${divider}
        ${emailForm}
        <p class="switch-view">${subtitle} <a href="#" id="switch-link">${subtitleLink}</a></p>
        ${footer}
      </div>
    `;
  }

  private buildCSS(): string {
    const b = this.branding;
    return `
      :host {
        --authon-primary-start: ${b.primaryColorStart || '#7c3aed'};
        --authon-primary-end: ${b.primaryColorEnd || '#4f46e5'};
        --authon-light-bg: ${b.lightBg || '#ffffff'};
        --authon-light-text: ${b.lightText || '#111827'};
        --authon-dark-bg: ${b.darkBg || '#0f172a'};
        --authon-dark-text: ${b.darkText || '#f1f5f9'};
        --authon-radius: ${b.borderRadius ?? 12}px;
        --authon-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-family: var(--authon-font);
        color: var(--authon-light-text);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .backdrop {
        position: fixed; inset: 0; z-index: 99998;
        background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease;
      }
      .modal-container {
        ${this.mode === 'popup' ? 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; max-height: 90vh; overflow-y: auto;' : ''}
        background: var(--authon-light-bg);
        border-radius: var(--authon-radius);
        padding: 32px;
        width: 400px; max-width: 100%;
        ${this.mode === 'popup' ? 'box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: slideIn 0.3s ease;' : ''}
      }
      .logo { display: block; margin: 0 auto 16px; max-height: 48px; }
      .title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
      .brand-name { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 24px; }
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
        margin: 16px 0; color: #9ca3af; font-size: 13px;
      }
      .divider::before, .divider::after {
        content: ''; flex: 1; height: 1px; background: #e5e7eb;
      }
      .email-form { display: flex; flex-direction: column; gap: 10px; }
      .input {
        width: 100%; padding: 10px 14px;
        border: 1px solid #d1d5db; border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-family: var(--authon-font);
        outline: none; transition: border-color 0.15s;
      }
      .input:focus { border-color: var(--authon-primary-start); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
      .submit-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none; border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .submit-btn:hover { opacity: 0.9; }
      .switch-view { text-align: center; margin-top: 16px; font-size: 13px; color: #6b7280; }
      .switch-view a { color: var(--authon-primary-start); text-decoration: none; font-weight: 500; }
      .switch-view a:hover { text-decoration: underline; }
      .footer { text-align: center; margin-top: 16px; font-size: 12px; color: #9ca3af; }
      .footer a { color: #9ca3af; text-decoration: none; }
      .footer a:hover { text-decoration: underline; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      ${b.customCss || ''}
    `;
  }

  private attachEvents(view: 'signIn' | 'signUp'): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.querySelectorAll('.provider-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const provider = (btn as HTMLElement).dataset.provider as OAuthProviderType;
        this.onProviderClick(provider);
      });
    });

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

    const switchLink = this.shadowRoot.getElementById('switch-link');
    if (switchLink) {
      switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.open(view === 'signIn' ? 'signUp' : 'signIn');
      });
    }

    const backdrop = this.shadowRoot.getElementById('backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.onClose());
    }

    if (this.mode === 'popup') {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.onClose();
          document.removeEventListener('keydown', handler);
        }
      };
      document.addEventListener('keydown', handler);
    }
  }
}
