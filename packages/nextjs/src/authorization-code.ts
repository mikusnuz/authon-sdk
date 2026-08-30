import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import type {
  AuthorizationCodeExchangeRequest,
  AuthorizationCodeExchangeResponse,
  AuthorizationCodeOptions,
} from '@authon/shared';

const DEFAULT_API_URL = 'https://api.authon.dev';
const DEFAULT_COOKIE_PREFIX = 'authon-txn-';

interface TransactionPayload {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  createdAt: number;
}

export interface CreateAuthonAuthorizationRequestOptions {
  redirectUri: string;
  transactionSecret?: string;
  cookiePrefix?: string;
  maxAgeSeconds?: number;
}

export interface HandleAuthonAuthorizationCallbackOptions {
  code: string;
  state: string;
  redirectUri: string;
  secretKey: string;
  apiUrl?: string;
  transactionSecret?: string;
  cookiePrefix?: string;
}

function getTransactionSecret(explicit?: string): string {
  const secret = explicit ?? process.env.AUTHON_TRANSACTION_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTHON_TRANSACTION_SECRET must be at least 32 characters');
  return secret;
}

function cookieName(state: string, prefix = DEFAULT_COOKIE_PREFIX): string {
  return `${prefix}${createHash('sha256').update(state).digest('hex').slice(0, 20)}`;
}

function encrypt(payload: TransactionPayload, secret: string): string {
  const key = createHash('sha256').update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url');
}

function decrypt(value: string, secret: string): TransactionPayload {
  const data = Buffer.from(value, 'base64url');
  if (data.length < 29) throw new Error('Invalid Authon transaction cookie');
  const key = createHash('sha256').update(secret).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  const plaintext = Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext) as TransactionPayload;
}

function equalString(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createAuthonAuthorizationRequest(
  options: CreateAuthonAuthorizationRequestOptions,
): Promise<{ authorization: AuthorizationCodeOptions }> {
  const redirect = new URL(options.redirectUri);
  if (redirect.username || redirect.password || redirect.hash) {
    throw new Error('Authon redirect URI must not contain credentials or a fragment');
  }
  const state = randomBytes(32).toString('base64url');
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier, 'ascii').digest('base64url');
  const maxAge = Math.max(1, Math.min(options.maxAgeSeconds ?? 600, 600));
  const payload: TransactionPayload = { state, codeVerifier, redirectUri: redirect.toString(), createdAt: Date.now() };
  const { cookies } = await import('next/headers');
  const store = await cookies();
  store.set(cookieName(state, options.cookiePrefix), encrypt(payload, getTransactionSecret(options.transactionSecret)), {
    httpOnly: true,
    secure: redirect.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return {
    authorization: {
      responseType: 'code',
      redirectUri: payload.redirectUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
      state,
    },
  };
}

export async function exchangeAuthonAuthorizationCode(options: {
  secretKey: string;
  request: AuthorizationCodeExchangeRequest;
  apiUrl?: string;
}): Promise<AuthorizationCodeExchangeResponse> {
  if (!/^sk_(live|test)_/.test(options.secretKey)) throw new Error('A server-side Authon secret key is required');
  const response = await fetch(`${(options.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '')}/v1/auth/token/exchange`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.secretKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify(options.request),
  });
  if (!response.ok) throw new Error(`Authon authorization code exchange failed (${response.status})`);
  const result = await response.json() as Partial<AuthorizationCodeExchangeResponse>;
  if (
    typeof result.accessToken !== 'string'
    || typeof result.refreshToken !== 'string'
    || typeof result.expiresIn !== 'number'
    || typeof result.sessionId !== 'string'
    || !result.user
    || typeof result.user.id !== 'string'
  ) {
    throw new Error('Authon authorization code exchange returned an invalid response');
  }
  return result as AuthorizationCodeExchangeResponse;
}

export async function handleAuthonAuthorizationCallback(
  options: HandleAuthonAuthorizationCallbackOptions,
): Promise<AuthorizationCodeExchangeResponse> {
  const name = cookieName(options.state, options.cookiePrefix);
  const { cookies } = await import('next/headers');
  const store = await cookies();
  const value = store.get(name)?.value;
  store.delete(name);
  if (!value) throw new Error('Missing or expired Authon authorization transaction');
  const transaction = decrypt(value, getTransactionSecret(options.transactionSecret));
  if (Date.now() - transaction.createdAt > 10 * 60 * 1000) throw new Error('Authon authorization transaction expired');
  if (!equalString(transaction.state, options.state)) throw new Error('Authon authorization state mismatch');
  if (!equalString(transaction.redirectUri, new URL(options.redirectUri).toString())) throw new Error('Authon redirect URI mismatch');
  return exchangeAuthonAuthorizationCode({
    secretKey: options.secretKey,
    apiUrl: options.apiUrl,
    request: {
      grantType: 'authorization_code',
      code: options.code,
      codeVerifier: transaction.codeVerifier,
      redirectUri: transaction.redirectUri,
    },
  });
}

export async function revokeAuthonSession(options: { secretKey: string; sessionId: string; apiUrl?: string }): Promise<void> {
  const response = await fetch(`${(options.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '')}/v1/auth/sessions/${encodeURIComponent(options.sessionId)}/revoke`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${options.secretKey}` },
    cache: 'no-store',
  });
  if (!response.ok && response.status !== 404) throw new Error(`Authon session revoke failed (${response.status})`);
}
