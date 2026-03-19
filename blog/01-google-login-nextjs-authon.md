---
title: "How to Add Google Login to Next.js with Authon in 5 Minutes"
published: false
description: "Step-by-step guide to adding OAuth authentication to your Next.js app using Authon, a self-hosted Clerk alternative"
tags: nextjs, authentication, oauth, react
canonical_url: https://authon.dev/blog/google-login-nextjs
---

Most auth tutorials take 30 minutes and leave you with a half-working setup. This one takes 5.

We're going to add Google login to a Next.js 15 app using [Authon](https://authon.dev) — a self-hosted authentication platform with 15 SDKs. By the end, you'll have a working sign-in flow with a themed modal, protected routes, and server-side session verification.

## What You'll Build

- A Next.js app with Google OAuth sign-in
- A ShadowDOM login modal (no CSS conflicts)
- Middleware that protects private routes
- Server-side user verification in API routes

## Prerequisites

- Node.js 18+
- An Authon account (free, self-hosted) or access to a hosted Authon instance
- A Google OAuth client ID and secret (from [Google Cloud Console](https://console.cloud.google.com/apis/credentials))

## Step 1: Create a Next.js App

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
```

Or use the Authon CLI scaffolding tool:

```bash
npx create-authon-app my-app --framework nextjs
```

## Step 2: Install the Authon SDK

```bash
npm install @authon/nextjs @authon/js
```

The `@authon/nextjs` package includes React components, hooks, middleware, and server helpers. `@authon/js` is the core browser SDK that powers the ShadowDOM modal.

## Step 3: Set Up Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_AUTHON_KEY=pk_live_your_publishable_key
AUTHON_SECRET_KEY=sk_live_your_secret_key
```

You get these keys from the Authon dashboard after creating a project. The publishable key is safe to expose in the browser. The secret key stays on the server.

## Step 4: Add the Provider

Wrap your app with `AuthonProvider` in `app/layout.tsx`:

```tsx
// app/layout.tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
```

This initializes the Authon client and provides auth context to all components.

## Step 5: Add the Middleware

Create `middleware.ts` in your project root:

```ts
// middleware.ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/about', '/pricing'],
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

This protects every route except the ones listed in `publicRoutes`. Unauthenticated users are redirected to `/sign-in`.

## Step 6: Build the Sign-In Page

```tsx
// app/sign-in/page.tsx
'use client';

import { SignedOut, useAuthon } from '@authon/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { openSignIn } = useAuthon();
  const router = useRouter();

  return (
    <SignedOut>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your dashboard.</p>
          <button
            onClick={async () => {
              await openSignIn();
            }}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#7c3aed',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </SignedOut>
  );
}
```

When the user clicks "Sign in", Authon opens a ShadowDOM modal with Google (and any other providers you've configured). The modal is completely isolated from your app's CSS — no style conflicts, no z-index battles.

## Step 7: Build the Dashboard

```tsx
// app/dashboard/page.tsx
'use client';

import { SignedIn, UserButton, useUser } from '@authon/react';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <SignedIn>
      <div style={{ padding: '2rem' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Dashboard</h1>
          <UserButton />
        </nav>

        <div style={{ marginTop: '2rem' }}>
          <h2>Welcome, {user?.displayName || user?.email}!</h2>
          <p>Email: {user?.email}</p>
          <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </SignedIn>
  );
}
```

The `<UserButton />` component renders an avatar dropdown with sign-out, profile management, and session info. The `useUser()` hook gives you the current user object.

## Step 8: Add Server-Side Verification (Optional)

If you have API routes that need to verify the user server-side:

```ts
// app/api/me/route.ts
import { currentUser } from '@authon/nextjs/server';

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  });
}
```

The `currentUser()` helper reads the token from the request cookie or Authorization header and verifies it against the Authon API.

## Step 9: Run It

```bash
npm run dev
```

Open `http://localhost:3000` — you'll see your landing page. Navigate to `/dashboard` — the middleware redirects you to `/sign-in`. Click "Sign in", pick Google from the modal, and you're in.

## Adding More Providers

Want GitHub, Discord, or Apple login? Enable them in the Authon dashboard. They'll automatically appear in the sign-in modal — no code changes needed.

## Adding MFA

Want to add TOTP-based multi-factor authentication?

```tsx
import { useAuthonMfa } from '@authon/react';

function MfaSetup() {
  const { setupMfa, verifyMfaSetup } = useAuthonMfa();

  const handleSetup = async () => {
    const result = await setupMfa();
    // result.qrCodeSvg — render this as an SVG for Google Authenticator
    // result.backupCodes — display these to the user
  };

  const handleVerify = async (code: string) => {
    await verifyMfaSetup(code);
    // MFA is now enabled
  };

  return (
    <div>
      <button onClick={handleSetup}>Enable MFA</button>
    </div>
  );
}
```

## Adding Web3 Login

Need wallet authentication?

```tsx
import { useAuthonWeb3 } from '@authon/react';

function Web3Login() {
  const { connectWallet } = useAuthonWeb3();

  return (
    <button onClick={() => connectWallet('metamask', 'evm')}>
      Sign in with MetaMask
    </button>
  );
}
```

Authon supports MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet (EVM), and Phantom (Solana).

## What You Get

In under 5 minutes, you now have:

- Google OAuth sign-in with a themed, ShadowDOM-isolated modal
- Protected routes via middleware
- Server-side token verification
- A `<UserButton>` component for sign-out and profile management
- The option to add MFA, Passkeys, Web3, and more providers with zero code changes to the auth flow

## Next Steps

- [Authon Documentation](https://docs.authon.dev)
- [SDK Reference on GitHub](https://github.com/mikusnuz/authon-sdk)
- [Authon vs Clerk comparison](https://github.com/mikusnuz/authon-sdk/blob/main/docs/compare/clerk.md)
- [Authon vs Auth0 comparison](https://github.com/mikusnuz/authon-sdk/blob/main/docs/compare/auth0.md)
