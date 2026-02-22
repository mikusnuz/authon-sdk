import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export interface AuthonMiddlewareOptions {
  publicRoutes?: string[];
  signInUrl?: string;
  secretKey?: string;
  apiUrl?: string;
}

function matchRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern;
  });
}

export function authonMiddleware(options: AuthonMiddlewareOptions = {}) {
  const { publicRoutes = ['/'], signInUrl = '/sign-in' } = options;

  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    if (matchRoute(pathname, [...publicRoutes, signInUrl, '/_next/*', '/api/*', '/favicon.ico'])) {
      return NextResponse.next();
    }

    const token =
      request.cookies.get('authon-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = signInUrl;
      url.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.headers.set('x-authon-token', token);
    return response;
  };
}
