**English** | [한국어](./README.ko.md)

# @authon/js

Core browser SDK for [Authon](https://authon.dev) — ShadowDOM login modal, OAuth flows, and session management.

## Install

```bash
npm install @authon/js
# or
pnpm add @authon/js
```

## Quick Start

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_...');

// Open the sign-in modal
await authon.openSignIn();

// Listen for auth events
authon.on('signedIn', (user) => {
  console.log('Signed in:', user.email);
});

authon.on('signedOut', () => {
  console.log('Signed out');
});

// Email/password sign-in
const user = await authon.signInWithEmail('user@example.com', 'password');

// OAuth sign-in (uses dashboard default flow: auto | popup | redirect)
await authon.signInWithOAuth('google');

// Optional runtime override
await authon.signInWithOAuth('google', { flowMode: 'redirect' });

// Get current user and token
const currentUser = authon.getUser();
const token = authon.getToken();

// Sign out
await authon.signOut();
```

## Configuration

```ts
const authon = new Authon('pk_live_...', {
  apiUrl: 'https://api.authon.dev',  // Custom API URL
  mode: 'popup',                      // 'popup' | 'embedded'
  theme: 'auto',                      // 'light' | 'dark' | 'auto'
  locale: 'en',                       // Locale for the modal UI
  containerId: 'auth-container',      // Container element ID (embedded mode)
  appearance: {                        // Custom branding overrides
    primaryColorStart: '#7c3aed',
    primaryColorEnd: '#4f46e5',
    borderRadius: 12,
    brandName: 'My App',
  },
});
```

## API Reference

### `Authon` class

| Method | Returns | Description |
|--------|---------|-------------|
| `openSignIn()` | `Promise<void>` | Open the sign-in modal |
| `openSignUp()` | `Promise<void>` | Open the sign-up modal |
| `signInWithEmail(email, password)` | `Promise<AuthonUser>` | Sign in with email/password |
| `signUpWithEmail(email, password, meta?)` | `Promise<AuthonUser>` | Register with email/password |
| `signInWithOAuth(provider, options?)` | `Promise<void>` | Start OAuth flow (`auto`, `popup`, `redirect`) |
| `signOut()` | `Promise<void>` | Sign out and clear session |
| `getUser()` | `AuthonUser \| null` | Get current user |
| `getToken()` | `string \| null` | Get current access token |
| `on(event, listener)` | `() => void` | Subscribe to events (returns unsubscribe fn) |
| `destroy()` | `void` | Clean up resources |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `signedIn` | `AuthonUser` | User signed in |
| `signedOut` | none | User signed out |
| `tokenRefreshed` | `string` | Access token was refreshed |
| `error` | `Error` | An error occurred |
| `mfaRequired` | `string` | MFA verification is required (payload is the mfaToken) |

## Multi-Factor Authentication (MFA)

Authon supports TOTP-based MFA compatible with Google Authenticator, Authy, and other authenticator apps.

### MFA Setup

```ts
import { Authon, generateQrSvg } from '@authon/js';

const authon = new Authon('pk_live_...');

// 1. Start MFA setup (user must be signed in)
const setup = await authon.setupMfa();
// setup.secret   — TOTP secret key
// setup.qrCodeUri — otpauth:// URI for authenticator apps
// setup.backupCodes — one-time recovery codes
// setup.qrCodeSvg — ready-to-use SVG string for the QR code

// Display the QR code in your UI
document.getElementById('qr')!.innerHTML = setup.qrCodeSvg;

// 2. User scans the QR code and enters the 6-digit code
const verified = await authon.verifyMfaSetup('123456');
```

### MFA Sign-In Flow

When MFA is enabled, `signInWithEmail` throws `AuthonMfaRequiredError`:

```ts
import { Authon, AuthonMfaRequiredError } from '@authon/js';

try {
  await authon.signInWithEmail('user@example.com', 'password');
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    // Prompt user for TOTP code, then verify
    const user = await authon.verifyMfa(err.mfaToken, '123456');
  }
}

// Or use the event listener
authon.on('mfaRequired', async (mfaToken) => {
  const code = prompt('Enter your 2FA code');
  if (code) await authon.verifyMfa(mfaToken, code);
});
```

### MFA Management

```ts
// Check MFA status
const status = await authon.getMfaStatus();
// status.enabled, status.backupCodesRemaining

// Disable MFA (requires current TOTP code)
await authon.disableMfa('123456');

// Regenerate backup codes (requires current TOTP code)
const newCodes = await authon.regenerateBackupCodes('123456');
```

### QR Code Generator

The SDK includes a zero-dependency QR code SVG generator:

```ts
import { generateQrSvg } from '@authon/js';

const svg = generateQrSvg('otpauth://totp/MyApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MyApp');
document.getElementById('qr')!.innerHTML = svg;
```

### MFA API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `setupMfa()` | `Promise<MfaSetupResponse & { qrCodeSvg: string }>` | Start MFA setup, returns secret + QR code |
| `verifyMfaSetup(code)` | `Promise<void>` | Verify TOTP code to complete setup |
| `verifyMfa(mfaToken, code)` | `Promise<AuthonUser>` | Verify TOTP during sign-in |
| `disableMfa(code)` | `Promise<void>` | Disable MFA |
| `getMfaStatus()` | `Promise<MfaStatus>` | Get current MFA status |
| `regenerateBackupCodes(code)` | `Promise<string[]>` | Regenerate backup codes |

## ShadowDOM Modal

The login modal renders inside a ShadowRoot, preventing CSS conflicts with your application. Branding (colors, logo, border radius, custom CSS) is fetched from your Authon project settings and can be overridden via the `appearance` config.

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
