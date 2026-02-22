# @authup/vue

Vue 3 SDK for [Authup](https://authup.dev) — plugin, composables, and components.

## Install

```bash
npm install @authup/vue
# or
pnpm add @authup/vue
```

Requires `vue >= 3.3.0`.

## Quick Start

### 1. Install the Plugin

```ts
// main.ts
import { createApp } from 'vue';
import { AuthupPlugin } from '@authup/vue';
import App from './App.vue';

const app = createApp(App);
app.use(AuthupPlugin, {
  publishableKey: 'pk_live_...',
});
app.mount('#app');
```

### 2. Use Composables

```vue
<script setup lang="ts">
import { useAuthup, useUser } from '@authup/vue';

const { isSignedIn, openSignIn, signOut } = useAuthup();
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
import { SignedIn, SignedOut, UserButton, useAuthup } from '@authup/vue';

const { openSignIn } = useAuthup();
</script>
```

## API Reference

### Plugin

```ts
app.use(AuthupPlugin, {
  publishableKey: string;
  apiUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  appearance?: Partial<BrandingConfig>;
});
```

### Composables

#### `useAuthup()`

```ts
const {
  isSignedIn,  // Ref<boolean>
  isLoading,   // Ref<boolean>
  user,        // Ref<AuthupUser | null>
  signOut,     // () => Promise<void>
  openSignIn,  // () => Promise<void>
  openSignUp,  // () => Promise<void>
  getToken,    // () => string | null
  client,      // Authup instance
} = useAuthup();
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

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
