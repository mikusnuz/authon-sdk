import Foundation
import AuthenticationServices

final class OAuthManager: NSObject, ASWebAuthenticationPresentationContextProviding {
    private let api: AuthonAPI

    #if os(macOS)
    private var nativeContinuation: CheckedContinuation<ApiAuthResponse, Error>?
    #endif

    init(api: AuthonAPI) {
        self.api = api
        super.init()
    }

    // MARK: - OAuth Flow

    func authenticate(provider: OAuthProvider) async throws -> ApiAuthResponse {
        #if os(macOS)
        if provider == .apple {
            return try await authenticateWithNativeApple()
        }
        #endif
        return try await authenticateWithWebOAuth(provider: provider)
    }

    // MARK: - Web OAuth (all platforms / non-Apple providers)

    private func authenticateWithWebOAuth(provider: OAuthProvider) async throws -> ApiAuthResponse {
        // 1. Get the OAuth URL from the server
        let redirectUri = "\(api.apiURL)/v1/auth/oauth/redirect"
        let encodedRedirect = redirectUri.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? redirectUri
        let urlPath = "/v1/auth/oauth/\(provider.rawValue)/url?redirectUri=\(encodedRedirect)&flow=redirect"

        struct OAuthUrlResponse: Decodable {
            let url: String
        }
        let urlResponse: OAuthUrlResponse = try await api.request("GET", urlPath)

        guard let authURL = URL(string: urlResponse.url) else {
            throw AuthonError(statusCode: 0, message: "Invalid OAuth URL returned by server", code: "invalid_oauth_url")
        }

        // 2. Open ASWebAuthenticationSession
        let callbackURL = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<URL, Error>) in
            let session = ASWebAuthenticationSession(
                url: authURL,
                callbackURLScheme: "authon"
            ) { callbackURL, error in
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
            session.start()
        }

        // 3. Extract state from callback URL query params
        guard let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
              let state = components.queryItems?.first(where: { $0.name == "state" })?.value else {
            throw AuthonError(statusCode: 0, message: "Missing state parameter in OAuth callback", code: "oauth_missing_state")
        }

        // 4. Poll for completion
        return try await pollForResult(state: state)
    }

    // MARK: - Native Apple Sign In (macOS only)

    #if os(macOS)
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

    // MARK: - Polling

    private func pollForResult(state: String) async throws -> ApiAuthResponse {
        let maxAttempts = 360  // 3 minutes at 500ms intervals
        let pollInterval: UInt64 = 500_000_000 // 500ms in nanoseconds

        for _ in 0..<maxAttempts {
            let pollPath = "/v1/auth/oauth/poll?state=\(state)"
            let response: OAuthPollResponse = try await api.request("GET", pollPath)

            switch response.status {
            case "completed":
                guard let accessToken = response.accessToken,
                      let refreshToken = response.refreshToken,
                      let expiresIn = response.expiresIn,
                      let user = response.user else {
                    throw AuthonError(statusCode: 0, message: "OAuth completed but missing response data", code: "oauth_incomplete_response")
                }
                return ApiAuthResponse(
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    expiresIn: expiresIn,
                    user: user
                )
            case "error":
                let msg = response.message ?? "OAuth authentication failed"
                throw AuthonError(statusCode: 0, message: msg, code: "oauth_error")
            default:
                try await Task.sleep(nanoseconds: pollInterval)
            }
        }

        throw AuthonError(statusCode: 0, message: "OAuth polling timed out", code: "oauth_timeout")
    }

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

// MARK: - ASAuthorizationControllerDelegate (macOS native Apple Sign In)

#if os(macOS)
extension OAuthManager: ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return NSApplication.shared.keyWindow ?? NSWindow()
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
        struct NativeOAuthRequest: Encodable {
            let provider: String
            let identityToken: String
        }

        return try await api.request(
            "POST",
            "/v1/auth/oauth/native",
            body: NativeOAuthRequest(provider: "apple", identityToken: identityToken)
        )
    }
}
#endif

// MARK: - OAuthPollResponse

struct OAuthPollResponse: Decodable {
    let status: String
    let accessToken: String?
    let refreshToken: String?
    let expiresIn: Int?
    let user: AuthonUser?
    let message: String?
}
