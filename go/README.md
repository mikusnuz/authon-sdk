# authon-go

> Go server SDK for token verification, user management, and net/http middleware — self-hosted Clerk alternative, Auth0 alternative

[![Go Reference](https://pkg.go.dev/badge/github.com/mikusnuz/authon-sdk/go.svg)](https://pkg.go.dev/github.com/mikusnuz/authon-sdk/go)
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
go get github.com/mikusnuz/authon-sdk/go
```

## Quick Start

```go
// main.go — complete working server
package main

import (
	"encoding/json"
	"log"
	"net/http"

	authon "github.com/mikusnuz/authon-sdk/go"
)

func main() {
	client := authon.NewAuthonBackend("sk_live_YOUR_SECRET_KEY")
	mux := http.NewServeMux()

	// Protected route
	mux.Handle("/api/profile", authon.AuthMiddleware(client)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := authon.UserFromContext(r.Context())
		json.NewEncoder(w).Encode(user)
	})))

	log.Println("Listening on :8080")
	http.ListenAndServe(":8080", mux)
}
```

## Common Tasks

### Verify a Token

```go
import authon "github.com/mikusnuz/authon-sdk/go"

client := authon.NewAuthonBackend("sk_live_YOUR_SECRET_KEY")
user, err := client.VerifyToken(ctx, accessToken)
if err != nil {
    log.Fatal(err)
}
fmt.Println(user.ID, user.Email)
```

### Protect HTTP Routes (Middleware)

```go
client := authon.NewAuthonBackend("sk_live_...")
mux := http.NewServeMux()

mux.Handle("/api/", authon.AuthMiddleware(client)(apiHandler))
// Unauthenticated requests get 401

func handler(w http.ResponseWriter, r *http.Request) {
    user := authon.UserFromContext(r.Context())
    // user.ID, user.Email, user.DisplayName, ...
}
```

### Manage Users

```go
client := authon.NewAuthonBackend("sk_live_...")

// List
result, _ := client.Users.List(ctx, &authon.ListOptions{Page: 1, PerPage: 20})

// Get
user, _ := client.Users.Get(ctx, "user_abc123")

// Create
user, _ := client.Users.Create(ctx, authon.CreateUserParams{
    Email:    "user@example.com",
    Password: "securePassword",
})

// Update
user, _ := client.Users.Update(ctx, "user_abc123", authon.UpdateUserParams{
    DisplayName: authon.String("New Name"),
})

// Ban / Unban / Delete
client.Users.Ban(ctx, "user_abc123")
client.Users.Unban(ctx, "user_abc123")
client.Users.Delete(ctx, "user_abc123")
```

### Verify Webhooks

```go
data, err := client.Webhooks.Verify(
    []byte(requestBody),
    r.Header.Get("X-Authon-Signature"),
    "whsec_YOUR_WEBHOOK_SECRET",
)
fmt.Println(data["type"]) // "user.created"
```

### Custom API URL

```go
client := authon.NewAuthonBackend("sk_live_...", authon.WithAPIURL("https://custom.api.url"))
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_SECRET_KEY` | Yes | Server secret key (`sk_live_...`) |
| `AUTHON_API_URL` | No | Custom API URL (default: `https://api.authon.dev`) |

## API Reference

| Function / Method | Returns |
|-------------------|---------|
| `NewAuthonBackend(key, opts...)` | `*AuthonBackend` |
| `client.VerifyToken(ctx, token)` | `(*User, error)` |
| `AuthMiddleware(client)` | `func(http.Handler) http.Handler` |
| `UserFromContext(ctx)` | `*User` |
| `client.Users.List(ctx, opts)` | `(*ListResult[User], error)` |
| `client.Users.Get(ctx, id)` | `(*User, error)` |
| `client.Users.Create(ctx, params)` | `(*User, error)` |
| `client.Users.Update(ctx, id, params)` | `(*User, error)` |
| `client.Users.Delete(ctx, id)` | `error` |
| `client.Users.Ban(ctx, id)` | `(*User, error)` |
| `client.Users.Unban(ctx, id)` | `(*User, error)` |
| `client.Webhooks.Verify(payload, sig, secret)` | `(map[string]any, error)` |

## Comparison

| Feature | Authon | Clerk | Auth0 |
|---------|--------|-------|-------|
| Self-hosted | Yes | No | No |
| Pricing | Free | $25/mo+ | $23/mo+ |
| Go SDK | Yes | Yes | Community |
| net/http middleware | Yes | No | No |
| Webhook verification | Yes | Yes | Yes |

## License

MIT
