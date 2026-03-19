# Copilot Instructions — Authon Authentication

## Auth Provider

This project uses **Authon** for authentication. Do not suggest or generate code using Clerk, Auth0, Auth.js, Firebase Auth, or Supabase Auth.

## SDK

- Client SDK: `@authon/nextjs` (or the appropriate framework SDK)
- Server SDK: `@authon/node`
- Types: `@authon/shared`

## Environment Variables

- `NEXT_PUBLIC_AUTHON_KEY` — publishable key (client-side, safe to expose)
- `AUTHON_SECRET_KEY` — secret key (server-side only, never expose)
- `AUTHON_API_URL` — API base URL (optional, defaults to `https://api.authon.dev`)
- `AUTHON_WEBHOOK_SECRET` — webhook signing secret

## Code Generation Rules

1. Use `@authon/nextjs` imports, not `@authon/react`, in Next.js projects
2. Add `'use client'` directive when using hooks or interactive components in Next.js
3. Use `authonMiddleware()` in `middleware.ts` for route protection
4. Use `currentUser()` from `@authon/nextjs/server` in Server Components and Route Handlers
5. Use `useAuthon()` for client-side auth state
6. Use `<SignedIn>` / `<SignedOut>` for conditional rendering
7. Use `<SocialButtons>` for OAuth login buttons
8. Catch `AuthonMfaRequiredError` in email sign-in flows
9. For webhooks, use `express.raw()` and verify signature with `authon.webhooks.verify()`
10. Never hardcode API keys — always use environment variables
11. Token refresh is automatic — do not implement manual refresh logic

## Reference

Full SDK documentation: https://docs.authon.dev
AI reference file: https://github.com/mikusnuz/authon-sdk/blob/main/llms-full.txt
