**English** | [한국어](./README.ko.md)

# @authon/nuxt

> Drop-in Nuxt 3 authentication with plugin, composables, and route middleware — self-hosted Clerk alternative, Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/nuxt?color=6d28d9)](https://www.npmjs.com/package/@authon/nuxt)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Install

```bash
npm install @authon/nuxt
```

## Quick Start

```ts
// plugins/authon.client.ts
import { createAuthonPlugin } from '@authon/nuxt';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authon = createAuthonPlugin(config.public.authonKey, {
    apiUrl: config.public.authonApiUrl,
    theme: 'auto',
  });
  return { provide: { authon } };
});
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authonKey: process.env.NUXT_PUBLIC_AUTHON_KEY,
      authonApiUrl: process.env.NUXT_PUBLIC_AUTHON_API_URL,
    },
  },
});
```

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { $authon } = useNuxtApp();
const { client, isSignedIn, user } = $authon;
</script>

<template>
  <div v-if="isSignedIn">
    <p>Welcome, {{ user?.displayName }}</p>
    <button @click="client.signOut()">Sign out</button>
  </div>
  <div v-else>
    <button @click="client.openSignIn()">Sign in</button>
  </div>
</template>
```

## Common Tasks

### Add Google OAuth Login

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp();

async function signInWithGoogle() {
  await $authon.client.signInWithOAuth('google');
}
</script>

<template>
  <button @click="signInWithGoogle">Sign in with Google</button>
</template>
```

### Protect a Route

```ts
// middleware/auth.ts
import { createAuthMiddleware } from '@authon/nuxt';

export default defineNuxtRouteMiddleware((to, from) => {
  const { $authon } = useNuxtApp();
  return createAuthMiddleware($authon, '/sign-in')(to, from);
});
```

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({ middleware: 'auth' });
const { $authon } = useNuxtApp();
</script>

<template>
  <h1>Welcome, {{ $authon.user?.displayName }}</h1>
</template>
```

### Get Current User

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp();
const { user, isLoading } = $authon;
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <p v-else-if="user">{{ user.email }}</p>
  <p v-else>Not signed in</p>
</template>
```

### Add Email/Password Auth

```vue
<script setup lang="ts">
import { ref } from 'vue';
const { $authon } = useNuxtApp();
const email = ref('');
const password = ref('');

async function handleSignIn() {
  await $authon.client.signInWithEmail(email.value, password.value);
}
</script>

<template>
  <form @submit.prevent="handleSignIn">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button type="submit">Sign In</button>
  </form>
</template>
```

### Handle Sign Out

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp();
</script>

<template>
  <button @click="$authon.client.signOut()">Sign Out</button>
</template>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_PUBLIC_AUTHON_API_URL` | Yes | Your Authon server URL |
| `NUXT_PUBLIC_AUTHON_KEY` | Yes | Project publishable key |

## API Reference

### Plugin

| Function | Returns |
|----------|---------|
| `createAuthonPlugin(key, config?)` | `AuthonPluginState { client, user, isSignedIn, isLoading }` |
| `createAuthMiddleware(authon, redirectTo?)` | Route middleware function |
| `renderSocialButtons(options)` | Cleanup function |

### Composables

| Composable | Returns |
|------------|---------|
| `useAuthon()` | `AuthonPluginState` (access via `useNuxtApp().$authon` in practice) |
| `useUser()` | `{ user, isLoading }` |
| `useAuthonWeb3()` | Web3 wallet auth |
| `useAuthonPasswordless()` | Magic link and OTP |
| `useAuthonPasskeys()` | Passkey registration and auth |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Self-hosted | Yes | No | Partial |
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| Nuxt 3 module | Yes | No | Via Sidebase |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |

## License

MIT
