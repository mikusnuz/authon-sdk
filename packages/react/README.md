# @authon/react

React SDK for [Authon](https://authon.dev) — Provider, hooks, and pre-built components.

## Install

```bash
npm install @authon/react
# or
pnpm add @authon/react
```

Requires `react >= 18.0.0`.

## Quick Start

```tsx
import {
  AuthonProvider,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useAuthon,
} from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <Header />
      <Main />
    </AuthonProvider>
  );
}

function Header() {
  return (
    <nav>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </nav>
  );
}

function SignInButton() {
  const { openSignIn } = useAuthon();
  return <button onClick={() => openSignIn()}>Sign In</button>;
}

function Main() {
  const { user, isLoading } = useUser();
  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>Please sign in.</p>;
  return <h1>Welcome, {user.displayName}</h1>;
}
```

## API Reference

### `<AuthonProvider>`

Wraps your app and provides auth context.

```tsx
<AuthonProvider
  publishableKey="pk_live_..."
  config={{
    apiUrl: 'https://api.authon.dev',
    theme: 'auto',
    locale: 'en',
    appearance: { primaryColorStart: '#7c3aed' },
  }}
>
  {children}
</AuthonProvider>
```

### Hooks

#### `useAuthon()`

Returns the full auth context:

```ts
const {
  isSignedIn,  // boolean
  isLoading,   // boolean
  user,        // AuthonUser | null
  signOut,     // () => Promise<void>
  openSignIn,  // () => Promise<void>
  openSignUp,  // () => Promise<void>
  getToken,    // () => string | null
  client,      // Authon instance
} = useAuthon();
```

#### `useUser()`

Shorthand for user data:

```ts
const { user, isLoading } = useUser();
```

### Components

| Component | Props | Description |
|-----------|-------|-------------|
| `<SignedIn>` | `children` | Renders children only when signed in |
| `<SignedOut>` | `children` | Renders children only when signed out |
| `<UserButton>` | none | Avatar dropdown with sign-out action |
| `<SignIn>` | `mode?` | Opens sign-in modal or renders embedded form |
| `<SignUp>` | `mode?` | Opens sign-up modal or renders embedded form |
| `<Protect>` | `fallback?`, `condition?` | Guards content, optionally with a custom condition |

### `<Protect>` Example

```tsx
<Protect
  fallback={<p>You need admin access.</p>}
  condition={(user) => user.publicMetadata?.role === 'admin'}
>
  <AdminPanel />
</Protect>
```

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../../LICENSE)
