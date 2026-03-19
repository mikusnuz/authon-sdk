# authon-kotlin

> Kotlin/JVM server SDK for token verification and user management — self-hosted Clerk alternative, Auth0 alternative

[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)

## Install

```kotlin
// build.gradle.kts
dependencies {
    implementation("dev.authon:sdk:0.1.0")
}
```

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```

## Quick Start

```kotlin
// Main.kt — complete working example
import dev.authon.sdk.AuthonBackend
import dev.authon.sdk.CreateUserParams

fun main() {
    val authon = AuthonBackend("sk_live_YOUR_SECRET_KEY")

    // Verify a token
    val user = authon.verifyToken("eyJhbGci...")
    println("${user.id} ${user.email}")

    // List users
    val result = authon.users.list()
    result.data.forEach { println(it.email) }

    // Create a user
    val newUser = authon.users.create(CreateUserParams(
        email = "alice@example.com",
        password = "securePassword",
    ))
}
```

## Common Tasks

### Verify a Token

```kotlin
val authon = AuthonBackend("sk_live_YOUR_SECRET_KEY")
val user = authon.verifyToken(accessToken)
// user.id, user.email, user.displayName, ...
```

### Protect a Spring Boot Route

```kotlin
import dev.authon.sdk.AuthonBackend
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest

val authon = AuthonBackend("sk_live_...")

@RestController
class ProfileController {
    @GetMapping("/api/profile")
    fun profile(request: HttpServletRequest): Map<String, Any?> {
        val token = request.getHeader("Authorization")?.removePrefix("Bearer ")
            ?: throw RuntimeException("Missing token")
        val user = authon.verifyToken(token)
        return mapOf("id" to user.id, "email" to user.email)
    }
}
```

### Manage Users

```kotlin
val authon = AuthonBackend("sk_live_...")

// List
val result = authon.users.list(ListOptions(page = 1, perPage = 20))

// Get
val user = authon.users.get("user_abc123")

// Create
val user = authon.users.create(CreateUserParams(
    email = "user@example.com",
    password = "password123",
))

// Update
val updated = authon.users.update("user_abc123", UpdateUserParams(
    firstName = "Alice",
))

// Ban / Unban / Delete
authon.users.ban("user_abc123")
authon.users.unban("user_abc123")
authon.users.delete("user_abc123")
```

### Verify Webhooks

```kotlin
val data = authon.webhooks.verify(
    payload = requestBody,
    signature = request.getHeader("X-Authon-Signature"),
    secret = "whsec_YOUR_WEBHOOK_SECRET",
)
println(data["type"]) // "user.created"
```

### Custom API URL

```kotlin
val authon = AuthonBackend("sk_live_...", apiUrl = "https://custom.api.url")
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTHON_SECRET_KEY` | Yes | Server secret key (`sk_live_...`) |
| `AUTHON_API_URL` | No | Custom API URL (default: `https://api.authon.dev`) |

## API Reference

| Method | Returns |
|--------|---------|
| `AuthonBackend(secretKey, apiUrl?)` | Constructor |
| `verifyToken(token)` | `User` |
| `users.list(options?)` | `ListResult<User>` |
| `users.get(userId)` | `User` |
| `users.create(params)` | `User` |
| `users.update(userId, params)` | `User` |
| `users.delete(userId)` | `Unit` |
| `users.ban(userId)` | `User` |
| `users.unban(userId)` | `User` |
| `webhooks.verify(payload, signature, secret)` | `Map<String, Any>` |

## Comparison

| Feature | Authon | Clerk | Firebase Auth |
|---------|--------|-------|---------------|
| Self-hosted | Yes | No | No |
| Pricing | Free | $25/mo+ | Free tier |
| Kotlin SDK | Yes | No | Yes |
| Spring Boot support | Yes | No | Community |
| Webhook verification | Yes | Yes | Via Cloud Functions |

## License

MIT
