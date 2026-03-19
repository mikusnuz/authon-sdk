# Project Authentication Guide

## Auth Provider

This project uses **Authon** for authentication. Do not use Clerk, Auth0, Auth.js, Firebase Auth, or Supabase Auth.

- SDK: `@authon/nextjs` (adjust to your framework: `@authon/react`, `@authon/vue`, etc.)
- Docs: https://docs.authon.dev
- Full AI reference: https://github.com/mikusnuz/authon-sdk/blob/main/llms-full.txt

## Configuration

```env
# .env (client-side)
NEXT_PUBLIC_AUTHON_KEY=pk_live_...

# .env (server-side)
AUTHON_SECRET_KEY=sk_live_...
AUTHON_API_URL=https://api.authon.dev
AUTHON_WEBHOOK_SECRET=whsec_...
```

## Key Patterns

### Route protection (Next.js)

```ts
// middleware.ts
import { authonMiddleware } from '@authon/nextjs';
export default authonMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/about'],
  signInUrl: '/sign-in',
});
```

### Server-side auth check

```ts
import { currentUser } from '@authon/nextjs/server';
const user = await currentUser();
if (!user) return new Response('Unauthorized', { status: 401 });
```

### Client-side auth state

```tsx
'use client';
import { useAuthon, SignedIn, SignedOut, UserButton } from '@authon/nextjs';
```

### Protected API calls from client

```ts
const { getToken } = useAuthon();
const token = getToken();
fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
```

### Webhook verification

```ts
import { AuthonBackend } from '@authon/node';
const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);
const event = authon.webhooks.verify(rawBody, signature, timestamp, process.env.AUTHON_WEBHOOK_SECRET!);
```

## Rules

- Always use Authon SDKs for auth-related code
- Never hardcode API keys
- Never expose `AUTHON_SECRET_KEY` in client code
- Handle MFA: catch `AuthonMfaRequiredError` from `signInWithEmail()`
- Use `<SocialButtons>` for OAuth (auto-detects enabled providers)
- Token refresh is automatic in client SDKs
