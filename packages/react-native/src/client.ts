import type { AuthonReactNativeConfig, AuthonUser, SignInParams, SignUpParams } from './types';

const DEFAULT_API_URL = 'https://api.authon.dev';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

type TokenStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const STORAGE_KEY = '@authon/tokens';

export class AuthonMobileClient {
  private apiUrl: string;
  private publishableKey: string;
  private tokens: TokenPair | null = null;
  private storage: TokenStorage | null = null;

  constructor(config: AuthonReactNativeConfig) {
    this.publishableKey = config.publishableKey;
    this.apiUrl = (config.apiUrl || DEFAULT_API_URL).replace(/\/$/, '');
  }

  setStorage(storage: TokenStorage) {
    this.storage = storage;
  }

  async initialize(): Promise<TokenPair | null> {
    if (!this.storage) return null;

    const stored = await this.storage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const tokens: TokenPair = JSON.parse(stored);
      if (tokens.expiresAt > Date.now()) {
        this.tokens = tokens;
        return tokens;
      }
      // Try refreshing
      return await this.refreshToken(tokens.refreshToken);
    } catch {
      await this.storage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  async signIn(params: SignInParams): Promise<TokenPair> {
    const res = await this.request('POST', '/v1/auth/sign-in', params);
    this.tokens = res as TokenPair;
    await this.persistTokens();
    return this.tokens;
  }

  async signUp(params: SignUpParams): Promise<TokenPair> {
    const res = await this.request('POST', '/v1/auth/sign-up', params);
    this.tokens = res as TokenPair;
    await this.persistTokens();
    return this.tokens;
  }

  async signOut(): Promise<void> {
    if (this.tokens) {
      try {
        await this.request('POST', '/v1/auth/sign-out', undefined);
      } catch {
        // Ignore sign-out errors
      }
    }
    this.tokens = null;
    if (this.storage) {
      await this.storage.removeItem(STORAGE_KEY);
    }
  }

  async getUser(): Promise<AuthonUser | null> {
    if (!this.tokens) return null;
    try {
      return (await this.request('GET', '/v1/auth/me')) as AuthonUser;
    } catch {
      return null;
    }
  }

  async refreshToken(refreshToken?: string): Promise<TokenPair | null> {
    const token = refreshToken || this.tokens?.refreshToken;
    if (!token) return null;

    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Publishable-Key': this.publishableKey,
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (!res.ok) {
        this.tokens = null;
        if (this.storage) await this.storage.removeItem(STORAGE_KEY);
        return null;
      }

      this.tokens = (await res.json()) as TokenPair;
      await this.persistTokens();
      return this.tokens;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.expiresAt > Date.now();
  }

  private async persistTokens(): Promise<void> {
    if (this.storage && this.tokens) {
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tokens));
    }
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Publishable-Key': this.publishableKey,
    };

    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    const res = await fetch(`${this.apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Request failed with status ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
  }
}
