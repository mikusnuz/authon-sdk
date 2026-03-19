# Authon Go SDK Example

Full-feature authentication example using the [Authon Go SDK](../../go/) with `net/http` and `html/template`.

## Features

- Email/password sign-in and sign-up
- Social login (10 providers via `@authon/js` CDN)
- Cookie-based session management with `authMiddleware`
- Profile view and edit (`backend.Users.Update`)
- Two-Factor Authentication setup/disable (client-side via `@authon/js`)
- Session list and revoke (client-side via `@authon/js`)
- Password reset via magic link
- Account deletion with confirmation guard
- Webhook signature verification (`backend.Webhooks.Verify`)
- Protected routes redirect unauthenticated users to `/sign-in`

## Quick Start

```bash
cp .env.example .env
# Edit .env with your Authon keys

go run .
```

Open http://localhost:8080

## Environment Variables

| Variable | Description |
|---|---|
| `AUTHON_API_KEY` | Secret key (backend API calls) |
| `AUTHON_PUBLISHABLE_KEY` | Publishable key (client-side `@authon/js`) |
| `AUTHON_API_URL` | API base URL (default: `https://api.authon.dev`) |
| `AUTHON_WEBHOOK_SECRET` | Webhook signature secret |
| `PORT` | HTTP port (default: `8080`) |

## Docker

```bash
docker build -t authon-go-example .
docker run -p 8080:8080 \
  -e AUTHON_API_KEY=sk_test_... \
  -e AUTHON_PUBLISHABLE_KEY=pk_test_... \
  authon-go-example
```

## Architecture

```
main.go         HTTP server, routes, template FuncMap
middleware.go   Cookie-based auth middleware + context helpers
handlers.go     All route handlers + template rendering
templates/      html/template files with dark theme CSS
static/         authon.js CDN loader + client-side SDK bridge
```

## Auth Flow

1. User submits email/password form (JavaScript calls `@authon/js`)
2. On success, token is POSTed to `/oauth/callback`
3. Server verifies token with `backend.VerifyToken()` and sets `authon_token` cookie
4. Subsequent requests: middleware reads cookie, verifies token, attaches user to context
5. Sign-out clears the cookie
