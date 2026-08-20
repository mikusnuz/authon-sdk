import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authonMiddleware } from './middleware';

describe('authonMiddleware compatibility', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

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
      'https://app.example/sign-in?redirect_url=%2Fdashboard%3Ftab%3Dsecurity',
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

  it('uses a configurable cookie name', async () => {
    const request = new NextRequest('https://app.example/dashboard', {
      headers: { cookie: 'project-token=session-token' },
    });

    const response = await authonMiddleware({ cookieName: 'project-token' })(request);

    expect(response.headers.get('x-authon-token')).toBe('session-token');
  });

  it.each([
    ['Bearer valid-token', 'valid-token'],
    ['bearer valid-token', 'valid-token'],
  ])('strictly accepts a single Bearer token from %s', async (authorization, token) => {
    const response = await authonMiddleware()(
      new NextRequest('https://app.example/dashboard', { headers: { authorization } }),
    );

    expect(response.headers.get('x-authon-token')).toBe(token);
  });

  it.each(['Bearer', 'Bearer ', 'Bearer  two-spaces', 'Basic value', 'Bearer token extra']) (
    'rejects malformed Authorization value %j with JSON instead of redirecting',
    async (authorization) => {
      const response = await authonMiddleware()(
        new NextRequest('https://app.example/dashboard', { headers: { authorization } }),
      );

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    },
  );

  it('keeps API routes public unless protectApiRoutes is enabled', async () => {
    const publicResponse = await authonMiddleware()(
      new NextRequest('https://app.example/api/private'),
    );
    const protectedResponse = await authonMiddleware({ protectApiRoutes: true })(
      new NextRequest('https://app.example/api/private'),
    );

    expect(publicResponse.headers.get('x-middleware-next')).toBe('1');
    expect(protectedResponse.status).toBe(401);
    await expect(protectedResponse.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('only remotely verifies tokens when explicitly enabled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const request = () => new NextRequest('https://app.example/dashboard', {
      headers: { cookie: 'authon-token=session-token' },
    });

    const trusted = await authonMiddleware()(request());
    const verified = await authonMiddleware({ verifyToken: true })(request());

    expect(trusted.headers.get('x-middleware-next')).toBe('1');
    expect(verified.status).toBe(307);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('accepts a valid payload-only remote response and preserves an optional key header', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      valid: true,
      payload: { sub: 'user_1' },
    }))));

    const response = await authonMiddleware({
      verifyToken: true,
      apiUrl: 'https://auth.example/base/',
      secretKey: 'sk_test',
    })(new NextRequest('https://app.example/dashboard', {
      headers: { cookie: 'authon-token=session-token' },
    }));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(fetch).toHaveBeenCalledWith('https://auth.example/base/v1/auth/token/verify', expect.objectContaining({
      headers: expect.objectContaining({ 'x-api-key': 'sk_test' }),
    }));
  });

  it.each([
    { valid: false },
    { valid: true },
    { payload: { sub: 'user_1' } },
  ])('fails closed for invalid remote response %#', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));

    const response = await authonMiddleware({ verifyToken: true, protectApiRoutes: true })(
      new NextRequest('https://app.example/api/private', {
        headers: { authorization: 'Bearer session-token' },
      }),
    );

    expect(response.status).toBe(401);
  });

  it('fails closed when remote verification times out', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));

    const pending = authonMiddleware({ verifyToken: true, timeoutMs: 20 })(
      new NextRequest('https://app.example/dashboard', {
        headers: { cookie: 'authon-token=session-token' },
      }),
    );
    await vi.advanceTimersByTimeAsync(20);

    const response = await pending;
    expect(response.status).toBe(307);
  });
});
