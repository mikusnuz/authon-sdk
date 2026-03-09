import type {
  AuthonUser,
  AuthonOrganization,
  OrganizationMember,
  CreateOrganizationParams,
  OrganizationListResponse,
  SessionInfo,
  Web3Chain,
  Web3Wallet,
  PasskeyCredential,
  PasswordlessResult,
  AuditLogQueryParams,
  AuditLogListResponse,
  JwtTemplate,
  CreateJwtTemplateParams,
  UpdateJwtTemplateParams,
} from '@authon/shared';
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

  web3 = {
    verifySignature: (
      message: string,
      signature: string,
      address: string,
      chain: Web3Chain,
    ): Promise<{ valid: boolean; address: string }> => {
      return this.request('POST', '/v1/backend/web3/verify-signature', {
        message,
        signature,
        address,
        chain,
      });
    },

    getWallets: (userId: string): Promise<Web3Wallet[]> => {
      return this.request('GET', `/v1/backend/users/${userId}/web3-wallets`);
    },
  };

  passwordless = {
    sendCode: (email: string, type?: 'sign-in' | 'sign-up'): Promise<PasswordlessResult> => {
      return this.request('POST', '/v1/backend/passwordless/send', { email, type });
    },

    verifyCode: (
      email: string,
      code: string,
    ): Promise<{ valid: boolean; userId?: string }> => {
      return this.request('POST', '/v1/backend/passwordless/verify', { email, code });
    },
  };

  passkeys = {
    list: (userId: string): Promise<PasskeyCredential[]> => {
      return this.request('GET', `/v1/backend/users/${userId}/passkeys`);
    },

    delete: (userId: string, credentialId: string): Promise<void> => {
      return this.request('DELETE', `/v1/backend/users/${userId}/passkeys/${credentialId}`);
    },
  };

  sessions = {
    list: (userId: string): Promise<SessionInfo[]> => {
      return this.request('GET', `/v1/backend/users/${userId}/sessions`);
    },

    revoke: (userId: string, sessionId: string): Promise<void> => {
      return this.request('DELETE', `/v1/backend/users/${userId}/sessions/${sessionId}`);
    },
  };

  auditLogs = {
    list: (params?: AuditLogQueryParams): Promise<AuditLogListResponse> => {
      const qs = new URLSearchParams();
      if (params?.event) qs.set('event', params.event);
      if (params?.actorId) qs.set('actorId', params.actorId);
      if (params?.targetId) qs.set('targetId', params.targetId);
      if (params?.dateFrom) qs.set('dateFrom', params.dateFrom);
      if (params?.dateTo) qs.set('dateTo', params.dateTo);
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const query = qs.toString();
      return this.request('GET', `/v1/backend/audit-logs${query ? `?${query}` : ''}`);
    },
  };

  jwtTemplates = {
    list: (): Promise<JwtTemplate[]> => {
      return this.request('GET', '/v1/backend/jwt-templates');
    },

    get: (templateId: string): Promise<JwtTemplate> => {
      return this.request('GET', `/v1/backend/jwt-templates/${templateId}`);
    },

    create: (params: CreateJwtTemplateParams): Promise<JwtTemplate> => {
      return this.request('POST', '/v1/backend/jwt-templates', params);
    },

    update: (templateId: string, params: UpdateJwtTemplateParams): Promise<JwtTemplate> => {
      return this.request('PUT', `/v1/backend/jwt-templates/${templateId}`, params);
    },

    delete: (templateId: string): Promise<void> => {
      return this.request('DELETE', `/v1/backend/jwt-templates/${templateId}`);
    },
  };

  organizations = {
    list: (options?: { page?: number; limit?: number }): Promise<OrganizationListResponse> => {
      const params = new URLSearchParams();
      if (options?.page) params.set('page', String(options.page));
      if (options?.limit) params.set('limit', String(options.limit));
      const qs = params.toString();
      return this.request('GET', `/v1/backend/organizations${qs ? `?${qs}` : ''}`);
    },

    get: (orgId: string): Promise<AuthonOrganization> => {
      return this.request('GET', `/v1/backend/organizations/${orgId}`);
    },

    create: (params: CreateOrganizationParams & { createdBy: string }): Promise<AuthonOrganization> => {
      return this.request('POST', '/v1/backend/organizations', params);
    },

    delete: (orgId: string): Promise<void> => {
      return this.request('DELETE', `/v1/backend/organizations/${orgId}`);
    },

    getMembers: (orgId: string): Promise<OrganizationMember[]> => {
      return this.request('GET', `/v1/backend/organizations/${orgId}/members`);
    },

    addMember: (orgId: string, params: { userId: string; role?: 'admin' | 'member' }): Promise<OrganizationMember> => {
      return this.request('POST', `/v1/backend/organizations/${orgId}/members`, params);
    },

    removeMember: (orgId: string, userId: string): Promise<void> => {
      return this.request('DELETE', `/v1/backend/organizations/${orgId}/members/${userId}`);
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
