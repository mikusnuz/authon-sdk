import type { AuthonUser, AuthTokens } from '@authon/shared';

export class SessionManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthonUser | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private apiUrl: string;
  private publishableKey: string;

  constructor(publishableKey: string, apiUrl: string) {
    this.publishableKey = publishableKey;
    this.apiUrl = apiUrl;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  getUser(): AuthonUser | null {
    return this.user;
  }

  setSession(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.user = tokens.user;
    if (tokens.expiresIn && tokens.expiresIn > 0) {
      this.scheduleRefresh(tokens.expiresIn);
    }
  }

  clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    // Refresh 60 seconds before expiry
    const refreshIn = Math.max((expiresIn - 60) * 1000, 30000);
    this.refreshTimer = setTimeout(() => this.refresh(), refreshIn);
  }

  async refresh(): Promise<AuthTokens | null> {
    if (!this.refreshToken) {
      this.clearSession();
      return null;
    }
    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) {
        this.clearSession();
        return null;
      }
      const tokens: AuthTokens = await res.json();
      this.setSession(tokens);
      return tokens;
    } catch {
      this.clearSession();
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/v1/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.publishableKey,
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    this.clearSession();
  }

  destroy(): void {
    this.clearSession();
  }
}
