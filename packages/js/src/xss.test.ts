// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import type { AuthonUser, BrandingConfig } from '@authon/shared';
import { ModalRenderer } from './modal';
import { ProfileRenderer } from './profile';
import {
  escapeHtml,
  isSafeColor,
  safeAvatarUrl,
  safeHttpUrl,
  safeImageDataUrl,
  sanitizeCustomCss,
} from './sanitize';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

function openModal(branding: Record<string, unknown>): ShadowRoot {
  const modal = new ModalRenderer({
    mode: 'popup',
    theme: 'light',
    branding: branding as BrandingConfig,
    onProviderClick: () => {},
    onEmailSubmit: () => {},
    onClose: () => {},
  });
  modal.setProviders(['google']);
  modal.open('signIn');
  return (modal as any).shadowRoot as ShadowRoot;
}

function user(overrides: Partial<AuthonUser> = {}): AuthonUser {
  return {
    id: 'user_1', projectId: 'project_1', email: 'person@example.com', displayName: 'Person',
    avatarUrl: null, phone: null, emailVerified: true, phoneVerified: false, isBanned: false,
    publicMetadata: null, lastSignInAt: null, signInCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('sanitize helpers', () => {
  it('escapes both quote styles', () => {
    expect(escapeHtml(`<a href='x' title="y">&`)).toBe('&lt;a href=&#39;x&#39; title=&quot;y&quot;&gt;&amp;');
  });

  it('accepts only absolute http(s) URLs', () => {
    expect(safeHttpUrl('https://example.com/terms')).toBe('https://example.com/terms');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('data:text/html,hi')).toBeNull();
    expect(safeHttpUrl('//evil.example')).toBeNull();
    expect(safeHttpUrl('https://x.example/"onmouseover="alert(1)')).toBe('https://x.example/%22onmouseover=%22alert(1)');
  });

  it('accepts only whitelisted base64 image data URLs for logos', () => {
    expect(safeImageDataUrl(PNG)).toBe(PNG);
    expect(safeImageDataUrl('data:image/svg+xml;base64,PHN2Zy8+')).toBe('data:image/svg+xml;base64,PHN2Zy8+');
    expect(safeImageDataUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeNull();
    expect(safeImageDataUrl('data:image/png" onerror="alert(1);base64,AAAA')).toBeNull();
    expect(safeImageDataUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBeNull();
    expect(safeImageDataUrl('https://example.com/logo.png')).toBeNull();
  });

  it('allows http(s) or image data URLs for avatars', () => {
    expect(safeAvatarUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png');
    expect(safeAvatarUrl(PNG)).toBe(PNG);
    expect(safeAvatarUrl('javascript:alert(1)')).toBeNull();
  });

  it('validates colors strictly', () => {
    for (const ok of ['#fff', '#7c3aed', '#7c3aed80', 'rgb(1, 2, 3)', 'rgba(1,2,3,0.5)', 'rgb(1 2 3 / 50%)', 'hsl(210, 40%, 50%)', 'hsla(210deg 40% 50% / .5)']) {
      expect(isSafeColor(ok), ok).toBe(true);
    }
    for (const bad of ['red;}</style><script>alert(1)</script>', '#fff;background:url(x)', 'url(javascript:1)', 'expression(alert(1))', 'rgb(1,2,3);x', '']) {
      expect(isSafeColor(bad), bad).toBe(false);
    }
  });

  it('strips </style sequences from custom CSS, including nested ones', () => {
    expect(sanitizeCustomCss('a{}</style><img src=x onerror=alert(1)>')).not.toMatch(/<\s*\/\s*style/i);
    expect(sanitizeCustomCss('<</style/style>')).not.toMatch(/<\s*\/\s*style/i);
    expect(sanitizeCustomCss('.x{color:red}')).toBe('.x{color:red}');
  });
});

describe('sign-in modal with malicious branding', () => {
  it('renders brandName as text', () => {
    const root = openModal({ brandName: '<img src=x onerror="window.__xss=1">Acme' });
    expect(root.querySelector('img[onerror]')).toBeNull();
    expect(root.querySelector('.brand-name')?.textContent).toBe('<img src=x onerror="window.__xss=1">Acme');
  });

  it('drops javascript: and attribute-breaking terms/privacy URLs', () => {
    const root = openModal({
      termsUrl: 'javascript:alert(1)',
      privacyUrl: 'https://ok.example/p" onclick="alert(1)',
    });
    const links = [...root.querySelectorAll('.footer a')];
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('https://ok.example/p%22%20onclick=%22alert(1)');
    expect(links[0].hasAttribute('onclick')).toBe(false);
  });

  it('accepts a valid http(s) terms URL', () => {
    const root = openModal({ termsUrl: 'https://acme.example/terms' });
    expect(root.querySelector('.footer a')?.getAttribute('href')).toBe('https://acme.example/terms');
  });

  it('rejects non-image or attribute-injecting logo data URLs', () => {
    expect(openModal({ logoDataUrl: 'data:image/png;base64,AAAA" onerror="alert(1)' }).querySelector('img.logo')).toBeNull();
    expect(openModal({ logoDataUrl: 'javascript:alert(1)' }).querySelector('img.logo')).toBeNull();
    expect(openModal({ logoDataUrl: 'data:text/html;base64,PHNjcmlwdD4=' }).querySelector('img.logo')).toBeNull();
    const ok = openModal({ logoDataUrl: PNG }).querySelector('img.logo');
    expect(ok?.getAttribute('src')).toBe(PNG);
    expect(ok?.attributes).toHaveLength(3);
  });

  it('keeps custom CSS inside its own style element', () => {
    const root = openModal({ customCss: '.title{color:red}</style><img src=x onerror=alert(1)><style>' });
    expect(root.querySelector('img[onerror]')).toBeNull();
    const custom = root.getElementById('authon-custom-style');
    expect(custom?.tagName).toBe('STYLE');
    expect(custom?.textContent).toContain('.title{color:red}');
    expect(custom?.textContent).not.toMatch(/<\s*\/\s*style/i);
    expect(root.getElementById('authon-theme-style')?.textContent).not.toContain('.title{color:red}');
    expect(root.querySelectorAll('style')).toHaveLength(2);
  });

  it('falls back to defaults for invalid colors and radius', () => {
    const root = openModal({
      primaryColorStart: 'red;}</style><script>alert(1)</script>',
      primaryColorEnd: 'rgb(1,2,3)',
      lightBg: '#fff;background:url(https://evil.example)',
      lightText: 'hsl(0, 0%, 10%)',
      borderRadius: '4px;}</style><script>alert(1)</script>',
    });
    const css = root.getElementById('authon-theme-style')?.textContent ?? '';
    expect(root.querySelector('script')).toBeNull();
    expect(css).toContain('--authon-primary-start: #7c3aed;');
    expect(css).toContain('--authon-primary-end: rgb(1,2,3);');
    expect(css).toContain('--authon-bg: #ffffff;');
    expect(css).toContain('--authon-text: hsl(0, 0%, 10%);');
    expect(css).toContain('--authon-radius: 12px;');
    expect(css).not.toContain('evil.example');
  });

  it('builds translucent overlay colors for non-hex backgrounds', () => {
    const css = openModal({ lightBg: 'rgb(10, 20, 30)' }).getElementById('authon-theme-style')?.textContent ?? '';
    expect(css).toContain('--authon-overlay-bg: color-mix(in srgb, rgb(10, 20, 30) 92%, transparent);');
  });
});

describe('profile with malicious user fields', () => {
  async function openProfile(u: AuthonUser, edit = false): Promise<ShadowRoot> {
    const profile = new ProfileRenderer({
      mode: 'popup',
      theme: 'light',
      user: u,
      onSave: async () => {},
      onSignOut: async () => {},
      onRevokeSession: async () => {},
      onClose: () => {},
    } as any);
    profile.open();
    if (edit) {
      (profile as any).shadowRoot.getElementById('profile-edit-btn').click();
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return (profile as any).shadowRoot as ShadowRoot;
  }

  const evilName = '"><img src=x onerror="window.__xss=1">';

  it('escapes displayName in view mode', async () => {
    const root = await openProfile(user({ displayName: evilName }));
    expect(root.querySelector('img[onerror]')).toBeNull();
    expect(root.querySelector('.display-name')?.textContent).toBe(evilName);
  });

  it('escapes displayName and avatarUrl inside input value attributes', async () => {
    const evilAvatar = 'https://a.example/x.png" autofocus onfocus="alert(1)';
    const root = await openProfile(user({ displayName: evilName, avatarUrl: evilAvatar }), true);
    expect(root.querySelector('img[onerror]')).toBeNull();
    expect(root.querySelector('[onfocus]')).toBeNull();
    const nameInput = root.getElementById('profile-displayname-input') as HTMLInputElement;
    const avatarInput = root.getElementById('profile-avatar-input') as HTMLInputElement;
    expect(nameInput.value).toBe(evilName);
    expect(avatarInput.value).toBe(evilAvatar);
  });

  it('only renders http(s) or image data avatars', async () => {
    expect((await openProfile(user({ avatarUrl: 'javascript:alert(1)' }))).querySelector('img.avatar-img')).toBeNull();
    expect((await openProfile(user({ avatarUrl: PNG }))).querySelector('img.avatar-img')?.getAttribute('src')).toBe(PNG);
    expect((await openProfile(user({ avatarUrl: 'https://cdn.example/a.png' }))).querySelector('img.avatar-img')?.getAttribute('src'))
      .toBe('https://cdn.example/a.png');
  });
});
