# authon-go

Official Go SDK for [Authon](https://authon.dev) — token verification, user management, and net/http middleware.

## Install

```bash
go get github.com/mikusnuz/authon-sdk/go
```

Requires Go >= 1.21.

## Quick Start

### Token Verification

```go
package main

import (
	"fmt"
	"log"

	authon "github.com/mikusnuz/authon-sdk/go"
)

func main() {
	client := authon.NewBackend("sk_live_...")

	user, err := client.VerifyToken("eyJ...")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(user.ID, user.Email)
}
```

### HTTP Middleware

```go
package main

import (
	"net/http"

	authon "github.com/mikusnuz/authon-sdk/go"
)

func main() {
	client := authon.NewBackend("sk_live_...")
	mux := http.NewServeMux()

	// Protected route
	mux.Handle("/api/profile", client.Middleware(http.HandlerFunc(profileHandler)))

	// Public route
	mux.HandleFunc("/health", healthHandler)

	http.ListenAndServe(":8080", mux)
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	user := authon.UserFromContext(r.Context())
	// user.ID, user.Email, user.DisplayName, ...
	w.Write([]byte("Hello, " + user.DisplayName))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ok"))
}
```

### User Management

```go
client := authon.NewBackend("sk_live_...")

// List users
result, err := client.Users.List(authon.ListOptions{Page: 1, PerPage: 20})

// Get a user
user, err := client.Users.Get("user_abc123")

// Create a user
user, err := client.Users.Create(authon.CreateUserParams{
	Email:    "user@example.com",
	Password: "securePassword",
})

// Update a user
user, err := client.Users.Update("user_abc123", authon.UpdateUserParams{
	DisplayName: authon.String("Updated Name"),
})

// Delete a user
err := client.Users.Delete("user_abc123")
```

### Webhook Verification

```go
client := authon.NewBackend("sk_live_...")

data, err := client.Webhooks.Verify(
	[]byte(requestBody),
	r.Header.Get("X-Authon-Signature"),
	"whsec_...",
)
if err != nil {
	http.Error(w, "Invalid signature", 400)
	return
}
fmt.Println(data["type"]) // "user.created"
```

### Custom API URL

```go
client := authon.NewBackend("sk_live_...", authon.WithAPIURL("https://custom.api.url"))
```

## API Reference

### `NewBackend(secretKey string, opts ...Option) *AuthonBackend`

| Method | Returns | Description |
|--------|---------|-------------|
| `VerifyToken(token)` | `(*User, error)` | Verify an access token |
| `Middleware(next)` | `http.Handler` | net/http middleware |
| `Users.List(opts)` | `(*ListResult[User], error)` | List users |
| `Users.Get(id)` | `(*User, error)` | Get a user |
| `Users.Create(params)` | `(*User, error)` | Create a user |
| `Users.Update(id, params)` | `(*User, error)` | Update a user |
| `Users.Delete(id)` | `error` | Delete a user |
| `Webhooks.Verify(payload, sig, secret)` | `(map[string]any, error)` | Verify HMAC-SHA256 signature |

### Types

| Type | Description |
|------|-------------|
| `User` | User with ID, Email, DisplayName, AvatarURL, Banned, etc. |
| `Session` | Active session with UserID, Status, ExpireAt |
| `WebhookEvent` | Webhook payload with ID, Type, Data, Timestamp |
| `ListResult[T]` | Paginated list: Data, TotalCount, Page, PerPage |
| `AuthonError` | API error with StatusCode, Message, Code |

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../LICENSE)
