# authup-go

Official Go SDK for [Authup](https://authup.dev) — token verification, user management, and net/http middleware.

## Install

```bash
go get github.com/mikusnuz/authup-sdk/go
```

Requires Go >= 1.21.

## Quick Start

### Token Verification

```go
package main

import (
	"fmt"
	"log"

	authup "github.com/mikusnuz/authup-sdk/go"
)

func main() {
	client := authup.NewBackend("sk_live_...")

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

	authup "github.com/mikusnuz/authup-sdk/go"
)

func main() {
	client := authup.NewBackend("sk_live_...")
	mux := http.NewServeMux()

	// Protected route
	mux.Handle("/api/profile", client.Middleware(http.HandlerFunc(profileHandler)))

	// Public route
	mux.HandleFunc("/health", healthHandler)

	http.ListenAndServe(":8080", mux)
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	user := authup.UserFromContext(r.Context())
	// user.ID, user.Email, user.DisplayName, ...
	w.Write([]byte("Hello, " + user.DisplayName))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ok"))
}
```

### User Management

```go
client := authup.NewBackend("sk_live_...")

// List users
result, err := client.Users.List(authup.ListOptions{Page: 1, PerPage: 20})

// Get a user
user, err := client.Users.Get("user_abc123")

// Create a user
user, err := client.Users.Create(authup.CreateUserParams{
	Email:    "user@example.com",
	Password: "securePassword",
})

// Update a user
user, err := client.Users.Update("user_abc123", authup.UpdateUserParams{
	DisplayName: authup.String("Updated Name"),
})

// Delete a user
err := client.Users.Delete("user_abc123")
```

### Webhook Verification

```go
client := authup.NewBackend("sk_live_...")

data, err := client.Webhooks.Verify(
	[]byte(requestBody),
	r.Header.Get("X-Authup-Signature"),
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
client := authup.NewBackend("sk_live_...", authup.WithAPIURL("https://custom.api.url"))
```

## API Reference

### `NewBackend(secretKey string, opts ...Option) *AuthupBackend`

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
| `AuthupError` | API error with StatusCode, Message, Code |

## Documentation

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../LICENSE)
