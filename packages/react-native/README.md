**English** | [한국어](./README.ko.md)

# @authon/react-native

React Native SDK for [Authon](https://authon.dev). It provides:

- `AuthonProvider` for app-wide auth state
- `useAuthon()` and `useUser()` hooks
- secure token persistence through a storage adapter
- `SocialButton` / `SocialButtons`
- low-level OAuth helpers (`startOAuth`, `completeOAuth`, `client`)

## Install

```bash
npm install @authon/react-native react-native-svg
npx expo install expo-secure-store expo-web-browser
```

`expo-secure-store` is the recommended storage adapter for Expo apps.
`expo-web-browser` is optional but recommended when you want a more controlled OAuth flow in Expo.

## Setup

```tsx
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

Without a storage adapter, tokens remain in memory only.

## Hooks

### `useAuthon()`

```ts
const {
  isLoaded,
  isSignedIn,
  userId,
  accessToken,
  user,
  signIn,
  signUp,
  signOut,
  getToken,
  providers,
  branding,
  startOAuth,
  completeOAuth,
  on,
  client,
} = useAuthon();
```

### `useUser()`

```ts
const { isLoaded, isSignedIn, user } = useUser();
```

## Email / Password Example

```tsx
import { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { useAuthon, useUser } from '@authon/react-native';

export function LoginScreen() {
  const { isLoaded } = useUser();
  const { signIn, signOut, user, isSignedIn } = useAuthon();
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
      setError(err.message ?? 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <ActivityIndicator />;

  if (isSignedIn) {
    return (
      <View style={{ padding: 24, gap: 12 }}>
        <Text>Welcome, {user?.displayName ?? user?.email}</Text>
        <Button title="Sign out" onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title={loading ? 'Signing in...' : 'Sign in'} onPress={handleSignIn} disabled={loading} />
    </View>
  );
}
```

## Social Buttons

```tsx
import { SocialButtons } from '@authon/react-native';

export function SocialLoginSection() {
  return (
    <SocialButtons
      onSuccess={() => console.log('Signed in')}
      onError={(error) => console.error(error)}
    />
  );
}
```

For fully custom buttons, use `SocialButton` or call `startOAuth()` / `completeOAuth()` yourself.

## Manual OAuth Flow

The basic SDK flow looks like this:

```tsx
import { Linking } from 'react-native';
import { useAuthon } from '@authon/react-native';

export function GoogleButton() {
  const { startOAuth, completeOAuth } = useAuthon();

  const handlePress = async () => {
    const { url, state } = await startOAuth('google');
    await Linking.openURL(url);
    await completeOAuth(state);
  };

  // ...
}
```

This is the simplest option, but it is browser-driven and completion is polling-based.

## Recommended Expo OAuth Flow

If you want a cleaner Android experience with `expo-web-browser`, request the OAuth URL manually with `flow=redirect` and `returnTo`.

```tsx
import * as WebBrowser from 'expo-web-browser';
import { Button } from 'react-native';
import { useAuthon } from '@authon/react-native';

const API_URL = 'https://api.authon.dev';
const PUBLISHABLE_KEY = 'pk_live_...';
const APP_DEEP_LINK = 'myapp://oauth-callback';
const RETURN_TO = 'https://auth.example.com/authon/mobile-callback';

async function requestOAuthUrl(provider: 'google') {
  const params = new URLSearchParams({
    redirectUri: `${API_URL}/v1/auth/oauth/redirect`,
    flow: 'redirect',
    returnTo: RETURN_TO,
  });

  const response = await fetch(
    `${API_URL}/v1/auth/oauth/${provider}/url?${params.toString()}`,
    { headers: { 'x-api-key': PUBLISHABLE_KEY } },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<{ url: string; state: string }>;
}

export function GoogleButton() {
  const { completeOAuth, getToken } = useAuthon();

  const handlePress = async () => {
    const { url, state } = await requestOAuthUrl('google');
    const pollPromise = completeOAuth(state);

    await WebBrowser.openAuthSessionAsync(url, APP_DEEP_LINK);
    await pollPromise;

    const authonAccessToken = getToken();
    // If your app also has its own backend session, exchange authonAccessToken here.
  };

  return <Button title="Continue with Google" onPress={handlePress} />;
}
```

Example HTTPS bridge page:

```html
<!doctype html>
<html>
  <body>
    <script>
      const params = new URLSearchParams(window.location.search);
      const state = params.get('authon_oauth_state');
      const error = params.get('authon_oauth_error');

      const target = new URL('myapp://oauth-callback');
      if (state) target.searchParams.set('state', state);
      if (error) target.searchParams.set('error', error);

      window.location.replace(target.toString());
    </script>
  </body>
</html>
```

## Important Notes

- Do not register `myapp://...` directly as the provider redirect URI. Keep provider redirect URIs on `{apiUrl}/v1/auth/oauth/redirect`.
- Use `returnTo` for your app callback bridge. `returnTo` should be an HTTPS URL you control, and its origin must be listed in `ALLOWED_REDIRECT_ORIGINS`.
- If you need a custom app scheme, let the HTTPS bridge page redirect into `myapp://...`.
- On Android, `dismissAuthSession()` cannot reliably close an already-open Custom Tab. Plan your flow around `openAuthSessionAsync()` and a proper bridge.
- If your mobile app also maintains its own backend session, exchange `getToken()` with your backend immediately after `completeOAuth()`.

## Docs

- [Authon docs](https://authon.dev/docs)
- [Authon OAuth flow](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
