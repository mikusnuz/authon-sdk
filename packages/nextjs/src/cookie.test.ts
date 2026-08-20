import { describe, expect, it } from 'vitest';

import { deleteAuthonCookie, serializeAuthonCookie } from './cookie';

describe('Next.js compatibility cookie serialization', () => {
  it('uses symmetric Path and SameSite attributes over HTTP', () => {
    expect(serializeAuthonCookie('header.payload.sig', {
      cookieName: 'project-token',
      protocol: 'http:',
    })).toBe('project-token=header.payload.sig; Path=/; SameSite=Lax');
    expect(deleteAuthonCookie({
      cookieName: 'project-token',
      protocol: 'http:',
    })).toBe('project-token=; Path=/; SameSite=Lax; Max-Age=0');
  });

  it('adds Secure symmetrically only over HTTPS', () => {
    expect(serializeAuthonCookie('token', { protocol: 'https:' }))
      .toBe('authon-token=token; Path=/; SameSite=Lax; Secure');
    expect(deleteAuthonCookie({ protocol: 'https:' }))
      .toBe('authon-token=; Path=/; SameSite=Lax; Secure; Max-Age=0');
  });
});
