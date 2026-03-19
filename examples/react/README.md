# Authon React Example

Complete authentication flow example using `@authon/react`.

**Live Demo:** https://examples.authon.dev/react/

## Features

- Email & password sign-in / sign-up
- Social login — 10 providers (Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft)
- Built-in components: `<SignIn />`, `<SignUp />`, `<UserButton />`, `<UserProfile />`
- Custom form approach with `client.signInWithEmail()` / `client.signUpWithEmail()`
- MFA (TOTP) setup with QR code, verify, disable, regenerate backup codes
- Session management — list & revoke sessions
- Profile editing — displayName, avatarUrl, phone
- Conditional rendering — `<SignedIn>`, `<SignedOut>`, `<Protect>`
- Password reset via magic link

## Setup

```bash
npm install
cp .env.example .env
# Fill in your project ID
```

Edit `.env`:

```env
VITE_AUTHON_PROJECT_ID=your-project-uuid
VITE_AUTHON_API_URL=https://api.authon.dev
```

## Run

```bash
npm run dev
# http://localhost:15586/react/
```

## Build

```bash
npm run build
```

## Code Structure

```
src/
  main.tsx          # AuthonProvider setup
  App.tsx           # Router
  index.css         # Dark theme styles
  components/
    Layout.tsx      # Nav with SignedIn/SignedOut/UserButton
    ProtectedRoute.tsx
  pages/
    Home.tsx        # Hero + feature grid
    SignInPage.tsx  # Toggle: built-in <SignIn /> vs custom form
    SignUpPage.tsx  # Toggle: built-in <SignUp /> vs custom form
    ProfilePage.tsx # UserProfile + custom edit form
    ResetPasswordPage.tsx
    MfaPage.tsx     # Full TOTP setup/disable/regen flow
    SessionsPage.tsx
    DeleteAccountPage.tsx
```

## Links

- [Authon Documentation](https://docs.authon.dev)
- [SDK on GitHub](https://github.com/mikusnuz/authon-sdk)
- [npm: @authon/react](https://www.npmjs.com/package/@authon/react)
