import { Authup } from '@authup/js';
import type { AuthupConfig } from '@authup/js';
import type { AuthupUser } from '@authup/shared';

/**
 * Injection token key for Authup configuration.
 * Used with Angular's InjectionToken.
 */
export const AUTHUP_CONFIG = 'AUTHUP_CONFIG';

export interface AuthupServiceConfig {
  publishableKey: string;
  config?: Omit<AuthupConfig, 'mode'>;
}

/**
 * Plain class wrapping @authup/js for Angular dependency injection.
 *
 * Since tsup cannot compile Angular decorators, this is a plain class.
 * Users should wrap it in their own injectable service:
 *
 * ```ts
 * import { Injectable } from '@angular/core';
 * import { AuthupService as BaseAuthupService } from '@authup/angular';
 *
 * @Injectable({ providedIn: 'root' })
 * export class AuthupService extends BaseAuthupService {
 *   constructor() {
 *     super({ publishableKey: 'pk_live_...' });
 *   }
 * }
 * ```
 *
 * Or use the `provideAuthup()` helper for standalone components.
 */
export class AuthupService {
  private client: Authup;
  private _user: AuthupUser | null = null;
  private _isSignedIn = false;
  private _isLoading = true;
  private _listeners: Array<() => void> = [];

  constructor(config: AuthupServiceConfig) {
    this.client = new Authup(config.publishableKey, config.config);

    this.client.on('signedIn', (user) => {
      this._user = user as AuthupUser;
      this._isSignedIn = true;
      this._isLoading = false;
      this.notifyListeners();
    });

    this.client.on('signedOut', () => {
      this._user = null;
      this._isSignedIn = false;
      this.notifyListeners();
    });

    this.client.on('error', () => {
      this._isLoading = false;
      this.notifyListeners();
    });

    this._isLoading = false;
  }

  get user(): AuthupUser | null {
    return this._user;
  }

  get isSignedIn(): boolean {
    return this._isSignedIn;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  async openSignIn(): Promise<void> {
    await this.client.openSignIn();
  }

  async openSignUp(): Promise<void> {
    await this.client.openSignUp();
  }

  async signOut(): Promise<void> {
    await this.client.signOut();
    this._user = null;
    this._isSignedIn = false;
    this.notifyListeners();
  }

  getToken(): string | null {
    return this.client.getToken();
  }

  getClient(): Authup {
    return this.client;
  }

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  onStateChange(callback: () => void): () => void {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== callback);
    };
  }

  destroy(): void {
    this.client.destroy();
    this._listeners = [];
  }

  private notifyListeners(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }
}
