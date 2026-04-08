# Authon SDK

Official SDKs for [Authon](https://authon.dev) — a modern authentication platform. Provides drop-in auth for any framework.

[![npm version](https://img.shields.io/npm/v/@authon/js?label=%40authon%2Fjs&color=6d28d9)](https://www.npmjs.com/package/@authon/js)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

## Packages

### JavaScript / TypeScript

| Package | Version | Description | npm |
|---------|---------|-------------|-----|
| [`@authon/shared`](./packages/shared) | 0.3.0 | Shared types and constants for all Authon SDKs | [npm](https://www.npmjs.com/package/@authon/shared) |
| [`@authon/js`](./packages/js) | 0.7.14 | Core browser SDK — ShadowDOM modal, OAuth, sessions, CAPTCHA, i18n (21 languages) | [npm](https://www.npmjs.com/package/@authon/js) |
| [`@authon/react`](./packages/react) | 0.3.2 | Provider, hooks, and components for React | [npm](https://www.npmjs.com/package/@authon/react) |
| [`@authon/nextjs`](./packages/nextjs) | 0.3.0 | Middleware and React components for Next.js | [npm](https://www.npmjs.com/package/@authon/nextjs) |
| [`@authon/vue`](./packages/vue) | 0.3.3 | Plugin, composables, and components for Vue 3 | [npm](https://www.npmjs.com/package/@authon/vue) |
| [`@authon/nuxt`](./packages/nuxt) | 0.3.3 | Auto-imported composables and middleware for Nuxt 3 | [npm](https://www.npmjs.com/package/@authon/nuxt) |
| [`@authon/svelte`](./packages/svelte) | 0.3.3 | Stores and components for Svelte | [npm](https://www.npmjs.com/package/@authon/svelte) |
| [`@authon/angular`](./packages/angular) | 0.3.3 | Service, guard, and components for Angular | [npm](https://www.npmjs.com/package/@authon/angular) |
| [`@authon/react-native`](./packages/react-native) | 0.3.10 | Mobile authentication for React Native | [npm](https://www.npmjs.com/package/@authon/react-native) |
| [`@authon/create-app`](./packages/create-authon-app) | 0.1.0 | CLI scaffolding tool — create new projects with Authon pre-configured | [npm](https://www.npmjs.com/package/@authon/create-app) |

## Features

- **Email / Password** — Sign up, sign in, password reset
- **OAuth** — Google, Apple, GitHub, Discord, Facebook, Microsoft, Kakao, Naver, LINE, X
- **Passwordless** — Magic link and email OTP
- **Passkeys (WebAuthn)** — Register, authenticate, manage credentials
- **Web3** — EVM wallet (MetaMask, WalletConnect, Coinbase Wallet, Pexus) and Solana (Phantom)
- **MFA (TOTP)** — Google Authenticator / Authy compatible, backup codes
- **Session Management** — List and revoke active sessions
- **User Profile** — Update display name, avatar, phone, and custom metadata
- **Webhook Verification** — Validate incoming webhook payloads from Authon

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API key** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...`) — use in your frontend code
   - **Test Key** (`pk_test_...`) — for development, enables [Dev Teleport](https://authon.dev/docs/testing)

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Quick Start

### Vanilla JavaScript

```bash
npm install @authon/js
```

```js
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_...');

// Open the built-in sign-in modal
await authon.openSignIn();

// Or sign in programmatically
const user = await authon.signInWithEmail('user@example.com', 'password');
console.log(user.displayName);

// Listen for auth state changes
authon.on('signedIn', (user) => {
  console.log('Signed in as', user.email);
});

authon.on('signedOut', () => {
  console.log('Signed out');
});

// Get the current user and token
const currentUser = authon.getUser();
const token = authon.getToken();

// Sign out
await authon.signOut();
```

See the full [@authon/js README](./packages/js/README.md) for all available methods.

### React

```bash
npm install @authon/react
```

```tsx
import { AuthonProvider, SignedIn, SignedOut, UserButton, useAuthon } from '@authon/react';
import { useUser } from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </AuthonProvider>
  );
}

function Dashboard() {
  const { user } = useUser();
  return <h1>Welcome, {user?.displayName}</h1>;
}

function LandingPage() {
  const { openSignIn } = useAuthon();
  return <button onClick={openSignIn}>Sign in</button>;
}
```

### Next.js

```bash
npm install @authon/nextjs
```

```ts
// middleware.ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHON_KEY!,
  publicRoutes: ['/', '/about', '/pricing'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

```tsx
// app/layout.tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
```

```ts
// Server-side token verification
import { currentUser } from '@authon/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

## Package READMEs

- [@authon/js](./packages/js/README.md) — Core browser SDK (full API reference)
- [@authon/react](./packages/react/README.md)
- [@authon/nextjs](./packages/nextjs/README.md)
- [@authon/vue](./packages/vue/README.md)
- [@authon/nuxt](./packages/nuxt/README.md)
- [@authon/svelte](./packages/svelte/README.md)
- [@authon/angular](./packages/angular/README.md)
- [@authon/react-native](./packages/react-native/README.md)

## Documentation

Full documentation: [authon.dev/docs](https://authon.dev/docs/getting-started)

Website: [authon.dev](https://authon.dev)

## Contributing

We welcome contributions. Please open an issue first to discuss any changes you'd like to make.

```bash
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk
pnpm install

# Build all packages
pnpm build

# Development mode (watch)
pnpm dev
```

## License

[MIT](./LICENSE)
