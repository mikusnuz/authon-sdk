import type { AuthupUser } from '@authup/shared';
import { createHmac, timingSafeEqual } from 'crypto';

interface AuthupBackendConfig {
  apiUrl?: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class AuthupBackend {
  private secretKey: string;
  private apiUrl: string;

  constructor(secretKey: string, config?: AuthupBackendConfig) {
    this.secretKey = secretKey;
    this.apiUrl = config?.apiUrl || 'https://api.authup.dev';
  }

  async verifyToken(accessToken: string): Promise<AuthupUser> {
    return this.request<AuthupUser>('GET', '/v1/auth/token/verify', undefined, {
      Authorization: `Bearer ${accessToken}`,
    });
  }

  users = {
    list: (options?: ListOptions): Promise<ListResult<AuthupUser>> => {
      const params = new URLSearchParams();
      if (options?.page) params.set('page', String(options.page));
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.search) params.set('search', options.search);
      const qs = params.toString();
      return this.request('GET', `/v1/users${qs ? `?${qs}` : ''}`);
    },

    get: (userId: string): Promise<AuthupUser> => {
      return this.request('GET', `/v1/users/${userId}`);
    },

    create: (data: {
      email: string;
      password?: string;
      displayName?: string;
    }): Promise<AuthupUser> => {
      return this.request('POST', '/v1/users', data);
    },

    update: (
      userId: string,
      data: Partial<{ email: string; displayName: string; publicMetadata: Record<string, unknown> }>,
    ): Promise<AuthupUser> => {
      return this.request('PATCH', `/v1/users/${userId}`, data);
    },

    delete: (userId: string): Promise<void> => {
      return this.request('DELETE', `/v1/users/${userId}`);
    },

    ban: (userId: string, reason?: string): Promise<AuthupUser> => {
      return this.request('POST', `/v1/users/${userId}/ban`, { reason });
    },

    unban: (userId: string): Promise<AuthupUser> => {
      return this.request('POST', `/v1/users/${userId}/unban`);
    },
  };

  webhooks = {
    verify: (
      payload: string | Buffer,
      signature: string,
      secret: string,
    ): Record<string, unknown> => {
      const body = typeof payload === 'string' ? payload : payload.toString('utf8');
      const expected = createHmac('sha256', secret).update(body).digest('hex');
      const actual = signature.replace('sha256=', '');

      const expectedBuf = Buffer.from(expected, 'hex');
      const actualBuf = Buffer.from(actual, 'hex');

      if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
        throw new Error('Invalid webhook signature');
      }

      return JSON.parse(body);
    },
  };

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.secretKey,
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Authup API error ${res.status}: ${text}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
}
