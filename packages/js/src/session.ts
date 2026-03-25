import type { AuthonUser, AuthTokens } from '@authon/shared';

export class SessionManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthonUser | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private apiUrl: string;
  private publishableKey: string;
  private storageKey: string;

  constructor(publishableKey: string, apiUrl: string) {
    this.publishableKey = publishableKey;
    this.apiUrl = apiUrl;
    this.storageKey = `authon_session_${publishableKey.slice(0, 16)}`;
    this.restoreFromStorage();
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;
      const data = JSON.parse(stored);
      if (data.accessToken && data.refreshToken && data.user) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
        // Token might be expired, schedule immediate refresh
        this.scheduleRefresh(5);
      }
    } catch { /* ignore corrupt storage */ }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      if (this.accessToken && this.refreshToken && this.user) {
        localStorage.setItem(this.storageKey, JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          user: this.user,
        }));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch { /* ignore */ }
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
    this.persistToStorage();
    if (tokens.expiresIn && tokens.expiresIn > 0) {
      this.scheduleRefresh(tokens.expiresIn);
    }
  }

  updateUser(user: AuthonUser): void {
    this.user = user;
  }

  clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.persistToStorage();
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
