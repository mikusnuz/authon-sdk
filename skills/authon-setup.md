---
name: authon-setup
description: Use when adding authentication to a Next.js, React, Vue, Nuxt, Svelte, Angular, React Native, or any supported frontend framework app with Authon. Also use when user says "add auth", "add login", "add authentication", "add sign in", "add sign up", "setup authon".
---

# Authon Setup Skill

Authon is a frontend authentication platform (Clerk alternative). This skill guides you through adding Authon auth to any supported framework.

## Framework Detection

Detect the project's framework by checking `package.json`, config files, or language markers:

| Signal | SDK Package |
|--------|-------------|
| `next.config.*` | `@authon/nextjs` |
| `vite.config.*` with `vue` in deps | `@authon/vue` |
| `nuxt.config.*` | `@authon/nuxt` |
| `svelte.config.*` | `@authon/svelte` |
| `angular.json` | `@authon/angular` |
| React (no Next.js) | `@authon/react` |
| `react-native` in deps | `@authon/react-native` |
| Vanilla JS / no framework | `@authon/js` |

## Environment Variables

All setups need these env vars. Create `.env` (or `.env.local` for Next.js):

```
# Client-side (publishable key — safe to expose)
NEXT_PUBLIC_AUTHON_KEY=pk_live_xxxxx        # Next.js
VITE_AUTHON_KEY=pk_live_xxxxx               # Vite-based (React/Vue/Svelte)
AUTHON_PUBLISHABLE_KEY=pk_live_xxxxx        # Other frameworks
```

---

## Next.js (App Router)

### 1. Install

```bash
npm install @authon/nextjs
```

### 2. Add Provider — `app/layout.tsx`

```tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
```

### 3. Add Middleware — `middleware.ts` (project root)

```ts
import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/about', '/pricing', '/sign-in', '/sign-up'],
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

The middleware reads the `authon-token` cookie or `Authorization: Bearer <token>` header. Unauthenticated users on protected routes are redirected to `signInUrl` with a `redirect_url` query param.

### 4. Sign In Page — `app/sign-in/page.tsx`

```tsx
'use client';

import { useAuthon } from '@authon/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const { openSignIn, isSignedIn } = useAuthon();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isSignedIn) {
      router.replace(searchParams.get('redirect_url') || '/dashboard');
    }
  }, [isSignedIn]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <button onClick={openSignIn}>Sign in</button>
    </div>
  );
}
```

### 5. Protected Page — `app/dashboard/page.tsx`

```tsx
'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@authon/nextjs';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <>
      <SignedIn>
        <UserButton />
        <h1>Welcome, {user?.displayName || user?.email}</h1>
      </SignedIn>
      <SignedOut>
        <p>Please sign in to continue.</p>
      </SignedOut>
    </>
  );
}
```

### 6. Server-Side User Access — `app/api/profile/route.ts`

```ts
import { currentUser } from '@authon/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

The `currentUser()` function reads the `authon-token` cookie via `next/headers` and verifies it with the Authon API.

You can also use `auth()` for more control:

```ts
import { auth } from '@authon/nextjs/server';

export async function GET() {
  const { userId, user, getToken } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });
  return Response.json({ userId, email: user?.email });
}
```

### 7. Verify

1. Run `npm run dev`
2. Visit a protected route (e.g. `/dashboard`) — should redirect to `/sign-in`
3. Click sign in — the Authon modal opens with your configured providers
4. After signing in, you're redirected back to the protected route
5. `UserButton` component shows user avatar and sign-out option

---

## React (Vite / CRA)

### 1. Install

```bash
npm install @authon/react
```

### 2. Add Provider — `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthonProvider } from '@authon/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthonProvider publishableKey={import.meta.env.VITE_AUTHON_KEY}>
      <App />
    </AuthonProvider>
  </React.StrictMode>,
);
```

### 3. Sign In — `src/App.tsx`

```tsx
import { SignedIn, SignedOut, UserButton, useAuthon, useUser } from '@authon/react';

export default function App() {
  return (
    <>
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}

function Dashboard() {
  const { user } = useUser();
  return <h1>Welcome, {user?.displayName || user?.email}</h1>;
}

function LandingPage() {
  const { openSignIn } = useAuthon();
  return <button onClick={openSignIn}>Sign in</button>;
}
```

### 4. Route Protection (with React Router)

```tsx
import { useAuthon } from '@authon/react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { isSignedIn, isLoading } = useAuthon();
  if (isLoading) return <div>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" />;
  return <Outlet />;
}
```

Or use the built-in `<Protect>` component:

```tsx
import { Protect } from '@authon/react';

function AdminPanel() {
  return (
    <Protect
      condition={(user) => user.publicMetadata?.role === 'admin'}
      fallback={<p>Access denied</p>}
    >
      <h1>Admin Panel</h1>
    </Protect>
  );
}
```

### 5. Get Token for API Calls

```tsx
const { getToken } = useAuthon();

async function fetchData() {
  const res = await fetch('/api/data', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}
```

### 6. Verify

1. Run `npm run dev`
2. `<SignedOut>` content is visible
3. Click sign in — modal opens
4. After sign in, `<SignedIn>` content replaces it
5. UserButton shows avatar and sign-out

---

## Vue 3

### 1. Install

```bash
npm install @authon/vue
```

### 2. Install Plugin — `src/main.ts`

```ts
import { createApp } from 'vue';
import { createAuthon } from '@authon/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createAuthon({
  publishableKey: import.meta.env.VITE_AUTHON_KEY,
}));

app.mount('#app');
```

### 3. Use in Components — `src/App.vue`

```vue
<script setup lang="ts">
import { useAuthon, useUser } from '@authon/vue';
import { AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue';

const { openSignIn, signOut } = useAuthon();
const { user, isLoading } = useUser();
</script>

<template>
  <div v-if="isLoading">Loading...</div>

  <AuthonSignedIn>
    <AuthonUserButton />
    <h1>Welcome, {{ user?.displayName || user?.email }}</h1>
    <button @click="signOut">Sign out</button>
  </AuthonSignedIn>

  <AuthonSignedOut>
    <button @click="openSignIn">Sign in</button>
  </AuthonSignedOut>
</template>
```

### 4. Route Guard (Vue Router)

```ts
import { useAuthon } from '@authon/vue';

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const { isSignedIn } = useAuthon();
    if (!isSignedIn) return { name: 'sign-in', query: { redirect: to.fullPath } };
  }
});
```

### 5. Verify

1. Run `npm run dev`
2. Click sign in — Authon modal opens
3. After signing in, user info is displayed

---

## Nuxt 3

### 1. Install

```bash
npm install @authon/nuxt
```

### 2. Create Plugin — `plugins/authon.client.ts`

```ts
import { createAuthonPlugin } from '@authon/nuxt';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authon = createAuthonPlugin(config.public.authonKey as string, {
    theme: 'auto',
  });
  return { provide: { authon } };
});
```

### 3. Runtime Config — `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      authonKey: process.env.AUTHON_PUBLISHABLE_KEY || '',
    },
  },
});
```

### 4. Auth Middleware — `middleware/auth.ts`

```ts
import { createAuthMiddleware } from '@authon/nuxt';

export default defineNuxtRouteMiddleware((to, from) => {
  const { $authon } = useNuxtApp();
  return createAuthMiddleware($authon as any, '/sign-in')(to, from);
});
```

### 5. Use in Pages — `pages/index.vue`

```vue
<script setup lang="ts">
const { $authon } = useNuxtApp();

async function signIn() {
  await $authon.client.openSignIn();
}

async function signOut() {
  await $authon.client.signOut();
}
</script>

<template>
  <div v-if="$authon.isSignedIn">
    <h1>Welcome, {{ $authon.user?.displayName }}</h1>
    <button @click="signOut">Sign out</button>
  </div>
  <div v-else>
    <button @click="signIn">Sign in</button>
  </div>
</template>
```

### 6. Protect a Page

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
</script>

<template>
  <h1>Dashboard (protected)</h1>
</template>
```

### 7. Verify

1. Run `npx nuxi dev`
2. Visit a protected page — redirects to `/sign-in`
3. Sign in, then access the protected page

---

## Svelte / SvelteKit

### 1. Install

```bash
npm install @authon/svelte
```

### 2. Initialize in Layout — `src/routes/+layout.svelte`

```svelte
<script>
  import { initAuthon } from '@authon/svelte';
  import { PUBLIC_AUTHON_KEY } from '$env/static/public';

  const authon = initAuthon(PUBLIC_AUTHON_KEY);
</script>

<slot />
```

### 3. Use in Components — `src/routes/+page.svelte`

```svelte
<script>
  import { getAuthon } from '@authon/svelte';

  const { user, isSignedIn, openSignIn, signOut, getToken } = getAuthon();
</script>

{#if $isSignedIn}
  <h1>Welcome, {$user?.displayName || $user?.email}</h1>
  <button on:click={signOut}>Sign out</button>
{:else}
  <button on:click={openSignIn}>Sign in</button>
{/if}
```

Note: `user` and `isSignedIn` are Svelte stores — use `$` prefix to access values.

### 4. Route Protection — `src/routes/dashboard/+page.ts`

```ts
import { getAuthon } from '@authon/svelte';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export function load() {
  const { isSignedIn } = getAuthon();
  if (!get(isSignedIn)) {
    throw redirect(302, '/sign-in');
  }
}
```

### 5. Verify

1. Run `npm run dev`
2. Click sign in — modal opens
3. After signing in, user info is displayed

---

## Angular

### 1. Install

```bash
npm install @authon/angular
```

### 2. Configure Providers — `src/app/app.config.ts`

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuthon } from '@authon/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    ...provideAuthon({ publishableKey: 'pk_live_xxxxx' }),
  ],
};
```

### 3. Create Injectable Wrapper — `src/app/authon.service.ts`

```ts
import { Injectable, Inject } from '@angular/core';
import { AuthonService as BaseAuthonService } from '@authon/angular';

@Injectable({ providedIn: 'root' })
export class AuthonService extends BaseAuthonService {
  constructor() {
    super({ publishableKey: 'pk_live_xxxxx' });
  }
}
```

### 4. Use in Components — `src/app/app.component.ts`

```ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { AuthonService } from './authon.service';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="authon.isSignedIn; else signedOut">
      <h1>Welcome, {{ authon.user?.displayName || authon.user?.email }}</h1>
      <button (click)="signOut()">Sign out</button>
    </div>
    <ng-template #signedOut>
      <button (click)="openSignIn()">Sign in</button>
    </ng-template>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe?: () => void;

  constructor(public authon: AuthonService) {}

  ngOnInit() {
    this.unsubscribe = this.authon.onStateChange(() => {
      // Trigger change detection when auth state changes
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
    this.authon.destroy();
  }

  openSignIn() {
    this.authon.openSignIn();
  }

  signOut() {
    this.authon.signOut();
  }
}
```

### 5. Route Guard — `src/app/app.routes.ts`

```ts
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from '@authon/angular';
import { AuthonService } from './authon.service';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [() => {
      const authon = inject(AuthonService);
      return authGuard(authon, '/sign-in');
    }],
  },
];
```

### 6. Verify

1. Run `ng serve`
2. Navigate to `/dashboard` — redirects to `/sign-in`
3. Click sign in — modal opens
4. After signing in, navigate to `/dashboard`

---

## Vanilla JavaScript

### 1. Install

```bash
npm install @authon/js
```

### 2. Initialize

```ts
import { Authon } from '@authon/js';

const authon = new Authon('pk_live_xxxxx', {
  apiUrl: 'https://api.authon.dev',  // optional, defaults to this
  theme: 'auto',                      // 'light' | 'dark' | 'auto'
  mode: 'popup',                      // 'popup' | 'embedded'
});
```

### 3. Sign In/Up with Modal

```ts
// Opens the built-in ShadowDOM modal with all configured providers
await authon.openSignIn();
await authon.openSignUp();
```

### 4. Programmatic Auth

```ts
// Email sign in (throws AuthonMfaRequiredError if MFA is enabled)
const user = await authon.signInWithEmail('user@example.com', 'password');

// Email sign up
const newUser = await authon.signUpWithEmail('user@example.com', 'password', {
  displayName: 'John',
});

// OAuth sign in
await authon.signInWithOAuth('google');
await authon.signInWithOAuth('github', { flowMode: 'redirect' });

// Sign out
await authon.signOut();
```

### 5. Events

```ts
authon.on('signedIn', (user) => console.log('Signed in:', user.email));
authon.on('signedOut', () => console.log('Signed out'));
authon.on('mfaRequired', (mfaToken) => { /* show MFA input */ });
authon.on('error', (err) => console.error(err));
authon.on('tokenRefreshed', (token) => { /* new token */ });
authon.on('passkeyRegistered', (credential) => { /* passkey added */ });
authon.on('web3Connected', (wallet) => { /* wallet linked */ });
```

### 6. Session

```ts
const user = authon.getUser();   // AuthonUser | null
const token = authon.getToken(); // string | null (access token)
```

### 7. Verify

1. Call `authon.openSignIn()` — modal appears
2. Sign in with any configured provider
3. `authon.getUser()` returns the user object

---

## React Native

### 1. Install

```bash
npm install @authon/react-native
```

### 2. Add Provider — `App.tsx`

```tsx
import { AuthonProvider } from '@authon/react-native';

export default function App() {
  return (
    <AuthonProvider publishableKey="pk_live_xxxxx">
      <Navigation />
    </AuthonProvider>
  );
}
```

### 3. Use Hooks

```tsx
import { useAuthon, useUser } from '@authon/react-native';

function HomeScreen() {
  const { openSignIn, signOut, isSignedIn } = useAuthon();
  const { user } = useUser();

  if (!isSignedIn) {
    return <Button title="Sign in" onPress={openSignIn} />;
  }

  return (
    <View>
      <Text>Welcome, {user?.displayName}</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
```

### 4. OAuth Social Buttons

```tsx
import { SocialButtons } from '@authon/react-native';

function SignInScreen() {
  return <SocialButtons onSuccess={(user) => console.log('Signed in', user)} />;
}
```

### 5. Verify

1. Run `npx expo start` or `npx react-native run-ios`
2. Tap sign in
3. OAuth opens in-app browser
4. After sign in, user data is available

---

## Additional Features (All Client SDKs)

### MFA (TOTP)

```ts
// Setup (returns QR code SVG)
const { qrCodeSvg, secret, backupCodes } = await authon.setupMfa();

// Verify setup with code from authenticator app
await authon.verifyMfaSetup('123456');

// When sign-in requires MFA, catch the error
try {
  await authon.signInWithEmail(email, password);
} catch (err) {
  if (err instanceof AuthonMfaRequiredError) {
    const user = await authon.verifyMfa(err.mfaToken, userCode);
  }
}

// Check MFA status
const status = await authon.getMfaStatus(); // { enabled: boolean, backupCodesRemaining: number }

// Disable MFA
await authon.disableMfa('123456');
```

### Passwordless (Magic Link / Email OTP)

```ts
// Send magic link
await authon.sendMagicLink('user@example.com');

// Send email OTP
await authon.sendEmailOtp('user@example.com');

// Verify (magic link token or OTP code)
const user = await authon.verifyPasswordless({ token: 'magic-link-token' });
const user = await authon.verifyPasswordless({ email: 'user@example.com', code: '123456' });
```

### Passkeys (WebAuthn)

```ts
// Register a passkey (user must be signed in)
const credential = await authon.registerPasskey('My laptop');

// Authenticate with passkey
const user = await authon.authenticateWithPasskey();

// List / rename / revoke
const passkeys = await authon.listPasskeys();
await authon.renamePasskey(passkeyId, 'New name');
await authon.revokePasskey(passkeyId);
```

### Web3 Wallet Auth

```ts
// 1. Get nonce for signing
const { message, nonce } = await authon.web3GetNonce(address, 'evm', 'metamask');

// 2. Sign with wallet (e.g., MetaMask)
const signature = await provider.request({ method: 'personal_sign', params: [message, address] });

// 3. Verify and sign in
const user = await authon.web3Verify(message, signature, address, 'evm', 'metamask');

// Link additional wallet (must be signed in)
const wallet = await authon.linkWallet({ address, chain: 'evm', walletType: 'metamask', message, signature });

// List / unlink wallets
const wallets = await authon.listWallets();
await authon.unlinkWallet(walletId);
```

### Session Management

```ts
const sessions = await authon.listSessions();
await authon.revokeSession(sessionId);
```

### User Profile Update

```ts
const updatedUser = await authon.updateProfile({
  displayName: 'New Name',
  avatarUrl: 'https://...',
  phone: '+1234567890',
  publicMetadata: { role: 'admin' },
});
```

### Organizations

```ts
// List
const { data: orgs } = await authon.organizations.list();

// Create
const org = await authon.organizations.create({ name: 'My Org', slug: 'my-org' });

// Get / Update / Delete
const org = await authon.organizations.get(orgId);
await authon.organizations.update(orgId, { name: 'New Name' });
await authon.organizations.delete(orgId);

// Members
const members = await authon.organizations.getMembers(orgId);
await authon.organizations.updateMemberRole(orgId, memberId, 'admin');
await authon.organizations.removeMember(orgId, memberId);

// Invitations
await authon.organizations.invite(orgId, { email: 'new@member.com', role: 'member' });
const invitations = await authon.organizations.getInvitations(orgId);
await authon.organizations.acceptInvitation(inviteToken);
await authon.organizations.leave(orgId);
```
