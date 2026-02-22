# authup-kotlin

Official Kotlin/Android SDK for [Authup](https://authup.dev) — authenticate users in Android apps.

## Install

### Gradle

```kotlin
// build.gradle.kts
dependencies {
    implementation("dev.authup:sdk:0.1.0")
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
import dev.authup.sdk.AuthupClient

val authup = AuthupClient(
    publishableKey = "pk_live_...",
    context = applicationContext,
)
```

### Sign In

```kotlin
// OAuth (opens Custom Tab)
val user = authup.signInWithOAuth(OAuthProvider.GOOGLE, activity)
Log.d("Authup", "Signed in: ${user.email}")

// Email/password
val user = authup.signInWithEmail("user@example.com", "password")

// Google One Tap
val user = authup.signInWithGoogleOneTap(activity)
```

### Auth State

```kotlin
// Check current user
val user = authup.currentUser
if (user != null) {
    Log.d("Authup", "Signed in as ${user.displayName}")
}

// Observe state (Flow)
lifecycleScope.launch {
    authup.authState.collect { state ->
        when {
            state.isLoading -> showLoading()
            state.user != null -> showProfile(state.user)
            else -> showSignIn()
        }
    }
}

// Get access token
val token = authup.getToken()

// Sign out
authup.signOut()
```

### Jetpack Compose

```kotlin
import dev.authup.sdk.compose.rememberAuthupState

@Composable
fun App() {
    val auth = rememberAuthupState(publishableKey = "pk_live_...")

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

### `AuthupClient`

| Method | Returns | Description |
|--------|---------|-------------|
| `signInWithOAuth(provider, activity)` | `suspend AuthupUser` | OAuth sign-in via Custom Tab |
| `signInWithEmail(email, password)` | `suspend AuthupUser` | Email sign-in |
| `signInWithGoogleOneTap(activity)` | `suspend AuthupUser` | Google One Tap sign-in |
| `signOut()` | `suspend Unit` | Sign out |
| `getToken()` | `suspend String?` | Get current access token |
| `currentUser` | `AuthupUser?` | Current user (synchronous) |
| `authState` | `StateFlow<AuthState>` | Observable auth state |

### `AuthupUser`

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

[authup.dev/docs](https://authup.dev/docs)

## License

[MIT](../LICENSE)
