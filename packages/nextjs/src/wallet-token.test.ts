import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAuthonWalletToken } from './wallet-token';

afterEach(() => vi.unstubAllGlobals());

describe('createAuthonWalletToken', () => {
  it('requests a wallet token with the secret key', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ token: 't', expiresAt: '2030-01-01T00:00:00.000Z' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await createAuthonWalletToken({ userId: 'u 1', secretKey: 'sk_test_abc', apiUrl: 'https://api.example.dev/' });
    expect(result).toEqual({ token: 't', expiresAt: '2030-01-01T00:00:00.000Z' });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.example.dev/v1/backend/users/u%201/wallet-token');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk_test_abc');
  });

  it('refuses publishable keys and failed responses', async () => {
    await expect(createAuthonWalletToken({ userId: 'u', secretKey: 'pk_test_abc' })).rejects.toThrow('secret key');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 403 })));
    await expect(createAuthonWalletToken({ userId: 'u', secretKey: 'sk_live_x' })).rejects.toThrow('403');
  });
});
