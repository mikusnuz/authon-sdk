**English** | [한국어](./README.ko.md)

# @authon/vue

Vue 3 Composition API integration for [Authon](https://authon.dev) — plugin setup, composables, and pre-built components.

## Install

```bash
npm install @authon/vue @authon/js
```

Requires `vue >= 3.3.0`.

## Setup

Register the plugin in `main.ts`:

```ts
import { createApp } from 'vue'
import { createAuthon } from '@authon/vue'
import App from './App.vue'

const app = createApp(App)

app.use(createAuthon({
  publishableKey: 'pk_live_...',
  config: {
    theme: 'auto',
    locale: 'en',
  },
}))

app.mount('#app')
```

## Composables

### `useAuthon()`

Returns the full auth state and helper methods. The `client` property exposes the underlying `@authon/js` `Authon` instance for all advanced operations.

```ts
import { useAuthon } from '@authon/vue'

const {
  isSignedIn,  // boolean — reactive
  isLoading,   // boolean — reactive
  user,        // AuthonUser | null — reactive
  client,      // Authon instance from @authon/js
  signOut,     // () => Promise<void>
  openSignIn,  // () => Promise<void>
  openSignUp,  // () => Promise<void>
  getToken,    // () => string | null
} = useAuthon()
```

### `useUser()`

Returns only the user and loading state as computed refs.

```ts
import { useUser } from '@authon/vue'

const { user, isLoading } = useUser()
// user: ComputedRef<AuthonUser | null>
// isLoading: ComputedRef<boolean>
```

## Components

```ts
import {
  AuthonSignIn,
  AuthonSignUp,
  AuthonUserButton,
  AuthonSignedIn,
  AuthonSignedOut,
  AuthonSocialButton,
  AuthonSocialButtons,
} from '@authon/vue'
```

| Component | Description |
|---|---|
| `<AuthonSignIn mode="popup" />` | Opens sign-in UI. `mode`: `'popup'` (default) or `'embedded'` |
| `<AuthonSignUp mode="popup" />` | Opens sign-up UI. `mode`: `'popup'` (default) or `'embedded'` |
| `<AuthonUserButton />` | Avatar button with dropdown — shows user info and sign-out |
| `<AuthonSignedIn>` | Renders default slot only when the user is authenticated |
| `<AuthonSignedOut>` | Renders default slot only when the user is not authenticated |
| `<AuthonSocialButton provider="google" />` | Single branded OAuth provider button |
| `<AuthonSocialButtons />` | Renders all configured OAuth provider buttons automatically |

## Examples

### Basic auth state in a navbar

```vue
<template>
  <nav>
    <AuthonSignedIn>
      <span>Hello, {{ user?.displayName }}</span>
      <button @click="signOut">Sign out</button>
    </AuthonSignedIn>
    <AuthonSignedOut>
      <AuthonUserButton />
    </AuthonSignedOut>
  </nav>
</template>

<script setup lang="ts">
import { useAuthon, AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue'

const { user, signOut } = useAuthon()
</script>
```

### Email + password sign-in

```vue
<template>
  <form @submit.prevent="handleSignIn">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button type="submit" :disabled="loading">Sign in</button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthon } from '@authon/vue'
import { useRouter } from 'vue-router'

const { client } = useAuthon()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSignIn() {
  loading.value = true
  error.value = ''
  try {
    await client!.signInWithEmail(email.value, password.value)
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
import { useAuthon, AuthonSocialButtons } from '@authon/vue'

const { client } = useAuthon()

// Trigger a specific provider directly
async function signInWithGoogle() {
  await client!.signInWithOAuth('google')
}
</script>

<template>
  <!-- Or render all configured providers automatically -->
  <AuthonSocialButtons
    :compact="false"
    :labels="{ google: 'Continue with Google' }"
    @success="() => router.push('/dashboard')"
    @error="(e) => console.error(e)"
  />
</template>
```

### MFA setup

```vue
<template>
  <div>
    <button @click="initMfaSetup">Enable MFA</button>
    <div v-if="qrCodeSvg" v-html="qrCodeSvg" />
    <p v-if="secret">Secret: {{ secret }}</p>
    <input v-model="verifyCode" placeholder="6-digit code" />
    <button @click="confirmSetup">Verify</button>
    <ul v-if="backupCodes.length">
      <li v-for="c in backupCodes" :key="c">{{ c }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthon } from '@authon/vue'

const { client } = useAuthon()
const qrCodeSvg = ref('')
const secret = ref('')
const backupCodes = ref<string[]>([])
const verifyCode = ref('')

async function initMfaSetup() {
  const res = await client!.setupMfa()
  qrCodeSvg.value = res.qrCodeSvg   // inline SVG for authenticator app
  secret.value = res.secret
  backupCodes.value = res.backupCodes
}

async function confirmSetup() {
  await client!.verifyMfaSetup(verifyCode.value)
  alert('MFA enabled successfully')
}
</script>
```

### MFA verification on sign-in

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthon } from '@authon/vue'
import { AuthonMfaRequiredError } from '@authon/js'

const { client } = useAuthon()
const mfaToken = ref('')
const totpCode = ref('')

async function signIn(email: string, password: string) {
  try {
    await client!.signInWithEmail(email, password)
  } catch (e) {
    if (e instanceof AuthonMfaRequiredError) {
      mfaToken.value = e.mfaToken  // show TOTP input
    }
  }
}

async function verifyMfa() {
  await client!.verifyMfa(mfaToken.value, totpCode.value)
}
</script>
```

### Passwordless — magic link

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthon } from '@authon/vue'

const { client } = useAuthon()
const email = ref('')
const sent = ref(false)

async function sendMagicLink() {
  await client!.sendMagicLink(email.value)
  sent.value = true
}
</script>
```

### Passwordless — email OTP

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthon } from '@authon/vue'

const { client } = useAuthon()
const email = ref('')
const otp = ref('')
const step = ref<'email' | 'verify'>('email')

async function sendOtp() {
  await client!.sendEmailOtp(email.value)
  step.value = 'verify'
}

async function verifyOtp() {
  const user = await client!.verifyPasswordless({ email: email.value, code: otp.value })
  console.log('Signed in as:', user.email)
}
</script>
```

### Passkeys

```vue
<script setup lang="ts">
import { useAuthon } from '@authon/vue'

const { client } = useAuthon()

// Register a new passkey (user must be signed in)
async function registerPasskey() {
  const credential = await client!.registerPasskey('My MacBook')
  console.log('Registered passkey:', credential.id)
}

// Authenticate with an existing passkey
async function loginWithPasskey() {
  const user = await client!.authenticateWithPasskey()
  console.log('Signed in as:', user.email)
}

// List all registered passkeys
async function listPasskeys() {
  const keys = await client!.listPasskeys()
  console.log(keys)
}
</script>
```

### Web3 wallet authentication

```vue
<script setup lang="ts">
import { useAuthon } from '@authon/vue'

const { client } = useAuthon()

async function signInWithWallet() {
  const address = '0xYourWalletAddress'

  // 1. Get a nonce + signable message from Authon
  const { nonce, message } = await client!.web3GetNonce(address, 'evm', 'metamask')

  // 2. Sign the message with the wallet
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  })

  // 3. Verify the signature and sign in
  const user = await client!.web3Verify(message, signature, address, 'evm', 'metamask')
  console.log('Signed in as:', user.email)
}

async function listLinkedWallets() {
  const wallets = await client!.listWallets()
  console.log(wallets)
}
</script>
```

### Profile update

```vue
<script setup lang="ts">
import { useAuthon } from '@authon/vue'

const { client } = useAuthon()

async function saveProfile() {
  const updated = await client!.updateProfile({
    displayName: 'Jane Doe',
    avatarUrl: 'https://example.com/avatar.png',
    phone: '+1234567890',
    publicMetadata: { role: 'admin' },
  })
  console.log('Updated user:', updated)
}
</script>
```

### Session management

```vue
<template>
  <ul>
    <li v-for="session in sessions" :key="session.id">
      {{ session.userAgent }} — {{ session.createdAt }}
      <button @click="revoke(session.id)">Revoke</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthon } from '@authon/vue'
import type { SessionInfo } from '@authon/shared'

const { client } = useAuthon()
const sessions = ref<SessionInfo[]>([])

onMounted(async () => {
  sessions.value = await client!.listSessions()
})

async function revoke(sessionId: string) {
  await client!.revokeSession(sessionId)
  sessions.value = sessions.value.filter(s => s.id !== sessionId)
}
</script>
```

## Social Buttons

`<AuthonSocialButtons>` fetches the enabled OAuth providers from your Authon dashboard and renders branded buttons automatically.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `compact` | `boolean` | `false` | Icon-only square buttons in a row |
| `gap` | `number` | `10` / `12` | Gap between buttons in px |
| `labels` | `Record<provider, string>` | — | Override button labels per provider |
| `onSuccess` | `() => void` | — | Called after successful OAuth sign-in |
| `onError` | `(error: Error) => void` | — | Called on OAuth error |

For a single provider button:

```vue
<template>
  <AuthonSocialButton
    provider="github"
    :onClick="handleClick"
    :loading="isLoading"
    :compact="false"
  />
</template>
```

**`AuthonSocialButton` props:**

| Prop | Type | Default |
|---|---|---|
| `provider` | `OAuthProviderType` | required |
| `onClick` | `(provider) => void` | required |
| `loading` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `label` | `string` | `'Continue with {Name}'` |
| `compact` | `boolean` | `false` |
| `borderRadius` | `number` | `10` |
| `height` | `number` | `48` |
| `size` | `number` | `48` (compact mode) |

## Plugin options

| Option | Type | Default | Description |
|---|---|---|---|
| `publishableKey` | `string` | required | Your Authon publishable key |
| `config.theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `config.locale` | `string` | `'en'` | Language code |
| `config.apiUrl` | `string` | `'https://api.authon.dev'` | Custom API base URL |
| `config.mode` | `'popup' \| 'embedded'` | `'popup'` | Modal display mode |
| `config.appearance` | `Partial<BrandingConfig>` | — | Override branding colors and logo |

## TypeScript

Types are re-exported from `@authon/shared`:

```ts
import type { AuthonUser, SessionInfo, PasskeyCredential, Web3Wallet } from '@authon/shared'
import type { AuthonState, AuthonPluginOptions } from '@authon/vue'
```

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
