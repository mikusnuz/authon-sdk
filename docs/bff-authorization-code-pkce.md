# BFF authentication with Authorization Code + PKCE

Use this flow when your application owns an HttpOnly server session. The browser receives a short-lived one-time code; Authon access and refresh tokens are returned only to your server.

## Requirements

- `@authon/js` and `@authon/nextjs` 0.8.0 or later
- an Authon publishable key in the browser
- the matching Authon secret key on the server only
- an exact callback URL registered for the project's `live` or `test` mode
- `AUTHON_TRANSACTION_SECRET` with at least 32 random characters

Live callbacks must use HTTPS. Test keys may additionally use HTTP loopback URLs such as `http://localhost:3000`. Wildcards, prefixes, fragments, and partial matches are not accepted.

## Browser start

```ts
import { Authon } from '@authon/js';

const authon = new Authon(process.env.NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY!, {
  sessionMode: 'bff',
});

const authorization = await fetch('/api/auth/authon/start', { method: 'POST' })
  .then((response) => response.json());

await authon.openSignIn(authorization);
```

`sessionMode: 'bff'` is required. In this mode Authon does not read or write browser token storage, create a JavaScript-readable token cookie, start token refresh, or emit a token-based `signedIn` event.

## Next.js server helper

Create the transaction in a Route Handler or Server Action, then pass only `authorization` to the client:

```ts
import { createAuthonAuthorizationRequest } from '@authon/nextjs/server';

const { authorization } = await createAuthonAuthorizationRequest({
  redirectUri: process.env.AUTHON_REDIRECT_URI!,
});

// Render a client component that calls authon.openSignIn(authorization).
```

Handle the callback entirely on the server:

```ts
import { handleAuthonAuthorizationCallback } from '@authon/nextjs/server';

const tokens = await handleAuthonAuthorizationCallback({
  code: request.nextUrl.searchParams.get('code')!,
  state: request.nextUrl.searchParams.get('state')!,
  redirectUri: process.env.AUTHON_REDIRECT_URI!,
  secretKey: process.env.AUTHON_SECRET_KEY!,
});

// Store tokens in your server-side session store. Never serialize them into HTML or JSON.
```

The helper stores the verifier, state, callback and timestamp in an encrypted `HttpOnly`, `SameSite=Lax` transaction cookie and deletes it before exchanging the code.

In the Authon dashboard, open the project and add callbacks under **Settings > Redirect URIs**. The live/test selection must match the publishable and secret key pair used by the flow.

## Typeblast NestJS integration

Callback contract to register for Typeblast:

- live: `https://typebla.st/api/v1/web-session/authon/callback`
- test: `http://localhost:3000/api/v1/web-session/authon/callback`
- test automation: `http://127.0.0.1:3000/api/v1/web-session/authon/callback`

The Typeblast NestJS API owns the verifier and state. Its callback exchanges the code and immediately creates the existing Typeblast HttpOnly session:

```ts
const response = await fetch(`${authonApiUrl}/v1/auth/token/exchange`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.AUTHON_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  cache: 'no-store',
  body: JSON.stringify({
    grantType: 'authorization_code',
    code,
    codeVerifier: transaction.codeVerifier,
    redirectUri: 'https://typebla.st/api/v1/web-session/authon/callback',
  }),
});

const { accessToken, refreshToken, expiresIn, sessionId, user } = await response.json();
await webSessionService.persist({ accessToken, refreshToken, expiresIn, sessionId, user });
```

## HTTP API

### Prepare authorization

```http
POST /v1/auth/authorize
x-api-key: pk_live_...
Content-Type: application/json
```

```json
{
  "responseType": "code",
  "redirectUri": "https://typebla.st/api/v1/web-session/authon/callback",
  "codeChallenge": "BASE64URL_SHA256_VERIFIER",
  "codeChallengeMethod": "S256",
  "state": "APPLICATION_CSRF_STATE"
}
```

```json
{ "authorizationRequestId": "OPAQUE_REQUEST", "expiresIn": 600 }
```

Pass `authorizationRequestId` through the selected login endpoint. Authon binds it to email verification, MFA, social OAuth, passwordless, passkey, or Web3 state. Successful code-mode authentication returns or redirects with only:

```json
{ "authorizationCode": "ONE_TIME_CODE", "state": "APPLICATION_CSRF_STATE", "expiresIn": 60 }
```

Redirect callbacks use `code`, `state`, and `expires_in` query parameters.

### Exchange

```http
POST /v1/auth/token/exchange
Authorization: Bearer sk_live_...
Content-Type: application/json
```

```json
{
  "grantType": "authorization_code",
  "code": "ONE_TIME_CODE",
  "codeVerifier": "ORIGINAL_PKCE_VERIFIER",
  "redirectUri": "https://typebla.st/api/v1/web-session/authon/callback"
}
```

```json
{
  "accessToken": "SERVER_ONLY_ACCESS_TOKEN",
  "refreshToken": "SERVER_ONLY_REFRESH_TOKEN",
  "expiresIn": 900,
  "sessionId": "AUTHON_SESSION_ID",
  "user": { "id": "user-id", "email": "person@example.com" }
}
```

Responses include `Cache-Control: no-store` and `Pragma: no-cache`. Do not automatically retry an exchange after an ambiguous network failure; restart authorization instead.

### Logout and revoke

Delete the application's local session first. Then revoke the Authon provider session as a best-effort server call:

```ts
import { revokeAuthonSession } from '@authon/nextjs/server';

await revokeAuthonSession({
  secretKey: process.env.AUTHON_SECRET_KEY!,
  sessionId: storedAuthonSessionId,
});
```

This calls `POST /v1/auth/sessions/:sessionId/revoke`. An Authon outage must not prevent deletion of the application's own session cookie.

## Environment variables

```dotenv
NEXT_PUBLIC_AUTHON_PUBLISHABLE_KEY=pk_live_...
AUTHON_SECRET_KEY=sk_live_...
AUTHON_TRANSACTION_SECRET=generate-at-least-32-random-characters
AUTHON_REDIRECT_URI=https://example.com/api/auth/callback
AUTHON_API_URL=https://api.authon.dev
```

Never expose `AUTHON_SECRET_KEY` or `AUTHON_TRANSACTION_SECRET` through a `NEXT_PUBLIC_` variable.

## Authon operator migration

Deploy the API migration before starting the new application image:

```text
1788110000000-AddAuthorizationCodeFlow
```

It adds project callback URLs, hashed authorization requests/codes, durable external OAuth transactions, and authorization context columns for email verification, passwordless, passkey, and Web3 flows. Production must run with `DB_SYNC=false`; use the checked-in TypeORM migration command instead.

## Existing SPA token mode

The existing browser token flow remains the default for backward compatibility. It uses browser storage and is intended for SPAs that do not have a BFF. New server-session applications should opt into code mode.
