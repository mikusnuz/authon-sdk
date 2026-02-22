# @authon/react-native

React Native SDK for [Authon](https://authon.dev) — native OAuth, secure token storage, and React hooks.

## Install

```bash
npm install @authon/react-native
# or
pnpm add @authon/react-native
```

Requires `react-native >= 0.72`, `expo-auth-session`, and `expo-secure-store` (or bare RN equivalents).

## Quick Start

### 1. Provider

```tsx
// App.tsx
import { AuthonProvider } from '@authon/react-native';

export default function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <Navigation />
    </AuthonProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useAuthon, useUser } from '@authon/react-native';
import { View, Text, Button } from 'react-native';

function ProfileScreen() {
  const { isSignedIn, signOut } = useAuthon();
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
  const { signInWithOAuth, signInWithEmail } = useAuthon();

  return (
    <View>
      <Button title="Sign in with Google" onPress={() => signInWithOAuth('google')} />
      <Button title="Sign in with Apple" onPress={() => signInWithOAuth('apple')} />
    </View>
  );
}
```

## API Reference

### `<AuthonProvider>`

```tsx
<AuthonProvider
  publishableKey="pk_live_..."
  config={{
    apiUrl: 'https://api.authon.dev',
    scheme: 'myapp',  // Custom URL scheme for OAuth redirect
  }}
>
```

### Hooks

#### `useAuthon()`

```ts
const {
  isSignedIn,       // boolean
  isLoading,        // boolean
  user,             // AuthonUser | null
  signInWithOAuth,  // (provider: string) => Promise<void>
  signInWithEmail,  // (email: string, password: string) => Promise<AuthonUser>
  signOut,          // () => Promise<void>
  getToken,         // () => Promise<string | null>
} = useAuthon();
```

#### `useUser()`

```ts
const { user, isLoading } = useUser();
```

### Token Storage

Tokens are stored using `expo-secure-store` (Expo) or the platform keychain (bare RN), keeping credentials encrypted at rest.

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
