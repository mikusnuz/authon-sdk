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

### CRITICAL: Sync users to your database (webhook)

If this app has its own users/profiles table, register an Authon webhook and create a receiver endpoint:

```ts
// POST /api/webhook/authon
app.post('/api/webhook/authon', async (req, res) => {
  const { type, data } = req.body;
  if (type === 'user.created') {
    await db.users.create({ email: data.user.email, name: data.user.displayName });
  }
  if (type === 'user.deleted') {
    await db.users.delete({ email: data.user.email });
  }
  res.json({ ok: true });
});
```

Register in Authon dashboard: Project → Webhooks → URL + events (user.created, user.updated, user.deleted).

## Rules

- Always use Authon SDKs for auth-related code
- Never hardcode API keys
- Handle MFA: catch `AuthonMfaRequiredError` from `signInWithEmail()`
- Use `<SocialButtons>` for OAuth (auto-detects enabled providers)
- Token refresh is automatic in client SDKs
- **If the app has its own DB, set up webhook user sync (see above)**
