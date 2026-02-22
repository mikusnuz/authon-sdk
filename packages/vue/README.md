# @authon/vue

Vue 3 SDK for [Authon](https://authon.dev) — plugin, composables, and components.

## Install

```bash
npm install @authon/vue
# or
pnpm add @authon/vue
```

Requires `vue >= 3.3.0`.

## Quick Start

### 1. Install the Plugin

```ts
// main.ts
import { createApp } from 'vue';
import { AuthonPlugin } from '@authon/vue';
import App from './App.vue';

const app = createApp(App);
app.use(AuthonPlugin, {
  publishableKey: 'pk_live_...',
});
app.mount('#app');
```

### 2. Use Composables

```vue
<script setup lang="ts">
import { useAuthon, useUser } from '@authon/vue';

const { isSignedIn, openSignIn, signOut } = useAuthon();
const { user, isLoading } = useUser();
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isSignedIn">
    <p>Welcome, {{ user?.displayName }}</p>
    <button @click="signOut()">Sign Out</button>
  </div>
  <div v-else>
    <button @click="openSignIn()">Sign In</button>
  </div>
</template>
```

### 3. Use Components

```vue
<template>
  <SignedIn>
    <UserButton />
  </SignedIn>
  <SignedOut>
    <button @click="openSignIn()">Sign In</button>
  </SignedOut>
</template>

<script setup lang="ts">
import { SignedIn, SignedOut, UserButton, useAuthon } from '@authon/vue';

const { openSignIn } = useAuthon();
</script>
```

## API Reference

### Plugin

```ts
app.use(AuthonPlugin, {
  publishableKey: string;
  apiUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  appearance?: Partial<BrandingConfig>;
});
```

### Composables

#### `useAuthon()`

```ts
const {
  isSignedIn,  // Ref<boolean>
  isLoading,   // Ref<boolean>
  user,        // Ref<AuthonUser | null>
  signOut,     // () => Promise<void>
  openSignIn,  // () => Promise<void>
  openSignUp,  // () => Promise<void>
  getToken,    // () => string | null
  client,      // Authon instance
} = useAuthon();
```

#### `useUser()`

```ts
const { user, isLoading } = useUser();
```

### Components

| Component | Description |
|-----------|-------------|
| `<SignedIn>` | Renders slot only when signed in |
| `<SignedOut>` | Renders slot only when signed out |
| `<UserButton>` | Avatar dropdown with sign-out |
| `<Protect>` | Conditional rendering with fallback slot |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
