# authon-kotlin

Official Kotlin/Android SDK for [Authon](https://authon.dev) — authenticate users in Android apps.

## Install

### Gradle

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

### Initialize

```kotlin
import dev.authon.sdk.AuthonClient

val authon = AuthonClient(
    publishableKey = "pk_live_...",
    context = applicationContext,
)
```

### Sign In

```kotlin
// OAuth (opens Custom Tab)
val user = authon.signInWithOAuth(OAuthProvider.GOOGLE, activity)
Log.d("Authon", "Signed in: ${user.email}")

// Email/password
val user = authon.signInWithEmail("user@example.com", "password")

// Google One Tap
val user = authon.signInWithGoogleOneTap(activity)
```

### Auth State

```kotlin
// Check current user
val user = authon.currentUser
if (user != null) {
    Log.d("Authon", "Signed in as ${user.displayName}")
}

// Observe state (Flow)
lifecycleScope.launch {
    authon.authState.collect { state ->
        when {
            state.isLoading -> showLoading()
            state.user != null -> showProfile(state.user)
            else -> showSignIn()
        }
    }
}

// Get access token
val token = authon.getToken()

// Sign out
authon.signOut()
```

### Jetpack Compose

```kotlin
import dev.authon.sdk.compose.rememberAuthonState

@Composable
fun App() {
    val auth = rememberAuthonState(publishableKey = "pk_live_...")

    when {
        auth.isLoading -> CircularProgressIndicator()
        auth.isSignedIn -> {
            Column {
                Text("Welcome, ${auth.user?.displayName}")
                Button(onClick = { auth.signOut() }) {
                    Text("Sign Out")
                }
            }
        }
        else -> {
            Column {
                Button(onClick = { auth.signInWithOAuth(OAuthProvider.GOOGLE) }) {
                    Text("Sign in with Google")
                }
            }
        }
    }
}
```

## API Reference

### `AuthonClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `signInWithOAuth(provider, activity)` | `suspend AuthonUser` | OAuth sign-in via Custom Tab |
| `signInWithEmail(email, password)` | `suspend AuthonUser` | Email sign-in |
| `signInWithGoogleOneTap(activity)` | `suspend AuthonUser` | Google One Tap sign-in |
| `signOut()` | `suspend Unit` | Sign out |
| `getToken()` | `suspend String?` | Get current access token |
| `currentUser` | `AuthonUser?` | Current user (synchronous) |
| `authState` | `StateFlow<AuthState>` | Observable auth state |

### `AuthonUser`

| Property | Type |
|----------|------|
| `id` | `String` |
| `email` | `String?` |
| `displayName` | `String?` |
| `avatarUrl` | `String?` |
| `emailVerified` | `Boolean` |
| `createdAt` | `Instant` |

### `OAuthProvider`

`GOOGLE`, `APPLE`, `KAKAO`, `NAVER`, `GITHUB`, `DISCORD`, `FACEBOOK`, `X`, `LINE`, `MICROSOFT`

## Token Storage

Tokens are stored using Android `EncryptedSharedPreferences` (AndroidX Security), encrypted with AES256-GCM.

## Documentation

[authon.dev/docs](https://authon.dev/docs)

## License

[MIT](../LICENSE)
