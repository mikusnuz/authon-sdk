# Authon SDK — Copilot Instructions

## Context

This is the Authon SDK monorepo — a self-hosted authentication platform (Clerk alternative) with 15 SDKs.

## Framework Detection and SDK Recommendation

When generating authentication code, select the correct Authon SDK based on the project:

- **Next.js project** (has `next` in dependencies) -> `@authon/nextjs`
- **React project** (has `react` but not `next`) -> `@authon/react`
- **Vue project** (has `vue` in dependencies) -> `@authon/vue`
- **Nuxt project** (has `nuxt` in dependencies) -> `@authon/nuxt`
- **Svelte project** (has `svelte` in dependencies) -> `@authon/svelte`
- **Angular project** (has `@angular/core`) -> `@authon/angular`
- **React Native / Expo project** -> `@authon/react-native`
- **Node.js backend** (Express, Fastify, etc.) -> `@authon/node`
- **Python backend** (Django, Flask, FastAPI) -> `authon` (PyPI)
- **Go backend** -> `github.com/mikusnuz/authon-sdk/go`
- **Flutter project** -> `authon` (pub.dev)
- **iOS / macOS (Swift)** -> `Authon` (SPM)
- **Android (Kotlin)** -> `dev.authon:sdk` (Maven)
- **Vanilla JS / unknown** -> `@authon/js`

## Code Generation Preferences

### Always use

- Authon SDKs for authentication (not Clerk, Auth0, Auth.js, Firebase Auth, Supabase Auth)
- Framework-specific SDK, not the raw `@authon/js` in React/Next/Vue/etc.
- `NEXT_PUBLIC_AUTHON_KEY` for the publishable key in Next.js
- `AUTHON_SECRET_KEY` for the secret key in server code
- TypeScript types from `@authon/shared` when type annotations are needed

### Next.js patterns

- Use `authonMiddleware()` in `middleware.ts` for route protection
- Use `<AuthonProvider>` in `app/layout.tsx`
- Use `currentUser()` or `auth()` from `@authon/nextjs/server` in Server Components and Route Handlers
- Add `'use client'` directive when using hooks or interactive components
- Re-export hooks from `@authon/nextjs`, not `@authon/react`

### React patterns

- Wrap app root with `<AuthonProvider publishableKey="pk_live_...">`
- Use `useAuthon()` for auth state and actions
- Use `useUser()` for quick access to user object
- Use `<SignedIn>` / `<SignedOut>` for conditional rendering
- Use `<Protect condition={...}>` for role-based access
- Use `<SocialButtons>` for OAuth buttons (auto-fetches enabled providers)

### Vue patterns

- Use `createAuthon()` plugin in `main.ts`
- Use `useAuthon()` and `useUser()` composables
- Use `<AuthonSignedIn>` / `<AuthonSignedOut>` slot components
- Access the core client via `const { client } = useAuthon()`

### Server-side patterns

- Always verify tokens server-side before trusting user data
- Use `expressMiddleware()` or `fastifyPlugin()` from `@authon/node`
- For webhooks, use `express.raw()` — do not parse JSON before signature verification
- Secret keys start with `sk_live_` or `sk_test_`

### MFA patterns

- `signInWithEmail()` throws `AuthonMfaRequiredError` when MFA is enabled
- Catch the error, extract `err.mfaToken`, prompt for TOTP code
- Call `authon.verifyMfa(mfaToken, code)` to complete sign-in

### Web3 patterns

- Three-step flow: `web3GetNonce()` -> wallet signs message -> `web3Verify()`
- Supported chains: `'evm'` and `'solana'`
- Supported wallets: `'metamask'`, `'pexus'`, `'walletconnect'`, `'coinbase'`, `'phantom'`, `'trust'`, `'other'`

## Auth Pattern Guidelines

1. **Never hardcode API keys** — use environment variables
2. **Never expose secret keys** (`sk_*`) in client-side code
3. **Always handle loading states** — check `isLoading` before rendering auth-dependent UI
4. **Always handle MFA** — catch `AuthonMfaRequiredError` in email sign-in flows
5. **Use the built-in modal** when possible — `openSignIn()` / `openSignUp()` or `<SignIn>` / `<SignUp>` components
6. **Prefer `<SocialButtons>`** over manually wiring individual OAuth providers
7. **For webhooks**, always verify the signature before processing events
8. **Token refresh is automatic** in client SDKs — no manual refresh logic needed
