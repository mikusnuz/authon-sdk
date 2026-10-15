import Foundation
import AuthenticationServices
import CryptoKit
import Security
#if canImport(AppKit)
import AppKit
#endif

final class OAuthManager: NSObject, ASWebAuthenticationPresentationContextProviding {
    private let api: AuthonAPI
    /// App URL scheme Authon redirects back to (e.g. "com.example.app"). It must be listed in the
    /// project's allowed origins as "com.example.app://".
    private let callbackScheme: String?

    #if os(macOS) || os(iOS)
    private var nativeContinuation: CheckedContinuation<ApiAuthResponse, Error>?
    #endif

    init(api: AuthonAPI, callbackScheme: String? = nil) {
        self.api = api
        self.callbackScheme = callbackScheme
        super.init()
    }

    // MARK: - OAuth Flow

    func authenticate(provider: OAuthProvider) async throws -> ApiAuthResponse {
        #if os(macOS) || os(iOS)
        if provider == .apple {
            do {
                return try await authenticateWithNativeApple()
            } catch let mfaError as AuthonMfaRequiredError {
                // Signed in with Apple, but the account needs MFA: never restart via web OAuth.
                throw mfaError
            } catch {
                // Native Apple Sign In failed (Debug build, sandbox, etc.) — fallback to web OAuth
                return try await authenticateWithWebOAuth(provider: .apple)
            }
        }
        #endif
        return try await authenticateWithWebOAuth(provider: provider)
    }

    // MARK: - Web OAuth (all platforms / non-Apple providers)

    /// PKCE flow: this instance keeps a random verifier and sends only its S256 hash. Authon
    /// redirects the auth session to `<callbackScheme>://oauth-callback` with a one-time code,
    /// which is exchanged together with the verifier. The OAuth state alone never yields tokens.
    private func authenticateWithWebOAuth(provider: OAuthProvider) async throws -> ApiAuthResponse {
        guard let scheme = callbackScheme, !scheme.isEmpty else {
            throw AuthonError(
                statusCode: 0,
                message: "Web OAuth needs oauthCallbackScheme in Authon(...) and \"<scheme>://\" in the project's allowed origins",
                code: "oauth_callback_scheme_missing"
            )
        }
        let returnTo = "\(scheme)://oauth-callback"
        let verifier = try Self.makeCodeVerifier()
        let challenge = Self.codeChallenge(for: verifier)

        var components = URLComponents()
        components.queryItems = [
            URLQueryItem(name: "redirectUri", value: "\(api.apiURL)/v1/auth/oauth/redirect"),
            URLQueryItem(name: "flow", value: "redirect"),
            URLQueryItem(name: "returnTo", value: returnTo),
            URLQueryItem(name: "codeChallenge", value: challenge),
            URLQueryItem(name: "codeChallengeMethod", value: "S256"),
        ]
        let query = components.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B") ?? ""

        struct OAuthUrlResponse: Decodable {
            let url: String
            let state: String
        }
        let urlResponse: OAuthUrlResponse = try await api.request("GET", "/v1/auth/oauth/\(provider.rawValue)/url?\(query)")
        guard let authURL = URL(string: urlResponse.url) else {
            throw AuthonError(statusCode: 0, message: "Invalid OAuth URL returned by server", code: "invalid_oauth_url")
        }

        let callbackURL = try await runAuthSession(url: authURL, scheme: scheme)
        let items = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false)?.queryItems ?? []
        func value(_ name: String) -> String? { items.first(where: { $0.name == name })?.value }

        guard value("authon_oauth_state") == urlResponse.state else {
            throw AuthonError(statusCode: 0, message: "OAuth state mismatch", code: "oauth_state_mismatch")
        }
        if let error = value("authon_oauth_error") {
            throw AuthonError(statusCode: 0, message: error, code: "oauth_error")
        }
        guard let code = value("authon_code") else {
            throw AuthonError(statusCode: 0, message: "Missing code in OAuth callback", code: "oauth_missing_code")
        }

        struct TokenExchangeRequest: Encodable {
            let code: String
            let codeVerifier: String
        }
        let exchange: OAuthExchangeResponse = try await api.request(
            "POST",
            "/v1/auth/oauth/token",
            body: TokenExchangeRequest(code: code, codeVerifier: verifier)
        )
        return try exchange.sessionOrThrow()
    }

    @MainActor
    private func runAuthSession(url: URL, scheme: String) async throws -> URL {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<URL, Error>) in
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: scheme) { callbackURL, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let callbackURL {
                    continuation.resume(returning: callbackURL)
                } else {
                    continuation.resume(throwing: AuthonError(statusCode: 0, message: "OAuth session returned no URL", code: "oauth_no_url"))
                }
            }
            session.prefersEphemeralWebBrowserSession = true
            session.presentationContextProvider = self
            if !session.start() {
                continuation.resume(throwing: AuthonError(statusCode: 0, message: "Could not start the OAuth session", code: "oauth_session_failed"))
            }
        }
    }

    // MARK: - PKCE

    static func makeCodeVerifier() throws -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        let status = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        guard status == errSecSuccess else {
            throw AuthonError(statusCode: 0, message: "Could not generate a PKCE verifier", code: "pkce_random_failed")
        }
        return base64URL(Data(bytes))
    }

    static func codeChallenge(for verifier: String) -> String {
        base64URL(Data(SHA256.hash(data: Data(verifier.utf8))))
    }

    static func base64URL(_ data: Data) -> String {
        data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    // MARK: - Native Apple Sign In

    #if os(macOS) || os(iOS)
    @MainActor
    private func authenticateWithNativeApple() async throws -> ApiAuthResponse {
        return try await withCheckedThrowingContinuation { continuation in
            self.nativeContinuation = continuation

            let provider = ASAuthorizationAppleIDProvider()
            let request = provider.createRequest()
            request.requestedScopes = [.fullName, .email]

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }
    #endif

    // MARK: - ASWebAuthenticationPresentationContextProviding

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        #if canImport(UIKit)
        if let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first,
           let window = windowScene.windows.first(where: { $0.isKeyWindow }) {
            return window
        }
        return ASPresentationAnchor()
        #elseif canImport(AppKit)
        return NSApplication.shared.keyWindow ?? NSWindow()
        #else
        return ASPresentationAnchor()
        #endif
    }
}

// MARK: - Exchange response

/// `POST /v1/auth/oauth/token` and `/v1/auth/oauth/native` answer either a session or, for users
/// with MFA enabled, `{ mfaRequired: true, mfaToken, mfaMethods }`.
struct OAuthExchangeResponse: Decodable, Sendable {
    let accessToken: String?
    let refreshToken: String?
    let expiresIn: Int?
    let user: AuthonUser?
    let mfaRequired: Bool?
    let mfaToken: String?
    let mfaMethods: [String]?

    /// The session, or `AuthonMfaRequiredError` to continue with `Authon.verifyMfa(mfaToken:code:)`.
    func sessionOrThrow() throws -> ApiAuthResponse {
        if mfaRequired == true {
            guard let mfaToken, !mfaToken.isEmpty else {
                throw AuthonError(statusCode: 0, message: "MFA required but no MFA token was returned", code: "oauth_invalid_mfa_response")
            }
            throw AuthonMfaRequiredError(mfaToken: mfaToken)
        }
        guard let accessToken, let refreshToken, let expiresIn, let user else {
            throw AuthonError(statusCode: 0, message: "Invalid OAuth token response", code: "oauth_invalid_response")
        }
        return ApiAuthResponse(accessToken: accessToken, refreshToken: refreshToken, expiresIn: expiresIn, user: user)
    }
}

// MARK: - ASAuthorizationControllerDelegate (native Apple Sign In)

#if os(macOS) || os(iOS)
extension OAuthManager: ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        #if canImport(UIKit)
        if let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first,
           let window = windowScene.windows.first(where: { $0.isKeyWindow }) {
            return window
        }
        return ASPresentationAnchor()
        #else
        return NSApplication.shared.keyWindow ?? NSWindow()
        #endif
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let continuation = nativeContinuation else { return }
        nativeContinuation = nil

        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            continuation.resume(throwing: AuthonError(
                statusCode: 0,
                message: "Unexpected Apple credential type",
                code: "apple_invalid_credential"
            ))
            return
        }

        guard let identityTokenData = credential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            continuation.resume(throwing: AuthonError(
                statusCode: 0,
                message: "Failed to extract Apple identity token",
                code: "apple_missing_identity_token"
            ))
            return
        }

        Task {
            do {
                let response = try await self.exchangeAppleToken(identityToken: identityToken)
                continuation.resume(returning: response)
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        guard let continuation = nativeContinuation else { return }
        nativeContinuation = nil

        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            continuation.resume(throwing: AuthonError(
                statusCode: 0,
                message: "Apple Sign In was canceled",
                code: "apple_sign_in_canceled"
            ))
        } else {
            continuation.resume(throwing: error)
        }
    }

    private func exchangeAppleToken(identityToken: String) async throws -> ApiAuthResponse {
        #if DEBUG
        // Debug-only: decode JWT to inspect audience (never log tokens in release builds)
        let parts = identityToken.split(separator: ".")
        if parts.count >= 2, let data = Data(base64Encoded: String(parts[1]).padding(toLength: ((parts[1].count + 3) / 4) * 4, withPad: "=", startingAt: 0)) {
            NSLog("[Authon-Apple] token payload: %@", String(data: data, encoding: .utf8) ?? "?")
        }
        #endif

        struct NativeOAuthRequest: Encodable {
            let provider: String
            let identity_token: String
        }

        let exchange: OAuthExchangeResponse = try await api.request(
            "POST",
            "/v1/auth/oauth/native",
            body: NativeOAuthRequest(provider: "apple", identity_token: identityToken)
        )
        return try exchange.sessionOrThrow()
    }
}
#endif
