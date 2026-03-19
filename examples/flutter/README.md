# Authon Flutter Example

A complete Flutter application demonstrating the full authentication flow using the [Authon](https://authon.dev) Dart SDK.

## Prerequisites

- Flutter SDK >= 3.0.0
- Dart SDK >= 3.0.0
- An [Authon](https://authon.dev) account with a publishable key

## Installation

```bash
flutter pub get
```

## Configuration

Set your Authon publishable key using the `--dart-define` flag:

```bash
flutter run --dart-define=AUTHON_PUBLISHABLE_KEY=pk_live_your_key_here
```

Or for development, edit `lib/main.dart` and replace the `defaultValue`:

```dart
publishableKey: const String.fromEnvironment(
  'AUTHON_PUBLISHABLE_KEY',
  defaultValue: 'pk_test_your_publishable_key_here', // replace this
),
```

## Running

```bash
# iOS
flutter run -d ios

# Android
flutter run -d android

# macOS (desktop)
flutter run -d macos
```

## Features

| Feature | Screen | API Call |
|---------|--------|----------|
| Email sign-in | `SignInScreen` | `authon.signInWithEmail(email, password)` |
| Email sign-up | `SignUpScreen` | `authon.signUpWithEmail(email, password)` |
| Password reset | `ResetPasswordScreen` | `authon.sendPasswordResetEmail(email)` |
| MFA setup | `MfaScreen` | `authon.setupMfa()` |
| MFA verify (login) | `MfaVerifyScreen` | `authon.verifyMfa(mfaToken, code)` |
| Disable MFA | `MfaScreen` | `authon.disableMfa(code)` |
| Regenerate backup codes | `MfaScreen` | `authon.regenerateBackupCodes(code)` |
| Profile update | `ProfileScreen` | `authon.updateProfile({...})` |
| List sessions | `SessionsScreen` | `authon.listSessions()` |
| Revoke session | `SessionsScreen` | `authon.revokeSession(id)` |
| Sign out | `HomeScreen` | `authon.signOut()` |
| Delete account | `DeleteAccountScreen` | `authon.deleteAccount()` |
| Social OAuth (10 providers) | `SocialButtons` | `authon.launchOAuthProvider(provider)` |

### OAuth Providers

Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X (Twitter), LINE, Microsoft

## Project Structure

```
lib/
├── main.dart                    # App entry, theme, routing, AuthonServiceProvider
├── services/
│   └── authon_service.dart      # Authon API client (wraps HTTP + secure storage)
├── screens/
│   ├── home_screen.dart         # Landing page, signed-in/out states
│   ├── sign_in_screen.dart      # Email sign-in + MFA trigger
│   ├── sign_up_screen.dart      # Email sign-up
│   ├── profile_screen.dart      # View and edit profile
│   ├── reset_password_screen.dart # Password reset via email link
│   ├── mfa_screen.dart          # MFA setup, disable, backup codes
│   ├── sessions_screen.dart     # List and revoke active sessions
│   └── delete_account_screen.dart # Account deletion with confirmation
└── widgets/
    ├── social_buttons.dart      # OAuth provider buttons (full + compact)
    └── auth_guard.dart          # Route guard for authenticated screens
```

## Architecture

### AuthonService

`AuthonService` in `lib/services/authon_service.dart` handles all authentication logic:

- **Token storage** — access and refresh tokens persisted via `flutter_secure_storage`
- **Auto-refresh** — transparently retries requests with a refreshed token on 401
- **OAuth** — opens provider URL in the external browser via `url_launcher`
- **State** — exposes `currentUser` and `isSignedIn` for UI consumption

### State Management

State is kept intentionally simple to serve as a reference implementation:

- `AuthonServiceProvider` — an `InheritedWidget` that propagates the `AuthonService` instance down the widget tree
- `StatefulWidget` per screen — local state with `setState`

For production apps, replace with your preferred state management solution (Riverpod, Bloc, etc.) while keeping `AuthonService` as the data layer.

### AuthGuard

`AuthGuard` wraps any `Widget` and redirects unauthenticated users to `/sign-in`:

```dart
routes: {
  '/profile': (context) => const AuthGuard(child: ProfileScreen()),
},
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `authon` | `path: ../../dart` | Authon Dart SDK |
| `http` | `^1.2.0` | HTTP client |
| `flutter_secure_storage` | `^9.0.0` | Encrypted token storage |
| `url_launcher` | `^6.2.0` | OAuth browser redirect |

## Deep Link Setup (OAuth Callback)

To handle OAuth callbacks from the browser, configure a deep link scheme for your app.

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="authon-flutter-example" android:host="oauth" />
</intent-filter>
```

### iOS (`ios/Runner/Info.plist`)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>authon-flutter-example</string>
    </array>
  </dict>
</array>
```

Configure the redirect URI in your Authon dashboard to match:
`authon-flutter-example://oauth`
