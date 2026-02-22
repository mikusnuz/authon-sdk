package dev.authon.sdk

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URI

/**
 * Server-side Authon client for Kotlin/JVM.
 *
 * @param secretKey Your Authon secret API key.
 * @param apiUrl Custom API base URL (defaults to `https://api.authon.dev`).
 */
class AuthonBackend @JvmOverloads constructor(
    private val secretKey: String,
    private val apiUrl: String = "https://api.authon.dev",
) {
    private val gson = Gson()
    private val baseUrl = apiUrl.trimEnd('/')

    val users = UserService()
    val webhooks = WebhookService()

    /**
     * Verifies an access token and returns the associated user.
     */
    fun verifyToken(accessToken: String): User {
        val response = request("GET", "/v1/auth/verify", headers = mapOf("Authorization" to "Bearer $accessToken"))
        return gson.fromJson(response, User::class.java)
    }

    inner class UserService {

        /** Lists users with optional pagination. */
        fun list(options: ListOptions? = null): ListResult<User> {
            var path = "/v1/users"
            if (options != null) {
                val params = mutableListOf<String>()
                options.page?.let { params.add("page=$it") }
                options.perPage?.let { params.add("perPage=$it") }
                if (params.isNotEmpty()) path += "?${params.joinToString("&")}"
            }
            val response = request("GET", path)
            val type = object : TypeToken<ListResult<User>>() {}.type
            return gson.fromJson(response, type)
        }

        /** Gets a user by ID. */
        fun get(userId: String): User {
            val response = request("GET", "/v1/users/$userId")
            return gson.fromJson(response, User::class.java)
        }

        /** Creates a new user. */
        fun create(params: CreateUserParams): User {
            val response = request("POST", "/v1/users", body = gson.toJson(params))
            return gson.fromJson(response, User::class.java)
        }

        /** Updates an existing user. */
        fun update(userId: String, params: UpdateUserParams): User {
            val response = request("PATCH", "/v1/users/$userId", body = gson.toJson(params))
            return gson.fromJson(response, User::class.java)
        }

        /** Deletes a user by ID. */
        fun delete(userId: String) {
            request("DELETE", "/v1/users/$userId")
        }

        /** Bans a user by ID. */
        fun ban(userId: String): User {
            val response = request("POST", "/v1/users/$userId/ban")
            return gson.fromJson(response, User::class.java)
        }

        /** Unbans a user by ID. */
        fun unban(userId: String): User {
            val response = request("POST", "/v1/users/$userId/unban")
            return gson.fromJson(response, User::class.java)
        }
    }

    inner class WebhookService {
        /** Verifies a webhook payload and returns the parsed data. */
        fun verify(payload: String, signature: String, secret: String): Map<String, Any> {
            return WebhookVerifier.verify(payload, signature, secret)
        }
    }

    private fun request(
        method: String,
        path: String,
        body: String? = null,
        headers: Map<String, String>? = null,
    ): String {
        val url = URI("$baseUrl$path").toURL()
        val connection = url.openConnection() as HttpURLConnection

        try {
            connection.requestMethod = if (method == "PATCH") "POST" else method
            if (method == "PATCH") {
                connection.setRequestProperty("X-HTTP-Method-Override", "PATCH")
            }
            connection.setRequestProperty("Authorization", "Bearer $secretKey")
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("User-Agent", "authon-kotlin/0.1.0")
            connection.connectTimeout = 30_000
            connection.readTimeout = 30_000

            headers?.forEach { (key, value) ->
                connection.setRequestProperty(key, value)
            }

            if (body != null) {
                connection.doOutput = true
                connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            }

            val responseCode = connection.responseCode
            val responseBody = if (responseCode >= 400) {
                connection.errorStream?.bufferedReader()?.readText() ?: ""
            } else {
                connection.inputStream.bufferedReader().readText()
            }

            if (responseCode >= 400) {
                try {
                    val error = gson.fromJson(responseBody, ErrorResponse::class.java)
                    throw AuthonException(
                        statusCode = responseCode,
                        message = error?.message ?: responseBody,
                        code = error?.code,
                    )
                } catch (e: AuthonException) {
                    throw e
                } catch (_: Exception) {
                    throw AuthonException(statusCode = responseCode, message = responseBody)
                }
            }

            return responseBody
        } finally {
            connection.disconnect()
        }
    }

    private data class ErrorResponse(
        val message: String? = null,
        val code: String? = null,
    )
}
