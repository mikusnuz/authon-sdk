---
name: authon-debugging
description: Use when login works locally but fails in production, when OAuth callback fails, when sessions expire unexpectedly, when CORS errors appear with Authon, when redirect URI is invalid, when the sign-in modal does not render, when token refresh fails, when middleware blocks all routes, when webhook verification fails, or any Authon auth issue. Also use when user says "auth not working", "login broken", "callback error", "CORS error with auth", "session expired", "token invalid", "modal not showing", "redirect loop", "401 error", "webhook failed".
---

# Authon Debugging Skill

Diagnose and fix common Authon authentication issues. All solutions are based on the actual Authon SDK source code.

## Diagnostic Steps (Run These First)

Before diving into specific issues, gather information:

### 1. Check Environment Variables

```bash
# Verify key is set (don't print the actual value)
echo "AUTHON_KEY set: $([ -n "$NEXT_PUBLIC_AUTHON_KEY" ] && echo YES || echo NO)"
```

In code, verify the key format:
- Publishable keys start with `pk_live_` or `pk_test_`

### 2. Verify API URL is Reachable

```bash
curl -s https://api.authon.dev/health
```

### 3. Check Browser Console

Open DevTools > Console tab. Look for:
- `useAuthon must be used within an <AuthonProvider>` — missing provider
- `useAuthon() must be called inside a component tree with createAuthon() installed` — Vue missing plugin
- `getAuthon() must be called within a component tree where initAuthon() was called` — Svelte missing init
- `API /v1/auth/branding: 401` — invalid publishable key
- `API /v1/auth/branding: 403` — key doesn't match project or domain not whitelisted
- `Failed to fetch` — API URL unreachable or CORS issue

### 4. Check Network Tab

Open DevTools > Network tab. Filter by `authon` or your API domain. Look for:
- Red requests (4xx/5xx status)
- CORS preflight failures (OPTIONS request failing)
- Missing `authon-token` cookie on requests

### 5. Verify OAuth Redirect URIs

In the Authon dashboard, check that your OAuth redirect URIs include:
- `https://api.authon.dev/v1/auth/oauth/redirect`
- For each OAuth provider (Google, GitHub, etc.), the redirect URI in the provider's developer console must match

---

## Issue 1: OAuth Callback Fails (Invalid redirect_uri)

### Symptoms
- OAuth popup opens but shows "invalid redirect_uri" or "redirect_uri_mismatch"
- User clicks OAuth provider button, gets redirected to an error page
- Console shows `API /v1/auth/oauth/{provider}/url` error

### Root Cause
The OAuth redirect URI configured in the provider's developer console (Google, GitHub, etc.) doesn't match what Authon sends. Authon uses `{apiUrl}/v1/auth/oauth/redirect` as the redirect URI.

### Fix

1. **Check what redirect URI Authon uses**: The SDK constructs it as `${this.config.apiUrl}/v1/auth/oauth/redirect`. Default API URL is `https://api.authon.dev`.

2. **In each OAuth provider's console** (Google Cloud Console, GitHub Developer Settings, etc.), add:
   ```
   https://api.authon.dev/v1/auth/oauth/redirect
   ```

3. **Check for trailing slashes**: `https://api.authon.dev/` vs `https://api.authon.dev` — some providers are strict about this.

---

## Issue 2: CORS Errors

### Symptoms
- Console shows `Access to fetch has been blocked by CORS policy`
- Network tab shows failed OPTIONS preflight requests to the Authon API
- Auth works on localhost but fails in production

### Root Cause
The Authon API server's CORS configuration doesn't include your domain. The SDK sends requests with `credentials: 'include'` (for cookie support), which requires explicit CORS whitelisting.

### Fix

1. **Authon Dashboard**: Add your domain under Project Settings > Domains.

2. **Common mistake — wrong protocol**: `http://localhost:3000` and `https://localhost:3000` are different origins. Make sure the exact origin is whitelisted.

3. **Common mistake — port mismatch**: `https://myapp.com` and `https://myapp.com:443` may be treated differently. Whitelist without the port for standard ports.

5. **Verify all request headers**: The SDK sends:
   - `x-api-key` (publishable key)
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>` (for authenticated requests)

   All of these must be allowed in the server's `Access-Control-Allow-Headers`.

---

## Issue 3: Session Expires Immediately / Token Invalid After Refresh

### Symptoms
- User signs in successfully but is immediately signed out
- `getUser()` returns `null` right after sign in
- Token refresh fails silently
- `authon-token` cookie is missing

### Root Cause
The `SessionManager` stores tokens in memory (not localStorage). If the page reloads, the session is lost unless the `authon-token` cookie is properly set by the server.

The token refresh mechanism runs 60 seconds before expiry (`Math.max((expiresIn - 60) * 1000, 30000)`). If the access token TTL is very short (< 60s), the refresh will fire immediately at 30s.

### Fix

1. **Check access token TTL**: Default is 900 seconds (15 minutes). If you've set it very low in the Authon dashboard, increase it.

2. **Check refresh token TTL**: Default is 604800 seconds (7 days). If expired, the user must sign in again.

3. **Cookie issues**: The middleware checks `request.cookies.get('authon-token')`. Ensure:
   - The Authon API sets this cookie correctly
   - The cookie domain matches your app domain
   - `SameSite` and `Secure` flags are correct for your environment
   - On localhost, `SameSite=Lax` is required (not `None`)

4. **Multi-tab issue**: The `SessionManager` is per-instance. Each tab creates a new `Authon` instance. Token refresh in one tab doesn't propagate to others. This is by design — each tab maintains its own session.

5. **Check for `maxSessions`**: Default is 5. If the user exceeds this, older sessions are automatically revoked.

6. **singleSession mode**: If `singleSession: true` is configured, signing in on a new device/tab will revoke all other sessions.

---

## Issue 4: ShadowDOM Modal Not Rendering

### Symptoms
- `openSignIn()` is called but nothing appears on screen
- No errors in console
- The modal HTML exists in DOM but is invisible

### Root Cause
The Authon modal renders inside a ShadowDOM element for CSS isolation. This can fail if:
- CSP (Content Security Policy) blocks inline styles
- The page has `overflow: hidden` on body/html
- The z-index is lower than other elements
- The modal container element is missing

### Fix

1. **Check CSP**: The ShadowDOM modal uses inline styles. Your CSP must allow `style-src 'unsafe-inline'` or you need to add the Authon style nonce.

2. **Check z-index**: The modal should have a very high z-index. If other elements (like a header) have `z-index: 999999`, they may cover the modal. Check with DevTools.

3. **Check for body overflow**: If `body { overflow: hidden }` is set permanently (not just when modal is open), the modal may render but be invisible.

4. **Embedded mode**: If using `mode: 'embedded'` with a `containerId`, the container element must exist in the DOM:
   ```ts
   const authon = new Authon('pk_live_...', {
     mode: 'embedded',
     containerId: 'authon-container',  // This element MUST exist
   });
   ```

5. **SSR / Server Component**: `openSignIn()` must be called on the client side. In Next.js, ensure the component is marked `'use client'`.

6. **Check initialization**: The modal requires branding and providers data from the API. If `ensureInitialized()` fails (network error, invalid key), the modal won't render. Check for `error` events:
   ```ts
   authon.on('error', (err) => console.error('Authon error:', err));
   ```

---

## Issue 5: Middleware Blocks All Routes (Next.js)

### Symptoms
- Every page redirects to `/sign-in`
- Even the sign-in page redirects to itself (infinite loop)
- Static assets fail to load
- API routes return redirects instead of data

### Root Cause
The `authonMiddleware` matcher is too broad, or `publicRoutes` doesn't include enough routes.

### Fix

1. **Check the matcher**: It should exclude static files and Next.js internals:
   ```ts
   export const config = {
     matcher: ['/((?!_next|.*\\..*).*)'],
   };
   ```
   This regex excludes `/_next/*` and any path with a file extension.

2. **Check publicRoutes**: The sign-in URL itself must be in `publicRoutes`:
   ```ts
   export default authonMiddleware({
     publicRoutes: ['/', '/sign-in', '/sign-up', '/about', '/pricing'],
     signInUrl: '/sign-in',  // This must also be in publicRoutes
   });
   ```

3. **Wildcard routes**: Use `*` suffix for path prefixes:
   ```ts
   publicRoutes: ['/', '/sign-in', '/api/*', '/public/*'],
   ```

4. **The middleware already skips**: `/_next/*`, `/api/*`, and `/favicon.ico` by default (hardcoded in the source). But if you need other API routes protected, note that `/api/*` is public by default.

5. **Check for redirect loop**: If `signInUrl` is not in `publicRoutes` or the default skip list, the middleware will redirect the sign-in page to itself. The source code always includes `signInUrl` in the skip list, but verify your config.

---

## Issue 6: Token Refresh Fails

### Symptoms
- User gets signed out after the access token expires (default 15 min)
- Console shows errors on `/v1/auth/token/refresh`
- `tokenRefreshed` event never fires

### Root Cause
The `SessionManager.refresh()` method POSTs to `/v1/auth/token/refresh` with the refresh token. Failure causes `clearSession()` — the user is signed out.

### Fix

1. **Check refresh token validity**: Refresh tokens expire after 7 days by default. If the user hasn't visited in > 7 days, they need to re-authenticate.

2. **Check network**: The refresh request uses `credentials: 'include'`. If cookies are blocked (e.g., third-party cookie restrictions in Safari), refresh may fail.

3. **Single session mode**: If `singleSession: true`, signing in elsewhere invalidates the refresh token.

4. **Token rotation**: Each refresh invalidates the previous refresh token. If two tabs try to refresh simultaneously, one will fail. The losing tab's session is cleared.

5. **Monitor refresh**: Listen for the event:
   ```ts
   authon.on('tokenRefreshed', (newToken) => {
     console.log('Token refreshed successfully');
   });
   authon.on('signedOut', () => {
     console.log('Session ended — possibly refresh failed');
   });
   ```

---

## Issue 7: OAuth Popup Blocked / Redirect Loop on Mobile

### Symptoms
- Clicking OAuth button does nothing on mobile
- Browser blocks the popup window
- OAuth starts but never completes
- User sees "Popup was blocked by the browser"

### Root Cause
Mobile browsers and some desktop browsers block popups. The SDK has a multi-layered fallback system:

1. Popup (fast path for desktop)
2. If popup blocked and `flowMode: 'auto'`, falls back to redirect flow
3. localStorage cross-tab communication (mobile fallback)
4. API polling every 1.5 seconds (universal fallback)
5. `visibilitychange` event handler for when the tab regains focus

### Fix

1. **Use `flowMode: 'auto'` (default)**: This automatically falls back to redirect if popup fails:
   ```ts
   await authon.signInWithOAuth('google'); // flowMode defaults to 'auto'
   ```

2. **Force redirect mode for mobile**:
   ```ts
   await authon.signInWithOAuth('google', { flowMode: 'redirect' });
   ```

3. **Configure flow mode server-side**: In the Authon dashboard, set each provider's OAuth flow to `redirect` for guaranteed mobile compatibility.

4. **Popup timing**: The popup must be opened in direct response to a user gesture (click). If `openSignIn()` is called after an async operation, the popup will be blocked. The SDK handles this internally, but custom flows should ensure synchronous popup opening.

5. **Redirect flow handling**: After redirect-based OAuth, the SDK reads `authon_oauth_state` and `authon_oauth_error` URL params on page load (in `consumeRedirectResultFromUrl`). Make sure your app doesn't strip these params before the SDK initializes.

6. **Max timeout**: The OAuth flow times out after 3 minutes (180 seconds). If the user takes longer, the flow silently ends. The popup close detection polls every 500ms.

---

## Issue 8: Webhook Verification Fails

### Symptoms
- Webhook endpoint returns 500 or "Invalid webhook signature"
- Events from Authon are not processed

### Root Cause
The webhook verification uses HMAC-SHA256. Common issues:
- Wrong secret
- Body was parsed/modified before verification
- Timestamp header missing

### Fix

1. **Use raw body**: The signature is computed over the raw request body. If Express/body-parser parses it first, the verification fails:

   ```ts
   // Express: get raw body BEFORE json parsing
   app.post('/webhooks/authon',
     express.raw({ type: 'application/json' }),
     (req, res) => {
       const event = authon.webhooks.verify(
         req.body,                                    // Buffer (raw)
         req.headers['x-authon-signature'] as string, // Format: "v1=<hex>"
         req.headers['x-authon-timestamp'] as string, // ISO 8601
         process.env.AUTHON_WEBHOOK_SECRET!,
       );
       // process event
       res.status(200).json({ received: true });
     }
   );
   ```

2. **Signature format**: The `x-authon-signature` header format is `v1=<hex>`. The verification code strips the `v1=` prefix. Make sure you're passing the full header value.

3. **Signed payload**: The HMAC is computed over `${timestamp}.${body}` (timestamp + dot + raw body). Both the `x-authon-timestamp` header and the raw body must be included.

4. **Timing-safe comparison**: The SDK uses timing-safe comparison (`timingSafeEqual`). Do not implement your own string comparison.

---

## Issue 9: MFA Verification Flow Broken

### Symptoms
- `signInWithEmail` succeeds but user can't proceed (MFA enabled)
- MFA code verification always fails
- `mfaRequired` event not firing

### Root Cause
When MFA is enabled, `signInWithEmail` throws `AuthonMfaRequiredError` instead of returning a user. The error contains a `mfaToken` needed for the second step.

### Fix

1. **Catch the MFA error properly**:
   ```ts
   import { AuthonMfaRequiredError } from '@authon/js';

   try {
     await authon.signInWithEmail(email, password);
   } catch (err) {
     if (err instanceof AuthonMfaRequiredError) {
       // Show MFA input UI
       const mfaToken = err.mfaToken;
       // Later, when user enters the code:
       const user = await authon.verifyMfa(mfaToken, code);
     } else {
       // Handle other errors
     }
   }
   ```

2. **Listen for the event** (alternative approach):
   ```ts
   authon.on('mfaRequired', (mfaToken) => {
     // Show MFA input, use mfaToken when verifying
   });
   ```

3. **MFA token expiry**: The `mfaToken` has a limited lifetime (typically 5 minutes). If the user takes too long, they need to re-enter their password.

4. **Wrong code**: If the TOTP code is wrong, `verifyMfa` throws. The user can retry with a new code using the same `mfaToken`.

5. **Backup codes**: Backup codes work as TOTP codes in `verifyMfa`. Each backup code can only be used once.

---

## Issue 10: `useAuthon` / `useUser` Returns null

### Symptoms
- `useAuthon()` throws "must be used within `<AuthonProvider>`"
- `user` is always `null` even after sign in
- `isLoading` stays `true` forever

### Root Cause per Framework

**React / Next.js**:
- `<AuthonProvider>` not wrapping the component tree
- The provider is in a Server Component (must be a Client Component)
- Multiple `AuthonProvider` instances (each creates its own `Authon` client)

**Vue**:
- `createAuthon()` plugin not installed via `app.use()`
- Composable called outside `setup()` lifecycle

**Svelte**:
- `initAuthon()` not called in root layout
- `getAuthon()` called in a module context instead of component context

**Angular**:
- `provideAuthon()` not in app providers
- Service not injected properly

### Fix

1. **React/Next.js**: Ensure the provider wraps everything and is a client component:
   ```tsx
   // app/layout.tsx
   import { AuthonProvider } from '@authon/nextjs';

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html>
         <body>
           <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
             {children}
           </AuthonProvider>
         </body>
       </html>
     );
   }
   ```

2. **isLoading stuck**: The SDK sets `isLoading = false` after checking for an existing session. If the API is unreachable, the `error` event fires and `isLoading` is set to `false`. But if the fetch hangs indefinitely (no timeout), `isLoading` stays `true`. Check network connectivity.

3. **user null after sign in**: The `signedIn` event updates the state. If you're reading `user` synchronously right after calling `signInWithEmail`, the state may not have updated yet. Use the returned user from the promise:
   ```ts
   const user = await authon.signInWithEmail(email, password);
   // user is available here immediately
   ```

---

## Issue 11: Next.js Server Components Can't Access Auth

### Symptoms
- `currentUser()` always returns `null` in Server Components
- Server-side API routes can't verify tokens

### Root Cause
`currentUser()` reads the `authon-token` cookie via `next/headers` and verifies it with the Authon API.

### Fix

1. **Cookie not set**: The `authon-token` cookie must be set by the client-side auth flow. Check that:
   - The sign-in flow completes successfully on the client
   - The Authon API's response includes `Set-Cookie` headers
   - The cookie domain/path matches your app

4. **Dynamic rendering**: `currentUser()` uses `cookies()` which opts into dynamic rendering. Make sure the page isn't statically generated.

---

## Issue 12: Build Errors with Angular / Nuxt

### Symptoms
- Angular build fails with decorator errors
- Nuxt build fails with module macro errors

### Root Cause
The `@authon/angular` and `@authon/nuxt` packages are compiled with tsup, which can't process Angular decorators or Nuxt module macros (`defineNuxtModule`, etc.). They export plain classes/functions instead.

### Fix

**Angular**: Create your own `@Injectable()` wrapper:
```ts
import { Injectable } from '@angular/core';
import { AuthonService as BaseAuthonService } from '@authon/angular';

@Injectable({ providedIn: 'root' })
export class AuthonService extends BaseAuthonService {
  constructor() {
    super({ publishableKey: 'pk_live_xxxxx' });
  }
}
```

**Nuxt**: Use as a plugin, not a Nuxt module:
```ts
// plugins/authon.client.ts
import { createAuthonPlugin } from '@authon/nuxt';

export default defineNuxtPlugin(() => {
  const authon = createAuthonPlugin('pk_live_xxxxx');
  return { provide: { authon } };
});
```

---

## Issue 13: Branding / Appearance Not Applied

### Symptoms
- Modal shows default styling, ignoring dashboard branding
- Custom colors/logo not appearing

### Root Cause
Branding is fetched from `/v1/auth/branding` during `ensureInitialized()`. Client-side `appearance` config merges on top of server branding.

### Fix

1. **Check API response**: Open `{apiUrl}/v1/auth/branding` with your publishable key header to see what branding the server returns.

2. **Override locally**: The `appearance` option in the SDK config overrides server branding:
   ```ts
   const authon = new Authon('pk_live_...', {
     appearance: {
       primaryColorStart: '#7c3aed',
       primaryColorEnd: '#4f46e5',
       borderRadius: 12,
       brandName: 'My App',
     },
   });
   ```

3. **Theme mismatch**: `theme: 'auto'` follows the system preference. `theme: 'dark'` forces dark mode. The branding config has separate `lightBg`/`lightText` and `darkBg`/`darkText` values.

---

## Quick Reference: Error Messages

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `useAuthon must be used within an <AuthonProvider>` | Component not wrapped in provider | Add `<AuthonProvider>` to root layout |
| `Must be signed in to X` | Calling authenticated method while signed out | Check `isSignedIn` before calling |
| `API /v1/auth/branding: 401` | Invalid publishable key | Check `NEXT_PUBLIC_AUTHON_KEY` |
| `API /v1/auth/signin: 401` | Wrong email or password | Verify credentials |
| `MFA verification required` | User has MFA enabled | Handle `AuthonMfaRequiredError` |
| `Invalid webhook signature` | Wrong secret or body modified | Use raw body, check secret |
| `Popup was blocked by the browser` | Browser blocked OAuth popup | Use `flowMode: 'redirect'` |
| `Authon API error 403` | Domain not whitelisted or key mismatch | Check dashboard domain settings |
| `Authon API error 429` | Rate limited | Reduce request frequency |
| `Missing authorization header` | No Bearer token in request | Pass token in Authorization header |
