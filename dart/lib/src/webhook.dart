import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Verifies a webhook payload using HMAC-SHA256.
class WebhookVerifier {
  /// Verifies the [payload] against the [signature] using the [secret].
  ///
  /// Returns the parsed JSON map on success.
  /// Throws [ArgumentError] for invalid inputs.
  /// Throws [FormatException] for signature mismatch.
  static Map<String, dynamic> verify(
    String payload,
    String signature,
    String secret,
  ) {
    if (payload.isEmpty) {
      throw ArgumentError('Empty webhook payload');
    }
    if (signature.isEmpty) {
      throw ArgumentError('Empty webhook signature');
    }
    if (secret.isEmpty) {
      throw ArgumentError('Empty webhook secret');
    }

    final key = utf8.encode(secret);
    final bytes = utf8.encode(payload);
    final hmacSha256 = Hmac(sha256, key);
    final digest = hmacSha256.convert(bytes);
    final expected = digest.toString();

    if (expected != signature) {
      throw const FormatException('Invalid webhook signature');
    }

    return jsonDecode(payload) as Map<String, dynamic>;
  }
}
