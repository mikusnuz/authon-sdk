**English** | [한국어](./README.ko.md)

# @authon/vue

> Drop-in Vue 3 authentication with composables and components — self-hosted Clerk alternative, Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/vue?color=6d28d9)](https://www.npmjs.com/package/@authon/vue)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...` or `pk_test_...`) — safe to use in client-side code
   - **Secret Key** (`sk_live_...` or `sk_test_...`) — server-side only, never expose to clients

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Install

```bash
npm install @authon/vue
```

## Quick Start

```ts
// src/main.ts
import { createApp } from 'vue';
import { createAuthon } from '@authon/vue';
import App from './App.vue';

const app = createApp(App);
app.use(createAuthon({
  publishableKey: 'pk_live_YOUR_PUBLISHABLE_KEY',
  config: { apiUrl: 'https://your-authon-server.com' },
}));
app.mount('#app');
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { useAuthon, useUser, AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue';
const { openSignIn, signOut } = useAuthon();
const { user } = useUser();
</script>

<template>
  <AuthonSignedOut>
    <button @click="openSignIn()">Sign In</button>
  </AuthonSignedOut>
  <AuthonSignedIn>
    <p>Welcome, {{ user?.email }}</p>
    <AuthonUserButton />
    <button @click="signOut()">Sign Out</button>
  </AuthonSignedIn>
</template>
```

## Common Tasks

### Add Google OAuth Login

```vue
<script setup lang="ts">
import { useAuthon } from '@authon/vue';
const { client } = useAuthon();
</script>

<template>
  <button @click="client?.signInWithOAuth('google')">Sign in with Google</button>
</template>
```

### Protect a Route

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
    { path: '/sign-in', component: () => import('../views/SignIn.vue') },
  ],
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const authon = router.app?.config.globalProperties.$authon;
    if (!authon?.isSignedIn) return next({ path: '/sign-in', query: { redirect: to.fullPath } });
  }
  next();
});

export default router;
```

### Get Current User

```vue
<script setup lang="ts">
import { useUser } from '@authon/vue';
const { user, isLoading } = useUser();
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <div v-else-if="user">
    <p>Email: {{ user.email }}</p>
    <p>Name: {{ user.displayName }}</p>
  </div>
  <p v-else>Not signed in</p>
</template>
```

### Add Email/Password Auth

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthon } from '@authon/vue';
const { client } = useAuthon();
const email = ref('');
const password = ref('');

async function handleSignIn() {
  await client?.signInWithEmail(email.value, password.value);
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
import { useAuthon } from '@authon/vue';
const { signOut } = useAuthon();
</script>

<template>
  <button @click="signOut()">Sign Out</button>
</template>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_AUTHON_API_URL` | Yes | Your Authon server URL |
| `VITE_AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key |

## API Reference

### Plugin

```ts
createAuthon({ publishableKey: string, config?: AuthonConfig })
```

### Composables

| Composable | Returns |
|------------|---------|
| `useAuthon()` | `{ isSignedIn, isLoading, user, client, signOut, openSignIn, openSignUp, getToken }` |
| `useUser()` | `{ user: ComputedRef, isLoading: ComputedRef }` |
| `useAuthonWeb3()` | Web3 wallet auth methods |
| `useAuthonPasswordless()` | Magic link and OTP methods |
| `useAuthonPasskeys()` | Passkey registration and auth |

### Components

| Component | Description |
|-----------|-------------|
| `<AuthonSignIn>` | Sign-in form (`mode="popup"` or `"embedded"`) |
| `<AuthonSignUp>` | Sign-up form |
| `<AuthonUserButton>` | Avatar dropdown with sign-out |
| `<AuthonSignedIn>` | Slot rendered only when signed in |
| `<AuthonSignedOut>` | Slot rendered only when signed out |
| `<AuthonSocialButtons>` | All enabled OAuth provider buttons |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Self-hosted | Yes | No | Partial |
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| ShadowDOM modal | Yes | No | No |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |

## License

MIT
