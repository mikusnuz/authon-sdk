**English** | [한국어](./README.ko.md)

# @authon/nuxt

Nuxt 3 module for [Authon](https://authon.dev) — auto-imported composables, components, and server middleware.

## Install

```bash
npm install @authon/nuxt
# or
pnpm add @authon/nuxt
```

Requires `nuxt >= 3.0.0`.

## Quick Start

### 1. Add Module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@authon/nuxt'],
  authon: {
    publishableKey: process.env.NUXT_PUBLIC_AUTHON_KEY,
  },
});
```

### 2. Use in Pages

All composables and components are auto-imported:

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <SignedIn>
      <UserButton />
      <p>Welcome, {{ user?.displayName }}</p>
    </SignedIn>
    <SignedOut>
      <button @click="openSignIn()">Sign In</button>
    </SignedOut>
  </div>
</template>

<script setup>
const { user, openSignIn } = useAuthon();
</script>
```

### 3. Server-side

```ts
// server/api/profile.get.ts
export default defineEventHandler(async (event) => {
  const user = await requireAuthonUser(event);
  return { user };
});
```

## API Reference

### Module Options

```ts
// nuxt.config.ts
authon: {
  publishableKey: string;
  secretKey?: string;        // For server-side verification
  apiUrl?: string;
  publicRoutes?: string[];   // Routes that don't require auth
}
```

### Auto-imported Composables

| Composable | Description |
|------------|-------------|
| `useAuthon()` | Full auth state and actions |
| `useUser()` | Current user and loading state |

### Auto-imported Components

| Component | Description |
|-----------|-------------|
| `<SignedIn>` | Renders slot only when signed in |
| `<SignedOut>` | Renders slot only when signed out |
| `<UserButton>` | Avatar dropdown with sign-out |
| `<Protect>` | Conditional rendering with fallback slot |

### Server Utilities

| Function | Description |
|----------|-------------|
| `requireAuthonUser(event)` | Get and verify the current user (throws 401 if unauthenticated) |
| `getAuthonUser(event)` | Get the current user or null |

## Multi-Factor Authentication (MFA)

Access MFA through the `client` from `useAuthon()`:

```vue
<script setup>
import { AuthonMfaRequiredError } from '@authon/js';

const { client } = useAuthon();

// Setup MFA
async function enableMfa() {
  const setup = await client.value.setupMfa();
  // setup.qrCodeSvg — SVG QR code for authenticator app
  // setup.backupCodes — recovery codes
}

// Sign-in with MFA
async function signIn(email, password) {
  try {
    await client.value.signInWithEmail(email, password);
  } catch (err) {
    if (err instanceof AuthonMfaRequiredError) {
      // Prompt for TOTP code, then:
      await client.value.verifyMfa(err.mfaToken, code);
    }
  }
}
</script>
```

See [`@authon/js` MFA docs](../js/README.md#multi-factor-authentication-mfa) for the full API reference.

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
