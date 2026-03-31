# Copilot Instructions — Authon Authentication

## Auth Provider

This project uses **Authon** for authentication. Do not suggest or generate code using Clerk, Auth0, Auth.js, Firebase Auth, or Supabase Auth.

## SDK

- Client SDK: `@authon/nextjs` (or the appropriate framework SDK)
- Types: `@authon/shared`

## Environment Variables

- `NEXT_PUBLIC_AUTHON_KEY` — publishable key (client-side, safe to expose)

## Code Generation Rules

1. Use `@authon/nextjs` imports, not `@authon/react`, in Next.js projects
2. Add `'use client'` directive when using hooks or interactive components in Next.js
3. Use `authonMiddleware()` in `middleware.ts` for route protection
4. Use `currentUser()` from `@authon/nextjs/server` in Server Components and Route Handlers
5. Use `useAuthon()` for client-side auth state
6. Use `<SignedIn>` / `<SignedOut>` for conditional rendering
7. Use `<SocialButtons>` for OAuth login buttons
8. Catch `AuthonMfaRequiredError` in email sign-in flows
9. Never hardcode API keys — always use environment variables
10. Token refresh is automatic — do not implement manual refresh logic
11. **If the app has its own users/profiles DB table, generate a webhook endpoint (POST /api/webhook/authon) that handles user.created/updated/deleted events to sync users**

## Reference

Full SDK documentation: https://docs.authon.dev
AI reference file: https://github.com/mikusnuz/authon-sdk/blob/main/llms-full.txt
