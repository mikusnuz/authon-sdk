import { Authon } from '@authon/js';
import type { AuthonConfig } from '@authon/js';
import type {
  AuthonUser,
  PasskeyCredential,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
} from '@authon/shared';

/**
 * Injection token key for Authon configuration.
 * Used with Angular's InjectionToken.
 */
export const AUTHON_CONFIG = 'AUTHON_CONFIG';

export interface AuthonServiceConfig {
  publishableKey: string;
  config?: Omit<AuthonConfig, 'mode'>;
}

/**
 * Plain class wrapping @authon/js for Angular dependency injection.
 *
 * Since tsup cannot compile Angular decorators, this is a plain class.
 * Users should wrap it in their own injectable service:
 *
 * ```ts
 * import { Injectable } from '@angular/core';
 * import { AuthonService as BaseAuthonService } from '@authon/angular';
 *
 * @Injectable({ providedIn: 'root' })
 * export class AuthonService extends BaseAuthonService {
 *   constructor() {
 *     super({ publishableKey: 'pk_live_...' });
 *   }
 * }
 * ```
 *
 * Or use the `provideAuthon()` helper for standalone components.
 */
export class AuthonService {
  private client: Authon;
  private _user: AuthonUser | null = null;
  private _isSignedIn = false;
  private _isLoading = true;
  private _listeners: Array<() => void> = [];

  constructor(config: AuthonServiceConfig) {
    this.client = new Authon(config.publishableKey, config.config);

    this.client.on('signedIn', (user) => {
      this._user = user as AuthonUser;
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

    const existingUser = this.client.getUser();
    if (existingUser) {
      this._user = existingUser as AuthonUser;
      this._isSignedIn = true;
    }
    this._isLoading = false;
  }

  get user(): AuthonUser | null {
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

  getClient(): Authon {
    return this.client;
  }

  // ── Web3 ──

  web3GetNonce(
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
    chainId?: number,
  ): Promise<Web3NonceResponse> {
    return this.client.web3GetNonce(address, chain, walletType, chainId);
  }

  web3Verify(
    message: string,
    signature: string,
    address: string,
    chain: Web3Chain,
    walletType: Web3WalletType,
  ): Promise<AuthonUser> {
    return this.client.web3Verify(message, signature, address, chain, walletType);
  }

  web3LinkWallet(params: {
    address: string;
    chain: Web3Chain;
    walletType: Web3WalletType;
    chainId?: number;
    message: string;
    signature: string;
  }): Promise<Web3Wallet> {
    return this.client.linkWallet(params);
  }

  web3UnlinkWallet(walletId: string): Promise<void> {
    return this.client.unlinkWallet(walletId);
  }

  web3GetWallets(): Promise<Web3Wallet[]> {
    return this.client.listWallets();
  }

  // ── Passwordless ──

  passwordlessSendCode(email: string, type: 'magic-link' | 'otp' = 'otp'): Promise<void> {
    if (type === 'magic-link') {
      return this.client.sendMagicLink(email);
    }
    return this.client.sendEmailOtp(email);
  }

  passwordlessVerifyCode(email: string, code: string): Promise<AuthonUser> {
    return this.client.verifyPasswordless({ email, code });
  }

  // ── Passkeys ──

  passkeyRegister(name?: string): Promise<PasskeyCredential> {
    return this.client.registerPasskey(name);
  }

  passkeyAuthenticate(email?: string): Promise<AuthonUser> {
    return this.client.authenticateWithPasskey(email);
  }

  passkeyList(): Promise<PasskeyCredential[]> {
    return this.client.listPasskeys();
  }

  passkeyDelete(credentialId: string): Promise<void> {
    return this.client.revokePasskey(credentialId);
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
