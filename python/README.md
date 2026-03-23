# authon

> Python server SDK for token verification, user management, and webhooks — self-hosted Clerk alternative, Auth0 alternative

[![PyPI version](https://img.shields.io/pypi/v/authon?color=6d28d9)](https://pypi.org/project/authon/)
[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)

## Prerequisites

Before installing the SDK, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...` or `pk_test_...`) — safe to use in client-side code
   - **Secret Key** (`sk_live_...` or `sk_test_...`) — server-side only, never expose to clients

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Install

```bash
pip install authon
```

## Quick Start

```python
# app.py — complete working example
from authon import AuthonBackend

authon = AuthonBackend("sk_live_YOUR_SECRET_KEY")

# Verify a token
user = authon.verify_token("eyJhbGci...")
print(user.id, user.email)

# List users
result = authon.users.list(page=1, limit=10)
for u in result.data:
    print(u.email)

# Create a user
new_user = authon.users.create(
    email="alice@example.com",
    password="securePassword",
    display_name="Alice",
)
```

## Common Tasks

### Verify a Token

```python
from authon import AuthonBackend

authon = AuthonBackend("sk_live_YOUR_SECRET_KEY")
user = authon.verify_token(access_token)
# user.id, user.email, user.display_name, user.avatar_url, ...
```

### Protect a FastAPI Route

```python
from fastapi import FastAPI, Depends, Header
from authon.middleware.fastapi import AuthonDependency
from authon.types import AuthonUser

app = FastAPI()
authon_dep = AuthonDependency("sk_live_YOUR_SECRET_KEY")

@app.get("/api/profile")
async def profile(
    authorization: str = Header(...),
    user: AuthonUser = Depends(authon_dep),
):
    return {"id": user.id, "email": user.email}
```

### Protect a Django View

```python
from django.http import JsonResponse
from authon import AuthonBackend
from authon.middleware.django import authon_login_required

authon = AuthonBackend("sk_live_YOUR_SECRET_KEY")

@authon_login_required(authon)
def profile(request):
    user = request.authon_user
    return JsonResponse({"id": user.id, "email": user.email})
```

### Protect a Flask Route

```python
from flask import Flask, g, jsonify
from authon import AuthonBackend
from authon.middleware.flask import flask_authon_required

app = Flask(__name__)
authon = AuthonBackend("sk_live_YOUR_SECRET_KEY")

@app.route("/api/profile")
@flask_authon_required(authon)
def profile():
    user = g.authon_user
    return jsonify({"id": user.id, "email": user.email})
```

### Manage Users

```python
authon = AuthonBackend("sk_live_...")

# Create
user = authon.users.create(email="user@example.com", password="pass123")

# Update
user = authon.users.update("usr_abc", display_name="New Name")

# Ban / Unban
authon.users.ban("usr_abc", reason="Spam")
authon.users.unban("usr_abc")

# Delete
authon.users.delete("usr_abc")
```

### Verify Webhooks

```python
from authon import verify_webhook

event = verify_webhook(
    payload=request_body,
    signature=request.headers["x-authon-signature"],
    secret="whsec_YOUR_WEBHOOK_SECRET",
)
print(event.type)  # "user.created"
```

### Async Client

```python
from authon import AsyncAuthonBackend

authon = AsyncAuthonBackend("sk_live_...")
user = await authon.verify_token("eyJ...")
result = await authon.users.list(page=1, limit=10)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_SECRET_KEY` | Yes | Server secret key (`sk_live_...`) |
| `AUTHON_API_URL` | No | Custom API URL (default: `https://api.authon.dev`) |
| `AUTHON_WEBHOOK_SECRET` | For webhooks | Webhook signing secret |

## API Reference

### AuthonBackend / AsyncAuthonBackend

| Method | Returns |
|--------|---------|
| `verify_token(token)` | `AuthonUser` |
| `users.list(page?, limit?, search?)` | `ListResult` |
| `users.get(user_id)` | `AuthonUser` |
| `users.create(email, password?, display_name?)` | `AuthonUser` |
| `users.update(user_id, **kwargs)` | `AuthonUser` |
| `users.delete(user_id)` | `None` |
| `users.ban(user_id, reason?)` | `AuthonUser` |
| `users.unban(user_id)` | `AuthonUser` |
| `webhooks.verify(payload, signature, secret)` | `WebhookEvent` |

### Middleware

| Module | Usage |
|--------|-------|
| `authon.middleware.fastapi` | `AuthonDependency` -- FastAPI `Depends()` |
| `authon.middleware.django` | `@authon_login_required(authon)` decorator |
| `authon.middleware.flask` | `@flask_authon_required(authon)` decorator |

## Comparison

| Feature | Authon | Clerk | Auth0 |
|---------|--------|-------|-------|
| Self-hosted | Yes | No | No |
| Pricing | Free | $25/mo+ | $23/mo+ |
| Python SDK | Yes | Yes | Yes |
| Django/Flask/FastAPI | Yes | No | Partial |
| Async support | Yes | No | Yes |
| Webhook verification | Yes | Yes | Yes |

## License

MIT
