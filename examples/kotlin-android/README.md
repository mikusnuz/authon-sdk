# Authon Kotlin Android Example

Full-feature authentication example for Android using Kotlin + Jetpack Compose with the Authon API.

## Features

- Email/password sign-in and sign-up
- Social login (Google, GitHub, Apple) via Chrome Custom Tabs + OAuth deep link
- Token storage with EncryptedSharedPreferences (AES-256)
- Profile view and edit (first name, last name, username)
- Password change
- Two-Factor Authentication (TOTP) — enroll, verify, disable
- Active sessions list and per-session revocation
- Account deletion with confirmation guard
- Dark/light theme (Material 3, follows system setting)
- Auth-guarded navigation via Compose Navigation

## Prerequisites

| Tool | Version |
|---|---|
| Android Studio | Hedgehog (2023.1.1) or later |
| Android SDK | API 26+ (minSdk) / API 35 (compileSdk) |
| JDK | 17 |
| Kotlin | 2.0.21 |
| Gradle | 8.5+ |

## Setup

### 1. Clone and open

```bash
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk/examples/kotlin-android
```

Open the `kotlin-android/` folder in Android Studio.

### 2. Configure keys

Edit `gradle.properties` and replace the placeholder values:

```properties
AUTHON_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
AUTHON_API_URL=https://api.authon.dev
AUTHON_OAUTH_REDIRECT_SCHEME=authon-example
```

| Property | Description |
|---|---|
| `AUTHON_PUBLISHABLE_KEY` | Publishable key from the Authon dashboard |
| `AUTHON_API_URL` | API base URL (default: `https://api.authon.dev`) |
| `AUTHON_OAUTH_REDIRECT_SCHEME` | URI scheme for OAuth callbacks — must match your Authon app settings |

Keys are injected at build time via `BuildConfig` and never committed to source control.

### 3. Build and run

```
Android Studio -> Run -> app
```

Or from the command line:

```bash
./gradlew installDebug
```

## Architecture

```
app/src/main/java/dev/authon/example/
├── MainActivity.kt          Entry point; sets up theme, navigation, handles deep links
├── AuthonService.kt         HTTP client (OkHttp) wrapping the Authon REST API
├── navigation/
│   └── AppNavigation.kt     Compose NavHost; route definitions and auth guard
└── screens/
    ├── HomeScreen.kt         Dashboard — user card, navigation menu, sign-out
    ├── SignInScreen.kt       Email/password sign-in + OAuth provider buttons
    ├── SignUpScreen.kt       Registration form
    ├── ProfileScreen.kt      Edit profile + change password
    ├── MfaScreen.kt          TOTP enrollment (QR code, backup codes), disable
    ├── SessionsScreen.kt     List all sessions; revoke individual sessions
    └── DeleteAccountScreen.kt  Confirmation guard + permanent account deletion
```

## Auth Flow

```
User fills form
      |
      v
AuthonService.signIn() / signUp()
      |  POST /v1/auth/sign-in (or /sign-up)
      v
Authon API returns { accessToken, refreshToken }
      |
      v
TokenStorage saves tokens (EncryptedSharedPreferences)
      |
      v
AuthonService.currentUser()
      |  GET /v1/auth/me  [Authorization: Bearer <accessToken>]
      v
Navigate to HomeScreen
```

## OAuth / Social Login Flow

```
User taps provider button
      |
      v
authonService.launchOAuth(context, provider)
      |  opens Chrome Custom Tab
      |  https://api.authon.dev/v1/auth/oauth/<provider>?redirect_uri=authon-example://callback
      v
User authenticates in browser
      |
      v
Authon redirects to authon-example://callback?code=...
      |
      v
MainActivity.onNewIntent() receives the deep link
      |
      v
AppNavigation routes to oauth_callback destination
      |
      v
AuthonService.handleOAuthCallback(uri)
      |  POST /v1/auth/oauth/callback  { code, redirectUri }
      v
Tokens stored, navigate to HomeScreen
```

## Dependencies

| Library | Purpose |
|---|---|
| `androidx.compose.*` | UI framework (Material 3, Navigation) |
| `androidx.security:security-crypto` | EncryptedSharedPreferences for token storage |
| `androidx.browser:browser` | Chrome Custom Tabs for OAuth |
| `com.squareup.okhttp3:okhttp` | HTTP client |
| `com.google.code.gson:gson` | JSON serialization |
| `io.coil-kt:coil-compose` | Async image loading (avatar) |
| `org.jetbrains.kotlinx:kotlinx-coroutines-android` | Coroutines for async operations |

## Note on the Kotlin SDK

The `dev.authon:sdk` Kotlin library (`authon-sdk/kotlin/`) is a **server-side (JVM) SDK** designed for backend services: token verification and webhook signature validation. Android apps communicate with the Authon API directly over HTTP using `AuthonService.kt` — the server-side SDK is not used in this example.
