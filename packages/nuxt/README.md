**English** | [한국어](./README.ko.md)

# @authon/nuxt

> Nuxt 3 authentication module with auto-imported composables and Vue components

## Install

```bash
npm install @authon/nuxt
```

## Setup

```env
NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY=pk_test_...
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@authon/nuxt'],
  runtimeConfig: {
    public: {
      authon: {
        publishableKey: process.env.NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY,
      },
    },
  },
})
```

The module installs the runtime plugin and auto-imports `useAuthon` and
`useUser`. Components are available from `@authon/nuxt`:

```vue
<script setup lang="ts">
import { AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/nuxt'

const authon = useAuthon()
const { user } = useUser()
</script>

<template>
  <AuthonSignedOut><button @click="authon.client?.openSignIn()">Sign in</button></AuthonSignedOut>
  <AuthonSignedIn>
    <p>Welcome, {{ user?.displayName }}</p>
    <AuthonUserButton />
  </AuthonSignedIn>
</template>
```

For explicit imports, use the dedicated entry point:

```ts
import { useAuthon, useUser } from '@authon/nuxt/composables'
```

## Configuration

The module also accepts inline options. Keep the publishable key in public
runtime config; a server secret, if your own endpoints need one, belongs in
private runtime config and is not required by the browser module.

```ts
export default defineNuxtConfig({
  modules: ['@authon/nuxt'],
  authon: {
    publishableKey: process.env.NUXT_PUBLIC_AUTHON_PUBLISHABLE_KEY,
    config: { theme: 'auto' },
    globalMiddleware: false,
  },
})
```

`globalMiddleware` installs Authon's route middleware globally. Client-side
route guards improve navigation UX, but sensitive server/API operations must
still verify an access token.

## Legacy manual plugin

`createAuthonPlugin` remains exported for compatibility, but is deprecated for
Nuxt applications. Do not create `plugins/authon.client.ts` in new projects;
use `modules: ['@authon/nuxt']`, auto-imports, and
`@authon/nuxt/composables` instead.

## Public API

- Module: default export, `authonModule`, `AuthonModuleOptions`
- Composables: `useAuthon`, `useUser`, `useAuthonWeb3`,
  `useAuthonPasswordless`, `useAuthonPasskeys`
- Components: `AuthonSignIn`, `AuthonSignUp`, `AuthonUserButton`,
  `AuthonSignedIn`, `AuthonSignedOut`
- Compatibility helpers: `createAuthonPlugin` (deprecated),
  `createAuthMiddleware`, `renderSocialButtons`

## License

MIT
