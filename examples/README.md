# Authon SDK Examples

Full-feature authentication examples for every Authon SDK. Each example implements the complete auth flow — email/password, social login (10 providers), passwordless sign-in (email code and magic link), passkeys, MFA, sessions, profile management, account deletion, and the embedded wallet.

**Live Demo:** [examples.authon.dev](https://examples.authon.dev)

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...` or `pk_test_...`) — safe to use in client-side code

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

4. **Turn on the extra sign-in methods and the wallet** (optional) — they are off until you switch them on
   - Providers → **Passwordless** (email code or magic link) and **Passkey (WebAuthn)**
   - Advanced → **Embedded wallets** for the embedded wallet
   - Add the example's origin (for example `http://localhost:15586`) to the project's allowed origins; the passkey and wallet flows check it

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Examples

### Frontend

| Framework | SDK | Live Demo | Source |
|-----------|-----|-----------|--------|
| React | `@authon/react` | [examples.authon.dev/react/](https://examples.authon.dev/react/) | [react/](./react/) |
| Next.js | `@authon/nextjs` | [examples.authon.dev/nextjs/](https://examples.authon.dev/nextjs/) | [nextjs/](./nextjs/) |
| Vue | `@authon/vue` | [examples.authon.dev/vue/](https://examples.authon.dev/vue/) | [vue/](./vue/) |
| Nuxt | `@authon/nuxt` | [examples.authon.dev/nuxt/](https://examples.authon.dev/nuxt/) | [nuxt/](./nuxt/) |
| Angular | `@authon/angular` | [examples.authon.dev/angular/](https://examples.authon.dev/angular/) | [angular/](./angular/) |
| Svelte | `@authon/svelte` | [examples.authon.dev/svelte/](https://examples.authon.dev/svelte/) | [svelte/](./svelte/) |
| Vanilla JS | `@authon/js` | [examples.authon.dev/js/](https://examples.authon.dev/js/) | [vanilla-js/](./vanilla-js/) |

How each web example reaches the passwordless, passkey and wallet APIs:

| Example | Passwordless + passkey | Embedded wallet | Files |
|---------|------------------------|-----------------|-------|
| React | `useAuthonPasswordless()`, `useAuthonPasskeys()` | `useAuthon().client.wallet` | `src/components/*Panel.tsx` |
| Next.js | `useAuthonPasswordless()`, `useAuthonPasskeys()` from `@authon/nextjs` | `useAuthon().client.wallet` | `app/components/*Panel.tsx` |
| Vue | `useAuthonPasswordless()`, `useAuthonPasskeys()` | `useAuthon().client.wallet` | `src/components/*Panel.vue` |
| Nuxt | `useAuthon().client` (core client) | `useAuthon().client.wallet` | `components/*Panel.vue` |
| Angular | `AuthonService` (`passwordlessSendCode`, `passwordlessVerifyCode`, `passkeyRegister`, `passkeyAuthenticate`) | `AuthonService.getClient().wallet` | `src/app/*-panel.component.ts` |
| Svelte | `AuthonStore` (`passwordlessSendCode`, `passwordlessVerifyCode`, `passkeyRegister`, `passkeyAuthenticate`) | `AuthonStore.client.wallet` | `src/lib/components/*Panel.svelte` |
| Vanilla JS | `authon.sendEmailOtp()`, `sendMagicLink()`, `verifyPasswordless()`, `authenticateWithPasskey()`, `registerPasskey()` | `authon.wallet` | `src/main.ts`, `index.html` |

None of the framework wrappers has a wallet hook yet, so every example reaches the wallet through the `@authon/js` client the wrapper exposes.

### Mobile (Code Only)

| Framework | SDK | Source | Passwordless | Passkeys | Embedded wallet |
|-----------|-----|--------|--------------|----------|-----------------|
| React Native | `@authon/react-native` | [react-native/](./react-native/) | Email or SMS code (`useAuthonPasswordless().sendCode` / `verifyCode`); no magic link helper | Two-step API (`useAuthonPasskeys().startAuth` / `completeAuth`, `startRegister` / `completeRegister`); the app runs the native passkey prompt with its own passkey module | Not supported |
| Flutter | `authon` (Dart) | [flutter/](./flutter/) | Not in this repository | Not in this repository | Not supported |
| Kotlin Android | `dev.authon:sdk` | [kotlin-android/](./kotlin-android/) | Not in this repository | Not in this repository | Not supported |
| Swift iOS | `Authon` (Swift) | [swift-ios/](./swift-ios/) | `sendMagicLink`, `sendEmailOtp`, `verifyPasswordless` | `registerPasskey`, `authenticateWithPasskey` (iOS 16+, real device, `webcredentials:api.authon.dev` associated domain) | Not supported |

> The mobile sample folders are not in this directory yet. The support columns describe what each SDK exposes today: the React Native SDK lives in [`packages/react-native`](../packages/react-native/) and the Swift SDK in [`swift/`](../swift/). The embedded wallet runs in a browser frame and is only available in the web SDKs.

## Features

Every example implements:

- [x] Email/password sign-up with validation
- [x] Email/password sign-in
- [x] Social login — Google, Apple, Kakao, Naver, GitHub, Facebook, Discord, X, LINE, Microsoft
- [x] Passwordless sign-in — email one-time code and magic link (web examples)
- [x] Passkey sign-in, and passkey registration after sign-in (web examples)
- [x] Embedded wallet — address, message signing, passkey protection and restore (web examples)
- [x] Profile page (view & edit)
- [x] Password reset
- [x] MFA/TOTP setup (QR code + verification + backup codes)
- [x] Session management (list & revoke)
- [x] Account deletion with confirmation
- [x] Protected routes/pages
- [x] Sign-out

Backend examples additionally include:
- [x] Token verification middleware
- [x] Webhook signature verification

## Passwordless, Passkeys and Embedded Wallet

Every web example shows these on its home page:

- **Signed out** — a "Sign in without a password" panel: *Email me a code* (`sendEmailOtp`, then `verifyPasswordless({ email, code })`), *Send magic link* (`sendMagicLink`), and *Sign in with passkey* (`authenticateWithPasskey(email?)`). The magic link opens the same page and the SDK finishes the sign-in on load (`autoHandleMagicLink`, on by default).
- **Signed in** — a *Passkeys* panel with *Register passkey* (`registerPasskey()`), and a *Wallet* panel that shows the address, backup state, device count, *Sign message* (`wallet.signMessage`), *Protect wallet* (`wallet.protect()`, shown while the wallet has no passkey backup) and *Restore wallet* (`wallet.restore()`, shown when `needsRestore` is true; the second button passes `resetOtherDevices: true`).

Each example creates the wallet in the background after sign-in:

```ts
new Authon(publishableKey, { wallet: { autoCreate: true } })
// framework wrappers take the same object as `config`
```

`protect()` and `restore()` show a passkey prompt, so the examples call them directly from the button click. With a custom `apiUrl`, also set `wallet.origin`. Apps that use `sessionMode: 'bff'` must pass `wallet.getToken` (see `createAuthonWalletToken` in `@authon/nextjs/server`); the examples use the default browser session.

Errors are shown on screen with their code:

| Code | Meaning |
|------|---------|
| `AUTH_METHOD_DISABLED` | The sign-in method is off for the project (server 403). Turn it on under Providers. `@authon/js` passes only the server message for auth errors, so the examples recognise this code from the message text. |
| `FORBIDDEN` | The wallet API refused the request. Most often the embedded wallet is turned off for the project: turn it on under Advanced → Embedded wallets. |
| `ORIGIN_NOT_ALLOWED` | The page origin is not in the project's allowed origins. |
| `PRF_UNSUPPORTED` | The browser or passkey provider lacks the WebAuthn PRF extension the wallet backup needs. |
| `NEEDS_RESTORE` | This browser holds no copy of the wallet key. Use *Restore wallet*. |
| `NOT_PROTECTED` | The wallet has no passkey backup yet, so it cannot be restored on this browser. |
| `NOT_CONFIGURED` | A custom `apiUrl` is used without `wallet.origin`. |
| `NotAllowedError`, `USER_CANCELLED` | The passkey prompt was cancelled or timed out. |

## Local Development

### Run all examples with Docker Compose

```bash
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk/examples

# Copy and configure environment
cp .env.example .env
# Edit .env with your Authon publishable key

# Start all 13 web containers
docker compose up -d
```

Then visit:
- Portal: http://localhost:15585
- React: http://localhost:15586
- Next.js: http://localhost:15587
- Vue: http://localhost:15588
- Nuxt: http://localhost:15589
- Angular: http://localhost:15595
- Svelte: http://localhost:15596
- Vanilla JS: http://localhost:15597
- Express: http://localhost:15598
- Go: http://localhost:15599
- FastAPI: http://localhost:15600
- Flask: http://localhost:15601
- Django: http://localhost:15602

### Run a single example

Each example can be run independently. See the README in each directory for specific instructions.

## Environment Variables

```env
# All examples
AUTHON_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
AUTHON_API_URL=https://api.authon.dev

# Vite-based frontends (React, Vue, Vanilla JS)
VITE_AUTHON_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_AUTHON_API_URL=https://api.authon.dev

# Backend examples
AUTHON_SECRET_KEY=sk_test_your_secret_key_here
AUTHON_WEBHOOK_SECRET=your-webhook-secret
```

## Architecture

```
                    Nginx (examples.authon.dev)
                           |
          +----------------+----------------+
          |                |                |
    /react/ (15586)  /nextjs/ (15587)  /vue/ (15588) ...
          |                |                |
     Docker Compose on server-1
          |
    Authon API (api.authon.dev)
```

All examples share the same Authon project and authenticate against the same API.

## License

MIT
