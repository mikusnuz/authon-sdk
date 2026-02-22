import Foundation
import CryptoKit

/// Handles webhook verification using HMAC-SHA256.
public enum WebhookVerifier {

    /// Verifies a webhook payload against the provided signature.
    ///
    /// - Parameters:
    ///   - payload: The raw webhook payload bytes.
    ///   - signature: The hex-encoded HMAC-SHA256 signature.
    ///   - secret: The webhook signing secret.
    /// - Returns: The parsed JSON dictionary.
    /// - Throws: `WebhookError` if verification fails.
    public static func verify(
        payload: Data,
        signature: String,
        secret: String
    ) throws -> [String: Any] {
        guard !payload.isEmpty else {
            throw WebhookError.emptyPayload
        }
        guard !signature.isEmpty else {
            throw WebhookError.emptySignature
        }
        guard !secret.isEmpty else {
            throw WebhookError.emptySecret
        }

        let key = SymmetricKey(data: Data(secret.utf8))
        let mac = HMAC<SHA256>.authenticationCode(for: payload, using: key)
        let expected = mac.map { String(format: "%02x", $0) }.joined()

        guard expected == signature else {
            throw WebhookError.invalidSignature
        }

        guard let json = try JSONSerialization.jsonObject(with: payload) as? [String: Any] else {
            throw WebhookError.invalidPayload
        }

        return json
    }
}

/// Errors that can occur during webhook verification.
public enum WebhookError: Error, Sendable {
    case emptyPayload
    case emptySignature
    case emptySecret
    case invalidSignature
    case invalidPayload
}
