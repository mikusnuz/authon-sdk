import type { AuthonUser } from '@authon/shared';
import { createHmac, timingSafeEqual } from 'crypto';

interface AuthonBackendConfig {
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

export class AuthonBackend {
  private secretKey: string;
  private apiUrl: string;

  constructor(secretKey: string, config?: AuthonBackendConfig) {
    this.secretKey = secretKey;
    this.apiUrl = config?.apiUrl || 'https://api.authon.dev';
  }

  async verifyToken(accessToken: string): Promise<AuthonUser> {
    return this.request<AuthonUser>('GET', '/v1/auth/token/verify', undefined, {
      Authorization: `Bearer ${accessToken}`,
    });
  }

  users = {
    list: (options?: ListOptions): Promise<ListResult<AuthonUser>> => {
      const params = new URLSearchParams();
      if (options?.page) params.set('page', String(options.page));
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.search) params.set('search', options.search);
      const qs = params.toString();
      return this.request('GET', `/v1/backend/users${qs ? `?${qs}` : ''}`);
    },

    get: (userId: string): Promise<AuthonUser> => {
      return this.request('GET', `/v1/backend/users/${userId}`);
    },

    getByExternalId: (externalId: string): Promise<AuthonUser> => {
      return this.request('GET', `/v1/backend/users/by-external-id/${externalId}`);
    },

    create: (data: {
      email: string;
      password?: string;
      displayName?: string;
      externalId?: string;
      provider?: string;
      avatarUrl?: string;
      phone?: string;
      emailVerified?: boolean;
      publicMetadata?: Record<string, unknown>;
      privateMetadata?: Record<string, unknown>;
    }): Promise<AuthonUser> => {
      return this.request('POST', '/v1/backend/users', data);
    },

    update: (
      userId: string,
      data: Partial<{
        displayName: string;
        externalId: string;
        avatarUrl: string;
        phone: string;
        emailVerified: boolean;
        publicMetadata: Record<string, unknown>;
        privateMetadata: Record<string, unknown>;
      }>,
    ): Promise<AuthonUser> => {
      return this.request('PATCH', `/v1/backend/users/${userId}`, data);
    },

    delete: (userId: string): Promise<void> => {
      return this.request('DELETE', `/v1/backend/users/${userId}`);
    },

    ban: (userId: string, reason?: string): Promise<AuthonUser> => {
      return this.request('POST', `/v1/backend/users/${userId}/ban`, { reason });
    },

    unban: (userId: string): Promise<AuthonUser> => {
      return this.request('POST', `/v1/backend/users/${userId}/unban`);
    },
  };

  webhooks = {
    /**
     * Verify an Authon webhook signature.
     * @param payload - Raw request body (string or Buffer)
     * @param signature - Value of `X-Authon-Signature` header (format: `v1=<hex>`)
     * @param timestamp - Value of `X-Authon-Timestamp` header (ISO 8601)
     * @param secret - Your webhook signing secret
     * @returns Parsed payload object
     */
    verify: (
      payload: string | Buffer,
      signature: string,
      timestamp: string,
      secret: string,
    ): Record<string, unknown> => {
      const body = typeof payload === 'string' ? payload : payload.toString('utf8');
      const signedPayload = `${timestamp}.${body}`;
      const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
      const actual = signature.replace('v1=', '');

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
      throw new Error(`Authon API error ${res.status}: ${text}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
}
