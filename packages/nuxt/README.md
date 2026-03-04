**English** | [한국어](./README.ko.md)

# @authon/nuxt

Nuxt 3 integration for [Authon](https://authon.dev) — client plugin, composables, route middleware, and social buttons.

## Install

```bash
npm install @authon/nuxt @authon/js
```

Requires `nuxt >= 3.0.0`.

## Setup

### 1. Create the Authon plugin

Create `plugins/authon.client.ts` — the `.client` suffix ensures it only runs in the browser:

```ts
// plugins/authon.client.ts
import { createAuthonPlugin } from '@authon/nuxt'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authon = createAuthonPlugin(config.public.authonKey, {
    theme: 'auto',
    locale: 'en',
  })
  return { provide: { authon } }
})
```

### 2. Expose the key via runtime config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authonKey: process.env.NUXT_PUBLIC_AUTHON_KEY,
    },
  },
})
```

### 3. Access auth state in pages

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { $authon } = useNuxtApp()
const { client, isSignedIn, user } = $authon
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

## API Reference

### `createAuthonPlugin(publishableKey, config?)`

Creates the Authon state object for use as a Nuxt plugin. Returns `AuthonPluginState`:

```ts
interface AuthonPluginState {
  client: Authon        // full @authon/js client instance
  user: AuthonUser | null
  isSignedIn: boolean
  isLoading: boolean
}
```

### `useAuthon()`

Convenience wrapper — in practice, access the client through `useNuxtApp().$authon`:

```ts
const { $authon } = useNuxtApp()
const { client, isSignedIn, user, isLoading } = $authon
```

### `useUser()`

```ts
const { $authon } = useNuxtApp()
const { user, isLoading } = $authon
```

### `createAuthMiddleware(authon, redirectTo?)`

Factory for creating route middleware that guards authenticated pages.

```ts
// middleware/auth.ts
import { createAuthMiddleware } from '@authon/nuxt'

export default defineNuxtRouteMiddleware((to, from) => {
  const { $authon } = useNuxtApp()
  return createAuthMiddleware($authon, '/login')(to, from)
})
```

Apply it per page:

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({ middleware: 'auth' })
</script>
```

The middleware redirects unauthenticated users to `redirectTo` (default: `'/sign-in'`) and preserves the original URL in `?redirect=`.

### `renderSocialButtons(options)`

Renders branded OAuth provider buttons into a container element. Returns a cleanup function.

```ts
import type { SocialButtonsConfig } from '@authon/nuxt'
```

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `client` | `Authon` | required | Authon client instance |
| `container` | `HTMLElement` | required | Target DOM element |
| `onSuccess` | `() => void` | — | Called after successful OAuth sign-in |
| `onError` | `(error: Error) => void` | — | Called on OAuth error |
| `compact` | `boolean` | `false` | Icon-only square buttons in a row |
| `gap` | `number` | `10` / `12` | Gap between buttons in px |
| `labels` | `Record<provider, string>` | — | Override button labels per provider |
| `borderRadius` | `number` | `10` | Button border radius in px |
| `height` | `number` | `48` | Button height in px |
| `size` | `number` | `48` | Icon button size in px (compact mode) |

## Examples

### Sign-in page with email + OAuth

```vue
<!-- pages/login.vue -->
<template>
  <div class="login">
    <div ref="socialContainer" />

    <form @submit.prevent="handleSignIn">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit" :disabled="loading">Sign in</button>
      <p v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { renderSocialButtons } from '@authon/nuxt'

const { $authon } = useNuxtApp()
const router = useRouter()

const socialContainer = ref<HTMLElement>()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
let cleanupSocial: (() => void) | undefined

onMounted(() => {
  if (socialContainer.value) {
    cleanupSocial = renderSocialButtons({
      client: $authon.client,
      container: socialContainer.value,
      onSuccess: () => router.push('/dashboard'),
      onError: (e) => { error.value = e.message },
    })
  }
})

onUnmounted(() => cleanupSocial?.())

async function handleSignIn() {
  loading.value = true
  error.value = ''
  try {
    await $authon.client.signInWithEmail(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
```

### OAuth sign-in

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp()

async function signInWithGoogle() {
  await $authon.client.signInWithOAuth('google')
}
</script>
```

### Protected page with middleware

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $authon } = useNuxtApp()
const { user } = $authon
</script>

<template>
  <h1>Welcome, {{ user?.displayName }}</h1>
</template>
```

### MFA setup

```vue
<script setup lang="ts">
import { ref } from 'vue'

const { $authon } = useNuxtApp()
const qrCodeSvg = ref('')
const secret = ref('')
const backupCodes = ref<string[]>([])
const verifyCode = ref('')

async function initMfaSetup() {
  const res = await $authon.client.setupMfa()
  qrCodeSvg.value = res.qrCodeSvg
  secret.value = res.secret
  backupCodes.value = res.backupCodes
}

async function confirmSetup() {
  await $authon.client.verifyMfaSetup(verifyCode.value)
  alert('MFA enabled')
}
</script>
```

### MFA verification on sign-in

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AuthonMfaRequiredError } from '@authon/js'

const { $authon } = useNuxtApp()
const mfaToken = ref('')
const totpCode = ref('')

async function signIn(email: string, password: string) {
  try {
    await $authon.client.signInWithEmail(email, password)
  } catch (e) {
    if (e instanceof AuthonMfaRequiredError) {
      mfaToken.value = e.mfaToken
    }
  }
}

async function verifyMfa() {
  await $authon.client.verifyMfa(mfaToken.value, totpCode.value)
}
</script>
```

### Passwordless — magic link

```vue
<script setup lang="ts">
import { ref } from 'vue'

const { $authon } = useNuxtApp()
const email = ref('')
const sent = ref(false)

async function sendMagicLink() {
  await $authon.client.sendMagicLink(email.value)
  sent.value = true
}
</script>
```

### Passwordless — email OTP

```vue
<script setup lang="ts">
import { ref } from 'vue'

const { $authon } = useNuxtApp()
const email = ref('')
const otp = ref('')
const step = ref<'email' | 'verify'>('email')

async function sendOtp() {
  await $authon.client.sendEmailOtp(email.value)
  step.value = 'verify'
}

async function verifyOtp() {
  const user = await $authon.client.verifyPasswordless({ email: email.value, code: otp.value })
  console.log('Signed in as:', user.email)
}
</script>
```

### Passkeys

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp()

// Register (user must be signed in)
async function registerPasskey() {
  const credential = await $authon.client.registerPasskey('My Device')
  console.log('Registered:', credential.id)
}

// Authenticate
async function loginWithPasskey() {
  const user = await $authon.client.authenticateWithPasskey()
  console.log('Signed in as:', user.email)
}
</script>
```

### Web3 wallet authentication

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp()

async function signInWithWallet() {
  const address = '0xYourWalletAddress'

  const { nonce, message } = await $authon.client.web3GetNonce(address, 'evm', 'metamask')

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  })

  const user = await $authon.client.web3Verify(message, signature, address, 'evm', 'metamask')
  console.log('Signed in as:', user.email)
}

async function listLinkedWallets() {
  const wallets = await $authon.client.listWallets()
  console.log(wallets)
}
</script>
```

### Profile update

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp()

async function saveProfile() {
  const updated = await $authon.client.updateProfile({
    displayName: 'Jane Doe',
    avatarUrl: 'https://example.com/avatar.png',
    phone: '+1234567890',
  })
  console.log('Updated user:', updated)
}
</script>
```

### Session management

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SessionInfo } from '@authon/shared'

const { $authon } = useNuxtApp()
const sessions = ref<SessionInfo[]>([])

onMounted(async () => {
  sessions.value = await $authon.client.listSessions()
})

async function revokeSession(sessionId: string) {
  await $authon.client.revokeSession(sessionId)
  sessions.value = sessions.value.filter(s => s.id !== sessionId)
}
</script>
```

## Plugin options (`AuthonModuleOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `publishableKey` | `string` | required | Your Authon publishable key |
| `config.theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `config.locale` | `string` | `'en'` | Language code |
| `config.apiUrl` | `string` | `'https://api.authon.dev'` | Custom API base URL |
| `config.appearance` | `Partial<BrandingConfig>` | — | Override branding colors and logo |
| `globalMiddleware` | `boolean` | `false` | Enable global auth middleware for all routes |

## TypeScript

```ts
import type { AuthonPluginState, AuthonModuleOptions, SocialButtonsConfig } from '@authon/nuxt'
import type { AuthonUser, SessionInfo, PasskeyCredential, Web3Wallet } from '@authon/shared'
```

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
