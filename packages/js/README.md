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

// OAuth sign-in (opens popup)
await authon.signInWithOAuth('google');

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
| `signInWithOAuth(provider)` | `Promise<void>` | Start OAuth flow in popup window |
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

## ShadowDOM Modal

The login modal renders inside a ShadowRoot, preventing CSS conflicts with your application. Branding (colors, logo, border radius, custom CSS) is fetched from your Authon project settings and can be overridden via the `appearance` config.

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
