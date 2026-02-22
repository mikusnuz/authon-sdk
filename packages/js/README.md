# @authup/js

Core browser SDK for [Authup](https://authup.dev) — ShadowDOM login modal, OAuth flows, and session management.

## Install

```bash
npm install @authup/js
# or
pnpm add @authup/js
```

## Quick Start

```ts
import { Authup } from '@authup/js';

const authup = new Authup('pk_live_...');

// Open the sign-in modal
await authup.openSignIn();

// Listen for auth events
authup.on('signedIn', (user) => {
  console.log('Signed in:', user.email);
});

authup.on('signedOut', () => {
  console.log('Signed out');
});

// Email/password sign-in
const user = await authup.signInWithEmail('user@example.com', 'password');

// OAuth sign-in (opens popup)
await authup.signInWithOAuth('google');

// Get current user and token
const currentUser = authup.getUser();
const token = authup.getToken();

// Sign out
await authup.signOut();
```

## Configuration

```ts
const authup = new Authup('pk_live_...', {
  apiUrl: 'https://api.authup.dev',  // Custom API URL
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

### `Authup` class

| Method | Returns | Description |
|--------|---------|-------------|
| `openSignIn()` | `Promise<void>` | Open the sign-in modal |
| `openSignUp()` | `Promise<void>` | Open the sign-up modal |
| `signInWithEmail(email, password)` | `Promise<AuthupUser>` | Sign in with email/password |
| `signUpWithEmail(email, password, meta?)` | `Promise<AuthupUser>` | Register with email/password |
| `signInWithOAuth(provider)` | `Promise<void>` | Start OAuth flow in popup window |
| `signOut()` | `Promise<void>` | Sign out and clear session |
| `getUser()` | `AuthupUser \| null` | Get current user |
| `getToken()` | `string \| null` | Get current access token |
| `on(event, listener)` | `() => void` | Subscribe to events (returns unsubscribe fn) |
| `destroy()` | `void` | Clean up resources |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `signedIn` | `AuthupUser` | User signed in |
| `signedOut` | none | User signed out |
| `tokenRefreshed` | `string` | Access token was refreshed |
| `error` | `Error` | An error occurred |

## ShadowDOM Modal

The login modal renders inside a ShadowRoot, preventing CSS conflicts with your application. Branding (colors, logo, border radius, custom CSS) is fetched from your Authup project settings and can be overridden via the `appearance` config.

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
