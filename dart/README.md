# authup (Dart/Flutter)

Official Dart SDK for [Authup](https://authup.dev) — authenticate users in Flutter apps with OAuth, email/password, and session management.

## Install

```yaml
# pubspec.yaml
dependencies:
  authup: ^0.1.0
```

```bash
dart pub get
```

## Quick Start

### Flutter Setup

```dart
import 'package:authup/authup.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    AuthupProvider(
      publishableKey: 'pk_live_...',
      child: const MyApp(),
    ),
  );
}
```

### Sign In

```dart
import 'package:authup/authup.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authup = Authup.of(context);

    return Column(
      children: [
        ElevatedButton(
          onPressed: () => authup.signInWithOAuth(OAuthProvider.google),
          child: const Text('Sign in with Google'),
        ),
        ElevatedButton(
          onPressed: () => authup.signInWithOAuth(OAuthProvider.apple),
          child: const Text('Sign in with Apple'),
        ),
        ElevatedButton(
          onPressed: () async {
            final user = await authup.signInWithEmail(
              'user@example.com',
              'password',
            );
            print(user.displayName);
          },
          child: const Text('Sign in with Email'),
        ),
      ],
    );
  }
}
```

### Watch Auth State

```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthupBuilder(
      builder: (context, state) {
        if (state.isLoading) return const CircularProgressIndicator();
        if (!state.isSignedIn) return const SignInScreen();

        return Column(
          children: [
            Text('Welcome, ${state.user!.displayName}'),
            ElevatedButton(
              onPressed: () => Authup.of(context).signOut(),
              child: const Text('Sign Out'),
            ),
          ],
        );
      },
    );
  }
}
```

## API Reference

### `AuthupProvider`

| Property | Type | Description |
|----------|------|-------------|
| `publishableKey` | `String` | Your publishable API key |
| `apiUrl` | `String?` | Custom API URL |
| `child` | `Widget` | Child widget tree |

### `Authup.of(context)`

| Method | Returns | Description |
|--------|---------|-------------|
| `signInWithOAuth(provider)` | `Future<AuthupUser>` | OAuth sign-in |
| `signInWithEmail(email, password)` | `Future<AuthupUser>` | Email sign-in |
| `signOut()` | `Future<void>` | Sign out |
| `user` | `AuthupUser?` | Current user |
| `isSignedIn` | `bool` | Whether signed in |
| `getToken()` | `Future<String?>` | Get current access token |

### `AuthupBuilder`

Reactive widget that rebuilds when auth state changes.

### `AuthupUser`

| Property | Type |
|----------|------|
| `id` | `String` |
| `email` | `String?` |
| `displayName` | `String?` |
| `avatarUrl` | `String?` |
| `emailVerified` | `bool` |
| `createdAt` | `DateTime` |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../LICENSE)
