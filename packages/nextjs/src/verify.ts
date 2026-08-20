import type { AuthonUser } from '@authon/shared';

const DEFAULT_API_URL = 'https://api.authon.dev';
const DEFAULT_TIMEOUT_MS = 5_000;

export interface TokenVerificationOptions {
  apiUrl?: string;
  secretKey?: string;
  timeoutMs?: number;
}

export interface VerifiedToken {
  payload: Record<string, unknown> | null;
  user: AuthonUser | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseUser(value: unknown): AuthonUser | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return null;
  return value as unknown as AuthonUser;
}

function parseVerifiedFields(value: Record<string, unknown>): VerifiedToken | null {

  let payload: Record<string, unknown> | null = null;
  if (value.payload != null) {
    if (!isRecord(value.payload)) return null;
    if ('sub' in value.payload && typeof value.payload.sub !== 'string') return null;
    payload = value.payload;
  }

  let user: AuthonUser | null = null;
  if (value.user != null) {
    user = parseUser(value.user);
    if (!user) return null;
  }

  return payload || user ? { payload, user } : null;
}

function parseVerificationResponse(value: unknown): VerifiedToken | null {
  if (!isRecord(value)) return null;

  if ('data' in value) return parseVerificationResponse(value.data);

  if ('valid' in value) {
    if (value.valid !== true) return null;
    return parseVerifiedFields(value);
  }

  if ('user' in value) {
    const user = parseUser(value.user);
    return user ? { payload: null, user } : null;
  }

  const user = parseUser(value);
  return user ? { payload: null, user } : null;
}

function normalizedTimeout(timeoutMs: number | undefined): number {
  return typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs >= 0
    ? timeoutMs
    : DEFAULT_TIMEOUT_MS;
}

export async function verifyAuthonToken(
  token: string,
  options: TokenVerificationOptions = {},
): Promise<VerifiedToken | null> {
  const apiUrl = (options.apiUrl ?? process.env['AUTHON_API_URL'] ?? DEFAULT_API_URL).replace(/\/+$/, '');
  const secretKey = options.secretKey ?? process.env['AUTHON_SECRET_KEY'];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), normalizedTimeout(options.timeoutMs));
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (secretKey) headers['x-api-key'] = secretKey;

  try {
    const response = await fetch(`${apiUrl}/v1/auth/token/verify`, {
      headers,
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return parseVerificationResponse(await response.json() as unknown);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
