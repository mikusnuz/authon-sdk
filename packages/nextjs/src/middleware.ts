import type { NextRequest } from 'next/server.js';
import { NextResponse } from 'next/server.js';
import { verifyAuthonToken } from './verify';

const DEFAULT_COOKIE_NAME = 'authon-token';

export interface AuthonMiddlewareOptions {
  publicRoutes?: string[];
  signInUrl?: string;
  secretKey?: string;
  apiUrl?: string;
  timeoutMs?: number;
  cookieName?: string;
  verifyToken?: boolean;
  protectApiRoutes?: boolean;
}

function matchRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith('*')) return pathname.startsWith(pattern.slice(0, -1));
    return pathname === pattern;
  });
}

function bearerToken(value: string | null): string | null {
  if (!value) return null;
  return /^Bearer ([^\s]+)$/i.exec(value)?.[1] ?? null;
}

function isApiRoute(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

function unauthorized(request: NextRequest, signInUrl: string, asJson: boolean): NextResponse {
  if (asJson) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = request.nextUrl.clone();
  url.pathname = signInUrl;
  url.search = '';
  url.hash = '';
  url.searchParams.set('redirect_url', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export function authonMiddleware(options: AuthonMiddlewareOptions = {}) {
  const {
    publicRoutes = ['/'],
    signInUrl = '/sign-in',
    cookieName = DEFAULT_COOKIE_NAME,
    protectApiRoutes = false,
    verifyToken = false,
  } = options;
  const alwaysPublic = [signInUrl, '/_next/*', '/favicon.ico'];
  if (!protectApiRoutes) alwaysPublic.push('/api', '/api/*');

  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    if (matchRoute(pathname, [...publicRoutes, ...alwaysPublic])) return NextResponse.next();

    const authorization = request.headers.get('authorization');
    const token = authorization !== null
      ? bearerToken(authorization)
      : request.cookies.get(cookieName)?.value ?? null;
    const apiOrBearerRequest = (protectApiRoutes && isApiRoute(pathname)) || authorization !== null;

    if (!token) return unauthorized(request, signInUrl, apiOrBearerRequest);

    if (verifyToken && !await verifyAuthonToken(token, options)) {
      return unauthorized(request, signInUrl, apiOrBearerRequest);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-authon-token', token);
    return NextResponse.next({ request: { headers: requestHeaders } });
  };
}
