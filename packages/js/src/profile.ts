import type { AuthonUser, BrandingConfig, SessionInfo } from '@authon/shared';
import { DEFAULT_BRANDING } from '@authon/shared';
import { getStrings, type TranslationStrings } from './i18n';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown device';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown device';
}

export class ProfileRenderer {
  private shadowRoot: ShadowRoot | null = null;
  private hostElement: HTMLDivElement | null = null;
  private containerElement: HTMLElement | null = null;
  private containerId: string | null = null;
  private mode: 'popup' | 'embedded';
  private theme: 'light' | 'dark' | 'auto';
  private branding: BrandingConfig;
  private themeObserver: MutationObserver | null = null;
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;
  private t: TranslationStrings;

  private user: AuthonUser;
  private sessions: SessionInfo[];
  private isEditMode: boolean = false;

  private onSave: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>;
  private onSignOut: () => Promise<void>;
  private onRevokeSession: (sessionId: string) => Promise<void>;
  private onClose: () => void;

  private escHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: {
    mode: 'popup' | 'embedded';
    theme?: 'light' | 'dark' | 'auto';
    containerId?: string;
    branding?: BrandingConfig;
    locale?: string;
    user: AuthonUser;
    sessions?: SessionInfo[];
    onSave: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>;
    onSignOut: () => Promise<void>;
    onRevokeSession: (sessionId: string) => Promise<void>;
    onClose: () => void;
  }) {
    this.mode = options.mode;
    this.theme = options.theme || 'auto';
    this.branding = { ...DEFAULT_BRANDING, ...options.branding };
    this.t = getStrings(options.locale || 'en');
    this.user = options.user;
    this.sessions = options.sessions || [];
    this.onSave = options.onSave;
    this.onSignOut = options.onSignOut;
    this.onRevokeSession = options.onRevokeSession;
    this.onClose = options.onClose;

    if (options.mode === 'embedded' && options.containerId) {
      this.containerId = options.containerId;
    }
  }

  private resolveContainerElement(): HTMLElement | null {
    if (this.mode !== 'embedded' || !this.containerId) return null;
    const next = document.getElementById(this.containerId);
    if (this.containerElement !== next) {
      this.hostElement?.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    this.containerElement = next;
    return next;
  }

  open(): void {
    this.resolveContainerElement();

    if (this.hostElement && !this.hostElement.isConnected) {
      this.hostElement = null;
      this.shadowRoot = null;
    }

    if (this.shadowRoot && this.hostElement) {
      this.rerender();
    } else {
      this.isEditMode = false;
      this.render();
    }
  }

  close(): void {
    this.stopThemeObserver();
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
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
  }

  updateUser(user: AuthonUser): void {
    this.user = user;
    if (this.shadowRoot) this.rerender();
  }

  updateSessions(sessions: SessionInfo[]): void {
    this.sessions = sessions;
    if (this.shadowRoot) this.rerender();
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.theme = theme;
    this.updateThemeCSS();
    if (theme === 'auto') {
      this.startThemeObserver();
    } else {
      this.stopThemeObserver();
    }
  }

  showSaving(): void {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById('profile-save-btn') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = '...';
    }
  }

  showSaveError(message: string): void {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById('profile-save-btn') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = false;
      btn.textContent = this.t.save;
    }
    this.showInlineError('profile-error', message);
  }

  private showInlineError(id: string, message: string): void {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById(id)?.remove();
    const errEl = document.createElement('div');
    errEl.id = id;
    errEl.className = 'error-msg';
    errEl.textContent = message;
    this.shadowRoot.querySelector('.profile-actions')?.appendChild(errEl);
  }

  private updateThemeCSS(): void {
    if (!this.shadowRoot) return;
    const styleEl = this.shadowRoot.getElementById('authon-profile-theme-style');
    if (styleEl) styleEl.textContent = this.buildCSS();
  }

  private startThemeObserver(): void {
    this.stopThemeObserver();
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    this.themeObserver = new MutationObserver(() => this.updateThemeCSS());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

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

  private isDark(): boolean {
    if (this.theme === 'dark') return true;
    if (this.theme === 'light') return false;
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      if (html.classList.contains('dark') || html.getAttribute('data-theme') === 'dark') return true;
      if (html.classList.contains('light') || html.getAttribute('data-theme') === 'light') return false;
    }
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private render(): void {
    const host = document.createElement('div');
    host.setAttribute('data-authon-profile', '');
    this.hostElement = host;

    if (this.mode === 'popup') {
      document.body.appendChild(host);
    } else {
      const container = this.resolveContainerElement();
      if (!container) {
        this.hostElement = null;
        throw new Error(`Authon profile container "#${this.containerId}" not found`);
      }
      container.replaceChildren();
      container.appendChild(host);
    }

    this.shadowRoot = host.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.buildShell();
    this.attachEvents();

    if (this.mode === 'popup') {
      this.escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { this.onClose(); this.close(); }
      };
      document.addEventListener('keydown', this.escHandler);
    }

    if (this.theme === 'auto') this.startThemeObserver();
  }

  private rerender(): void {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.getElementById('profile-inner');
    if (!inner) return;
    inner.style.opacity = '0';
    inner.style.transform = 'translateY(-4px)';
    setTimeout(() => {
      inner.innerHTML = this.buildInnerContent();
      this.attachInnerEvents();
      void inner.offsetHeight;
      inner.style.opacity = '1';
      inner.style.transform = 'translateY(0)';
    }, 120);
  }

  private buildShell(): string {
    const popupWrapper = this.mode === 'popup'
      ? `<div class="backdrop" id="profile-backdrop"></div>`
      : '';

    return `
      <style id="authon-profile-theme-style">${this.buildCSS()}</style>
      ${popupWrapper}
      <div class="profile-container" role="dialog" aria-modal="true" aria-label="${this.t.profile}">
        <div id="profile-inner" class="profile-inner">
          ${this.buildInnerContent()}
        </div>
      </div>
    `;
  }

  private buildInnerContent(): string {
    const u = this.user;
    const initials = (u.displayName || u.email || '?')
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');

    const avatarHtml = u.avatarUrl
      ? `<img class="avatar-img" src="${u.avatarUrl}" alt="${u.displayName || ''}" />`
      : `<div class="avatar-placeholder">${initials}</div>`;

    const closeBtn = this.mode === 'popup'
      ? `<button class="close-btn" id="profile-close-btn" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>`
      : '';

    if (this.isEditMode) {
      return this.buildEditContent(avatarHtml, closeBtn);
    }

    return this.buildViewContent(avatarHtml, closeBtn, u);
  }

  private buildViewContent(avatarHtml: string, closeBtn: string, u: AuthonUser): string {
    const sessionsHtml = this.sessions.length > 0
      ? `<div class="section">
          <div class="section-label">${this.t.sessions}</div>
          <div class="sessions-list">
            ${this.sessions.map((s) => `
              <div class="session-item" data-session-id="${s.id}">
                <div class="session-info">
                  <span class="session-device">${parseUserAgent(s.userAgent)}</span>
                  <span class="session-meta">${s.ipAddress || ''} &middot; ${formatRelativeTime(s.lastActiveAt)}</span>
                </div>
                <button class="session-revoke-btn" data-session-id="${s.id}" aria-label="Revoke session">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
        </div>`
      : '';

    return `
      <div class="profile-header">
        <div class="avatar-wrap">${avatarHtml}</div>
        <div class="header-text">
          <div class="display-name">${u.displayName || '—'}</div>
          <div class="email">${u.email || '—'}</div>
        </div>
        ${closeBtn}
      </div>

      <div class="section">
        <div class="field-row">
          <span class="field-label">${this.t.emailAddress}</span>
          <span class="field-value readonly">${u.email || '—'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">${this.t.displayName}</span>
          <span class="field-value">${u.displayName || '—'}</span>
        </div>
      </div>

      ${sessionsHtml}

      <div class="profile-actions">
        <button class="edit-btn" id="profile-edit-btn">${this.t.editProfile}</button>
        <button class="signout-btn" id="profile-signout-btn">${this.t.signOut}</button>
      </div>
    `;
  }

  private buildEditContent(avatarHtml: string, closeBtn: string): string {
    const u = this.user;
    return `
      <div class="profile-header">
        <div class="avatar-wrap">${avatarHtml}</div>
        <div class="header-text">
          <div class="display-name">${this.t.editProfile}</div>
          <div class="email">${u.email || '—'}</div>
        </div>
        ${closeBtn}
      </div>

      <div class="section">
        <div class="field-group">
          <label class="field-label" for="profile-displayname-input">${this.t.displayName}</label>
          <input
            id="profile-displayname-input"
            class="input"
            type="text"
            value="${u.displayName || ''}"
            placeholder="${this.t.displayName}"
            autocomplete="name"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="profile-avatar-input">Avatar URL</label>
          <input
            id="profile-avatar-input"
            class="input"
            type="url"
            value="${u.avatarUrl || ''}"
            placeholder="https://..."
            autocomplete="off"
          />
        </div>
        <div class="field-group">
          <label class="field-label">${this.t.emailAddress}</label>
          <input class="input readonly" type="email" value="${u.email || ''}" disabled />
        </div>
      </div>

      <div class="profile-actions">
        <button class="save-btn" id="profile-save-btn">${this.t.save}</button>
        <button class="cancel-btn" id="profile-cancel-btn">Cancel</button>
      </div>
    `;
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
    const sectionBg = dark ? '#1e293b' : '#f9fafb';
    const sessionItemBg = dark ? '#263148' : '#f3f4f6';

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
        --authon-section-bg: ${sectionBg};
        --authon-session-bg: ${sessionItemBg};
        --authon-backdrop-bg: rgba(0,0,0,${dark ? '0.7' : '0.5'});
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

      .profile-container {
        ${this.mode === 'popup'
          ? 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; max-height: 90vh; overflow-y: auto;'
          : ''}
        background: var(--authon-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: var(--authon-radius);
        padding: 24px;
        width: 380px; max-width: 100%;
        ${this.mode === 'popup' ? `box-shadow: 0 25px 50px -12px rgba(0,0,0,${dark ? '0.5' : '0.25'}); animation: slideIn 0.3s ease;` : ''}
      }

      .profile-inner {
        transition: opacity 0.12s ease, transform 0.12s ease;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 20px;
        position: relative;
      }

      .avatar-wrap { flex-shrink: 0; }

      .avatar-img {
        width: 52px; height: 52px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--authon-border);
      }

      .avatar-placeholder {
        width: 52px; height: 52px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; font-weight: 700; color: #fff;
        flex-shrink: 0;
      }

      .header-text { flex: 1; min-width: 0; }

      .display-name {
        font-size: 16px; font-weight: 600;
        color: var(--authon-text);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .email {
        font-size: 13px; color: var(--authon-muted);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-top: 2px;
      }

      .close-btn {
        position: absolute; top: 0; right: 0;
        background: none; border: none;
        color: var(--authon-muted); cursor: pointer;
        padding: 4px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .close-btn:hover { color: var(--authon-text); background: var(--authon-divider); }

      .section {
        background: var(--authon-section-bg);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.67);
        padding: 12px 14px;
        margin-bottom: 12px;
        display: flex; flex-direction: column; gap: 10px;
      }

      .section-label {
        font-size: 11px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: var(--authon-dim); margin-bottom: 2px;
      }

      .field-row {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }

      .field-label {
        font-size: 12px; color: var(--authon-muted); flex-shrink: 0;
      }

      .field-value {
        font-size: 13px; color: var(--authon-text);
        text-align: right; min-width: 0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .field-value.readonly { color: var(--authon-dim); }

      .field-group {
        display: flex; flex-direction: column; gap: 4px;
      }

      .input {
        width: 100%; padding: 9px 12px;
        background: var(--authon-input-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-family: var(--authon-font);
        outline: none; transition: border-color 0.15s;
      }
      .input::placeholder { color: var(--authon-dim); }
      .input:focus { border-color: var(--authon-primary-start); box-shadow: 0 0 0 3px ${hexToRgba(b.primaryColorStart || '#7c3aed', 0.15)}; }
      .input.readonly, .input:disabled { color: var(--authon-dim); cursor: not-allowed; background: var(--authon-section-bg); }

      .sessions-list { display: flex; flex-direction: column; gap: 6px; }

      .session-item {
        display: flex; align-items: center; justify-content: space-between;
        background: var(--authon-session-bg);
        border-radius: calc(var(--authon-radius) * 0.5);
        padding: 8px 10px; gap: 8px;
      }

      .session-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

      .session-device {
        font-size: 13px; font-weight: 500; color: var(--authon-text);
      }

      .session-meta {
        font-size: 11px; color: var(--authon-dim);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .session-revoke-btn {
        background: none; border: none;
        color: var(--authon-dim); cursor: pointer;
        padding: 4px; border-radius: 4px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .session-revoke-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

      .profile-actions {
        display: flex; flex-direction: column; gap: 8px;
        margin-top: 4px;
      }

      .edit-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none;
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .edit-btn:hover { opacity: 0.9; }

      .save-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none;
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .save-btn:hover { opacity: 0.9; }
      .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

      .cancel-btn {
        width: 100%; padding: 10px;
        background: none;
        color: var(--authon-muted);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: var(--authon-font); transition: background 0.15s, color 0.15s;
      }
      .cancel-btn:hover { background: var(--authon-divider); color: var(--authon-text); }

      .signout-btn {
        width: 100%; padding: 10px;
        background: none;
        color: #ef4444;
        border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: var(--authon-font); transition: background 0.15s;
      }
      .signout-btn:hover { background: rgba(239,68,68,0.08); }

      .error-msg {
        padding: 8px 12px;
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 13px; color: #ef4444; text-align: center;
        animation: fadeIn 0.15s ease;
      }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { opacity: 0; transform: translate(-50%, calc(-50% - 8px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
    `;
  }

  private attachEvents(): void {
    this.attachBackdropEvent();
    this.attachInnerEvents();
  }

  private attachBackdropEvent(): void {
    if (!this.shadowRoot || this.mode !== 'popup') return;
    const backdrop = this.shadowRoot.getElementById('profile-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => { this.onClose(); this.close(); });
    }
  }

  private attachInnerEvents(): void {
    if (!this.shadowRoot) return;

    const closeBtn = this.shadowRoot.getElementById('profile-close-btn');
    closeBtn?.addEventListener('click', () => { this.onClose(); this.close(); });

    const editBtn = this.shadowRoot.getElementById('profile-edit-btn');
    editBtn?.addEventListener('click', () => {
      this.isEditMode = true;
      this.rerender();
    });

    const cancelBtn = this.shadowRoot.getElementById('profile-cancel-btn');
    cancelBtn?.addEventListener('click', () => {
      this.isEditMode = false;
      this.rerender();
    });

    const saveBtn = this.shadowRoot.getElementById('profile-save-btn');
    saveBtn?.addEventListener('click', async () => {
      const nameInput = this.shadowRoot!.getElementById('profile-displayname-input') as HTMLInputElement | null;
      const avatarInput = this.shadowRoot!.getElementById('profile-avatar-input') as HTMLInputElement | null;

      const displayName = nameInput?.value.trim();
      const avatarUrl = avatarInput?.value.trim();

      this.showSaving();
      this.shadowRoot!.getElementById('profile-error')?.remove();

      try {
        await this.onSave({
          displayName: displayName || undefined,
          avatarUrl: avatarUrl || undefined,
        });
        this.isEditMode = false;
        this.rerender();
      } catch (err) {
        this.showSaveError(err instanceof Error ? err.message : 'Save failed');
      }
    });

    const signOutBtn = this.shadowRoot.getElementById('profile-signout-btn');
    signOutBtn?.addEventListener('click', async () => {
      if (signOutBtn instanceof HTMLButtonElement) {
        signOutBtn.disabled = true;
        signOutBtn.textContent = '...';
      }
      try {
        await this.onSignOut();
        this.close();
      } catch (_) {
        if (signOutBtn instanceof HTMLButtonElement) {
          signOutBtn.disabled = false;
          signOutBtn.textContent = this.t.signOut;
        }
      }
    });

    this.shadowRoot.querySelectorAll<HTMLButtonElement>('.session-revoke-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const sessionId = btn.dataset.sessionId;
        if (!sessionId) return;
        btn.disabled = true;
        try {
          await this.onRevokeSession(sessionId);
          this.sessions = this.sessions.filter((s) => s.id !== sessionId);
          this.rerender();
        } catch (_) {
          btn.disabled = false;
        }
      });
    });
  }
}
