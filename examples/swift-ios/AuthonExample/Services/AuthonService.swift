import Foundation
import Security
import AuthenticationServices

// MARK: - Keychain Helper

private enum Keychain {
    static let accessTokenKey  = "authon.accessToken"
    static let refreshTokenKey = "authon.refreshToken"

    static func save(_ value: String, forKey key: String) {
        let data = Data(value.utf8)
        let query: [CFString: Any] = [
            kSecClass:           kSecClassGenericPassword,
            kSecAttrAccount:     key,
            kSecValueData:       data,
            kSecAttrAccessible:  kSecAttrAccessibleWhenUnlocked,
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    static func load(forKey key: String) -> String? {
        let query: [CFString: Any] = [
            kSecClass:       kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecReturnData:  true,
            kSecMatchLimit:  kSecMatchLimitOne,
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8)
        else { return nil }
        return string
    }

    static func delete(forKey key: String) {
        let query: [CFString: Any] = [
            kSecClass:       kSecClassGenericPassword,
            kSecAttrAccount: key,
        ]
        SecItemDelete(query as CFDictionary)
    }

    static func clearAll() {
        delete(forKey: accessTokenKey)
        delete(forKey: refreshTokenKey)
    }
}

// MARK: - AuthonService

@MainActor
final class AuthonService: NSObject, ObservableObject {

    static let shared = AuthonService()

    // Replace with your Authon publishable key and project base URL
    private let baseURL   = "https://api.authon.dev"
    private let projectId = "YOUR_PROJECT_ID"

    @Published var currentUser: AppUser?
    @Published var isLoading: Bool = false

    private let urlSession: URLSession
    private var webAuthSession: ASWebAuthenticationSession?

    override private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.urlSession = URLSession(configuration: config)
        super.init()
        Task { await loadStoredSession() }
    }

    var isAuthenticated: Bool { currentUser != nil }

    var accessToken: String? { Keychain.load(forKey: Keychain.accessTokenKey) }

    // MARK: - Session Restoration

    private func loadStoredSession() async {
        guard let token = Keychain.load(forKey: Keychain.accessTokenKey) else { return }
        do {
            let user = try await fetchCurrentUser(token: token)
            self.currentUser = user
        } catch {
            Keychain.clearAll()
        }
    }

    // MARK: - Sign Up

    func signUp(email: String, password: String, firstName: String? = nil, lastName: String? = nil) async throws -> AppUser {
        struct Body: Encodable {
            let email: String
            let password: String
            let firstName: String?
            let lastName: String?
        }
        let body = Body(email: email, password: password, firstName: firstName, lastName: lastName)
        let response: SignUpResponse = try await request(method: "POST", path: "/v1/auth/sign-up", body: body)
        persist(response.accessToken, refresh: response.refreshToken)
        currentUser = response.user
        return response.user
    }

    // MARK: - Sign In

    func signIn(email: String, password: String) async throws -> AppUser {
        struct Body: Encodable {
            let email: String
            let password: String
        }
        let response: SignInResponse = try await request(method: "POST", path: "/v1/auth/sign-in", body: Body(email: email, password: password))
        persist(response.accessToken, refresh: response.refreshToken)
        currentUser = response.user
        return response.user
    }

    // MARK: - Sign Out

    func signOut() async throws {
        if let token = Keychain.load(forKey: Keychain.accessTokenKey) {
            _ = try? await requestVoid(method: "POST", path: "/v1/auth/sign-out", token: token)
        }
        Keychain.clearAll()
        currentUser = nil
    }

    // MARK: - OAuth

    func signInWithOAuth(provider: String, presentationAnchor: ASPresentationAnchor) async throws -> AppUser {
        let callbackScheme = "authon-example"
        let authURL = URL(string: "\(baseURL)/v1/auth/oauth/\(provider)?redirect_uri=\(callbackScheme)://oauth/callback&project_id=\(projectId)")!

        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: authURL, callbackURLScheme: callbackScheme) { [weak self] callbackURL, error in
                guard let self = self else { return }
                if let error = error {
                    continuation.resume(throwing: AuthError.networkError(error.localizedDescription))
                    return
                }
                guard let callbackURL = callbackURL,
                      let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
                      let token = components.queryItems?.first(where: { $0.name == "access_token" })?.value
                else {
                    continuation.resume(throwing: AuthError.unknown)
                    return
                }
                Task { @MainActor in
                    do {
                        let user = try await self.fetchCurrentUser(token: token)
                        let refreshToken = components.queryItems?.first(where: { $0.name == "refresh_token" })?.value
                        self.persist(token, refresh: refreshToken)
                        self.currentUser = user
                        continuation.resume(returning: user)
                    } catch {
                        continuation.resume(throwing: error)
                    }
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            self.webAuthSession = session
            session.start()
        }
    }

    // MARK: - MFA

    func getMfaStatus() async throws -> MfaStatus {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        return try await request(method: "GET", path: "/v1/auth/mfa/status", token: token)
    }

    func setupMfa() async throws -> MfaSetupResponse {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        return try await request(method: "POST", path: "/v1/auth/mfa/totp/setup", token: token)
    }

    func verifyMfa(code: String) async throws {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        struct Body: Encodable { let code: String }
        let response: MfaVerifyResponse = try await request(
            method: "POST", path: "/v1/auth/mfa/totp/verify",
            body: Body(code: code), token: token
        )
        persist(response.accessToken, refresh: response.refreshToken)
    }

    func disableMfa(code: String) async throws {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        struct Body: Encodable { let code: String }
        try await requestVoid(method: "DELETE", path: "/v1/auth/mfa/totp", body: Body(code: code), token: token)
    }

    // MARK: - Sessions

    func listSessions() async throws -> [AppSession] {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        struct SessionsResponse: Decodable { let data: [AppSession] }
        let response: SessionsResponse = try await request(method: "GET", path: "/v1/auth/sessions", token: token)
        return response.data
    }

    func revokeSession(id: String) async throws {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        try await requestVoid(method: "DELETE", path: "/v1/auth/sessions/\(id)", token: token)
    }

    // MARK: - Profile

    func updateProfile(firstName: String?, lastName: String?, username: String?) async throws -> AppUser {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        struct Body: Encodable { let firstName: String?; let lastName: String?; let username: String? }
        let user: AppUser = try await request(
            method: "PATCH", path: "/v1/auth/me",
            body: Body(firstName: firstName, lastName: lastName, username: username),
            token: token
        )
        currentUser = user
        return user
    }

    // MARK: - Password Reset

    func requestPasswordReset(email: String) async throws {
        struct Body: Encodable { let email: String }
        try await requestVoid(method: "POST", path: "/v1/auth/password/reset-request", body: Body(email: email))
    }

    func resetPassword(token: String, newPassword: String) async throws {
        struct Body: Encodable { let token: String; let password: String }
        try await requestVoid(method: "POST", path: "/v1/auth/password/reset", body: Body(token: token, password: newPassword))
    }

    // MARK: - Delete Account

    func deleteAccount(password: String) async throws {
        guard let token = accessToken else { throw AuthError.tokenMissing }
        struct Body: Encodable { let password: String }
        try await requestVoid(method: "DELETE", path: "/v1/auth/me", body: Body(password: password), token: token)
        Keychain.clearAll()
        currentUser = nil
    }

    // MARK: - Internal Helpers

    private func fetchCurrentUser(token: String) async throws -> AppUser {
        return try await request(method: "GET", path: "/v1/auth/me", token: token)
    }

    private func persist(_ access: String, refresh: String?) {
        Keychain.save(access, forKey: Keychain.accessTokenKey)
        if let refresh = refresh {
            Keychain.save(refresh, forKey: Keychain.refreshTokenKey)
        }
    }

    private func request<T: Decodable>(
        method: String,
        path: String,
        body: (any Encodable)? = nil,
        token: String? = nil
    ) async throws -> T {
        let urlRequest = try buildRequest(method: method, path: path, body: body, token: token)
        let (data, response) = try await urlSession.data(for: urlRequest)
        try validate(response: response, data: data)
        return try JSONDecoder().decode(T.self, from: data)
    }

    @discardableResult
    private func requestVoid(
        method: String,
        path: String,
        body: (any Encodable)? = nil,
        token: String? = nil
    ) async throws -> Void {
        let urlRequest = try buildRequest(method: method, path: path, body: body, token: token)
        let (data, response) = try await urlSession.data(for: urlRequest)
        try validate(response: response, data: data)
    }

    private func buildRequest(
        method: String,
        path: String,
        body: (any Encodable)?,
        token: String?
    ) throws -> URLRequest {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw AuthError.networkError("Invalid URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("authon-swift-ios/1.0.0", forHTTPHeaderField: "User-Agent")
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }
        return request
    }

    private func validate(response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else { throw AuthError.unknown }
        guard http.statusCode < 400 else {
            struct ErrorBody: Decodable { let message: String }
            let message = (try? JSONDecoder().decode(ErrorBody.self, from: data))?.message ?? HTTPURLResponse.localizedString(forStatusCode: http.statusCode)
            throw AuthError.serverError(http.statusCode, message)
        }
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension AuthonService: ASWebAuthenticationPresentationContextProviding {
    nonisolated func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        DispatchQueue.main.sync {
            UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first(where: { $0.isKeyWindow }) ?? ASPresentationAnchor()
        }
    }
}
