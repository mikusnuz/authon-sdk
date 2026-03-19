# Authon Flask Example

Flask + Jinja2 example demonstrating a full server-side auth flow with the Authon Python SDK.

## Features

- Email/password sign-in and sign-up (client-side via `@authon/js`)
- Social OAuth (10 providers: Google, GitHub, Discord, Facebook, Apple, Kakao, Naver, X, LINE, Microsoft)
- httpOnly cookie-based sessions
- Protected route decorator (`require_auth`)
- Profile view and edit
- Two-factor authentication (TOTP setup, verify, disable)
- Session list and revocation
- Account deletion
- Password reset flow
- Webhook signature verification (HMAC-SHA256)

## Quick Start

```bash
cp .env.example .env
# Fill in your Authon keys

pip install -r requirements.txt
python app.py
```

Open http://localhost:5000

## Docker

```bash
docker build -t authon-flask-example .
docker run -p 5000:5000 --env-file .env authon-flask-example
```

## Auth Flow

1. User submits credentials on the client side (fetch → Authon API directly)
2. On success, the client POSTs the token to `/auth/set-token`
3. Flask sets an httpOnly cookie (`authon_token`)
4. Subsequent requests are authenticated via the `require_auth` decorator, which calls `backend.verify_token()`

## Project Structure

```
app.py               # Single-file Flask app with all routes
templates/
  base.html          # Dark-theme layout with nav
  home.html
  sign_in.html
  sign_up.html
  profile.html
  mfa.html
  sessions.html
  delete_account.html
  reset_password.html
```
