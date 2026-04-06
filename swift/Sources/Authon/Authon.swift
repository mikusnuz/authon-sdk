import Foundation
import Combine

@MainActor
public final class Authon: ObservableObject {
    // MARK: - Published State

    @Published public var user: AuthonUser?
    @Published public var isSignedIn: Bool = false
    @Published public var isLoaded: Bool = false
    @Published public var isLoading: Bool = false

    // MARK: - Internal Components

    private let api: AuthonAPI
    private let sessionManager: SessionManager
    private let oauthManager: OAuthManager
    private let brandingManager: BrandingManager
    private let events = EventEmitter()

    // MARK: - Init

    public init(publishableKey: String, apiURL: String = "https://api.authon.dev") {
        let api = AuthonAPI(publishableKey: publishableKey, apiURL: apiURL)
        self.api = api
        self.brandingManager = BrandingManager(api: api)
        self.oauthManager = OAuthManager(api: api)

        // Temporary placeholders — replaced after init
        var refreshedHandler: ((TokenPair, AuthonUser) -> Void)!
        var expiredHandler: (() -> Void)!

        self.sessionManager = SessionManager(
            publishableKey: publishableKey,
            api: api,
            onRefreshed: { pair, user in refreshedHandler(pair, user) },
            onExpired: { expiredHandler() }
        )

        refreshedHandler = { [weak self] _, user in
            Task { @MainActor [weak self] in
                guard let self else { return }
                self.user = user
                self.isSignedIn = true
                self.events.emit(.tokenRefreshed, data: user)
            }
        }

        expiredHandler = { [weak self] in
            Task { @MainActor [weak self] in
                guard let self else { return }
                // Try one more refresh before giving up
                let recovered = await self.refreshSession()
                if !recovered {
                    self.user = nil
                    self.isSignedIn = false
                    self.events.emit(.signedOut)
                }
            }
        }
    }

    // MARK: - Lifecycle

    public func initialize() async {
        isLoading = true
        defer { isLoading = false; isLoaded = true }

        // Load tokens from keychain
        if let stored = sessionManager.loadFromKeychain(), sessionManager.hasTokens() {
            // Try to validate current token
            do {
                let fetchedUser: AuthonUser = try await api.requestAuth(
                    "GET", "/v1/auth/me", accessToken: stored.accessToken
                )
                user = fetchedUser
                isSignedIn = true
                sessionManager.scheduleRefresh()
            } catch {
                // Token expired, try refresh
                if let refreshed = await sessionManager.refresh() {
                    do {
                        let fetchedUser: AuthonUser = try await api.requestAuth(
                            "GET", "/v1/auth/me", accessToken: refreshed.accessToken
                        )
                        user = fetchedUser
                        isSignedIn = true
                        sessionManager.scheduleRefresh()
                    } catch {
                        // /me failed after refresh — keep tokens for retry, don't destroy session
                        user = nil
                        isSignedIn = false
                    }
                } else {
                    // refresh() returned nil — could be network error or invalid token
                    // Do NOT clear keychain — preserve refreshToken for retry on next app activate
                    user = nil
                    isSignedIn = false
                }
            }
        }

        // Fetch branding in background
        try? await brandingManager.ensureLoaded()
    }

    public func destroy() {
        sessionManager.destroy()
        events.removeAll()
        user = nil
        isSignedIn = false
        isLoaded = false
    }

    // MARK: - Email/Password

    public func signIn(email: String, password: String) async throws -> AuthonUser {
        let body = SignInRequest(email: email, password: password)

        // First, get raw data to check for MFA requirement
        let responseData = try await rawRequest("POST", "/v1/auth/signin", body: body)

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        // Check for MFA
        if let mfaCheck = try? decoder.decode(MfaCheckResponse.self, from: responseData),
           mfaCheck.mfaRequired == true,
           let mfaToken = mfaCheck.mfaToken {
            events.emit(.mfaRequired)
            throw AuthonMfaRequiredError(mfaToken: mfaToken)
        }

        // Check for email verification requirement
        if let verifyCheck = try? decoder.decode(SignInResponse.self, from: responseData),
           verifyCheck.needsVerification == true {
            throw AuthonVerificationRequired(email: verifyCheck.email ?? email)
        }

        let response = try decoder.decode(ApiAuthResponse.self, from: responseData)
        handleAuthSuccess(response)
        return response.user
    }

    public func signUp(email: String, password: String, displayName: String? = nil) async throws -> AuthonUser {
        let body = SignUpRequest(email: email, password: password, displayName: displayName)
        let responseData = try await rawRequest("POST", "/v1/auth/signup", body: body)

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        if let verifyCheck = try? decoder.decode(SignInResponse.self, from: responseData),
           verifyCheck.needsVerification == true {
            throw AuthonVerificationRequired(email: verifyCheck.email ?? email)
        }

        let response = try decoder.decode(ApiAuthResponse.self, from: responseData)
        handleAuthSuccess(response)
        return response.user
    }

    public func verifyEmail(email: String, code: String) async throws -> AuthonUser {
        struct VerifyBody: Encodable {
            let email: String
            let code: String
        }
        let response: ApiAuthResponse = try await api.request(
            "POST", "/v1/auth/verify-email",
            body: VerifyBody(email: email, code: code)
        )
        handleAuthSuccess(response)
        return response.user
    }

    public func resendVerificationCode(email: String) async throws {
        struct ResendBody: Encodable { let email: String }
        struct EmptyResponse: Decodable {}
        let _: EmptyResponse = try await api.request(
            "POST", "/v1/auth/resend-code",
            body: ResendBody(email: email)
        )
    }

    public func signOut() async throws {
        if let token = sessionManager.getAccessToken() {
            try? await api.requestAuthVoid("POST", "/v1/auth/signout", accessToken: token)
        }
        sessionManager.clearKeychain()
        sessionManager.destroy()
        user = nil
        isSignedIn = false
        events.emit(.signedOut)
    }

    // MARK: - User

    public func getUser() async throws -> AuthonUser {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        let fetchedUser: AuthonUser = try await api.requestAuth("GET", "/v1/auth/me", accessToken: token)
        user = fetchedUser
        return fetchedUser
    }

    // MARK: - OAuth

    public func signInWithOAuth(_ provider: OAuthProvider) async throws -> AuthonUser {
        let response = try await oauthManager.authenticate(provider: provider)
        handleAuthSuccess(response)
        return response.user
    }

    // MARK: - MFA

    public func setupMfa() async throws -> MfaSetupResponse {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("POST", "/v1/auth/mfa/totp/setup", accessToken: token)
    }

    public func verifyMfaSetup(code: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable { let code: String }
        try await api.requestAuthVoid("POST", "/v1/auth/mfa/totp/verify-setup", accessToken: token, body: Body(code: code))
    }

    public func verifyMfa(mfaToken: String, code: String) async throws -> AuthonUser {
        struct Body: Encodable {
            let mfaToken: String
            let code: String
        }
        let response: ApiAuthResponse = try await api.request(
            "POST", "/v1/auth/mfa/verify",
            body: Body(mfaToken: mfaToken, code: code)
        )
        handleAuthSuccess(response)
        return response.user
    }

    public func disableMfa(code: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable { let code: String }
        try await api.requestAuthVoid("POST", "/v1/auth/mfa/disable", accessToken: token, body: Body(code: code))
    }

    public func getMfaStatus() async throws -> MfaStatus {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/mfa/status", accessToken: token)
    }

    public func regenerateBackupCodes(code: String) async throws -> [String] {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable { let code: String }
        struct Response: Decodable { let backupCodes: [String] }
        let response: Response = try await api.requestAuth(
            "POST", "/v1/auth/mfa/backup-codes/regenerate",
            accessToken: token, body: Body(code: code)
        )
        return response.backupCodes
    }

    // MARK: - Passwordless

    public func sendMagicLink(email: String) async throws {
        struct Body: Encodable { let email: String }
        try await api.requestVoid("POST", "/v1/auth/passwordless/magic-link", body: Body(email: email))
    }

    public func sendEmailOtp(email: String) async throws {
        struct Body: Encodable { let email: String }
        try await api.requestVoid("POST", "/v1/auth/passwordless/email-otp", body: Body(email: email))
    }

    public func sendSmsOtp(phone: String) async throws {
        struct Body: Encodable { let phone: String }
        try await api.requestVoid("POST", "/v1/auth/passwordless/sms-otp", body: Body(phone: phone))
    }

    public func verifyPasswordless(token: String? = nil, email: String? = nil, code: String? = nil) async throws -> AuthonUser {
        struct Body: Encodable {
            let token: String?
            let email: String?
            let code: String?
        }
        let response: ApiAuthResponse = try await api.request(
            "POST", "/v1/auth/passwordless/verify",
            body: Body(token: token, email: email, code: code)
        )
        handleAuthSuccess(response)
        return response.user
    }

    // MARK: - Passkeys

    public func registerPasskey(name: String? = nil) async throws -> PasskeyCredential {
        guard let accessToken = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }

        // 1. Get registration options from server
        struct OptionsBody: Encodable { let name: String? }
        struct OptionsResponse: Decodable { let options: AnyCodable }
        let optionsResponse: OptionsResponse = try await api.requestAuth(
            "POST", "/v1/auth/passkeys/register/options",
            accessToken: accessToken,
            body: OptionsBody(name: name)
        )

        // TODO: ASAuthorizationController integration
        // Use ASAuthorizationPlatformPublicKeyCredentialProvider with the options
        // to create a platform credential via the system passkey UI.
        // For now, we pass the options directly to verify endpoint as a placeholder.

        // 3. Verify the credential with the server
        let credential: PasskeyCredential = try await api.requestAuth(
            "POST", "/v1/auth/passkeys/register/verify",
            accessToken: accessToken,
            body: optionsResponse.options
        )
        return credential
    }

    public func authenticateWithPasskey(email: String? = nil) async throws -> AuthonUser {
        // 1. Get authentication options from server
        struct OptionsBody: Encodable { let email: String? }
        struct OptionsResponse: Decodable { let options: AnyCodable }
        let optionsResponse: OptionsResponse = try await api.request(
            "POST", "/v1/auth/passkeys/authenticate/options",
            body: OptionsBody(email: email)
        )

        // TODO: ASAuthorizationController integration
        // Use ASAuthorizationPlatformPublicKeyCredentialProvider with the options
        // to authenticate via the system passkey UI.
        // For now, we pass the options directly to verify endpoint as a placeholder.

        // 3. Verify the credential with the server
        let response: ApiAuthResponse = try await api.request(
            "POST", "/v1/auth/passkeys/authenticate/verify",
            body: optionsResponse.options
        )
        handleAuthSuccess(response)
        return response.user
    }

    public func listPasskeys() async throws -> [PasskeyCredential] {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/passkeys", accessToken: token)
    }

    public func renamePasskey(id: String, name: String) async throws -> PasskeyCredential {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable { let name: String }
        return try await api.requestAuth(
            "PATCH", "/v1/auth/passkeys/\(id)",
            accessToken: token, body: Body(name: name)
        )
    }

    public func deletePasskey(id: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        try await api.requestAuthVoid("DELETE", "/v1/auth/passkeys/\(id)", accessToken: token)
    }

    // MARK: - Web3

    public func getWeb3Nonce(address: String, chain: Web3Chain, walletType: Web3WalletType, chainId: Int? = nil) async throws -> Web3NonceResponse {
        struct Body: Encodable {
            let address: String
            let chain: Web3Chain
            let walletType: Web3WalletType
            let chainId: Int?
        }
        return try await api.request(
            "POST", "/v1/auth/web3/nonce",
            body: Body(address: address, chain: chain, walletType: walletType, chainId: chainId)
        )
    }

    public func verifyWeb3Signature(message: String, signature: String, address: String, chain: Web3Chain, walletType: Web3WalletType) async throws -> AuthonUser {
        struct Body: Encodable {
            let message: String
            let signature: String
            let address: String
            let chain: Web3Chain
            let walletType: Web3WalletType
        }
        let response: ApiAuthResponse = try await api.request(
            "POST", "/v1/auth/web3/verify",
            body: Body(message: message, signature: signature, address: address, chain: chain, walletType: walletType)
        )
        handleAuthSuccess(response)
        return response.user
    }

    public func linkWallet(address: String, chain: Web3Chain, walletType: Web3WalletType, chainId: Int? = nil, message: String, signature: String) async throws -> Web3Wallet {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable {
            let address: String
            let chain: Web3Chain
            let walletType: Web3WalletType
            let chainId: Int?
            let message: String
            let signature: String
        }
        return try await api.requestAuth(
            "POST", "/v1/auth/web3/link",
            accessToken: token,
            body: Body(address: address, chain: chain, walletType: walletType, chainId: chainId, message: message, signature: signature)
        )
    }

    public func unlinkWallet(id: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        try await api.requestAuthVoid("DELETE", "/v1/auth/web3/wallets/\(id)", accessToken: token)
    }

    public func listWallets() async throws -> [Web3Wallet] {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/web3/wallets", accessToken: token)
    }

    // MARK: - Profile

    public func updateProfile(_ params: UpdateProfileParams) async throws -> AuthonUser {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        let updatedUser: AuthonUser = try await api.requestAuth(
            "PATCH", "/v1/auth/me", accessToken: token, body: params
        )
        user = updatedUser
        return updatedUser
    }

    // MARK: - Sessions

    public func listSessions() async throws -> [AuthonSession] {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/me/sessions", accessToken: token)
    }

    public func revokeSession(id: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        try await api.requestAuthVoid("DELETE", "/v1/auth/me/sessions/\(id)", accessToken: token)
    }

    public func revokeAllSessions() async throws {
        let sessions = try await listSessions()
        for session in sessions {
            try await revokeSession(id: session.id)
        }
    }

    // MARK: - Organizations

    public func listOrganizations() async throws -> OrganizationListResponse {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/organizations", accessToken: token)
    }

    public func getOrganization(id: String) async throws -> AuthonOrganization {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/organizations/\(id)", accessToken: token)
    }

    public func createOrganization(_ params: CreateOrganizationParams) async throws -> AuthonOrganization {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("POST", "/v1/auth/organizations", accessToken: token, body: params)
    }

    public func updateOrganization(id: String, params: UpdateOrganizationParams) async throws -> AuthonOrganization {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("PATCH", "/v1/auth/organizations/\(id)", accessToken: token, body: params)
    }

    public func deleteOrganization(id: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        try await api.requestAuthVoid("DELETE", "/v1/auth/organizations/\(id)", accessToken: token)
    }

    public func listOrganizationMembers(orgId: String) async throws -> [OrganizationMember] {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/organizations/\(orgId)/members", accessToken: token)
    }

    public func inviteToOrganization(orgId: String, email: String, role: String? = nil) async throws -> OrganizationInvitation {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable {
            let email: String
            let role: String?
        }
        return try await api.requestAuth(
            "POST", "/v1/auth/organizations/\(orgId)/invitations",
            accessToken: token, body: Body(email: email, role: role)
        )
    }

    public func getOrganizationInvitations(orgId: String) async throws -> [OrganizationInvitation] {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        return try await api.requestAuth("GET", "/v1/auth/organizations/\(orgId)/invitations", accessToken: token)
    }

    public func acceptInvitation(token invitationToken: String) async throws -> OrganizationMember {
        struct Body: Encodable { let token: String }
        return try await api.request("POST", "/v1/auth/organizations/invitations/accept", body: Body(token: invitationToken))
    }

    public func rejectInvitation(token invitationToken: String) async throws {
        struct Body: Encodable { let token: String }
        try await api.requestVoid("POST", "/v1/auth/organizations/invitations/reject", body: Body(token: invitationToken))
    }

    public func removeMember(orgId: String, memberId: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        try await api.requestAuthVoid("DELETE", "/v1/auth/organizations/\(orgId)/members/\(memberId)", accessToken: token)
    }

    public func updateMemberRole(orgId: String, memberId: String, role: String) async throws -> OrganizationMember {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        struct Body: Encodable { let role: String }
        return try await api.requestAuth(
            "PATCH", "/v1/auth/organizations/\(orgId)/members/\(memberId)",
            accessToken: token, body: Body(role: role)
        )
    }

    public func leaveOrganization(orgId: String) async throws {
        guard let token = sessionManager.getAccessToken() else {
            throw AuthonError(statusCode: 401, message: "Not authenticated", code: "not_authenticated")
        }
        try await api.requestAuthVoid("POST", "/v1/auth/organizations/\(orgId)/leave", accessToken: token)
    }

    // MARK: - Token

    public func getToken() -> String? {
        return sessionManager.getAccessToken()
    }

    public func isTokenValid() -> Bool {
        return sessionManager.isAuthenticated()
    }

    /// Check token validity and auto-refresh if expired. Returns true if a valid token is available after the call.
    public func ensureValidToken() async -> Bool {
        if sessionManager.isAuthenticated() { return true }
        return await refreshSession()
    }

    public func getRefreshToken() -> String? {
        return sessionManager.getRefreshToken()
    }

    public func refreshSession() async -> Bool {
        if let refreshed = await sessionManager.refresh() {
            do {
                let fetchedUser: AuthonUser = try await api.requestAuth(
                    "GET", "/v1/auth/me", accessToken: refreshed.accessToken
                )
                user = fetchedUser
                isSignedIn = true
                sessionManager.scheduleRefresh() // Re-arm next auto-refresh
                return true
            } catch {
                return false
            }
        }
        return false
    }

    // MARK: - Events

    @discardableResult
    public func on(_ event: AuthonEvent, handler: @escaping (AuthonUser?) -> Void) -> (() -> Void) {
        return events.on(event) { data in
            handler(data as? AuthonUser)
        }
    }

    // MARK: - Branding / Providers

    public func getProviders() async throws -> [OAuthProvider] {
        try await brandingManager.ensureLoaded()
        return brandingManager.getProviders()
    }

    public func getBranding() async throws -> BrandingConfig {
        try await brandingManager.ensureLoaded()
        return brandingManager.getBranding()
    }

    // MARK: - Private Helpers

    private func handleAuthSuccess(_ response: ApiAuthResponse) {
        sessionManager.setTokens(TokenPair(
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            expiresAt: Date().timeIntervalSince1970 * 1000 + Double(response.expiresIn) * 1000
        ))
        user = response.user
        isSignedIn = true
        events.emit(.signedIn, data: response.user)
    }

    /// Performs a raw request and returns the response Data for manual decoding.
    private func rawRequest(_ method: String, _ path: String, body: (any Encodable)? = nil) async throws -> Data {
        guard let url = URL(string: "\(api.apiURL)\(path)") else {
            throw AuthonError(statusCode: 0, message: "Invalid URL", code: "invalid_url")
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(api.publishableKey, forHTTPHeaderField: "x-api-key")
        req.setValue("authon-swift/0.3.0", forHTTPHeaderField: "User-Agent")

        if let body {
            let encoder = JSONEncoder()
            encoder.keyEncodingStrategy = .convertToSnakeCase
            req.httpBody = try encoder.encode(AnyEncodableBox(body))
        }

        let (data, response) = try await URLSession.shared.data(for: req)
        let httpResponse = response as! HTTPURLResponse

        if httpResponse.statusCode >= 400 {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            if let decoded = try? decoder.decode(AuthonError.self, from: data) {
                throw AuthonError(statusCode: httpResponse.statusCode, message: decoded.message, code: decoded.code)
            }
            let text = String(data: data, encoding: .utf8) ?? HTTPURLResponse.localizedString(forStatusCode: httpResponse.statusCode)
            throw AuthonError(statusCode: httpResponse.statusCode, message: text, code: nil)
        }

        return data
    }
}

// MARK: - MfaCheckResponse

private struct MfaCheckResponse: Decodable {
    let mfaRequired: Bool?
    let mfaToken: String?
    let accessToken: String?
}

// MARK: - SignInResponse (verification check)

private struct SignInResponse: Decodable {
    let accessToken: String?
    let refreshToken: String?
    let expiresIn: Int?
    let user: AuthonUser?
    let needsVerification: Bool?
    let email: String?
}

// MARK: - AuthonVerificationRequired

public struct AuthonVerificationRequired: Error {
    public let email: String
    public init(email: String) { self.email = email }
}

// MARK: - AnyEncodableBox (for rawRequest)

private struct AnyEncodableBox: Encodable {
    private let _encode: (Encoder) throws -> Void

    init(_ wrapped: any Encodable) {
        _encode = { encoder in
            try wrapped.encode(to: encoder)
        }
    }

    func encode(to encoder: Encoder) throws {
        try _encode(encoder)
    }
}
