---
title: "Why We Built a Self-Hosted Clerk Alternative (and Open-Sourced It)"
published: false
description: "The story behind Authon — a free, self-hosted auth platform with 15 SDKs supporting OAuth, MFA, Passkeys, and Web3"
tags: opensource, authentication, webdev, selfhosted
---

Authentication is the first thing every web app needs and the last thing anyone wants to build from scratch. So we used Clerk. Then we used Auth0. Then we tried Supabase Auth. Each time, we ran into the same problems.

This is the story of why we built [Authon](https://authon.dev) — a free, self-hosted authentication platform — and open-sourced it.

## The Problem with Hosted Auth

### 1. Pricing Scales Faster Than Revenue

Clerk charges $0.02 per monthly active user beyond 10,000. Auth0's Essentials plan charges $0.07/MAU. At 50,000 users, you're looking at $800-3,500/month just for authentication.

For a bootstrapped startup, that's painful. Authentication is infrastructure — it should scale with compute cost, not user count.

| Users | Clerk | Auth0 | Authon |
|---|---|---|---|
| 10,000 | Free | ~$700/mo | Free |
| 50,000 | ~$825/mo | ~$3,500/mo | Free |
| 100,000 | ~$1,825/mo | Custom | Free |
| 500,000 | Custom | Custom | Free |

### 2. Vendor Lock-in Is Real

When your middleware imports `@clerk/nextjs`, your React components use `<ClerkProvider>`, and your API routes call `clerkClient.users.getUser()`, switching auth providers means rewriting most of your application.

Firebase Auth is worse — your Firestore security rules reference `request.auth`, your Cloud Functions use auth triggers, and your user IDs are Firebase-specific. Migrating away is a multi-week project.

### 3. Data Sovereignty

When you use a hosted auth service, your users' credentials, sessions, and personal data live on someone else's servers. For some industries and regions (healthcare, finance, EU), that's not acceptable.

### 4. Missing Features We Needed

We needed three things that no single platform offered:

- **Web3 wallet authentication** — native EVM and Solana sign-in, not a third-party plugin
- **ShadowDOM-isolated UI** — a login modal that never conflicts with the host app's CSS
- **15+ SDKs** — first-party support for React, Vue, Svelte, Angular, React Native, Flutter, Python, Go, Swift, Kotlin

## The Solution: Authon

We built Authon as a standalone auth platform with these principles:

1. **Self-hosted, always free** — run it on your own server, pay nothing per user
2. **Drop-in SDKs** — one line to add auth to any framework
3. **ShadowDOM isolation** — the login modal is encapsulated, zero CSS conflicts
4. **Web3 native** — wallet auth is a first-class citizen, not an afterthought

### What Authon Does

**Authentication methods:**
- Email / password (sign up, sign in, password reset)
- OAuth (Google, Apple, GitHub, Discord, Facebook, Microsoft, Kakao, Naver, LINE, X)
- Passwordless (magic link, email OTP)
- Passkeys (WebAuthn) — full lifecycle: register, authenticate, list, rename, revoke
- Web3 wallets — EVM (MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet) and Solana (Phantom)

**Security:**
- MFA (TOTP) — Google Authenticator / Authy compatible, with backup codes
- Session management — list active sessions, revoke individually
- Audit logs — every auth event tracked

**Platform features:**
- Organizations — multi-tenant support with roles (owner, admin, member)
- JWT templates — custom claim mapping
- Webhooks — 10 event types with signed payloads
- Branding — full theming (colors, logos, custom CSS, locale)
- Admin dashboard — user management, analytics, configuration

### 15 SDKs Across 6 Languages

| Platform | Package |
|---|---|
| Vanilla JS | `@authon/js` |
| React | `@authon/react` |
| Next.js | `@authon/nextjs` |
| Vue 3 | `@authon/vue` |
| Nuxt 3 | `@authon/nuxt` |
| Svelte | `@authon/svelte` |
| Angular | `@authon/angular` |
| React Native | `@authon/react-native` |
| Node.js | `@authon/node` |
| Python | `authon` (PyPI) |
| Go | `authon-go` |
| Dart / Flutter | `authon` (pub.dev) |
| Swift (iOS/macOS) | `Authon` (SPM) |
| Kotlin (Android) | `authon-kotlin` (Maven) |
| CLI scaffolding | `create-authon-app` |

We didn't want to ship an SDK for React and leave everyone else to figure it out. Whether you're building with Django, FastAPI, Gin, Flutter, or SwiftUI — there's a first-party SDK.

## How It Works

### React Example

```tsx
import { AuthonProvider, SignedIn, SignedOut, UserButton, useAuthon } from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </AuthonProvider>
  );
}

function SignInButton() {
  const { openSignIn } = useAuthon();
  return <button onClick={openSignIn}>Sign in</button>;
}
```

That's the entire auth integration. The `openSignIn()` function renders a ShadowDOM modal with every provider you've configured in the dashboard.

### Next.js Middleware

```ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/pricing'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

Three lines of config. Every non-public route is protected.

### Express Backend

```ts
import { expressMiddleware } from '@authon/node';

app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});
```

The middleware verifies the JWT, decodes the user, and attaches it to `req.auth`.

### Web3 Sign-In

```ts
const authon = new Authon('pk_live_...');

// Get a nonce for the wallet to sign
const { message } = await authon.web3GetNonce(address, 'evm', 'metamask');

// User signs the message in MetaMask
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [message, address],
});

// Verify the signature and get a session
const user = await authon.web3Verify(message, signature, address, 'evm', 'metamask');
```

No third-party plugins, no complex integrations. Web3 auth is built into the core SDK.

## ShadowDOM: Why It Matters

Most auth solutions inject UI directly into the DOM or use iframes. Both have problems:

- **Direct DOM injection** means your app's CSS affects the auth modal. A `* { box-sizing: border-box; }` rule, a global font override, or a high z-index div can break the login form.
- **Iframes** work but create UX friction — different scroll contexts, blocked by some browsers, and harder to theme.

Authon uses ShadowDOM. The modal is rendered inside a shadow root that's completely isolated from your app's styles. Your CSS can't leak in, and the modal's styles can't leak out. It just works, every time.

## The Comparison

| Feature | Authon | Clerk | Auth0 | Auth.js | Firebase Auth | Supabase Auth |
|---|---|---|---|---|---|---|
| Self-hosted | Yes | No | No | N/A (library) | No | Yes |
| Free unlimited users | Yes | No (10K) | No (25K) | Yes | Partial | Partial |
| Web3 | Yes | No | No | No | No | No |
| Passkeys | Yes | Yes | Yes | Experimental | Limited | No |
| MFA | Yes | Yes | Yes | No | Paid | Yes |
| Organizations | Yes | Yes | Yes (paid) | No | No | No |
| ShadowDOM UI | Yes | No | No | No | No | No |
| SDKs | 15 | 8 | 20+ | 5 | 10+ | 6 |
| Pre-built UI | Yes | Yes | Universal Login | No | FirebaseUI | Basic |

## Open Source

Authon SDK is MIT licensed and [available on GitHub](https://github.com/mikusnuz/authon-sdk). The monorepo contains all 15 SDKs, fully typed, with complete documentation.

```bash
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk
pnpm install
pnpm build
```

## Getting Started

The fastest way to try Authon:

```bash
npx create-authon-app my-app --framework nextjs
```

This scaffolds a Next.js app with Authon pre-configured — provider, middleware, sign-in page, and dashboard.

Or install manually:

```bash
npm install @authon/nextjs @authon/js
```

Documentation: [docs.authon.dev](https://docs.authon.dev)
GitHub: [github.com/mikusnuz/authon-sdk](https://github.com/mikusnuz/authon-sdk)
Website: [authon.dev](https://authon.dev)

## What's Next

We're actively building:
- SMS/phone authentication
- SAML and OIDC federation
- Anonymous auth
- Rate limiting and bot detection
- More OAuth providers

If you're tired of paying per user for authentication, or you need Web3/Passkeys/MFA in a self-hosted package, give Authon a try. We'd love your feedback.
