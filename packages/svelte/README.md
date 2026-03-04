**English** | [한국어](./README.ko.md)

# @authon/svelte

Svelte integration for [Authon](https://authon.dev) — reactive stores, context-based setup, and social login buttons.

## Install

```bash
npm install @authon/svelte @authon/js
```

Requires `svelte >= 4.0.0`.

## Setup

Initialize Authon in your root layout component and provide it to the component tree via Svelte context:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { initAuthon } from '@authon/svelte'
  import { onDestroy } from 'svelte'

  const authon = initAuthon('pk_live_...', {
    theme: 'auto',
    locale: 'en',
  })

  onDestroy(() => authon.destroy())
</script>

<slot />
```

Then access the store in any child component:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { user, isSignedIn, isLoading, openSignIn, signOut } = getAuthon()
</script>

{#if $isLoading}
  <p>Loading...</p>
{:else if $isSignedIn}
  <p>Welcome, {$user?.displayName}</p>
  <button on:click={signOut}>Sign out</button>
{:else}
  <button on:click={openSignIn}>Sign in</button>
{/if}
```

## API Reference

### `initAuthon(publishableKey, config?)`

Creates an `AuthonStore` and registers it in Svelte context. Call this once in your root layout.

```ts
import { initAuthon } from '@authon/svelte'

const authon = initAuthon('pk_live_...', {
  theme: 'auto',
  locale: 'en',
})
```

### `getAuthon()`

Retrieves the `AuthonStore` from Svelte context. Must be called within a component that is a descendant of the component where `initAuthon` was called.

```ts
import { getAuthon } from '@authon/svelte'

const authon = getAuthon()
```

### `createAuthonStore(publishableKey, config?)`

Low-level store factory. Use `initAuthon` / `getAuthon` for most cases; use this directly if you need a store without Svelte context.

### `AuthonStore`

```ts
interface AuthonStore {
  user: Readable<AuthonUser | null>
  isSignedIn: Readable<boolean>
  isLoading: Readable<boolean>
  client: Authon                          // @authon/js Authon instance
  signOut: () => Promise<void>
  openSignIn: () => Promise<void>
  openSignUp: () => Promise<void>
  getToken: () => string | null
  destroy: () => void
}
```

All store values are Svelte `Readable` stores — subscribe with the `$` prefix in templates.

### `renderSocialButtons(options)`

Renders branded OAuth provider buttons into a DOM element. Returns a cleanup function.

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

### Basic auth state

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { user, isSignedIn, isLoading, openSignIn, signOut } = getAuthon()
</script>

{#if $isLoading}
  <p>Loading...</p>
{:else if $isSignedIn}
  <p>Hello, {$user?.displayName ?? $user?.email}</p>
  <button on:click={signOut}>Sign out</button>
{:else}
  <button on:click={openSignIn}>Sign in</button>
{/if}
```

### Email + password sign-in

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()

  let email = ''
  let password = ''
  let loading = false
  let error = ''

  async function handleSignIn() {
    loading = true
    error = ''
    try {
      await client.signInWithEmail(email, password)
    } catch (e: any) {
      error = e.message
    } finally {
      loading = false
    }
  }
</script>

<form on:submit|preventDefault={handleSignIn}>
  <input bind:value={email} type="email" placeholder="Email" />
  <input bind:value={password} type="password" placeholder="Password" />
  <button type="submit" disabled={loading}>Sign in</button>
  {#if error}<p>{error}</p>{/if}
</form>
```

### OAuth sign-in

```svelte
<script lang="ts">
  import { getAuthon, renderSocialButtons } from '@authon/svelte'
  import { onMount, onDestroy } from 'svelte'

  const { client } = getAuthon()
  let container: HTMLElement
  let cleanup: (() => void) | undefined

  onMount(() => {
    cleanup = renderSocialButtons({
      client,
      container,
      onSuccess: () => window.location.href = '/dashboard',
      onError: (e) => console.error(e),
    })
  })

  onDestroy(() => cleanup?.())

  // Or trigger a single provider directly
  async function signInWithGoogle() {
    await client.signInWithOAuth('google')
  }
</script>

<div bind:this={container} />
<button on:click={signInWithGoogle}>Sign in with Google</button>
```

### MFA setup

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()

  let qrCodeSvg = ''
  let secret = ''
  let backupCodes: string[] = []
  let verifyCode = ''

  async function initMfaSetup() {
    const res = await client.setupMfa()
    qrCodeSvg = res.qrCodeSvg   // SVG string for display
    secret = res.secret
    backupCodes = res.backupCodes
  }

  async function confirmSetup() {
    await client.verifyMfaSetup(verifyCode)
    alert('MFA enabled')
  }
</script>

<button on:click={initMfaSetup}>Enable MFA</button>

{#if qrCodeSvg}
  {@html qrCodeSvg}
  <p>Scan with your authenticator app</p>
  <p>Secret: {secret}</p>
  <ul>{#each backupCodes as code}<li>{code}</li>{/each}</ul>
  <input bind:value={verifyCode} placeholder="6-digit code" />
  <button on:click={confirmSetup}>Verify</button>
{/if}
```

### MFA verification on sign-in

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'
  import { AuthonMfaRequiredError } from '@authon/js'

  const { client } = getAuthon()

  let mfaToken = ''
  let totpCode = ''

  async function signIn(email: string, password: string) {
    try {
      await client.signInWithEmail(email, password)
    } catch (e) {
      if (e instanceof AuthonMfaRequiredError) {
        mfaToken = e.mfaToken  // show TOTP input
      }
    }
  }

  async function verifyMfa() {
    await client.verifyMfa(mfaToken, totpCode)
  }
</script>
```

### Passwordless — magic link

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()
  let email = ''
  let sent = false

  async function sendMagicLink() {
    await client.sendMagicLink(email)
    sent = true
  }
</script>

{#if sent}
  <p>Check your inbox for a sign-in link.</p>
{:else}
  <input bind:value={email} type="email" placeholder="Email" />
  <button on:click={sendMagicLink}>Send magic link</button>
{/if}
```

### Passwordless — email OTP

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()
  let email = ''
  let otp = ''
  let step: 'email' | 'verify' = 'email'

  async function sendOtp() {
    await client.sendEmailOtp(email)
    step = 'verify'
  }

  async function verifyOtp() {
    const user = await client.verifyPasswordless({ email, code: otp })
    console.log('Signed in as:', user.email)
  }
</script>

{#if step === 'email'}
  <input bind:value={email} type="email" placeholder="Email" />
  <button on:click={sendOtp}>Send code</button>
{:else}
  <input bind:value={otp} placeholder="6-digit code" />
  <button on:click={verifyOtp}>Verify</button>
{/if}
```

### Passkeys

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()

  // Register (user must be signed in)
  async function registerPasskey() {
    const credential = await client.registerPasskey('My Device')
    console.log('Registered:', credential.id)
  }

  // Authenticate
  async function loginWithPasskey() {
    const user = await client.authenticateWithPasskey()
    console.log('Signed in as:', user.email)
  }

  // List registered passkeys
  async function listPasskeys() {
    const keys = await client.listPasskeys()
    console.log(keys)
  }
</script>
```

### Web3 wallet authentication

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()

  async function signInWithWallet() {
    const address = '0xYourWalletAddress'

    // 1. Get a nonce + signable message from Authon
    const { nonce, message } = await client.web3GetNonce(address, 'evm', 'metamask')

    // 2. Sign the message with the wallet
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    })

    // 3. Verify the signature and sign in
    const user = await client.web3Verify(message, signature, address, 'evm', 'metamask')
    console.log('Signed in as:', user.email)
  }

  async function listLinkedWallets() {
    const wallets = await client.listWallets()
    console.log(wallets)
  }
</script>
```

### Profile update

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()

  async function saveProfile() {
    const updated = await client.updateProfile({
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

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte'
  import { onMount } from 'svelte'
  import type { SessionInfo } from '@authon/shared'

  const { client } = getAuthon()
  let sessions: SessionInfo[] = []

  onMount(async () => {
    sessions = await client.listSessions()
  })

  async function revokeSession(sessionId: string) {
    await client.revokeSession(sessionId)
    sessions = sessions.filter(s => s.id !== sessionId)
  }
</script>

<ul>
  {#each sessions as session (session.id)}
    <li>
      {session.userAgent} — {session.createdAt}
      <button on:click={() => revokeSession(session.id)}>Revoke</button>
    </li>
  {/each}
</ul>
```

## Store options

| Option | Type | Default | Description |
|---|---|---|---|
| `publishableKey` | `string` | required | Your Authon publishable key |
| `config.theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `config.locale` | `string` | `'en'` | Language code |
| `config.apiUrl` | `string` | `'https://api.authon.dev'` | Custom API base URL |
| `config.appearance` | `Partial<BrandingConfig>` | — | Override branding colors and logo |

## TypeScript

```ts
import type { AuthonStore, SocialButtonsOptions } from '@authon/svelte'
import type { AuthonUser, SessionInfo, PasskeyCredential, Web3Wallet } from '@authon/shared'
```

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
