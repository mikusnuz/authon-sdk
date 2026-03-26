**English** | [한국어](./README.ko.md)

# @authon/react

> Drop-in React authentication with hooks and components — Auth0 alternative, open-source auth

[![npm version](https://img.shields.io/npm/v/@authon/react?color=6d28d9)](https://www.npmjs.com/package/@authon/react)
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
npm install @authon/react
```

## Quick Start

```tsx
// src/main.tsx — complete working file
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthonProvider, useAuthon, useUser, SignedIn, SignedOut, UserButton } from '@authon/react';

function App() {
  const { openSignIn, signOut } = useAuthon();
  const { user } = useUser();

  return (
    <div>
      <SignedOut>
        <button onClick={() => openSignIn()}>Sign In</button>
      </SignedOut>
      <SignedIn>
        <p>Welcome, {user?.email}</p>
        <UserButton />
        <button onClick={() => signOut()}>Sign Out</button>
      </SignedIn>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthonProvider
    publishableKey="pk_live_YOUR_PUBLISHABLE_KEY"
  >
    <App />
  </AuthonProvider>
);
```

## Common Tasks

### Add Google OAuth Login

```tsx
import { useAuthon } from '@authon/react';

function GoogleLoginButton() {
  const { client } = useAuthon();
  return (
    <button onClick={() => client?.signInWithOAuth('google')}>
      Sign in with Google
    </button>
  );
}
```

### Protect a Route

```tsx
import { Protect } from '@authon/react';

function Dashboard() {
  return (
    <Protect fallback={<p>Please sign in to view this page.</p>}>
      <h1>Dashboard</h1>
    </Protect>
  );
}

// With role-based condition
function AdminPanel() {
  return (
    <Protect
      condition={(user) => user.publicMetadata?.role === 'admin'}
      fallback={<p>Admin access required.</p>}
    >
      <h1>Admin Panel</h1>
    </Protect>
  );
}
```

### Get Current User

```tsx
import { useUser } from '@authon/react';

function Profile() {
  const { user, isLoading } = useUser();
  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>Not signed in</p>;
  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Name: {user.displayName}</p>
    </div>
  );
}
```

### Add Email/Password Auth

```tsx
import { useAuthon } from '@authon/react';
import { useState } from 'react';

function EmailSignIn() {
  const { client } = useAuthon();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await client?.signInWithEmail(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Handle Sign Out

```tsx
import { useAuthon } from '@authon/react';

function SignOutButton() {
  const { signOut } = useAuthon();
  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_PUBLISHABLE_KEY` | Yes | Project publishable key (`pk_live_...` or `pk_test_...`) |
| `AUTHON_API_URL` | No | Optional — defaults to `api.authon.dev` |

## API Reference

### Components

| Component | Description |
|-----------|-------------|
| `<AuthonProvider>` | Context provider. Props: `publishableKey`, `config?` |
| `<SignIn>` | Pre-built sign-in form (`mode="popup"` or `"embedded"`) |
| `<SignUp>` | Pre-built sign-up form |
| `<UserButton>` | Avatar dropdown with user info and sign-out |
| `<UserProfile>` | Full user profile management |
| `<SignedIn>` | Renders children only when signed in |
| `<SignedOut>` | Renders children only when signed out |
| `<Protect>` | Conditional render with `fallback` and `condition` |
| `<SocialButton>` | Single OAuth provider button |
| `<SocialButtons>` | All enabled OAuth provider buttons |

### Hooks

| Hook | Returns |
|------|---------|
| `useAuthon()` | `{ isSignedIn, isLoading, user, signOut, openSignIn, openSignUp, getToken, client }` |
| `useUser()` | `{ user, isLoading }` |
| `useAuthonMfa()` | MFA setup, verification, and management |
| `useAuthonPasskeys()` | Passkey registration and authentication |
| `useAuthonPasswordless()` | Magic link and email OTP |
| `useAuthonWeb3()` | Web3 wallet sign-in and management |
| `useAuthonSessions()` | List and revoke active sessions |
| `useOrganization()` | Active organization management |
| `useOrganizationList()` | List and switch organizations |

## Comparison

| Feature | Authon | Clerk | Auth.js |
|---------|--------|-------|---------|
| Pricing | Free | $25/mo+ | Free |
| OAuth providers | 10+ | 20+ | 80+ |
| ShadowDOM modal | Yes | No | No |
| MFA/Passkeys | Yes | Yes | Plugin |
| Web3 auth | Yes | No | No |
| Organizations | Yes | Yes | No |

## License

MIT
