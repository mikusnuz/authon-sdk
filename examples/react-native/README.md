# Authon React Native Example

A complete Expo React Native app demonstrating the full authentication flow using `@authon/react-native`.

> No live demo — run locally with `expo start`.

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Android Emulator (or physical device)

## Installation

```bash
cd examples/react-native
npm install
```

## Configuration

Open `app/_layout.tsx` and replace `YOUR_PUBLISHABLE_KEY` with your Authon project's publishable key:

```tsx
<AuthonProvider publishableKey="pk_live_xxxxxxxxxxxxxxxx" storage={secureStorage}>
```

You can find your publishable key in the Authon dashboard under **Settings > API Keys**.

## Running

```bash
# Interactive menu — choose iOS/Android/Web
npm start

# iOS Simulator directly
npm run ios

# Android Emulator directly
npm run android
```

## Project Structure

```
examples/react-native/
├── app/
│   ├── _layout.tsx         # AuthonProvider + SecureStore + Stack navigator
│   ├── index.tsx            # Home screen (signed-in/out states)
│   ├── sign-in.tsx          # Email/password + OAuth sign-in + MFA step
│   ├── sign-up.tsx          # Email/password + OAuth registration
│   ├── profile.tsx          # View/edit profile, quick actions
│   ├── reset-password.tsx   # Send magic link via passwordless API
│   ├── mfa.tsx              # TOTP setup, enable/disable, backup codes
│   ├── sessions.tsx         # List active sessions, revoke sessions
│   └── delete-account.tsx   # Confirmed account deletion
├── components/
│   ├── ProtectedScreen.tsx  # Auth guard — redirects to /sign-in if unauthenticated
│   └── SocialButtons.tsx    # OAuth wrapper using expo-web-browser
├── app.json
├── package.json
└── tsconfig.json
```

## Features

| Feature | Screen | API Used |
|---------|--------|----------|
| Email/password sign-in | `sign-in.tsx` | `signIn({ strategy: 'email_password', email, password })` |
| Email/password sign-up | `sign-up.tsx` | `signUp({ email, password, displayName })` |
| Social OAuth (10 providers) | `sign-in.tsx`, `sign-up.tsx` | `startOAuth(provider)` + `completeOAuth(state)` |
| MFA setup (TOTP) | `mfa.tsx` | `/v1/auth/mfa/totp/setup`, `/v1/auth/mfa/totp/verify-setup` |
| MFA disable | `mfa.tsx` | `/v1/auth/mfa/disable` |
| Backup code regeneration | `mfa.tsx` | `/v1/auth/mfa/backup-codes/regenerate` |
| Profile update | `profile.tsx` | `PATCH /v1/auth/me` |
| Session listing | `sessions.tsx` | `GET /v1/auth/me/sessions` |
| Session revocation | `sessions.tsx` | `DELETE /v1/auth/me/sessions/:id` |
| Password reset | `reset-password.tsx` | `client.passwordlessSendCode(email, 'email')` |
| Account deletion | `delete-account.tsx` | `DELETE /v1/auth/me` |
| Secure token storage | `_layout.tsx` | `expo-secure-store` via `AuthonProvider.storage` |

## OAuth Flow (Mobile)

On mobile, OAuth is handled by opening a browser session with `expo-web-browser` and polling the Authon API for the result:

```tsx
const { url, state } = await startOAuth(provider);
const result = await WebBrowser.openAuthSessionAsync(url);
if (result.type !== 'success') throw new Error('OAuth cancelled');
await completeOAuth(state); // polls until resolved
```

## Secure Token Storage

Tokens are persisted using `expo-secure-store` and passed to `AuthonProvider` via the `storage` prop:

```tsx
const secureStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

<AuthonProvider publishableKey="..." storage={secureStorage}>
```

The provider automatically restores the session on app launch and refreshes tokens 60 seconds before expiry.

## Supported OAuth Providers

Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X (Twitter), LINE, Microsoft

The available providers are fetched dynamically from the API — only providers configured in your Authon dashboard will appear.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@authon/react-native` | Core auth hooks, provider, components |
| `expo-secure-store` | Encrypted token storage |
| `expo-web-browser` | OAuth browser session |
| `expo-router` | File-based navigation |
| `react-native-screens` | Native screen optimization |
| `react-native-safe-area-context` | Safe area insets |
