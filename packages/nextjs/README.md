# @authon/nextjs

Next.js SDK for [Authon](https://authon.dev) — middleware, server helpers, and React components for App Router.

## Install

```bash
npm install @authon/nextjs
# or
pnpm add @authon/nextjs
```

Requires `next >= 14.0.0`.

## Quick Start

### 1. Middleware

Protect routes at the edge:

```ts
// middleware.ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHON_KEY!,
  publicRoutes: ['/', '/about', '/pricing', '/sign-in'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

### 2. Provider

Wrap your layout:

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

### 3. Client Components

Use all `@authon/react` hooks and components:

```tsx
'use client';

import { useUser, SignedIn, SignedOut, UserButton } from '@authon/nextjs';

export function Header() {
  return (
    <nav>
      <SignedIn><UserButton /></SignedIn>
      <SignedOut><a href="/sign-in">Sign In</a></SignedOut>
    </nav>
  );
}
```

### 4. Server-side

```ts
import { currentUser, auth } from '@authon/nextjs/server';

// In a Server Component or Route Handler
export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}

// Get the full auth state
const { userId, sessionId, getToken } = await auth();
```

## API Reference

### Client Exports

Re-exports all components and hooks from `@authon/react`:

`AuthonProvider`, `useAuthon`, `useUser`, `SignedIn`, `SignedOut`, `UserButton`, `SignIn`, `SignUp`, `Protect`

### Server Exports (`@authon/nextjs/server`)

| Function | Returns | Description |
|----------|---------|-------------|
| `currentUser()` | `Promise<AuthonUser \| null>` | Get the current user from cookies |
| `auth()` | `Promise<AuthState>` | Get full auth state (userId, sessionId, getToken) |

### Middleware

| Function | Description |
|----------|-------------|
| `authMiddleware(options)` | Edge middleware that redirects unauthenticated users |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
