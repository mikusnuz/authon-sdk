# @authup/svelte

Svelte SDK for [Authup](https://authup.dev) — stores, actions, and components.

## Install

```bash
npm install @authup/svelte
# or
pnpm add @authup/svelte
```

Requires `svelte >= 4.0.0`.

## Quick Start

### 1. Initialize

```ts
// src/lib/authup.ts
import { initAuthup } from '@authup/svelte';

export const authup = initAuthup({
  publishableKey: 'pk_live_...',
});
```

### 2. Use Stores

```svelte
<script>
  import { user, isSignedIn, isLoading } from '@authup/svelte';
  import { openSignIn, signOut } from '@authup/svelte';
</script>

{#if $isLoading}
  <p>Loading...</p>
{:else if $isSignedIn}
  <p>Welcome, {$user?.displayName}</p>
  <button on:click={signOut}>Sign Out</button>
{:else}
  <button on:click={openSignIn}>Sign In</button>
{/if}
```

### 3. Use Components

```svelte
<script>
  import { SignedIn, SignedOut, UserButton } from '@authup/svelte';
</script>

<SignedIn>
  <UserButton />
</SignedIn>
<SignedOut>
  <button on:click={openSignIn}>Sign In</button>
</SignedOut>
```

## API Reference

### Stores

| Store | Type | Description |
|-------|------|-------------|
| `user` | `Readable<AuthupUser \| null>` | Current user |
| `isSignedIn` | `Readable<boolean>` | Whether the user is signed in |
| `isLoading` | `Readable<boolean>` | Whether auth state is loading |

### Actions

| Function | Returns | Description |
|----------|---------|-------------|
| `openSignIn()` | `Promise<void>` | Open sign-in modal |
| `openSignUp()` | `Promise<void>` | Open sign-up modal |
| `signOut()` | `Promise<void>` | Sign out |
| `getToken()` | `string \| null` | Get current access token |

### Components

| Component | Description |
|-----------|-------------|
| `<SignedIn>` | Renders slot only when signed in |
| `<SignedOut>` | Renders slot only when signed out |
| `<UserButton>` | Avatar dropdown with sign-out |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
