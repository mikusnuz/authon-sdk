---
name: authon-migration
description: Use when migrating from Clerk, Auth.js (NextAuth), Auth0, Firebase Auth, Supabase Auth, or custom session-based auth to Authon. Also use when user mentions "replace clerk", "switch from auth0", "migrate auth", "replace nextauth", "move from firebase auth", "switch auth provider", "replace supabase auth".
---

# Authon Migration Skill

This skill migrates existing authentication systems to Authon. It covers detection, package replacement, code mapping, and user data migration.

## Detect Current Auth Provider

Scan `package.json`, imports, and config files for these patterns:

| Package / Pattern | Provider |
|-------------------|----------|
| `@clerk/nextjs`, `@clerk/react`, `@clerk/clerk-sdk-node` | Clerk |
| `next-auth`, `@auth/core`, `@auth/nextjs` | Auth.js (NextAuth) |
| `auth0`, `@auth0/nextjs-auth0`, `@auth0/auth0-react` | Auth0 |
| `firebase/auth`, `firebase-admin/auth` | Firebase Auth |
| `@supabase/auth-helpers-nextjs`, `@supabase/ssr`, `@supabase/supabase-js` | Supabase Auth |
| `express-session`, `passport`, `passport-local` | Custom Session/Passport |

---

## Migration: Clerk to Authon

Authon is designed as a drop-in Clerk alternative. The API surface is intentionally similar.

### Step 1: Replace Packages

```bash
# Remove Clerk
npm uninstall @clerk/nextjs @clerk/react @clerk/clerk-sdk-node @clerk/themes

# Install Authon
npm install @authon/nextjs  # For Next.js
# OR
npm install @authon/react   # For React SPA
```

### Step 2: Update Environment Variables

```diff
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
- CLERK_SECRET_KEY=sk_live_xxxxx
+ NEXT_PUBLIC_AUTHON_KEY=pk_live_xxxxx
+ AUTHON_SECRET_KEY=sk_live_xxxxx
```

### Step 3: Replace Provider

```diff
// app/layout.tsx
- import { ClerkProvider } from '@clerk/nextjs';
+ import { AuthonProvider } from '@authon/nextjs';

  export default function RootLayout({ children }) {
    return (
-     <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
+     <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
        {children}
-     </ClerkProvider>
+     </AuthonProvider>
    );
  }
```

### Step 4: Replace Components

| Clerk | Authon |
|-------|--------|
| `<ClerkProvider>` | `<AuthonProvider>` |
| `<SignIn />` | `<SignIn />` (same name) |
| `<SignUp />` | `<SignUp />` (same name) |
| `<UserButton />` | `<UserButton />` (same name) |
| `<UserProfile />` | `<UserProfile />` (same name) |
| `<SignedIn>` | `<SignedIn>` (same name) |
| `<SignedOut>` | `<SignedOut>` (same name) |
| `<Protect>` | `<Protect>` (same name) |
| `useAuth()` | `useAuthon()` |
| `useUser()` | `useUser()` (same name) |
| `useClerk()` | `useAuthon()` |
| `useOrganization()` | `useOrganization()` (same name) |
| `useOrganizationList()` | `useOrganizationList()` (same name) |

Import path change:

```diff
- import { useAuth, useUser, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
+ import { useAuthon, useUser, SignedIn, SignedOut, UserButton } from '@authon/nextjs';
```

### Step 5: Replace Hooks

```diff
- const { isSignedIn, userId, getToken } = useAuth();
+ const { isSignedIn, user, getToken } = useAuthon();
+ const userId = user?.id;
```

```diff
- const { user, isLoaded } = useUser();
+ const { user, isLoading } = useUser();
  // Note: Clerk uses `isLoaded` (done loading), Authon uses `isLoading` (still loading)
- if (!isLoaded) return null;
+ if (isLoading) return null;
```

### Step 6: Update Middleware

```diff
// middleware.ts
- import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
- const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)']);
- export default clerkMiddleware(async (auth, request) => {
-   if (!isPublicRoute(request)) await auth.protect();
- });
+ import { authonMiddleware } from '@authon/nextjs';
+ export default authonMiddleware({
+   publicRoutes: ['/', '/sign-in', '/sign-up', '/about'],
+   signInUrl: '/sign-in',
+ });

  export const config = {
    matcher: ['/((?!_next|.*\\..*).*)'],
  };
```

### Step 7: Update Server-Side Auth

```diff
// Server component or API route
- import { currentUser, auth } from '@clerk/nextjs/server';
+ import { currentUser, auth } from '@authon/nextjs/server';

  // currentUser() works the same way
  const user = await currentUser();

  // auth() returns similar structure
- const { userId } = await auth();
+ const { userId, user, getToken } = await auth();
```

### Step 8: Update Backend API (if using @clerk/clerk-sdk-node)

```diff
- import { clerkClient } from '@clerk/clerk-sdk-node';
+ import { AuthonBackend } from '@authon/node';
+ const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

  // Verify token
- const user = await clerkClient.users.getUser(userId);
+ const user = await authon.verifyToken(accessToken);

  // List users
- const users = await clerkClient.users.getUserList();
+ const { data: users } = await authon.users.list();

  // Update user
- await clerkClient.users.updateUser(userId, { firstName: 'John' });
+ await authon.users.update(userId, { displayName: 'John' });

  // Delete user
- await clerkClient.users.deleteUser(userId);
+ await authon.users.delete(userId);

  // Ban / Unban
+ await authon.users.ban(userId, 'reason');
+ await authon.users.unban(userId);
```

### Step 9: Migrate User Data

Use the Authon backend API to import existing users:

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

// For each Clerk user, create in Authon
for (const clerkUser of clerkUsers) {
  await authon.users.create({
    email: clerkUser.emailAddresses[0]?.emailAddress,
    displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    externalId: clerkUser.id,  // Keep Clerk ID as reference
    avatarUrl: clerkUser.imageUrl,
    emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
    publicMetadata: clerkUser.publicMetadata,
    privateMetadata: clerkUser.privateMetadata,
  });
}
```

### Step 10: Update Webhooks

```diff
// Clerk webhook
- import { Webhook } from 'svix';
- const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
- const evt = wh.verify(body, headers);

// Authon webhook
+ import { AuthonBackend } from '@authon/node';
+ const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);
+ const event = authon.webhooks.verify(
+   rawBody,
+   req.headers['x-authon-signature'],
+   req.headers['x-authon-timestamp'],
+   process.env.AUTHON_WEBHOOK_SECRET!,
+ );
```

Webhook event mapping:

| Clerk Event | Authon Event |
|-------------|--------------|
| `user.created` | `user.created` |
| `user.updated` | `user.updated` |
| `user.deleted` | `user.deleted` |
| `session.created` | `session.created` |
| `session.ended` | `session.ended` |
| `session.revoked` | `session.revoked` |

---

## Migration: Auth.js (NextAuth) to Authon

### Step 1: Replace Packages

```bash
npm uninstall next-auth @auth/core @auth/prisma-adapter
npm install @authon/nextjs
```

### Step 2: Update Environment Variables

```diff
- NEXTAUTH_SECRET=xxxxx
- NEXTAUTH_URL=http://localhost:3000
- GOOGLE_CLIENT_ID=xxxxx
- GOOGLE_CLIENT_SECRET=xxxxx
+ NEXT_PUBLIC_AUTHON_KEY=pk_live_xxxxx
+ AUTHON_SECRET_KEY=sk_live_xxxxx
```

Note: OAuth provider credentials (Google, GitHub, etc.) are now configured in the Authon dashboard, not in env vars.

### Step 3: Remove Auth.js API Route

Delete the Auth.js API route:
- `app/api/auth/[...nextauth]/route.ts`
- OR `pages/api/auth/[...nextauth].ts`

### Step 4: Replace Provider

```diff
// app/layout.tsx
- import { SessionProvider } from 'next-auth/react';
+ import { AuthonProvider } from '@authon/nextjs';

  export default function RootLayout({ children }) {
    return (
-     <SessionProvider>
+     <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
        {children}
-     </SessionProvider>
+     </AuthonProvider>
    );
  }
```

### Step 5: Replace Hooks and Session Access

```diff
- import { useSession, signIn, signOut } from 'next-auth/react';
+ import { useAuthon, useUser } from '@authon/nextjs';

  function Component() {
-   const { data: session, status } = useSession();
-   const isLoading = status === 'loading';
-   const user = session?.user;
+   const { isSignedIn, isLoading, openSignIn, signOut } = useAuthon();
+   const { user } = useUser();

-   if (status === 'unauthenticated') {
-     return <button onClick={() => signIn('google')}>Sign in</button>;
-   }
+   if (!isSignedIn && !isLoading) {
+     return <button onClick={openSignIn}>Sign in</button>;
+   }

    return <p>Welcome, {user?.displayName || user?.email}</p>;
  }
```

### Step 6: Add Middleware

Auth.js uses a callback-based approach. Authon uses declarative middleware:

```ts
// middleware.ts
import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/sign-in'],
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

### Step 7: Replace Server-Side Auth

```diff
// Server component
- import { getServerSession } from 'next-auth';
- import { authOptions } from '@/lib/auth';
- const session = await getServerSession(authOptions);
- const user = session?.user;
+ import { currentUser } from '@authon/nextjs/server';
+ const user = await currentUser();
```

### Step 8: Remove Database Adapter

Auth.js often uses Prisma/Drizzle adapters for session storage. Authon handles sessions server-side. Remove:
- `@auth/prisma-adapter`
- Session/Account/VerificationToken tables (if Auth.js created them)
- The adapter configuration in your auth config

### Step 9: Migrate Users

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

for (const nextAuthUser of existingUsers) {
  await authon.users.create({
    email: nextAuthUser.email,
    displayName: nextAuthUser.name,
    avatarUrl: nextAuthUser.image,
    emailVerified: !!nextAuthUser.emailVerified,
    externalId: nextAuthUser.id,
  });
}
```

---

## Migration: Auth0 to Authon

### Step 1: Replace Packages

```bash
# Next.js
npm uninstall @auth0/nextjs-auth0
npm install @authon/nextjs

# React SPA
npm uninstall @auth0/auth0-react
npm install @authon/react

# Node.js server
npm uninstall auth0 express-openid-connect
npm install @authon/node
```

### Step 2: Update Environment Variables

```diff
- AUTH0_SECRET=xxxxx
- AUTH0_BASE_URL=http://localhost:3000
- AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
- AUTH0_CLIENT_ID=xxxxx
- AUTH0_CLIENT_SECRET=xxxxx
+ NEXT_PUBLIC_AUTHON_KEY=pk_live_xxxxx
+ AUTHON_SECRET_KEY=sk_live_xxxxx
```

### Step 3: Replace Provider (Next.js)

```diff
- import { UserProvider } from '@auth0/nextjs-auth0/client';
+ import { AuthonProvider } from '@authon/nextjs';

  export default function RootLayout({ children }) {
    return (
-     <UserProvider>
+     <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
        {children}
-     </UserProvider>
+     </AuthonProvider>
    );
  }
```

### Step 4: Replace Provider (React SPA)

```diff
- import { Auth0Provider } from '@auth0/auth0-react';
+ import { AuthonProvider } from '@authon/react';

  function App() {
    return (
-     <Auth0Provider domain="your-tenant.auth0.com" clientId="xxxxx" redirectUri={window.location.origin}>
+     <AuthonProvider publishableKey="pk_live_xxxxx">
        <MyApp />
-     </Auth0Provider>
+     </AuthonProvider>
    );
  }
```

### Step 5: Replace Hooks

```diff
- import { useUser } from '@auth0/nextjs-auth0/client';
+ import { useUser, useAuthon } from '@authon/nextjs';

  function Component() {
-   const { user, error, isLoading } = useUser();
+   const { user, isLoading } = useUser();
+   const { signOut, openSignIn } = useAuthon();

-   // Auth0 sign in via redirect
-   <a href="/api/auth/login">Login</a>
+   // Authon sign in via modal
+   <button onClick={openSignIn}>Sign in</button>

-   // Auth0 sign out
-   <a href="/api/auth/logout">Logout</a>
+   // Authon sign out
+   <button onClick={signOut}>Sign out</button>
  }
```

### Step 6: Remove Auth0 API Routes

Delete:
- `app/api/auth/[auth0]/route.ts` (Next.js App Router)
- OR `pages/api/auth/[...auth0].ts` (Pages Router)

These are not needed with Authon.

### Step 7: Replace Server-Side Auth

```diff
- import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
+ import { currentUser } from '@authon/nextjs/server';

  export async function GET() {
-   const session = await getSession();
-   const user = session?.user;
+   const user = await currentUser();
    if (!user) return new Response('Unauthorized', { status: 401 });
    return Response.json({ user });
  }
```

### Step 8: Replace Node.js Server Auth

```diff
- const { auth } = require('express-openid-connect');
- app.use(auth({ ... }));
+ import { expressMiddleware } from '@authon/node';
+ app.use('/api', expressMiddleware({ secretKey: process.env.AUTHON_SECRET_KEY! }));
```

### Step 9: Migrate Users

Use the Auth0 Management API to export users, then import to Authon:

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

for (const auth0User of exportedUsers) {
  await authon.users.create({
    email: auth0User.email,
    displayName: auth0User.name || auth0User.nickname,
    avatarUrl: auth0User.picture,
    emailVerified: auth0User.email_verified,
    externalId: auth0User.user_id,
    publicMetadata: auth0User.user_metadata,
    privateMetadata: auth0User.app_metadata,
  });
}
```

---

## Migration: Firebase Auth to Authon

### Step 1: Replace Packages

```bash
npm uninstall firebase firebase-admin
npm install @authon/react  # or @authon/nextjs for Next.js
npm install @authon/node   # for server-side
```

### Step 2: Update Environment Variables

```diff
- NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
- FIREBASE_SERVICE_ACCOUNT=xxxxx
+ NEXT_PUBLIC_AUTHON_KEY=pk_live_xxxxx
+ AUTHON_SECRET_KEY=sk_live_xxxxx
```

### Step 3: Replace Client-Side Auth

```diff
- import { initializeApp } from 'firebase/app';
- import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
- const auth = getAuth(app);
+ import { useAuthon, useUser } from '@authon/react';

  function Component() {
-   const [user, setUser] = useState(null);
-   useEffect(() => onAuthStateChanged(auth, setUser), []);
+   const { isSignedIn, openSignIn, signOut } = useAuthon();
+   const { user } = useUser();

    // Sign in
-   await signInWithPopup(auth, new GoogleAuthProvider());
+   await openSignIn();  // Opens modal with all configured providers

    // Sign out
-   await signOut(auth);
+   await signOut();

    // Get token
-   const token = await auth.currentUser?.getIdToken();
+   const token = getToken();
  }
```

### Step 4: Replace Server-Side Verification

```diff
- import admin from 'firebase-admin';
- admin.initializeApp();
- const decodedToken = await admin.auth().verifyIdToken(idToken);
+ import { AuthonBackend } from '@authon/node';
+ const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);
+ const user = await authon.verifyToken(accessToken);
```

### Step 5: Migrate Users

Export Firebase users using the Admin SDK, then import:

```ts
import admin from 'firebase-admin';
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

const listResult = await admin.auth().listUsers();
for (const fbUser of listResult.users) {
  await authon.users.create({
    email: fbUser.email!,
    displayName: fbUser.displayName || undefined,
    avatarUrl: fbUser.photoURL || undefined,
    emailVerified: fbUser.emailVerified,
    phone: fbUser.phoneNumber || undefined,
    externalId: fbUser.uid,
  });
}
```

---

## Migration: Supabase Auth to Authon

### Step 1: Replace Packages

```bash
npm uninstall @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs
npm install @authon/nextjs  # or @authon/react
npm install @authon/node    # for server
```

### Step 2: Update Environment Variables

```diff
- NEXT_PUBLIC_SUPABASE_URL=xxxxx
- NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
- SUPABASE_SERVICE_ROLE_KEY=xxxxx
+ NEXT_PUBLIC_AUTHON_KEY=pk_live_xxxxx
+ AUTHON_SECRET_KEY=sk_live_xxxxx
```

### Step 3: Replace Client-Side Auth

```diff
- import { createClient } from '@supabase/supabase-js';
- const supabase = createClient(url, anonKey);
+ import { useAuthon, useUser } from '@authon/nextjs';

  function Component() {
+   const { openSignIn, signOut, isSignedIn, getToken } = useAuthon();
+   const { user } = useUser();

    // Sign in
-   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
+   await openSignIn();

    // OAuth
-   const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
+   await openSignIn();  // Modal shows all configured providers

    // Sign out
-   await supabase.auth.signOut();
+   await signOut();

    // Get session / user
-   const { data: { session } } = await supabase.auth.getSession();
-   const user = session?.user;
+   // user and isSignedIn are already reactive via hooks

    // Get token for API calls
-   const token = session?.access_token;
+   const token = getToken();
  }
```

### Step 4: Replace Server-Side Auth

```diff
// API route
- import { createServerClient } from '@supabase/ssr';
- const supabase = createServerClient(url, anonKey, { cookies });
- const { data: { user } } = await supabase.auth.getUser();
+ import { currentUser } from '@authon/nextjs/server';
+ const user = await currentUser();
```

### Step 5: Migrate Users

Export from Supabase `auth.users` table, then import:

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

for (const supaUser of supabaseUsers) {
  await authon.users.create({
    email: supaUser.email!,
    displayName: supaUser.raw_user_meta_data?.full_name,
    avatarUrl: supaUser.raw_user_meta_data?.avatar_url,
    emailVerified: !!supaUser.email_confirmed_at,
    phone: supaUser.phone || undefined,
    externalId: supaUser.id,
    publicMetadata: supaUser.raw_user_meta_data,
  });
}
```

---

## Migration: Custom Session/Passport to Authon

### Step 1: Replace Packages

```bash
npm uninstall express-session passport passport-local passport-google-oauth20 connect-mongo
npm install @authon/node    # Server
npm install @authon/react   # Client (if applicable)
```

### Step 2: Replace Express Session Middleware

```diff
- import session from 'express-session';
- import passport from 'passport';
- import { Strategy as LocalStrategy } from 'passport-local';
-
- app.use(session({ secret: 'xxx', resave: false, saveUninitialized: false }));
- app.use(passport.initialize());
- app.use(passport.session());
-
- passport.use(new LocalStrategy(async (username, password, done) => {
-   const user = await db.users.findByEmail(username);
-   if (!user || !bcrypt.compareSync(password, user.hash)) return done(null, false);
-   return done(null, user);
- }));
+ import { expressMiddleware } from '@authon/node';
+
+ // Protect API routes — verifies Bearer token
+ app.use('/api', expressMiddleware({
+   secretKey: process.env.AUTHON_SECRET_KEY!,
+ }));
```

### Step 3: Replace Login Endpoint

```diff
- app.post('/login', passport.authenticate('local'), (req, res) => {
-   res.json({ user: req.user });
- });
// Client-side: Users now sign in via Authon modal (openSignIn())
// The modal handles email/password, OAuth, MFA, etc.
// No server-side login endpoint needed
```

### Step 4: Replace Auth Check in Routes

```diff
- function ensureAuthenticated(req, res, next) {
-   if (req.isAuthenticated()) return next();
-   res.status(401).json({ error: 'Not authenticated' });
- }
- app.get('/api/profile', ensureAuthenticated, (req, res) => {
-   res.json({ user: req.user });
- });
+ // expressMiddleware already handles auth check
+ app.get('/api/profile', (req, res) => {
+   res.json({ user: req.auth });  // req.auth is AuthonUser
+ });
```

### Step 5: Migrate Users

```ts
import { AuthonBackend } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

for (const legacyUser of existingUsers) {
  await authon.users.create({
    email: legacyUser.email,
    displayName: legacyUser.name,
    externalId: legacyUser.id.toString(),
    emailVerified: legacyUser.verified,
    // Note: passwords cannot be migrated — users will need to reset
    // or use magic link / OAuth on first Authon sign-in
  });
}
```

---

## Post-Migration Checklist

1. **Environment variables**: All old auth env vars removed, Authon vars set
2. **Middleware**: Authon middleware protecting correct routes
3. **Provider wrap**: Root component wrapped in `<AuthonProvider>`
4. **Sign in flow**: Modal opens and authenticates correctly
5. **Server-side**: `currentUser()` / `auth()` / `verifyToken()` working
6. **Webhooks**: Updated to use Authon webhook format (`x-authon-signature`, `x-authon-timestamp`)
7. **User data**: All users migrated with `externalId` mapping
8. **OAuth providers**: Re-configured in Authon dashboard with same redirect URIs
9. **Old packages**: Fully removed from `package.json`
10. **Database**: Removed old session/account tables if using Auth.js adapters
