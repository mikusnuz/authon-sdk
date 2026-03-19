# Authon Node/Express Example

Full-feature server-side auth flow using `@authon/node` + Express + EJS templates.

## Stack

- Express 5
- EJS (server-side rendering)
- TypeScript
- `@authon/node` — backend SDK (token verification, user management, webhooks)
- `@authon/js` — client-side OAuth + modal (loaded dynamically)
- cookie-parser — httpOnly cookie sessions

## Features

- Email/password sign-in and sign-up
- Social OAuth (10 providers) via `@authon/js` client-side
- httpOnly cookie-based sessions
- Protected routes middleware (`requireAuth`)
- Profile view and edit (`PATCH /v1/auth/me`)
- Two-factor authentication (TOTP setup, verify, disable)
- Active session list and revocation
- Account deletion (server-side via `authon.users.delete`)
- Password reset flow
- Webhook signature verification (`authon.webhooks.verify`)

## Getting Started

```bash
cp .env.example .env
# Edit .env with your keys

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `AUTHON_SECRET_KEY` | Secret key (`sk_test_...`) for server-side SDK |
| `AUTHON_PUBLISHABLE_KEY` | Publishable key (`pk_test_...`) for client-side |
| `AUTHON_API_URL` | API base URL (default: `https://api.authon.dev`) |
| `AUTHON_WEBHOOK_SECRET` | Webhook signing secret |
| `PORT` | Server port (default: 3000) |

## Auth Flow

1. User submits email/password form
2. Browser POSTs to Authon API (`/v1/auth/signin`)
3. On success, `POST /auth/set-token` sets an httpOnly cookie
4. Express `requireAuth` middleware verifies the cookie token via `authon.verifyToken()`
5. Social OAuth: `@authon/js` handles the popup/redirect, then calls `/auth/set-token`

## Project Structure

```
src/
  server.ts            Express app, route mounting
  middleware/auth.ts   requireAuth middleware
  routes/
    auth.ts            /sign-in, /sign-up, /sign-out, /auth/set-token
    profile.ts         /profile (protected)
    mfa.ts             /mfa (protected)
    sessions.ts        /sessions (protected)
    delete-account.ts  /delete-account (protected)
    webhook.ts         /webhook
  views/
    partials/          head.ejs, nav.ejs, foot.ejs
    home.ejs
    sign-in.ejs
    sign-up.ejs
    profile.ejs
    mfa.ejs
    sessions.ejs
    delete-account.ejs
    reset-password.ejs
```
