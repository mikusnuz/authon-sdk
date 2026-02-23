import type { AuthonUser, AuthTokens, BrandingConfig, OAuthProviderType } from '@authon/shared';
import type { AuthonConfig, AuthonEventType, AuthonEvents } from './types';
import { ModalRenderer } from './modal';
import { SessionManager } from './session';

export class Authon {
  private publishableKey: string;
  private config: Required<Omit<AuthonConfig, 'containerId' | 'appearance'>> & {
    containerId?: string;
    appearance?: Partial<BrandingConfig>;
  };
  private session: SessionManager;
  private modal: ModalRenderer | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private branding: BrandingConfig | null = null;
  private providers: OAuthProviderType[] = [];
  private initialized = false;

  constructor(publishableKey: string, config?: AuthonConfig) {
    this.publishableKey = publishableKey;
    this.config = {
      apiUrl: config?.apiUrl || 'https://api.authon.dev',
      mode: config?.mode || 'popup',
      theme: config?.theme || 'auto',
      locale: config?.locale || 'en',
      containerId: config?.containerId,
      appearance: config?.appearance,
    };
    this.session = new SessionManager(publishableKey, this.config.apiUrl);
  }

  // ── Public API ──

  async openSignIn(): Promise<void> {
    await this.ensureInitialized();
    this.getModal().open('signIn');
  }

  async openSignUp(): Promise<void> {
    await this.ensureInitialized();
    this.getModal().open('signUp');
  }

  async signInWithOAuth(provider: OAuthProviderType): Promise<void> {
    await this.ensureInitialized();
    await this.startOAuthFlow(provider);
  }

  async signInWithEmail(email: string, password: string): Promise<AuthonUser> {
    const tokens = await this.apiPost<AuthTokens>('/v1/auth/signin', { email, password });
    this.session.setSession(tokens);
    this.emit('signedIn', tokens.user);
    return tokens.user;
  }

  async signUpWithEmail(
    email: string,
    password: string,
    meta?: { displayName?: string },
  ): Promise<AuthonUser> {
    const tokens = await this.apiPost<AuthTokens>('/v1/auth/signup', {
      email,
      password,
      ...meta,
    });
    this.session.setSession(tokens);
    this.emit('signedIn', tokens.user);
    return tokens.user;
  }

  async signOut(): Promise<void> {
    await this.session.signOut();
    this.emit('signedOut');
  }

  getUser(): AuthonUser | null {
    return this.session.getUser();
  }

  getToken(): string | null {
    return this.session.getToken();
  }

  on<K extends AuthonEventType>(event: K, listener: AuthonEvents[K]): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const set = this.listeners.get(event)!;
    set.add(listener as (...args: unknown[]) => void);
    return () => set.delete(listener as (...args: unknown[]) => void);
  }

  destroy(): void {
    this.modal?.close();
    this.session.destroy();
    this.listeners.clear();
  }

  // ── Internal ──

  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    try {
      const [branding, providersRes] = await Promise.all([
        this.apiGet<BrandingConfig>('/v1/auth/branding'),
        this.apiGet<{ providers: OAuthProviderType[] }>('/v1/auth/providers'),
      ]);
      this.branding = { ...branding, ...this.config.appearance };
      this.providers = providersRes.providers;
      this.initialized = true;
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private getModal(): ModalRenderer {
    if (!this.modal) {
      this.modal = new ModalRenderer({
        mode: this.config.mode,
        theme: this.config.theme,
        containerId: this.config.containerId,
        branding: this.branding || undefined,
        onProviderClick: (provider) => this.startOAuthFlow(provider),
        onEmailSubmit: (email, password, isSignUp) => {
          this.modal?.clearError();
          const promise = isSignUp
            ? this.signUpWithEmail(email, password)
            : this.signInWithEmail(email, password);
          promise
            .then(() => this.modal?.close())
            .catch((err) => {
              const msg = err instanceof Error ? err.message : String(err);
              this.modal?.showError(msg || 'Authentication failed');
              this.emit('error', err instanceof Error ? err : new Error(msg));
            });
        },
        onClose: () => this.modal?.close(),
      });
    }
    if (this.branding) this.modal.setBranding(this.branding);
    this.modal.setProviders(this.providers);
    return this.modal;
  }

  private async startOAuthFlow(provider: OAuthProviderType): Promise<void> {
    try {
      const redirectUri = `${this.config.apiUrl}/v1/auth/oauth/redirect`;
      const { url, state } = await this.apiGet<{ url: string; state: string }>(
        `/v1/auth/oauth/${provider}/url?redirectUri=${encodeURIComponent(redirectUri)}`,
      );

      this.modal?.showLoading();

      // Open popup
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        url,
        'authon-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
      );

      if (!popup || popup.closed) {
        this.modal?.hideLoading();
        this.modal?.showBanner(
          'Pop-up blocked. Please allow pop-ups for this site and try again.',
          'warning',
        );
        this.emit('error', new Error('Popup was blocked by the browser'));
        return;
      }

      let resolved = false;
      let cleaned = false;

      const resolve = (tokens: AuthTokens) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        try { if (!popup.closed) popup.close(); } catch { /* ignore */ }
        this.session.setSession(tokens);
        this.modal?.close();
        this.emit('signedIn', tokens.user);
      };

      const handleError = (msg: string) => {
        if (resolved) return;
        cleanup();
        this.modal?.hideLoading();
        this.modal?.showError(msg);
        this.emit('error', new Error(msg));
      };

      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        window.removeEventListener('message', messageHandler);
        if (apiPollTimer) clearInterval(apiPollTimer);
        if (closePollTimer) clearInterval(closePollTimer);
        if (maxTimer) clearTimeout(maxTimer);
      };

      // 1. postMessage handler (fast path — Chrome/Firefox)
      const messageHandler = (e: MessageEvent) => {
        if (e.data?.type !== 'authon-oauth-callback') return;
        if (e.data.tokens) {
          resolve(e.data.tokens as AuthTokens);
        }
      };
      window.addEventListener('message', messageHandler);

      // 2. API polling (Safari fallback — window.opener severed by COOP)
      const apiPollTimer = setInterval(async () => {
        if (resolved || cleaned) return;
        try {
          const result = await this.apiGet<{ status: string; accessToken?: string; refreshToken?: string; expiresIn?: number; user?: AuthonUser; message?: string }>(
            `/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`,
          );
          if (result.status === 'completed' && result.accessToken) {
            resolve({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken!,
              expiresIn: result.expiresIn!,
              user: result.user!,
            });
          } else if (result.status === 'error') {
            handleError(result.message || 'Authentication failed');
          }
        } catch {
          // Network error — keep polling
        }
      }, 1500);

      // 3. Popup close detection
      const closePollTimer = setInterval(() => {
        if (resolved || cleaned) return;
        try {
          if (popup.closed) {
            clearInterval(closePollTimer);
            // Give polling a few more seconds to pick up the result
            setTimeout(() => {
              if (resolved || cleaned) return;
              cleanup();
              this.modal?.hideLoading();
            }, 3000);
          }
        } catch {
          // Cross-origin access error — popup still open
        }
      }, 500);

      // 4. Max timeout (3 minutes)
      const maxTimer = setTimeout(() => {
        if (resolved || cleaned) return;
        cleanup();
        this.modal?.hideLoading();
      }, 180_000);
    } catch (err) {
      this.modal?.hideLoading();
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  private async apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      headers: { 'x-api-key': this.publishableKey },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.publishableKey,
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }

  private async parseApiError(res: Response, path: string): Promise<string> {
    try {
      const body = await res.json();
      if (Array.isArray(body.message) && body.message.length > 0) {
        return body.message[0];
      }
      if (typeof body.message === 'string' && body.message !== 'Bad Request') {
        return body.message;
      }
    } catch { /* ignore */ }
    return `API ${path}: ${res.status}`;
  }
}
