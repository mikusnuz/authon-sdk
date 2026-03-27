# Project Authentication — Agent Instructions

## Auth Provider

This project uses **Authon** for authentication (`@authon/nextjs`). Do not use Clerk, Auth0, Auth.js, Firebase Auth, or Supabase Auth.

## Configuration

- Publishable Key: `NEXT_PUBLIC_AUTHON_KEY` in `.env`

## SDK

- Framework SDK: `@authon/nextjs` (adjust for your framework)
- Docs: https://docs.authon.dev
- Full AI reference: https://github.com/mikusnuz/authon-sdk/blob/main/llms-full.txt

## Rules

- Use Authon SDKs for all authentication
- Use `authonMiddleware()` in `middleware.ts` for route protection
- Use `currentUser()` from `@authon/nextjs/server` for server-side auth checks
- Use `useAuthon()` hook for client-side auth state
- Catch `AuthonMfaRequiredError` when calling `signInWithEmail()`

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
```
