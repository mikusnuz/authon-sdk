# authon (Python)

Official Python SDK for [Authon](https://authon.dev) — verify tokens, manage users, and integrate with Django, Flask, and FastAPI.

## Install

```bash
pip install authon
```

Requires Python >= 3.8. Uses `httpx` for HTTP requests.

## Quick Start

### Basic Client

```python
from authon import AuthonBackend

authon = AuthonBackend("sk_live_...")

# Verify a token
user = authon.verify_token("eyJ...")
print(user.id, user.email)

# List users
result = authon.users.list(page=1, limit=10)
for u in result.data:
    print(u.email)

# Create a user
new_user = authon.users.create(
    email="user@example.com",
    password="securePassword",
    display_name="New User",
)

# Update a user
authon.users.update("user_abc123", display_name="Updated Name")

# Ban / unban
authon.users.ban("user_abc123", reason="Spam")
authon.users.unban("user_abc123")

# Delete a user
authon.users.delete("user_abc123")
```

### Async Client

```python
from authon import AsyncAuthonBackend

authon = AsyncAuthonBackend("sk_live_...")

user = await authon.verify_token("eyJ...")
result = await authon.users.list(page=1, limit=10)
```

### FastAPI

```python
from fastapi import FastAPI, Depends, Header
from authon.middleware.fastapi import AuthonDependency
from authon.types import AuthonUser

app = FastAPI()
authon_dep = AuthonDependency("sk_live_...")

@app.get("/api/profile")
async def profile(
    authorization: str = Header(...),
    user: AuthonUser = Depends(authon_dep),
):
    return {"id": user.id, "email": user.email}
```

### Django

```python
from django.http import JsonResponse
from authon import AuthonBackend
from authon.middleware.django import authon_login_required

authon = AuthonBackend("sk_live_...")

@authon_login_required(authon)
def profile(request):
    user = request.authon_user
    return JsonResponse({"id": user.id, "email": user.email})
```

### Flask

```python
from flask import Flask, g, jsonify
from authon import AuthonBackend
from authon.middleware.flask import flask_authon_required

app = Flask(__name__)
authon = AuthonBackend("sk_live_...")

@app.route("/api/profile")
@flask_authon_required(authon)
def profile():
    user = g.authon_user
    return jsonify({"id": user.id, "email": user.email})
```

### Webhook Verification

```python
from authon import verify_webhook

event = verify_webhook(
    payload=request_body,
    signature=request.headers["x-authon-signature"],
    secret="whsec_...",
)
print(event.type)  # "user.created"
```

## API Reference

### `AuthonBackend(secret_key, api_url?)`

| Method | Returns | Description |
|--------|---------|-------------|
| `verify_token(token)` | `AuthonUser` | Verify an access token |
| `users.list(page?, limit?, search?)` | `ListResult` | List users |
| `users.get(user_id)` | `AuthonUser` | Get a user |
| `users.create(email, password?, display_name?)` | `AuthonUser` | Create a user |
| `users.update(user_id, **kwargs)` | `AuthonUser` | Update a user |
| `users.delete(user_id)` | `None` | Delete a user |
| `users.ban(user_id, reason?)` | `AuthonUser` | Ban a user |
| `users.unban(user_id)` | `AuthonUser` | Unban a user |
| `webhooks.verify(payload, signature, secret)` | `WebhookEvent` | Verify webhook signature |

### `AsyncAuthonBackend`

Same API as `AuthonBackend`, but all methods are `async`.

### Types

| Type | Fields |
|------|--------|
| `AuthonUser` | `id`, `email`, `display_name`, `avatar_url`, `email_verified`, `banned`, `created_at` |
| `AuthonSession` | `id`, `user_id`, `ip_address`, `expires_at` |
| `WebhookEvent` | `id`, `type`, `project_id`, `timestamp`, `data` |
| `ListResult` | `data`, `total`, `page`, `limit` |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../LICENSE)
