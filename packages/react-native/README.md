# @authup/react-native

React Native SDK for [Authup](https://authup.dev) — native OAuth, secure token storage, and React hooks.

## Install

```bash
npm install @authup/react-native
# or
pnpm add @authup/react-native
```

Requires `react-native >= 0.72`, `expo-auth-session`, and `expo-secure-store` (or bare RN equivalents).

## Quick Start

### 1. Provider

```tsx
// App.tsx
import { AuthupProvider } from '@authup/react-native';

export default function App() {
  return (
    <AuthupProvider publishableKey="pk_live_...">
      <Navigation />
    </AuthupProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useAuthup, useUser } from '@authup/react-native';
import { View, Text, Button } from 'react-native';

function ProfileScreen() {
  const { isSignedIn, signOut } = useAuthup();
  const { user } = useUser();

  if (!isSignedIn) {
    return <SignInScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.displayName}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

function SignInScreen() {
  const { signInWithOAuth, signInWithEmail } = useAuthup();

  return (
    <View>
      <Button title="Sign in with Google" onPress={() => signInWithOAuth('google')} />
      <Button title="Sign in with Apple" onPress={() => signInWithOAuth('apple')} />
    </View>
  );
}
```

## API Reference

### `<AuthupProvider>`

```tsx
<AuthupProvider
  publishableKey="pk_live_..."
  config={{
    apiUrl: 'https://api.authup.dev',
    scheme: 'myapp',  // Custom URL scheme for OAuth redirect
  }}
>
```

### Hooks

#### `useAuthup()`

```ts
const {
  isSignedIn,       // boolean
  isLoading,        // boolean
  user,             // AuthupUser | null
  signInWithOAuth,  // (provider: string) => Promise<void>
  signInWithEmail,  // (email: string, password: string) => Promise<AuthupUser>
  signOut,          // () => Promise<void>
  getToken,         // () => Promise<string | null>
} = useAuthup();
```

#### `useUser()`

```ts
const { user, isLoading } = useUser();
```

### Token Storage

Tokens are stored using `expo-secure-store` (Expo) or the platform keychain (bare RN), keeping credentials encrypted at rest.

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../../LICENSE)
