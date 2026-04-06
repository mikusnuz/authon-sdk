# Authon (Swift)

> Native iOS/macOS client SDK — self-hosted Clerk alternative with SwiftUI login UI

[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%2016%2B%20%7C%20macOS%2013%2B-lightgrey)]()

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...` or `pk_test_...`) — safe to use in client-side code
   - **Secret Key** (`sk_live_...` or `sk_test_...`) — server-side only, never expose to clients

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Install

### Swift Package Manager

```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/mikusnuz/authon-sdk.git", from: "0.3.0")
]
```

Or in Xcode: **File > Add Package Dependencies** > `https://github.com/mikusnuz/authon-sdk.git`

### Info.plist — Register URL Scheme

Required for OAuth callback:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>authon</string>
        </array>
    </dict>
</array>
```

## Quick Start

```swift
import SwiftUI
import Authon

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            AuthonProvider(publishableKey: "pk_live_...") {
                ContentView()
            }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var authon: Authon

    var body: some View {
        SignedOut {
            SignInView { user in
                print("Signed in: \(user.email ?? "")")
            }
        }
        SignedIn {
            VStack {
                UserButton()
                Text("Welcome, \(authon.user?.displayName ?? "")")

                // Get token for your backend
                if let token = authon.getToken() {
                    // Send to your API
                }
            }
        }
    }
}
```

## Authentication Methods

### Email / Password

```swift
let user = try await authon.signIn(email: "user@example.com", password: "secret")
```

### OAuth (Social Login)

```swift
let user = try await authon.signInWithOAuth(.google)
// Opens ASWebAuthenticationSession → system browser
```

### Native Apple Sign In (macOS / iOS)

On macOS and iOS, calling `signInWithOAuth(.apple)` automatically uses `ASAuthorizationAppleIDProvider` instead of a browser window. No code changes are required — the SDK detects the platform and picks the right flow.

```swift
let user = try await authon.signInWithOAuth(.apple)
// macOS/iOS: native Apple Sign In sheet → POST /v1/auth/oauth/native
// Other platforms: ASWebAuthenticationSession → /v1/auth/oauth/redirect
```

#### Required setup

1. **Enable the entitlement** in Xcode → your target → Signing & Capabilities → add **Sign In with Apple**.

2. **Set your Development Team** (required for the entitlement to be valid during development).

3. **Configure `bundleId` in the Authon dashboard** so the API accepts tokens issued to your app's Bundle ID alongside the web Services ID:
   - Go to **Authon Dashboard → Project Settings → OAuth → Apple → Extra Config**
   - Add `bundleId` matching your app's Bundle ID:

   ```json
   {
     "bundleId": "app.example.MyApp"
   }
   ```

   Without this setting, the API only accepts tokens issued to the web Services ID (audience). Adding `bundleId` enables both web and native Apple Sign In from the same project.

> **Note:** The `authon://` URL scheme in `Info.plist` is still needed for other OAuth providers (Google, GitHub, etc.) but is not required for native Apple Sign In.

### MFA (TOTP)

```swift
do {
    let user = try await authon.signIn(email: email, password: password)
} catch let error as AuthonMfaRequiredError {
    // Show TOTP code input, then:
    let user = try await authon.verifyMfa(mfaToken: error.mfaToken, code: "123456")
}
```

### Passwordless

```swift
try await authon.sendEmailOtp(email: "user@example.com")
let user = try await authon.verifyPasswordless(email: "user@example.com", code: "123456")
```

### Web3 Wallet

```swift
let nonce = try await authon.getWeb3Nonce(address: addr, chain: .evm, walletType: .metamask)
let user = try await authon.verifyWeb3Signature(
    message: nonce.message, signature: sig, address: addr, chain: .evm, walletType: .metamask
)
```

## SwiftUI Components

| Component | Description |
|-----------|-------------|
| `AuthonProvider` | Wraps app, injects Authon into environment |
| `SignInView` | Email/password + passwordless + social login form |
| `SignUpView` | Registration form with social buttons |
| `UserButton` | Avatar dropdown with sign out |
| `SocialButton` | Single OAuth provider button |
| `SocialButtons` | All enabled provider buttons |
| `SignedIn { }` | Renders content only when signed in |
| `SignedOut { }` | Renders content only when signed out |

## Full API

### Auth
| Method | Description |
|--------|-------------|
| `signIn(email:password:)` | Email/password sign in |
| `signUp(email:password:displayName:)` | Register new user |
| `signInWithOAuth(_:)` | OAuth sign in — native Apple sheet on macOS/iOS, ASWebAuthenticationSession elsewhere |
| `signOut()` | Sign out, clear Keychain |
| `getUser()` | Refresh user from server |
| `getToken()` | Get cached access token |

### MFA
| Method | Description |
|--------|-------------|
| `setupMfa()` | Get TOTP secret + QR code URI |
| `verifyMfaSetup(code:)` | Confirm TOTP setup |
| `verifyMfa(mfaToken:code:)` | Complete MFA sign in |
| `disableMfa(code:)` | Disable MFA |
| `getMfaStatus()` | Check MFA enabled status |
| `regenerateBackupCodes(code:)` | New backup codes |

### Passwordless
| Method | Description |
|--------|-------------|
| `sendMagicLink(email:)` | Send magic link email |
| `sendEmailOtp(email:)` | Send email OTP |
| `sendSmsOtp(phone:)` | Send SMS OTP |
| `verifyPasswordless(token:email:code:)` | Verify code/token |

### Passkeys
| Method | Description |
|--------|-------------|
| `registerPasskey(name:)` | Register new passkey |
| `authenticateWithPasskey(email:)` | Sign in with passkey |
| `listPasskeys()` | List registered passkeys |
| `renamePasskey(id:name:)` | Rename a passkey |
| `deletePasskey(id:)` | Delete a passkey |

## Passkey Setup

Passkeys use the WebAuthn standard via `ASAuthorizationController`. Follow these steps to enable them in your app.

### Requirements

- iOS 16+ or macOS 13+
- Apple Developer account with an active development team
- A physical device (passkeys do not work in Simulator)
- Passkeys enabled in the Authon Dashboard under **Project Settings → Providers**

### 1. Add Associated Domains capability

In Xcode, open your target → **Signing & Capabilities** → click **+** → add **Associated Domains**.

Add the following entry:

```
webcredentials:api.authon.dev
```

This tells the OS to look for `https://api.authon.dev/.well-known/apple-app-site-association` to validate your app's right to use passkeys for that relying party.

### 2. Register your Bundle ID with Authon

The `apple-app-site-association` file on `api.authon.dev` must list your app's **Team ID + Bundle ID** (format: `TEAMID.com.example.MyApp`).

Contact [support@authon.dev](mailto:support@authon.dev) with:

- Your **Team ID** (visible in the Apple Developer portal)
- Your app's **Bundle ID**

We will add the entry to the AASA file. Until it is added, passkey registration and authentication will fail with an `ASAuthorization` error.

### 3. Enable Passkeys in the Dashboard

Go to **Authon Dashboard → your project → Providers** and toggle **Passkeys** on.

### 4. Register a passkey (authenticated user)

```swift
import Authon

// User must already be signed in
do {
    let credential = try await authon.registerPasskey(name: "My iPhone")
    print("Passkey registered: \(credential.id)")
} catch {
    print("Registration failed: \(error.localizedDescription)")
}
```

### 5. Sign in with a passkey

```swift
import Authon

do {
    let user = try await authon.authenticateWithPasskey(email: "user@example.com")
    print("Signed in: \(user.email ?? "")")
} catch {
    print("Authentication failed: \(error.localizedDescription)")
}
```

Passing `email` is optional — the system will present all available passkeys for the relying party if omitted.

### Debug builds and local testing

Apple enforces the AASA domain association at runtime, which means passkeys require a properly configured domain even during development.

For local testing against a custom server, pass `?mode=developer` to your API URL. This relaxes some checks on the server side but cannot bypass the OS-level domain association — you still need a real device with the Associated Domains entitlement and a reachable AASA endpoint.

```swift
AuthonProvider(publishableKey: "pk_test_...", apiURL: "https://your.dev.server?mode=developer") {
    ContentView()
}
```

### Web3
| Method | Description |
|--------|-------------|
| `getWeb3Nonce(address:chain:walletType:)` | Get signing nonce |
| `verifyWeb3Signature(...)` | Verify wallet signature |
| `linkWallet(...)` | Link wallet to account |
| `unlinkWallet(id:)` | Unlink wallet |
| `listWallets()` | List linked wallets |

### Organizations
| Method | Description |
|--------|-------------|
| `listOrganizations()` | List user's organizations |
| `createOrganization(_:)` | Create organization |
| `updateOrganization(id:params:)` | Update organization |
| `deleteOrganization(id:)` | Delete organization |
| `inviteToOrganization(orgId:email:role:)` | Invite member |
| `listOrganizationMembers(orgId:)` | List members |
| `updateMemberRole(orgId:memberId:role:)` | Change member role |
| `leaveOrganization(orgId:)` | Leave organization |

### Sessions & Profile
| Method | Description |
|--------|-------------|
| `updateProfile(_:)` | Update display name, avatar, etc. |
| `listSessions()` | List active sessions |
| `revokeSession(id:)` | Revoke a session |
| `revokeAllSessions()` | Revoke all sessions |

## Events

```swift
let cancel = authon.on(.signedIn) { user in
    print("User signed in: \(user?.email ?? "")")
}
// Later: cancel() to unsubscribe
```

Events: `.signedIn`, `.signedOut`, `.tokenRefreshed`, `.mfaRequired`, `.error`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| Publishable Key | Yes | `pk_live_...` or `pk_test_...` |
| API URL | No | Default: `https://api.authon.dev` |

## License

MIT
