# authup (Python)

Official Python SDK for [Authup](https://authup.dev) — verify tokens, manage users, and integrate with Django, Flask, and FastAPI.

## Install

```bash
pip install authup
```

Requires Python >= 3.8. Uses `httpx` for HTTP requests.

## Quick Start

### Basic Client

```python
from authup import AuthupBackend

authup = AuthupBackend("sk_live_...")

# Verify a token
user = authup.verify_token("eyJ...")
print(user.id, user.email)

# List users
result = authup.users.list(page=1, limit=10)
for u in result.data:
    print(u.email)

# Create a user
new_user = authup.users.create(
    email="user@example.com",
    password="securePassword",
    display_name="New User",
)

# Update a user
authup.users.update("user_abc123", display_name="Updated Name")

# Ban / unban
authup.users.ban("user_abc123", reason="Spam")
authup.users.unban("user_abc123")

# Delete a user
authup.users.delete("user_abc123")
```

### Async Client

```python
from authup import AsyncAuthupBackend

authup = AsyncAuthupBackend("sk_live_...")

user = await authup.verify_token("eyJ...")
result = await authup.users.list(page=1, limit=10)
```

### FastAPI

```python
from fastapi import FastAPI, Depends, Header
from authup.middleware.fastapi import AuthupDependency
from authup.types import AuthupUser

app = FastAPI()
authup_dep = AuthupDependency("sk_live_...")

@app.get("/api/profile")
async def profile(
    authorization: str = Header(...),
    user: AuthupUser = Depends(authup_dep),
):
    return {"id": user.id, "email": user.email}
```

### Django

```python
from django.http import JsonResponse
from authup import AuthupBackend
from authup.middleware.django import authup_login_required

authup = AuthupBackend("sk_live_...")

@authup_login_required(authup)
def profile(request):
    user = request.authup_user
    return JsonResponse({"id": user.id, "email": user.email})
```

### Flask

```python
from flask import Flask, g, jsonify
from authup import AuthupBackend
from authup.middleware.flask import flask_authup_required

app = Flask(__name__)
authup = AuthupBackend("sk_live_...")

@app.route("/api/profile")
@flask_authup_required(authup)
def profile():
    user = g.authup_user
    return jsonify({"id": user.id, "email": user.email})
```

### Webhook Verification

```python
from authup import verify_webhook

event = verify_webhook(
    payload=request_body,
    signature=request.headers["x-authup-signature"],
    secret="whsec_...",
)
print(event.type)  # "user.created"
```

## API Reference

### `AuthupBackend(secret_key, api_url?)`

| Method | Returns | Description |
|--------|---------|-------------|
| `verify_token(token)` | `AuthupUser` | Verify an access token |
| `users.list(page?, limit?, search?)` | `ListResult` | List users |
| `users.get(user_id)` | `AuthupUser` | Get a user |
| `users.create(email, password?, display_name?)` | `AuthupUser` | Create a user |
| `users.update(user_id, **kwargs)` | `AuthupUser` | Update a user |
| `users.delete(user_id)` | `None` | Delete a user |
| `users.ban(user_id, reason?)` | `AuthupUser` | Ban a user |
| `users.unban(user_id)` | `AuthupUser` | Unban a user |
| `webhooks.verify(payload, signature, secret)` | `WebhookEvent` | Verify webhook signature |

### `AsyncAuthupBackend`

Same API as `AuthupBackend`, but all methods are `async`.

### Types

| Type | Fields |
|------|--------|
| `AuthupUser` | `id`, `email`, `display_name`, `avatar_url`, `email_verified`, `banned`, `created_at` |
| `AuthupSession` | `id`, `user_id`, `ip_address`, `expires_at` |
| `WebhookEvent` | `id`, `type`, `project_id`, `timestamp`, `data` |
| `ListResult` | `data`, `total`, `page`, `limit` |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../LICENSE)
