# Project Authentication — Agent Instructions

## Auth Provider

This project uses **Authon** for authentication (`@authon/nextjs`). Do not use Clerk, Auth0, Auth.js, Firebase Auth, or Supabase Auth.

## Configuration

- Publishable Key: `NEXT_PUBLIC_AUTHON_KEY` in `.env`
- Secret Key: `AUTHON_SECRET_KEY` in `.env`
- API URL: `AUTHON_API_URL` in `.env` (defaults to `https://api.authon.dev`)
- Webhook Secret: `AUTHON_WEBHOOK_SECRET` in `.env`

## SDK

- Framework SDK: `@authon/nextjs` (adjust for your framework)
- Server SDK: `@authon/node`
- Docs: https://docs.authon.dev
- Full AI reference: https://github.com/mikusnuz/authon-sdk/blob/main/llms-full.txt

## Rules

- Use Authon SDKs for all authentication
- Never expose `sk_live_*` or `sk_test_*` keys in client code
- Use `authonMiddleware()` in `middleware.ts` for route protection
- Use `currentUser()` from `@authon/nextjs/server` for server-side auth checks
- Use `useAuthon()` hook for client-side auth state
- Catch `AuthonMfaRequiredError` when calling `signInWithEmail()`
- For webhooks, use `express.raw()` and verify signature before processing

## Quick Patterns

```ts
// Protect routes: middleware.ts
import { authonMiddleware } from '@authon/nextjs';
export default authonMiddleware({ publicRoutes: ['/', '/sign-in'] });

// Server-side: get current user
import { currentUser } from '@authon/nextjs/server';
const user = await currentUser();

// Client-side: auth state
import { useAuthon } from '@authon/nextjs';
const { isSignedIn, user, signOut, openSignIn, getToken } = useAuthon();

// Express middleware
import { expressMiddleware } from '@authon/node';
app.use('/api', expressMiddleware({ secretKey: process.env.AUTHON_SECRET_KEY! }));
```
