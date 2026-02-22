import type { AuthupUser, AuthTokens, BrandingConfig, OAuthProviderType } from '@authup/shared';
import type { AuthupConfig, AuthupEventType, AuthupEvents } from './types';
import { ModalRenderer } from './modal';
import { SessionManager } from './session';

export class Authup {
  private publishableKey: string;
  private config: Required<Omit<AuthupConfig, 'containerId' | 'appearance'>> & {
    containerId?: string;
    appearance?: Partial<BrandingConfig>;
  };
  private session: SessionManager;
  private modal: ModalRenderer | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private branding: BrandingConfig | null = null;
  private providers: OAuthProviderType[] = [];
  private initialized = false;

  constructor(publishableKey: string, config?: AuthupConfig) {
    this.publishableKey = publishableKey;
    this.config = {
      apiUrl: config?.apiUrl || 'https://api.authup.dev',
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

  async signInWithEmail(email: string, password: string): Promise<AuthupUser> {
    const tokens = await this.apiPost<AuthTokens>('/v1/auth/signin', { email, password });
    this.session.setSession(tokens);
    this.emit('signedIn', tokens.user);
    return tokens.user;
  }

  async signUpWithEmail(
    email: string,
    password: string,
    meta?: { displayName?: string },
  ): Promise<AuthupUser> {
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

  getUser(): AuthupUser | null {
    return this.session.getUser();
  }

  getToken(): string | null {
    return this.session.getToken();
  }

  on<K extends AuthupEventType>(event: K, listener: AuthupEvents[K]): () => void {
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
      const [branding, providers] = await Promise.all([
        this.apiGet<BrandingConfig>('/v1/auth/branding'),
        this.apiGet<{ providers: OAuthProviderType[] }>('/v1/auth/providers'),
      ]);
      this.branding = { ...branding, ...this.config.appearance };
      this.providers = providers.providers;
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
        containerId: this.config.containerId,
        branding: this.branding || undefined,
        onProviderClick: (provider) => this.startOAuthFlow(provider),
        onEmailSubmit: (email, password, isSignUp) => {
          if (isSignUp) {
            this.signUpWithEmail(email, password).then(() => this.modal?.close());
          } else {
            this.signInWithEmail(email, password).then(() => this.modal?.close());
          }
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
      const { url } = await this.apiGet<{ url: string }>(
        `/v1/auth/oauth/${provider}/url`,
      );
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        url,
        'authup-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
      );

      const handler = async (e: MessageEvent) => {
        if (e.data?.type === 'authup-oauth-callback') {
          window.removeEventListener('message', handler);
          popup?.close();
          try {
            const tokens = await this.apiPost<AuthTokens>('/v1/auth/oauth/callback', {
              code: e.data.code,
              state: e.data.state,
              codeVerifier: e.data.codeVerifier,
              provider,
            });
            this.session.setSession(tokens);
            this.modal?.close();
            this.emit('signedIn', tokens.user);
          } catch (err) {
            this.emit('error', err instanceof Error ? err : new Error(String(err)));
          }
        }
      };
      window.addEventListener('message', handler);
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  private async apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      headers: { 'x-api-key': this.publishableKey },
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
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
    if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
    return res.json();
  }
}
