package dev.authup.sdk

import java.time.Instant

/** Represents an Authup user. */
data class User(
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
    val metadata: Map<String, Any>? = null,
    val externalAccounts: List<ExternalAccount>? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
)

/** Represents an OAuth-linked external account. */
data class ExternalAccount(
    val provider: String,
    val providerId: String,
    val email: String? = null,
)

/** Represents an active user session. */
data class Session(
    val id: String,
    val userId: String,
    val status: String,
    val lastActiveAt: String,
    val expireAt: String,
    val createdAt: String,
)

/** Represents an incoming webhook event. */
data class WebhookEvent(
    val id: String,
    val type: String,
    val data: Any?,
    val timestamp: String,
)

/** A paginated list response. */
data class ListResult<T>(
    val data: List<T>,
    val totalCount: Int,
    val page: Int,
    val perPage: Int,
)

/** Options for list endpoints. */
data class ListOptions(
    val page: Int? = null,
    val perPage: Int? = null,
)

/** Parameters for creating a user. */
data class CreateUserParams(
    val email: String? = null,
    val phone: String? = null,
    val username: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val password: String? = null,
    val metadata: Map<String, Any>? = null,
)

/** Parameters for updating a user. */
data class UpdateUserParams(
    val email: String? = null,
    val phone: String? = null,
    val username: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val metadata: Map<String, Any>? = null,
)

/** API error response. */
class AuthupException(
    val statusCode: Int,
    override val message: String,
    val code: String? = null,
) : Exception(if (code != null) "$code: $message" else message)
