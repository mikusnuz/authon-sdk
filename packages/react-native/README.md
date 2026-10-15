**English** | [한국어](./README.ko.md)

# @authon/react-native

> Drop-in React Native authentication with secure token storage — Auth0 alternative

[![npm version](https://img.shields.io/npm/v/@authon/react-native?color=6d28d9)](https://www.npmjs.com/package/@authon/react-native)
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
npm install @authon/react-native react-native-svg
npx expo install expo-secure-store expo-web-browser
```

## Quick Start

```tsx
// App.tsx — complete working file
import React, { useState } from 'react';
import { View, Text, Button, TextInput, ActivityIndicator } from 'react-native';
import { AuthonProvider, useAuthon, useUser } from '@authon/react-native';
import * as SecureStore from 'expo-secure-store';

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

function HomeScreen() {
  const { isLoaded, isSignedIn, user, signIn, signOut } = useAuthon();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isLoaded) return <ActivityIndicator />;

  if (isSignedIn) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Welcome, {user?.displayName ?? user?.email}</Text>
        <Button title="Sign Out" onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign In" onPress={() => signIn({ strategy: 'email_password', email, password })} />
    </View>
  );
}

export default function App() {
  return (
    <AuthonProvider
      publishableKey="pk_live_YOUR_PUBLISHABLE_KEY"
      storage={storage}
    >
      <HomeScreen />
    </AuthonProvider>
  );
}
```

## Common Tasks

### Add Google OAuth Login

```tsx
import * as WebBrowser from 'expo-web-browser';
import { useAuthon } from '@authon/react-native';

// 1. Add your app scheme (e.g. "myapp://") to the project's allowed origins in the dashboard.
// 2. Optionally set <AuthonProvider oauthReturnTo="myapp://oauth-callback" ...> so
//    startOAuth() and <SocialButtons /> know where to return.
function GoogleButton() {
  const { startOAuth, completeOAuth } = useAuthon();

  const handlePress = async () => {
    const { url } = await startOAuth('google', { returnTo: 'myapp://oauth-callback' });
    const result = await WebBrowser.openAuthSessionAsync(url, 'myapp://oauth-callback');
    if (result.type === 'success') await completeOAuth(result.url);
  };

  return <Button title="Sign in with Google" onPress={handlePress} />;
}
```

From 0.9.1, OAuth uses PKCE:
- `startOAuth` keeps a verifier in the client and sends only its hash.
- Authon redirects to `returnTo` with a one-time `authon_code`.
- `completeOAuth(callbackUrl)` exchanges that code with the verifier.
- `GET /v1/auth/oauth/poll` returns status only, so `completeOAuth(state)` on its own can no longer get tokens. It now waits until `handleOAuthCallback(url)` receives the deep link.
- `crypto.getRandomValues` is required (Expo SDK 49+ or `react-native-get-random-values`).
- If the user has MFA enabled, `completeOAuth` / `handleOAuthCallback` reject with `AuthonMfaRequiredError` (and emit `mfaRequired`). No session exists yet; finish with `verifyMfa(error.mfaToken, code)`:

```tsx
import { AuthonMfaRequiredError, useAuthon } from '@authon/react-native';

const { completeOAuth, verifyMfa } = useAuthon();
try {
  await completeOAuth(result.url);
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    const code = await askUserForTotpCode();
    await verifyMfa(err.mfaToken, code);
  } else throw err;
}
```

### Add Google OAuth (Expo recommended)

```tsx
import * as WebBrowser from 'expo-web-browser';
import { useAuthon } from '@authon/react-native';

function GoogleButton() {
  const { startOAuth, completeOAuth } = useAuthon();

  const handlePress = async () => {
    // https bridge on an allowed origin that 302-redirects to
    // myapp://oauth-callback, forwarding authon_code and authon_oauth_state.
    const { url } = await startOAuth('google', {
      returnTo: 'https://your-domain.com/mobile-callback',
    });
    const result = await WebBrowser.openAuthSessionAsync(url, 'myapp://oauth-callback');
    if (result.type === 'success') await completeOAuth(result.url);
  };

  return <Button title="Sign in with Google" onPress={handlePress} />;
}
```

### Get Current User

```tsx
import { useUser } from '@authon/react-native';

function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return <ActivityIndicator />;
  if (!isSignedIn) return <Text>Not signed in</Text>;
  return <Text>Email: {user?.email}</Text>;
}
```

### Add Email/Password Auth

```tsx
const { signIn } = useAuthon();
await signIn({ strategy: 'email_password', email: 'user@example.com', password: 'MyP@ssw0rd' });
```

### Handle Sign Out

```tsx
const { signOut } = useAuthon();
await signOut();
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
| `<AuthonProvider>` | Provider with `publishableKey`, `apiUrl`, `storage` |
| `<SocialButtons>` | Renders all enabled OAuth provider buttons |
| `<SocialButton>` | Single OAuth provider button with icon |

### Hooks

| Hook | Returns |
|------|---------|
| `useAuthon()` | `{ isLoaded, isSignedIn, user, signIn, signUp, signOut, getToken, providers, branding, startOAuth, completeOAuth, handleOAuthCallback, verifyMfa, on, client }` |
| `useUser()` | `{ isLoaded, isSignedIn, user }` |
| `useAuthonWeb3()` | Web3 wallet auth |
| `useAuthonPasswordless()` | OTP and magic link |
| `useAuthonPasskeys()` | Passkey registration and auth |

## Comparison

| Feature | Authon | Clerk | Auth0 |
|---------|--------|-------|-------|
| Pricing | Free | $25/mo+ | $23/mo+ |
| React Native | Yes | Yes | Yes |
| Secure token storage | Yes | Yes | Yes |
| Web3 auth | Yes | No | No |
| MFA/Passkeys | Yes | Yes | Yes |

## License

MIT
