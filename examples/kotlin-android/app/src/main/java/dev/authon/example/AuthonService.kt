package dev.authon.example

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

// ---------------------------------------------------------------------------
// Data models (mobile-side; mirrors Authon REST API responses)
// ---------------------------------------------------------------------------

data class AuthUser(
    val id: String,
    val email: String? = null,
    val emailVerified: Boolean = false,
    val phone: String? = null,
    val phoneVerified: Boolean = false,
    val username: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val displayName: String? = null,
    val avatarUrl: String? = null,
    val banned: Boolean = false,
    val externalAccounts: List<ExternalAccount> = emptyList(),
    val createdAt: String = "",
    val updatedAt: String = "",
)

data class ExternalAccount(
    val provider: String,
    val providerId: String,
    val email: String? = null,
)

data class AuthSession(
    val id: String,
    val userId: String,
    val status: String,
    val lastActiveAt: String,
    val expireAt: String,
    val createdAt: String,
)

data class SignInRequest(
    val email: String,
    val password: String,
    val strategy: String = "password",
)

data class SignUpRequest(
    val email: String,
    val password: String,
    val firstName: String? = null,
    val lastName: String? = null,
)

data class UpdateProfileRequest(
    val firstName: String? = null,
    val lastName: String? = null,
    val username: String? = null,
)

data class MfaEnrollResponse(
    val secret: String,
    val qrCodeUrl: String,
    val backupCodes: List<String>,
)

data class AuthTokens(
    val accessToken: String,
    val refreshToken: String? = null,
    val expiresIn: Long = 3600,
)

data class ApiError(
    val message: String,
    val code: String? = null,
    @SerializedName("statusCode") val statusCode: Int = 0,
)

class AuthonException(val statusCode: Int, override val message: String, val code: String? = null) :
    Exception(message)

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

class TokenStorage(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "authon_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    var accessToken: String?
        get() = prefs.getString(KEY_ACCESS_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_ACCESS_TOKEN, value).apply()

    var refreshToken: String?
        get() = prefs.getString(KEY_REFRESH_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_REFRESH_TOKEN, value).apply()

    fun clear() = prefs.edit().clear().apply()

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
    }
}

// ---------------------------------------------------------------------------
// AuthonService — HTTP client wrapping the Authon REST API
// ---------------------------------------------------------------------------

class AuthonService(context: Context) {

    private val baseUrl = BuildConfig.AUTHON_API_URL.trimEnd('/')
    private val publishableKey = BuildConfig.AUTHON_PUBLISHABLE_KEY
    val tokenStorage = TokenStorage(context)
    private val gson = Gson()
    private val applicationContext = context.applicationContext

    private val http = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG)
                HttpLoggingInterceptor.Level.BODY
            else
                HttpLoggingInterceptor.Level.NONE
        })
        .build()

    private val json = "application/json; charset=utf-8".toMediaType()

    // -----------------------------------------------------------------------
    // Auth
    // -----------------------------------------------------------------------

    suspend fun signIn(email: String, password: String): AuthUser = withContext(Dispatchers.IO) {
        val body = gson.toJson(SignInRequest(email = email, password = password))
        val response = post("/v1/auth/sign-in", body, authenticated = false)
        val tokens = gson.fromJson(response, AuthTokens::class.java)
        tokenStorage.accessToken = tokens.accessToken
        tokenStorage.refreshToken = tokens.refreshToken
        currentUser()
    }

    suspend fun signUp(email: String, password: String, firstName: String?, lastName: String?): AuthUser =
        withContext(Dispatchers.IO) {
            val body = gson.toJson(
                SignUpRequest(
                    email = email,
                    password = password,
                    firstName = firstName?.ifBlank { null },
                    lastName = lastName?.ifBlank { null },
                )
            )
            val response = post("/v1/auth/sign-up", body, authenticated = false)
            val tokens = gson.fromJson(response, AuthTokens::class.java)
            tokenStorage.accessToken = tokens.accessToken
            tokenStorage.refreshToken = tokens.refreshToken
            currentUser()
        }

    suspend fun signOut(): Unit = withContext(Dispatchers.IO) {
        runCatching { post("/v1/auth/sign-out", "{}", authenticated = true) }
        tokenStorage.clear()
    }

    suspend fun currentUser(): AuthUser = withContext(Dispatchers.IO) {
        val response = get("/v1/auth/me")
        gson.fromJson(response, AuthUser::class.java)
    }

    suspend fun refreshSession(): Unit = withContext(Dispatchers.IO) {
        val refreshToken = tokenStorage.refreshToken
            ?: throw AuthonException(401, "No refresh token available")
        val body = gson.toJson(mapOf("refreshToken" to refreshToken))
        val response = post("/v1/auth/refresh", body, authenticated = false)
        val tokens = gson.fromJson(response, AuthTokens::class.java)
        tokenStorage.accessToken = tokens.accessToken
        tokens.refreshToken?.let { tokenStorage.refreshToken = it }
    }

    // -----------------------------------------------------------------------
    // Profile
    // -----------------------------------------------------------------------

    suspend fun updateProfile(firstName: String?, lastName: String?, username: String?): AuthUser =
        withContext(Dispatchers.IO) {
            val body = gson.toJson(
                UpdateProfileRequest(
                    firstName = firstName?.ifBlank { null },
                    lastName = lastName?.ifBlank { null },
                    username = username?.ifBlank { null },
                )
            )
            val response = patch("/v1/auth/profile", body)
            gson.fromJson(response, AuthUser::class.java)
        }

    suspend fun changePassword(currentPassword: String, newPassword: String): Unit =
        withContext(Dispatchers.IO) {
            val body = gson.toJson(
                mapOf("currentPassword" to currentPassword, "newPassword" to newPassword)
            )
            post("/v1/auth/change-password", body, authenticated = true)
            Unit
        }

    suspend fun sendPasswordResetEmail(email: String): Unit = withContext(Dispatchers.IO) {
        val body = gson.toJson(mapOf("email" to email))
        post("/v1/auth/forgot-password", body, authenticated = false)
        Unit
    }

    suspend fun deleteAccount(): Unit = withContext(Dispatchers.IO) {
        delete("/v1/auth/account")
        tokenStorage.clear()
    }

    // -----------------------------------------------------------------------
    // Sessions
    // -----------------------------------------------------------------------

    suspend fun listSessions(): List<AuthSession> = withContext(Dispatchers.IO) {
        val response = get("/v1/auth/sessions")
        val type = object : TypeToken<List<AuthSession>>() {}.type
        gson.fromJson(response, type)
    }

    suspend fun revokeSession(sessionId: String): Unit = withContext(Dispatchers.IO) {
        delete("/v1/auth/sessions/$sessionId")
    }

    // -----------------------------------------------------------------------
    // MFA
    // -----------------------------------------------------------------------

    suspend fun enrollMfa(): MfaEnrollResponse = withContext(Dispatchers.IO) {
        val response = post("/v1/auth/mfa/enroll", "{}", authenticated = true)
        gson.fromJson(response, MfaEnrollResponse::class.java)
    }

    suspend fun verifyMfaEnrollment(code: String): Unit = withContext(Dispatchers.IO) {
        val body = gson.toJson(mapOf("code" to code))
        post("/v1/auth/mfa/verify-enrollment", body, authenticated = true)
        Unit
    }

    suspend fun disableMfa(code: String): Unit = withContext(Dispatchers.IO) {
        val body = gson.toJson(mapOf("code" to code))
        post("/v1/auth/mfa/disable", body, authenticated = true)
        Unit
    }

    // -----------------------------------------------------------------------
    // OAuth / Social login
    // -----------------------------------------------------------------------

    fun launchOAuth(context: android.content.Context, provider: String) {
        val redirectUri = "${BuildConfig.AUTHON_OAUTH_REDIRECT_SCHEME}://callback"
        val url = "$baseUrl/v1/auth/oauth/$provider" +
                "?redirect_uri=${Uri.encode(redirectUri)}" +
                "&pk=${Uri.encode(publishableKey)}"

        val customTabsIntent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .build()
        customTabsIntent.launchUrl(context, Uri.parse(url))
    }

    suspend fun handleOAuthCallback(uri: Uri): AuthUser = withContext(Dispatchers.IO) {
        val code = uri.getQueryParameter("code")
            ?: throw AuthonException(400, "Missing authorization code in OAuth callback")
        val redirectUri = "${BuildConfig.AUTHON_OAUTH_REDIRECT_SCHEME}://callback"
        val body = gson.toJson(mapOf("code" to code, "redirectUri" to redirectUri))
        val response = post("/v1/auth/oauth/callback", body, authenticated = false)
        val tokens = gson.fromJson(response, AuthTokens::class.java)
        tokenStorage.accessToken = tokens.accessToken
        tokenStorage.refreshToken = tokens.refreshToken
        currentUser()
    }

    // -----------------------------------------------------------------------
    // HTTP helpers
    // -----------------------------------------------------------------------

    private fun get(path: String): String {
        val request = Request.Builder()
            .url("$baseUrl$path")
            .applyAuth()
            .get()
            .build()
        return execute(request)
    }

    private fun post(path: String, body: String, authenticated: Boolean = true): String {
        val requestBody = body.toRequestBody(json)
        val builder = Request.Builder()
            .url("$baseUrl$path")
            .post(requestBody)
        if (authenticated) builder.applyAuth()
        else builder.header("X-Authon-Publishable-Key", publishableKey)
        return execute(builder.build())
    }

    private fun patch(path: String, body: String): String {
        val requestBody = body.toRequestBody(json)
        val request = Request.Builder()
            .url("$baseUrl$path")
            .applyAuth()
            .patch(requestBody)
            .build()
        return execute(request)
    }

    private fun delete(path: String): String {
        val request = Request.Builder()
            .url("$baseUrl$path")
            .applyAuth()
            .delete()
            .build()
        return execute(request)
    }

    private fun Request.Builder.applyAuth(): Request.Builder {
        val token = tokenStorage.accessToken
        if (token != null) header("Authorization", "Bearer $token")
        return this
    }

    private fun execute(request: Request): String {
        val response = http.newCall(request).execute()
        val responseBody = response.body?.string() ?: ""
        if (!response.isSuccessful) {
            val error = runCatching { gson.fromJson(responseBody, ApiError::class.java) }.getOrNull()
            throw AuthonException(
                statusCode = response.code,
                message = error?.message ?: "HTTP ${response.code}",
                code = error?.code,
            )
        }
        return responseBody
    }
}
