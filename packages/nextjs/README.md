**English** | [한국어](./README.ko.md)

# @authon/nextjs

Next.js integration for [Authon](https://authon.dev). Includes edge middleware, server-side helpers, and all React components and hooks.

## Install

```bash
npm install @authon/nextjs @authon/js
# or
pnpm add @authon/nextjs @authon/js
```

Requires `next >= 14.0.0`.

---

## Setup

### 1. Middleware

Create `middleware.ts` at your project root to protect routes at the edge:

```ts
// middleware.ts
import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/about', '/pricing', '/sign-in', '/sign-up'],
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

Any route not listed in `publicRoutes` will redirect unauthenticated users to `signInUrl`. The original destination is preserved as a `redirect_url` query parameter.

### 2. AuthonProvider in layout

Wrap your root layout with `<AuthonProvider>`:

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

---

## Middleware

### `authonMiddleware(options)`

```ts
import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/blog*', '/sign-in'],
  signInUrl: '/sign-in',
  secretKey: process.env.AUTHON_SECRET_KEY,
  apiUrl: 'https://api.authon.dev',
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `publicRoutes` | `string[]` | `['/']` | Routes that do not require authentication. Supports trailing `*` wildcard (e.g. `'/blog*'`) |
| `signInUrl` | `string` | `'/sign-in'` | Redirect destination for unauthenticated users |
| `secretKey` | `string` (optional) | `process.env.AUTHON_SECRET_KEY` | Secret key for token verification |
| `apiUrl` | `string` (optional) | `'https://api.authon.dev'` | Authon API base URL |

The middleware automatically allows `/_next/*`, `/api/*`, and `/favicon.ico` through without authentication.

---

## Server-Side Helpers

Import from `@authon/nextjs/server` for use in Server Components and Route Handlers.

### `currentUser()`

Returns the authenticated user from the session cookie, or `null` if not signed in.

```ts
// app/api/profile/route.ts
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

```ts
// app/dashboard/page.tsx (Server Component)
import { currentUser } from '@authon/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <h1>Welcome, {user.displayName}!</h1>;
}
```

**Return type:** `Promise<AuthonUser | null>`

### `auth()`

Returns the full auth state including `userId`, `user`, and a `getToken()` function. Useful when you need to forward the token to a downstream service.

```ts
// app/api/data/route.ts
import { auth } from '@authon/nextjs/server';

export async function GET() {
  const { userId, user, getToken } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = getToken();

  // Forward token to an internal service
  const response = await fetch('https://internal-api.example.com/data', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return Response.json(await response.json());
}
```

**Return type:**

```ts
Promise<{
  userId: string | null;
  user: AuthonUser | null;
  getToken: () => string | null;
}>
```

---

## Client Components

All components and hooks from `@authon/react` are re-exported from `@authon/nextjs`. Add `'use client'` to any component that uses them.

### Components

```tsx
'use client';

import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  SignUp,
  Protect,
  SocialButtons,
} from '@authon/nextjs';

export function Navbar() {
  return (
    <nav>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href="/sign-in">Sign In</a>
      </SignedOut>
    </nav>
  );
}
```

### Auth Page Example

```tsx
// app/sign-in/page.tsx
'use client';

import { SignIn, SocialButtons } from '@authon/nextjs';

export default function SignInPage() {
  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>Sign In</h1>
      <SocialButtons
        onSuccess={() => (window.location.href = '/dashboard')}
        onError={(err) => console.error(err)}
      />
      <SignIn mode="embedded" />
    </div>
  );
}
```

### Role-Based Access

```tsx
'use client';

import { Protect } from '@authon/nextjs';

export function AdminSection() {
  return (
    <Protect
      fallback={<p>You need admin access to view this section.</p>}
      condition={(user) => user.publicMetadata?.role === 'admin'}
    >
      <AdminPanel />
    </Protect>
  );
}
```

---

## Hooks

All hooks from `@authon/react` are re-exported. Use them in Client Components.

### `useAuthon()`

```tsx
'use client';

import { useAuthon } from '@authon/nextjs';

export function SignOutButton() {
  const { signOut, isSignedIn } = useAuthon();

  if (!isSignedIn) return null;

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

### `useUser()`

```tsx
'use client';

import { useUser } from '@authon/nextjs';

export function UserGreeting() {
  const { user, isLoading } = useUser();

  if (isLoading) return <span>Loading...</span>;
  if (!user) return null;

  return <span>Hello, {user.displayName ?? user.email}!</span>;
}
```

### `useAuthonMfa()`

```tsx
'use client';

import { useAuthonMfa } from '@authon/nextjs';

export function MfaSettings() {
  const { setupMfa, verifyMfaSetup, disableMfa, getMfaStatus, regenerateBackupCodes, isLoading, error } =
    useAuthonMfa();

  const handleEnable = async () => {
    const result = await setupMfa();
    if (result) {
      // result.qrCodeSvg — SVG string to render QR code
      // result.backupCodes — one-time recovery codes
      // result.secret — raw TOTP secret
    }
  };

  const handleDisable = async (totpCode: string) => {
    const success = await disableMfa(totpCode);
    if (success) console.log('MFA disabled');
  };

  return (
    <div>
      <button onClick={handleEnable} disabled={isLoading}>Enable MFA</button>
      {error && <p>{error.message}</p>}
    </div>
  );
}
```

### `useAuthonPasskeys()`

```tsx
'use client';

import { useAuthonPasskeys } from '@authon/nextjs';

export function PasskeyManager() {
  const { registerPasskey, listPasskeys, revokePasskey, isLoading, error } = useAuthonPasskeys();

  const handleRegister = async () => {
    const passkey = await registerPasskey('My Device');
    if (passkey) console.log('Registered:', passkey.id);
  };

  return (
    <button onClick={handleRegister} disabled={isLoading}>
      Add Passkey
    </button>
  );
}
```

### `useAuthonPasswordless()`

```tsx
'use client';

import { useAuthonPasswordless } from '@authon/nextjs';
import { useState } from 'react';

export function MagicLinkForm() {
  const { sendMagicLink, isLoading, error } = useAuthonPasswordless();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const success = await sendMagicLink(email);
    if (success) setSent(true);
  };

  if (sent) return <p>Check your email for a sign-in link.</p>;

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleSubmit} disabled={isLoading}>Send Link</button>
      {error && <p>{error.message}</p>}
    </div>
  );
}
```

### `useAuthonWeb3()`

```tsx
'use client';

import { useAuthonWeb3 } from '@authon/nextjs';

export function WalletLogin() {
  const { getNonce, verify, isLoading, error } = useAuthonWeb3();

  const handleConnect = async () => {
    const address = '0xYourAddress';
    const nonceResponse = await getNonce(address, 'evm', 'metamask', 1);
    if (!nonceResponse) return;

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [nonceResponse.message, address],
    });

    const success = await verify(nonceResponse.message, signature, address, 'evm', 'metamask');
    if (success) console.log('Signed in with wallet!');
  };

  return (
    <button onClick={handleConnect} disabled={isLoading}>
      Connect Wallet
    </button>
  );
}
```

### `useAuthonSessions()`

```tsx
'use client';

import { useAuthonSessions } from '@authon/nextjs';
import { useEffect, useState } from 'react';
import type { SessionInfo } from '@authon/shared';

export function ActiveSessions() {
  const { listSessions, revokeSession, isLoading, error } = useAuthonSessions();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  useEffect(() => {
    listSessions().then((s) => {
      if (s) setSessions(s);
    });
  }, []);

  const handleRevoke = async (id: string) => {
    const success = await revokeSession(id);
    if (success) setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {sessions.map((session) => (
        <li key={session.id}>
          <span>{session.userAgent ?? 'Unknown'}</span>
          <button onClick={() => handleRevoke(session.id)}>Revoke</button>
        </li>
      ))}
      {error && <p>{error.message}</p>}
    </ul>
  );
}
```

---

## Re-exported API Reference

Everything below is re-exported from `@authon/react` and available directly from `@authon/nextjs`.

### Components

| Component | Description |
|-----------|-------------|
| `<AuthonProvider>` | Provides auth context — wrap your root layout |
| `<SignIn>` | Opens sign-in modal or renders embedded form |
| `<SignUp>` | Opens sign-up modal or renders embedded form |
| `<UserButton>` | Avatar dropdown with user info and sign-out |
| `<SignedIn>` | Renders children only when signed in |
| `<SignedOut>` | Renders children only when signed out |
| `<Protect>` | Role-based access guard with optional `condition` |
| `<SocialButton>` | Single OAuth provider button |
| `<SocialButtons>` | Auto-renders enabled OAuth provider buttons |

### Hooks

| Hook | Description |
|------|-------------|
| `useAuthon()` | Full auth context: user, signOut, openSignIn, getToken, client |
| `useUser()` | Shorthand for `{ user, isLoading }` |
| `useAuthonMfa()` | TOTP MFA setup, verification, and management |
| `useAuthonPasskeys()` | WebAuthn passkey registration and authentication |
| `useAuthonPasswordless()` | Magic link and email OTP flows |
| `useAuthonWeb3()` | Web3 wallet sign-in and wallet management |
| `useAuthonSessions()` | List and revoke active sessions |

### Server Functions (`@authon/nextjs/server`)

| Function | Returns | Description |
|----------|---------|-------------|
| `currentUser()` | `Promise<AuthonUser \| null>` | Get the current user from the session cookie |
| `auth()` | `Promise<{ userId, user, getToken }>` | Get full auth state for server-side use |

---

## Environment Variables

```env
# Required — your project's publishable key (safe to expose to the browser)
NEXT_PUBLIC_AUTHON_KEY=pk_live_...

# Required for server-side verification
AUTHON_SECRET_KEY=sk_live_...

# Optional — defaults to https://api.authon.dev
AUTHON_API_URL=https://api.authon.dev
```

---

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
