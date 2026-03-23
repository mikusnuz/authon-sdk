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
| `signInWithOAuth(_:)` | OAuth via ASWebAuthenticationSession |
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
