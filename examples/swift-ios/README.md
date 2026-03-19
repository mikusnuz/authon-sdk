# Authon Swift iOS Example

A SwiftUI iOS application demonstrating the full authentication flow using the [Authon](https://authon.dev) platform.

## Prerequisites

- Xcode 15 or later
- iOS 15+ deployment target
- An [Authon](https://authon.dev) account with a project created

## Features

- Email/password sign-up and sign-in
- OAuth social login (10 providers) via `ASWebAuthenticationSession`
- TOTP-based two-factor authentication (setup, verify, disable)
- Session management (list and revoke active sessions)
- Profile editing
- Password reset via email link or token
- Account deletion with confirmation gate
- Secure token storage using iOS Keychain
- Dark theme throughout

## Project Structure

```
AuthonExample/
├── AuthonExampleApp.swift       # @main entry point, injects AuthonService
├── ContentView.swift            # Auth-gated root — TabView vs NavigationStack(SignIn)
├── Services/
│   └── AuthonService.swift      # URLSession-based API client + Keychain helpers
├── Models/
│   └── AuthModels.swift         # AppUser, AppSession, MfaStatus, OAuthProvider, etc.
├── Views/
│   ├── HomeView.swift           # Dashboard shown after sign-in
│   ├── SignInView.swift         # Email/password sign-in form + social buttons
│   ├── SignUpView.swift         # Registration form with password strength indicator
│   ├── ProfileView.swift        # Edit first name, last name, username
│   ├── ResetPasswordView.swift  # Request reset link + token-based password reset
│   ├── MfaView.swift            # TOTP enable/verify/disable + backup codes
│   ├── SessionsView.swift       # List and revoke active sessions
│   └── DeleteAccountView.swift  # Guarded account deletion
└── Components/
    ├── SocialButtonsView.swift  # 10 OAuth provider buttons grid
    └── AuthGuard.swift          # requiresAuth() view modifier + loading overlay
```

## Setup

### 1. Clone and open the project

```bash
cd authon-sdk/examples/swift-ios
open Package.swift
```

Or create an Xcode project manually and add the Swift package from `../../swift`.

### 2. Configure your Authon credentials

Open `AuthonExample/Services/AuthonService.swift` and replace the placeholder values:

```swift
private let baseURL   = "https://api.authon.dev"   // or your self-hosted URL
private let projectId = "YOUR_PROJECT_ID"           // from the Authon dashboard
```

### 3. Configure the OAuth callback scheme

If you use OAuth social login, register the URL scheme `authon-example` in your Xcode project:

1. Select the target in Xcode.
2. Go to **Info** > **URL Types**.
3. Add a new entry with **URL Scheme**: `authon-example`.

### 4. Build and run

Select an iOS 15+ simulator or device and press **Run** (`Cmd+R`).

## Authentication Flow

```
App launch
  └── AuthonService.init()
        └── loadStoredSession()  →  GET /v1/auth/me
              ├── token valid    →  ContentView shows TabView (authenticated)
              └── token invalid  →  Keychain cleared, ContentView shows SignInView

SignIn / SignUp
  └── POST /v1/auth/sign-in or /v1/auth/sign-up
        └── tokens saved to Keychain
              └── currentUser published → ContentView re-renders

OAuth
  └── ASWebAuthenticationSession opens provider URL
        └── callback URL contains access_token query param
              └── tokens saved, currentUser fetched

Sign Out
  └── POST /v1/auth/sign-out  →  Keychain cleared  →  currentUser = nil
```

## Keychain Storage

Tokens are stored under these keys using `kSecClassGenericPassword`:

| Key | Value |
|-----|-------|
| `authon.accessToken` | JWT access token |
| `authon.refreshToken` | Refresh token (if issued) |

## API Endpoints Used

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/auth/sign-up` | Create account |
| POST | `/v1/auth/sign-in` | Email/password login |
| POST | `/v1/auth/sign-out` | Invalidate session |
| GET | `/v1/auth/me` | Fetch current user |
| PATCH | `/v1/auth/me` | Update profile |
| DELETE | `/v1/auth/me` | Delete account |
| POST | `/v1/auth/password/reset-request` | Send reset email |
| POST | `/v1/auth/password/reset` | Apply reset token |
| GET | `/v1/auth/mfa/status` | MFA status |
| POST | `/v1/auth/mfa/totp/setup` | Begin TOTP setup |
| POST | `/v1/auth/mfa/totp/verify` | Verify TOTP code |
| DELETE | `/v1/auth/mfa/totp` | Disable TOTP |
| GET | `/v1/auth/sessions` | List sessions |
| DELETE | `/v1/auth/sessions/:id` | Revoke a session |
| GET | `/v1/auth/oauth/:provider` | OAuth redirect |

## Dependencies

- `Authon` Swift package (`../../swift`) — backend-side SDK (bundled for reference)
- `AuthenticationServices` — `ASWebAuthenticationSession` for OAuth
- `Security` — Keychain access

> The frontend mobile auth flow makes direct HTTP calls to the Authon API.
> The `Authon` Swift package is a server-side SDK intended for use in Swift server environments (e.g., Vapor, Hummingbird).
