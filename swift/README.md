# Authon (Swift)

> Swift server SDK for iOS/macOS token verification and user management — self-hosted Clerk alternative, Auth0 alternative

[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)

## Install

### Swift Package Manager

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/mikusnuz/authon-sdk.git", from: "0.1.0")
]
```

Or in Xcode: File > Add Package Dependencies > `https://github.com/mikusnuz/authon-sdk.git`

## Quick Start

```swift
// main.swift — complete working example
import Authon

let authon = AuthonBackend(secretKey: "sk_live_YOUR_SECRET_KEY")

// Verify a token
let user = try await authon.verifyToken("eyJhbGci...")
print("\(user.id) \(user.email ?? "no email")")

// List users
let result = try await authon.users.list()
for u in result.data {
    print(u.email ?? "no email")
}

// Create a user
let newUser = try await authon.users.create(CreateUserParams(
    email: "alice@example.com",
    password: "securePassword"
))
```

## Common Tasks

### Verify a Token

```swift
let authon = AuthonBackend(secretKey: "sk_live_...")
let user = try await authon.verifyToken(accessToken)
// user.id, user.email, user.displayName, ...
```

### Manage Users

```swift
let authon = AuthonBackend(secretKey: "sk_live_...")

// List
let result = try await authon.users.list(options: ListOptions(page: 1, perPage: 20))

// Get
let user = try await authon.users.get("user_abc123")

// Create
let user = try await authon.users.create(CreateUserParams(email: "user@example.com", password: "pass123"))

// Update
let updated = try await authon.users.update("user_abc123", params: UpdateUserParams(firstName: "Alice"))

// Ban / Unban / Delete
try await authon.users.ban("user_abc123")
try await authon.users.unban("user_abc123")
try await authon.users.delete("user_abc123")
```

### Verify Webhooks

```swift
let event = try authon.webhooks.verify(
    payload: requestBodyData,
    signature: request.headers["x-authon-signature"]!,
    secret: "whsec_YOUR_WEBHOOK_SECRET"
)
// event["type"] == "user.created"
```

### Custom API URL

```swift
let authon = AuthonBackend(secretKey: "sk_live_...", apiURL: "https://custom.api.url")
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_SECRET_KEY` | Yes | Server secret key (`sk_live_...`) |
| `AUTHON_API_URL` | No | Custom API URL (default: `https://api.authon.dev`) |

## API Reference

| Method | Returns |
|--------|---------|
| `AuthonBackend(secretKey:, apiURL?)` | Constructor |
| `verifyToken(_:)` | `async throws -> User` |
| `users.list(options?)` | `async throws -> ListResult<User>` |
| `users.get(_:)` | `async throws -> User` |
| `users.create(_:)` | `async throws -> User` |
| `users.update(_:, params:)` | `async throws -> User` |
| `users.delete(_:)` | `async throws` |
| `users.ban(_:)` | `async throws -> User` |
| `users.unban(_:)` | `async throws -> User` |
| `webhooks.verify(payload:, signature:, secret:)` | `throws -> [String: Any]` |

## Comparison

| Feature | Authon | Clerk | Firebase Auth |
|---------|--------|-------|---------------|
| Self-hosted | Yes | No | No |
| Pricing | Free | $25/mo+ | Free tier |
| Swift SDK | Yes | No | Yes |
| async/await | Yes | N/A | Yes |
| Server-side verification | Yes | Yes | Yes |

## License

MIT
