package dev.authup.sdk

import com.google.gson.Gson
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/** Handles webhook verification using HMAC-SHA256. */
object WebhookVerifier {

    private val gson = Gson()

    /**
     * Verifies a webhook payload against the provided HMAC-SHA256 signature.
     *
     * @param payload The raw webhook payload string.
     * @param signature The hex-encoded HMAC-SHA256 signature.
     * @param secret The webhook signing secret.
     * @return The parsed JSON map.
     * @throws IllegalArgumentException If any parameter is empty.
     * @throws SecurityException If the signature is invalid.
     */
    @JvmStatic
    fun verify(payload: String, signature: String, secret: String): Map<String, Any> {
        require(payload.isNotEmpty()) { "Empty webhook payload" }
        require(signature.isNotEmpty()) { "Empty webhook signature" }
        require(secret.isNotEmpty()) { "Empty webhook secret" }

        val mac = Mac.getInstance("HmacSHA256")
        val keySpec = SecretKeySpec(secret.toByteArray(Charsets.UTF_8), "HmacSHA256")
        mac.init(keySpec)
        val hash = mac.doFinal(payload.toByteArray(Charsets.UTF_8))
        val expected = hash.joinToString("") { "%02x".format(it) }

        if (expected != signature) {
            throw SecurityException("Invalid webhook signature")
        }

        @Suppress("UNCHECKED_CAST")
        return gson.fromJson(payload, Map::class.java) as Map<String, Any>
    }
}
