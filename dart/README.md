# authon (Dart/Flutter)

Official Dart SDK for [Authon](https://authon.dev) — authenticate users in Flutter apps with OAuth, email/password, and session management.

## Install

```yaml
# pubspec.yaml
dependencies:
  authon: ^0.1.0
```

```bash
dart pub get
```

## Quick Start

### Flutter Setup

```dart
import 'package:authon/authon.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    AuthonProvider(
      publishableKey: 'pk_live_...',
      child: const MyApp(),
    ),
  );
}
```

### Sign In

```dart
import 'package:authon/authon.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authon = Authon.of(context);

    return Column(
      children: [
        ElevatedButton(
          onPressed: () => authon.signInWithOAuth(OAuthProvider.google),
          child: const Text('Sign in with Google'),
        ),
        ElevatedButton(
          onPressed: () => authon.signInWithOAuth(OAuthProvider.apple),
          child: const Text('Sign in with Apple'),
        ),
        ElevatedButton(
          onPressed: () async {
            final user = await authon.signInWithEmail(
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
    return AuthonBuilder(
      builder: (context, state) {
        if (state.isLoading) return const CircularProgressIndicator();
        if (!state.isSignedIn) return const SignInScreen();

        return Column(
          children: [
            Text('Welcome, ${state.user!.displayName}'),
            ElevatedButton(
              onPressed: () => Authon.of(context).signOut(),
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

### `AuthonProvider`

| Property | Type | Description |
|----------|------|-------------|
| `publishableKey` | `String` | Your publishable API key |
| `apiUrl` | `String?` | Custom API URL |
| `child` | `Widget` | Child widget tree |

### `Authon.of(context)`

| Method | Returns | Description |
|--------|---------|-------------|
| `signInWithOAuth(provider)` | `Future<AuthonUser>` | OAuth sign-in |
| `signInWithEmail(email, password)` | `Future<AuthonUser>` | Email sign-in |
| `signOut()` | `Future<void>` | Sign out |
| `user` | `AuthonUser?` | Current user |
| `isSignedIn` | `bool` | Whether signed in |
| `getToken()` | `Future<String?>` | Get current access token |

### `AuthonBuilder`

Reactive widget that rebuilds when auth state changes.

### `AuthonUser`

| Property | Type |
|----------|------|
| `id` | `String` |
| `email` | `String?` |
| `displayName` | `String?` |
| `avatarUrl` | `String?` |
| `emailVerified` | `bool` |
| `createdAt` | `DateTime` |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../LICENSE)
