**English** | [한국어](./README.ko.md)

# @authon/nextjs

> Drop-in Next.js authentication with middleware, server helpers, and React components — self-hosted Clerk alternative, Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/nextjs?color=6d28d9)](https://www.npmjs.com/package/@authon/nextjs)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Install

```bash
npm install @authon/nextjs
```

## Quick Start

```tsx
// app/layout.tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthonProvider
          publishableKey={process.env.NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY!}
          config={{ apiUrl: process.env.NEXT_PUBLIC_AUTHON_API_URL }}
        >
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
```

```ts
// middleware.ts
import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/pricing', '/sign-in', '/sign-up'],
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

```tsx
// app/page.tsx
'use client';
import { SignedIn, SignedOut, UserButton, useAuthon } from '@authon/nextjs';

export default function Home() {
  const { openSignIn } = useAuthon();
  return (
    <div>
      <SignedOut>
        <button onClick={() => openSignIn()}>Sign In</button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
```

## Common Tasks

### Add Google OAuth Login

```tsx
'use client';
import { useAuthon } from '@authon/nextjs';

export default function SignInPage() {
  const { client } = useAuthon();
  return (
    <button onClick={() => client?.signInWithOAuth('google')}>
      Sign in with Google
    </button>
  );
}
```

### Protect a Route (Middleware)

```ts
// middleware.ts
import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/blog*'],
  signInUrl: '/sign-in',
});
```

### Get Current User (Server Component)

```tsx
// app/dashboard/page.tsx
import { currentUser } from '@authon/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  return <h1>Welcome, {user.displayName}</h1>;
}
```

### Get Auth State (Route Handler)

```ts
// app/api/profile/route.ts
import { auth } from '@authon/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, user, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ user });
}
```

### Add Email/Password Auth

```tsx
'use client';
import { useAuthon } from '@authon/nextjs';
import { useState } from 'react';

export default function SignInPage() {
  const { client } = useAuthon();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await client?.signInWithEmail(email, password); }}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Handle Sign Out

```tsx
'use client';
import { useAuthon } from '@authon/nextjs';

export function SignOutButton() {
  const { signOut } = useAuthon();
  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AUTHON_API_URL` | Yes | Your Authon server URL |
| `NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key |
| `AUTHON_SECRET_KEY` | Server only | Secret key for server-side token verification |

## API Reference

### Middleware

```ts
authonMiddleware({ publicRoutes?: string[], signInUrl?: string, secretKey?: string, apiUrl?: string })
```

### Server Helpers (`@authon/nextjs/server`)

| Function | Returns |
|----------|---------|
| `currentUser()` | `Promise<AuthonUser \| null>` |
| `auth()` | `Promise<{ userId, user, getToken }>` |

### Client Components (re-exported from @authon/react)

`AuthonProvider`, `useAuthon`, `useUser`, `SignIn`, `SignUp`, `UserButton`, `UserProfile`, `SignedIn`, `SignedOut`, `Protect`, `SocialButtons`, `useAuthonMfa`, `useAuthonPasskeys`, `useAuthonPasswordless`, `useAuthonWeb3`, `useAuthonSessions`

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Self-hosted | Yes | No | Partial |
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| Next.js middleware | Yes | Yes | Manual |
| Server Components | Yes | Yes | Partial |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |

## License

MIT
