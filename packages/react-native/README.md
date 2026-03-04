**English** | [한국어](./README.ko.md)

# @authon/react-native

React Native SDK for [Authon](https://authon.dev) authentication. Provides React hooks, social login with in-app browser, and secure token storage.

## Install

```bash
npm install @authon/react-native @authon/js
```

Peer dependencies:

```bash
npm install react-native react-native-svg
```

| Peer dependency | Version |
|---|---|
| `react` | `^18.0.0 \|\| ^19.0.0` |
| `react-native` | `>=0.70.0` |
| `react-native-svg` | `>=12.0.0` |

---

## Setup

Wrap your app with `AuthonProvider` and pass a token storage adapter. For secure storage, use `expo-secure-store` (Expo) or `react-native-keychain` (bare RN).

```tsx
// App.tsx
import React from 'react';
import { AuthonProvider } from '@authon/react-native';
import * as SecureStore from 'expo-secure-store';

const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export default function App() {
  return (
    <AuthonProvider publishableKey="pk_live_..." storage={storage}>
      <Navigation />
    </AuthonProvider>
  );
}
```

Without a storage adapter, tokens persist only in memory and are lost on app restart.

---

## Hooks

### `useAuthon()`

Returns the full auth context.

```typescript
import { useAuthon } from '@authon/react-native';

const {
  isLoaded,       // boolean — true once the initial auth check is complete
  isSignedIn,     // boolean
  userId,         // string | null
  sessionId,      // string | null
  accessToken,    // string | null
  user,           // AuthonUser | null
  signIn,         // (params: SignInParams) => Promise<void>
  signUp,         // (params: SignUpParams) => Promise<void>
  signOut,        // () => Promise<void>
  getToken,       // () => string | null — returns current access token
  providers,      // OAuthProviderType[] — enabled providers from your project config
  branding,       // BrandingConfig | null
  startOAuth,     // (provider, redirectUri?) => Promise<{ url: string; state: string }>
  completeOAuth,  // (state: string) => Promise<void>
  on,             // (event, listener) => () => void — subscribe to auth events
  client,         // AuthonMobileClient — underlying client instance
} = useAuthon();
```

### `useUser()`

Convenience hook that returns only user state.

```typescript
import { useUser } from '@authon/react-native';

const { isLoaded, isSignedIn, user } = useUser();
```

---

## Examples

### Login screen with email and password

```tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function LoginScreen() {
  const { signIn, isLoaded } = useAuthon();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn({ strategy: 'email_password', email, password });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <ActivityIndicator />;

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={handleSignIn} disabled={loading} />
    </View>
  );
}
```

### Social login buttons

Use the built-in `SocialButtons` component. It fetches the enabled providers from your Authon project and renders buttons automatically.

```tsx
import React from 'react';
import { View } from 'react-native';
import { SocialButtons } from '@authon/react-native';

export function SocialLoginSection() {
  return (
    <View style={{ padding: 24 }}>
      <SocialButtons
        onSuccess={() => console.log('Signed in')}
        onError={(err) => console.error(err)}
      />
    </View>
  );
}
```

Compact icon-only layout:

```tsx
<SocialButtons
  compact
  onSuccess={() => console.log('Signed in')}
  onError={(err) => console.error(err)}
/>
```

Individual `SocialButton`:

```tsx
import { SocialButton } from '@authon/react-native';

<SocialButton
  provider="google"
  onPress={(provider) => handleOAuth(provider)}
  loading={isLoading}
  label="Continue with Google"  // optional — defaults to "Continue with Google"
  compact={false}               // optional — icon-only square button
  height={48}                   // optional — button height in px
  borderRadius={10}             // optional
/>
```

### Manual OAuth flow with in-app browser

`SocialButtons` handles OAuth automatically. For custom flows, use `startOAuth` and `completeOAuth` directly. OAuth uses the device browser (via `Linking.openURL`) rather than a popup.

```tsx
import React, { useState } from 'react';
import { Button, Linking } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function GoogleSignInButton() {
  const { startOAuth, completeOAuth } = useAuthon();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { url, state } = await startOAuth('google');
      // Open the OAuth URL in the default browser
      await Linking.openURL(url);
      // Poll for OAuth completion (3 minute timeout)
      await completeOAuth(state);
    } catch (err: any) {
      if (err.message !== 'OAuth timeout') {
        console.error('OAuth failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={loading ? 'Signing in...' : 'Sign in with Google'}
      onPress={handleGoogleSignIn}
      disabled={loading}
    />
  );
}
```

### Session management

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function SessionsScreen() {
  const { client, userId, signOut } = useAuthon();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    // Access the underlying AuthonMobileClient for advanced operations
    client.getUser().then(() => {
      // sessions are managed server-side; use @authon/node on the backend
      // to list and revoke sessions via authon.sessions.list(userId)
    });
  }, [userId]);

  return (
    <View>
      <Button title="Sign Out (all devices)" onPress={signOut} />
    </View>
  );
}
```

### MFA setup

MFA (TOTP) is configured on the client side through the underlying `@authon/js` client. Access it via `client` from `useAuthon()`.

```tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function MfaSetupScreen() {
  const { client } = useAuthon();
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');

  const setupMfa = async () => {
    // Use the underlying client's MFA methods (via @authon/js)
    const jsClient = (client as any)._jsClient;
    if (!jsClient) return;

    const setup = await jsClient.setupMfa();
    setQrCodeUri(setup.qrCodeUri);
    setBackupCodes(setup.backupCodes);
  };

  const verifyMfa = async () => {
    const jsClient = (client as any)._jsClient;
    await jsClient.verifyMfaSetup(code);
  };

  return (
    <View style={{ padding: 24, gap: 12 }}>
      {qrCodeUri ? (
        <>
          <Image source={{ uri: qrCodeUri }} style={{ width: 200, height: 200 }} />
          <Text>Backup codes: {backupCodes.join(', ')}</Text>
          <TextInput
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <Button title="Verify" onPress={verifyMfa} />
        </>
      ) : (
        <Button title="Enable MFA" onPress={setupMfa} />
      )}
    </View>
  );
}
```

### Web3 wallet connection

```tsx
import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function Web3ConnectScreen() {
  const { client } = useAuthon();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    // Request nonce from Authon API via the underlying client
    const apiUrl = client.getApiUrl();
    const token = client.getAccessToken();

    // 1. Get a sign message from Authon
    const nonceRes = await fetch(`${apiUrl}/v1/auth/web3/nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-api-key': 'pk_live_...',
      },
      body: JSON.stringify({ address: walletAddress, chain: 'evm' }),
    });
    const { message } = await nonceRes.json();

    // 2. Sign with your wallet library (e.g. WalletConnect, ethers)
    // const signature = await wallet.signMessage(message);

    // 3. Verify and link wallet
    // await fetch(`${apiUrl}/v1/auth/web3/verify`, { ... })
  };

  return (
    <View style={{ padding: 24 }}>
      <Button title="Connect Wallet" onPress={connectWallet} />
    </View>
  );
}
```

### Auth event subscription

```tsx
import { useEffect } from 'react';
import { useAuthon } from '@authon/react-native';

function App() {
  const { on } = useAuthon();

  useEffect(() => {
    const unsubSignedIn = on('signedIn', (user) => {
      console.log('User signed in:', user.id);
    });
    const unsubSignedOut = on('signedOut', () => {
      console.log('User signed out');
    });
    const unsubRefreshed = on('tokenRefreshed', () => {
      console.log('Token refreshed');
    });
    const unsubError = on('error', (err) => {
      console.error('Auth error:', err);
    });

    return () => {
      unsubSignedIn();
      unsubSignedOut();
      unsubRefreshed();
      unsubError();
    };
  }, [on]);

  return null;
}
```

---

## OAuth Note

Unlike web SDKs, `@authon/react-native` does not use popups. OAuth flows open the system browser via `Linking.openURL`. After the user authenticates, the SDK polls the Authon API to complete the session (up to 3 minutes). The `SocialButtons` component handles this polling automatically.

---

## API Reference

### `<AuthonProvider>`

| Prop | Type | Description |
|---|---|---|
| `publishableKey` | `string` | Your Authon publishable key (`pk_live_...`) |
| `apiUrl` | `string` | Optional — custom API base URL |
| `storage` | `TokenStorage` | Optional — secure storage adapter for token persistence |
| `children` | `React.ReactNode` | App content |

### `TokenStorage` interface

```typescript
interface TokenStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

### `SignInParams`

```typescript
interface SignInParams {
  strategy: 'email_password' | 'oauth';
  email?: string;
  password?: string;
  provider?: string;
}
```

### `SignUpParams`

```typescript
interface SignUpParams {
  email: string;
  password: string;
  displayName?: string;
}
```

### `AuthonMobileClient` methods

| Method | Returns | Description |
|---|---|---|
| `signIn(params)` | `Promise<{ tokens, user }>` | Sign in with email/password or OAuth |
| `signUp(params)` | `Promise<{ tokens, user }>` | Create account and sign in |
| `signOut()` | `Promise<void>` | Sign out and clear local session |
| `getUser()` | `Promise<AuthonUser \| null>` | Fetch current user from API |
| `getCachedUser()` | `AuthonUser \| null` | Return locally cached user |
| `getAccessToken()` | `string \| null` | Return current access token |
| `isAuthenticated()` | `boolean` | Check if token is valid and not expired |
| `refreshToken(token?)` | `Promise<TokenPair \| null>` | Refresh the access token |
| `getProviders()` | `Promise<OAuthProviderType[]>` | Fetch enabled OAuth providers |
| `getBranding()` | `Promise<BrandingConfig \| null>` | Fetch project branding config |
| `getOAuthUrl(provider, redirectUri)` | `Promise<{ url, state }>` | Get OAuth authorization URL |
| `completeOAuth(state)` | `Promise<{ tokens, user }>` | Poll for OAuth completion |
| `getApiUrl()` | `string` | Return configured API base URL |
| `on(event, listener)` | `() => void` | Subscribe to auth events, returns unsubscribe function |
| `setStorage(storage)` | `void` | Set token storage adapter |
| `initialize()` | `Promise<TokenPair \| null>` | Load tokens from storage on app start |
| `destroy()` | `void` | Clear timers and event listeners |

---

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
