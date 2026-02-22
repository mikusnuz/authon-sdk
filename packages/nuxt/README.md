# @authup/nuxt

Nuxt 3 module for [Authup](https://authup.dev) — auto-imported composables, components, and server middleware.

## Install

```bash
npm install @authup/nuxt
# or
pnpm add @authup/nuxt
```

Requires `nuxt >= 3.0.0`.

## Quick Start

### 1. Add Module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@authup/nuxt'],
  authup: {
    publishableKey: process.env.NUXT_PUBLIC_AUTHUP_KEY,
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
const { user, openSignIn } = useAuthup();
</script>
```

### 3. Server-side

```ts
// server/api/profile.get.ts
export default defineEventHandler(async (event) => {
  const user = await requireAuthupUser(event);
  return { user };
});
```

## API Reference

### Module Options

```ts
// nuxt.config.ts
authup: {
  publishableKey: string;
  secretKey?: string;        // For server-side verification
  apiUrl?: string;
  publicRoutes?: string[];   // Routes that don't require auth
}
```

### Auto-imported Composables

| Composable | Description |
|------------|-------------|
| `useAuthup()` | Full auth state and actions |
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
| `requireAuthupUser(event)` | Get and verify the current user (throws 401 if unauthenticated) |
| `getAuthupUser(event)` | Get the current user or null |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
