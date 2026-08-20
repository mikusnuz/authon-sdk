const DEFAULT_COOKIE_NAME = 'authon-token';

export interface AuthonCookieOptions {
  cookieName?: string;
  protocol?: string;
}

function cookieName(options: AuthonCookieOptions): string {
  return options.cookieName ?? DEFAULT_COOKIE_NAME;
}

function attributes(options: AuthonCookieOptions): string {
  return `Path=/; SameSite=Lax${options.protocol === 'https:' ? '; Secure' : ''}`;
}

export function serializeAuthonCookie(
  token: string,
  options: AuthonCookieOptions = {},
): string {
  return `${cookieName(options)}=${encodeURIComponent(token)}; ${attributes(options)}`;
}

export function deleteAuthonCookie(options: AuthonCookieOptions = {}): string {
  return `${cookieName(options)}=; ${attributes(options)}; Max-Age=0`;
}

export function readAuthonCookie(name = DEFAULT_COOKIE_NAME): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      try {
        return decodeURIComponent(cookie.slice(prefix.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isUnexpiredAuthonToken(token: string, now = Date.now()): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === 'number' && payload.exp > Math.floor(now / 1_000);
  } catch {
    return false;
  }
}

export function syncAuthonCookie(token: string | null, options: AuthonCookieOptions = {}): void {
  if (typeof document === 'undefined') return;
  const name = cookieName(options);
  const existing = readAuthonCookie(name);
  if (token) {
    if (existing !== token) document.cookie = serializeAuthonCookie(token, options);
  } else if (existing !== null) {
    document.cookie = deleteAuthonCookie(options);
  }
}
