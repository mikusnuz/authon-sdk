**English** | [한국어](./README.ko.md)

# @authon/svelte

> Drop-in Svelte authentication with reactive stores — Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/svelte?color=6d28d9)](https://www.npmjs.com/package/@authon/svelte)
[![License](https://img.shields.io/badge/license-MIT-blue)](../../LICENSE)

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...`) — use in your frontend code
   - **Test Key** (`pk_test_...`) — for development, enables Dev Teleport

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Install

```bash
npm install @authon/svelte
```

## Quick Start

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { initAuthon } from '@authon/svelte';
  import { onDestroy } from 'svelte';

  const authon = initAuthon('pk_live_YOUR_PUBLISHABLE_KEY', {
    theme: 'auto',
  });

  onDestroy(() => authon.destroy());
</script>

<slot />
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  const { user, isSignedIn, isLoading, openSignIn, signOut } = getAuthon();
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

## Common Tasks

### Add Google OAuth Login

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  const { client } = getAuthon();
</script>

<button on:click={() => client.signInWithOAuth('google')}>Sign in with Google</button>
```

### Protect a Route

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  const { isSignedIn, isLoading } = getAuthon();

  onMount(() => {
    if (!$isLoading && !$isSignedIn) goto('/sign-in');
  });
</script>

{#if $isSignedIn}
  <h1>Dashboard</h1>
{/if}
```

### Get Current User

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  const { user, isLoading } = getAuthon();
</script>

{#if $isLoading}
  <p>Loading...</p>
{:else if $user}
  <p>Email: {$user.email}</p>
  <p>Name: {$user.displayName}</p>
{:else}
  <p>Not signed in</p>
{/if}
```

### Add Email/Password Auth

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  const { client } = getAuthon();
  let email = '';
  let password = '';

  async function handleSignIn() {
    await client.signInWithEmail(email, password);
  }
</script>

<form on:submit|preventDefault={handleSignIn}>
  <input bind:value={email} type="email" placeholder="Email" />
  <input bind:value={password} type="password" placeholder="Password" />
  <button type="submit">Sign in</button>
</form>
```

### Handle Sign Out

```svelte
<script lang="ts">
  import { getAuthon } from '@authon/svelte';
  const { signOut } = getAuthon();
</script>

<button on:click={signOut}>Sign Out</button>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key (`pk_live_...` or `pk_test_...`) |
| `PUBLIC_AUTHON_API_URL` | No | Optional — defaults to `api.authon.dev` |

## API Reference

### Setup

| Function | Description |
|----------|-------------|
| `initAuthon(key, config?)` | Create store and set in Svelte context (call in root layout) |
| `getAuthon()` | Get `AuthonStore` from context (call in child components) |
| `createAuthonStore(key, config?)` | Low-level store factory (without context) |

### AuthonStore

| Property / Method | Type |
|-------------------|------|
| `user` | `Readable<AuthonUser \| null>` |
| `isSignedIn` | `Readable<boolean>` |
| `isLoading` | `Readable<boolean>` |
| `client` | `Authon` |
| `signOut()` | `Promise<void>` |
| `openSignIn()` | `Promise<void>` |
| `openSignUp()` | `Promise<void>` |
| `getToken()` | `string \| null` |
| `web3GetNonce(...)` | Web3 nonce request |
| `web3Verify(...)` | Web3 sign-in |
| `passwordlessSendCode(...)` | Send magic link or OTP |
| `passwordlessVerifyCode(...)` | Verify OTP |
| `passkeyRegister(...)` | Register passkey |
| `passkeyAuthenticate(...)` | Auth with passkey |
| `destroy()` | Cleanup |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| ShadowDOM modal | Yes | No | No |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |

## License

MIT
