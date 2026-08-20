import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { authonMiddleware } from './middleware';

describe('authonMiddleware compatibility', () => {
  it.each(['/', '/sign-in', '/_next/static/app.js', '/api/private', '/favicon.ico'])(
    'leaves the default public route %s accessible',
    async (pathname) => {
      const response = await authonMiddleware()(new NextRequest(`https://app.example${pathname}`));

      expect(response.headers.get('x-middleware-next')).toBe('1');
      expect(response.headers.get('location')).toBeNull();
    },
  );

  it('redirects an unauthenticated protected route to the default sign-in route', async () => {
    const response = await authonMiddleware()(
      new NextRequest('https://app.example/dashboard?tab=security'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://app.example/sign-in?tab=security&redirect_url=%2Fdashboard',
    );
  });

  it('forwards the default cookie token on a protected route', async () => {
    const request = new NextRequest('https://app.example/dashboard', {
      headers: { cookie: 'authon-token=session-token' },
    });

    const response = await authonMiddleware()(request);

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-authon-token')).toBe('session-token');
  });
});
