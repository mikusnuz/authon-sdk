# @authup/nextjs

Next.js SDK for [Authup](https://authup.dev) — middleware, server helpers, and React components for App Router.

## Install

```bash
npm install @authup/nextjs
# or
pnpm add @authup/nextjs
```

Requires `next >= 14.0.0`.

## Quick Start

### 1. Middleware

Protect routes at the edge:

```ts
// middleware.ts
import { authMiddleware } from '@authup/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHUP_KEY!,
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
import { AuthupProvider } from '@authup/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthupProvider publishableKey={process.env.NEXT_PUBLIC_AUTHUP_KEY!}>
          {children}
        </AuthupProvider>
      </body>
    </html>
  );
}
```

### 3. Client Components

Use all `@authup/react` hooks and components:

```tsx
'use client';

import { useUser, SignedIn, SignedOut, UserButton } from '@authup/nextjs';

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
import { currentUser, auth } from '@authup/nextjs/server';

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

Re-exports all components and hooks from `@authup/react`:

`AuthupProvider`, `useAuthup`, `useUser`, `SignedIn`, `SignedOut`, `UserButton`, `SignIn`, `SignUp`, `Protect`

### Server Exports (`@authup/nextjs/server`)

| Function | Returns | Description |
|----------|---------|-------------|
| `currentUser()` | `Promise<AuthupUser \| null>` | Get the current user from cookies |
| `auth()` | `Promise<AuthState>` | Get full auth state (userId, sessionId, getToken) |

### Middleware

| Function | Description |
|----------|-------------|
| `authMiddleware(options)` | Edge middleware that redirects unauthenticated users |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
