# authon

> Dart/Flutter server SDK for token verification and user management — self-hosted Clerk alternative, Auth0 alternative

[![pub version](https://img.shields.io/pub/v/authon?color=6d28d9)](https://pub.dev/packages/authon)
[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)

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

```dart
// main.dart — complete working example
import 'package:authon/authon.dart';

void main() async {
  final authon = AuthonBackend(secretKey: 'sk_live_YOUR_SECRET_KEY');

  // Verify a token
  final user = await authon.verifyToken('eyJhbGci...');
  print('${user.id} ${user.email}');

  // List users
  final result = await authon.users.list();
  for (final u in result.data) {
    print(u.email);
  }

  // Create a user
  final newUser = await authon.users.create(CreateUserParams(
    email: 'alice@example.com',
    password: 'securePassword',
  ));

  authon.close();
}
```

## Common Tasks

### Verify a Token

```dart
final authon = AuthonBackend(secretKey: 'sk_live_...');
final user = await authon.verifyToken(accessToken);
// user.id, user.email, user.displayName, ...
```

### Manage Users

```dart
final authon = AuthonBackend(secretKey: 'sk_live_...');

// List
final result = await authon.users.list(options: ListOptions(page: 1, perPage: 20));

// Get
final user = await authon.users.get('user_abc123');

// Create
final user = await authon.users.create(CreateUserParams(
  email: 'user@example.com',
  password: 'password123',
));

// Update
final updated = await authon.users.update('user_abc123', UpdateUserParams(
  firstName: 'Alice',
));

// Ban / Unban / Delete
await authon.users.ban('user_abc123');
await authon.users.unban('user_abc123');
await authon.users.delete('user_abc123');
```

### Verify Webhooks

```dart
final event = authon.webhooks.verify(
  requestBody,
  request.headers['x-authon-signature']!,
  'whsec_YOUR_WEBHOOK_SECRET',
);
print(event['type']); // "user.created"
```

### Custom API URL

```dart
final authon = AuthonBackend(
  secretKey: 'sk_live_...',
  apiUrl: 'https://custom.api.url',
);
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_SECRET_KEY` | Yes | Server secret key (`sk_live_...`) |
| `AUTHON_API_URL` | No | Custom API URL (default: `https://api.authon.dev`) |

## API Reference

| Method | Returns |
|--------|---------|
| `AuthonBackend(secretKey:, apiUrl?)` | Constructor |
| `verifyToken(token)` | `Future<User>` |
| `users.list(options?)` | `Future<ListResult<User>>` |
| `users.get(userId)` | `Future<User>` |
| `users.create(params)` | `Future<User>` |
| `users.update(userId, params)` | `Future<User>` |
| `users.delete(userId)` | `Future<void>` |
| `users.ban(userId)` | `Future<User>` |
| `users.unban(userId)` | `Future<User>` |
| `webhooks.verify(payload, signature, secret)` | `Map<String, dynamic>` |
| `close()` | Closes HTTP client |

## Comparison

| Feature | Authon | Clerk | Firebase Auth |
|---------|--------|-------|---------------|
| Self-hosted | Yes | No | No |
| Pricing | Free | $25/mo+ | Free tier |
| Dart SDK | Yes | No | Yes |
| Server-side verification | Yes | Yes | Yes |
| Webhook verification | Yes | Yes | Via Cloud Functions |

## License

MIT
