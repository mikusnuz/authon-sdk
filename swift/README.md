# Authon (Swift)

Official Swift SDK for [Authon](https://authon.dev) — authenticate users in iOS and macOS apps.

## Install

### Swift Package Manager

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/mikusnuz/authon-sdk.git", from: "0.1.0")
]
```

Or add via Xcode: File > Add Package Dependencies > `https://github.com/mikusnuz/authon-sdk.git`

## Quick Start

### Initialize

```swift
import Authon

let authon = AuthonClient(publishableKey: "pk_live_...")
```

### Sign In

```swift
// OAuth (opens ASWebAuthenticationSession)
let user = try await authon.signIn(with: .google)
print(user.email ?? "No email")

// Email/password
let user = try await authon.signIn(email: "user@example.com", password: "password")

// Apple Sign In (native)
let user = try await authon.signIn(with: .apple)
```

### Auth State

```swift
// Check current user
if let user = authon.currentUser {
    print("Signed in as \(user.displayName ?? user.email ?? "unknown")")
}

// Listen for changes
authon.onAuthStateChanged { user in
    if let user {
        print("Signed in: \(user.id)")
    } else {
        print("Signed out")
    }
}

// Get access token
let token = try await authon.getToken()

// Sign out
try await authon.signOut()
```

### SwiftUI

```swift
import SwiftUI
import Authon

struct ContentView: View {
    @StateObject private var auth = AuthonObservable(publishableKey: "pk_live_...")

    var body: some View {
        Group {
            if auth.isLoading {
                ProgressView()
            } else if let user = auth.user {
                VStack {
                    Text("Welcome, \(user.displayName ?? "User")")
                    Button("Sign Out") {
                        Task { try await auth.signOut() }
                    }
                }
            } else {
                VStack {
                    Button("Sign in with Google") {
                        Task { try await auth.signIn(with: .google) }
                    }
                    Button("Sign in with Apple") {
                        Task { try await auth.signIn(with: .apple) }
                    }
                }
            }
        }
    }
}
```

## API Reference

### `AuthonClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `signIn(with: OAuthProvider)` | `async throws -> AuthonUser` | OAuth sign-in |
| `signIn(email:password:)` | `async throws -> AuthonUser` | Email sign-in |
| `signOut()` | `async throws` | Sign out |
| `getToken()` | `async throws -> String` | Get current access token |
| `currentUser` | `AuthonUser?` | Current user (synchronous) |
| `onAuthStateChanged(_:)` | `() -> Void` | Listen for auth changes (returns unsubscribe) |

### `AuthonObservable` (SwiftUI)

ObservableObject with `@Published` properties:

| Property | Type | Description |
|----------|------|-------------|
| `user` | `AuthonUser?` | Current user |
| `isSignedIn` | `Bool` | Whether signed in |
| `isLoading` | `Bool` | Loading state |

### `AuthonUser`

| Property | Type |
|----------|------|
| `id` | `String` |
| `email` | `String?` |
| `displayName` | `String?` |
| `avatarUrl` | `String?` |
| `emailVerified` | `Bool` |
| `createdAt` | `Date` |

### `OAuthProvider`

`.google`, `.apple`, `.kakao`, `.naver`, `.github`, `.discord`, `.facebook`, `.x`, `.line`, `.microsoft`

## Token Storage

Tokens are stored in the iOS/macOS Keychain using `kSecClassGenericPassword`, encrypted at rest.

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../LICENSE)
