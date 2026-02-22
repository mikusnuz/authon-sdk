import Foundation

/// Server-side Authup client for Swift.
public final class AuthupBackend: Sendable {
    private let secretKey: String
    private let apiURL: String
    private let session: URLSession
    private let decoder: JSONDecoder

    public let users: UserService
    public let webhooks: WebhookServiceProxy

    /// Creates a new backend client.
    ///
    /// - Parameters:
    ///   - secretKey: Your Authup secret API key.
    ///   - apiURL: Custom API base URL (defaults to `https://api.authup.dev`).
    ///   - session: Custom URLSession (defaults to `.shared`).
    public init(
        secretKey: String,
        apiURL: String = "https://api.authup.dev",
        session: URLSession = .shared
    ) {
        self.secretKey = secretKey
        self.apiURL = apiURL.hasSuffix("/") ? String(apiURL.dropLast()) : apiURL
        self.session = session
        self.decoder = JSONDecoder()
        self.users = UserService(secretKey: secretKey, apiURL: self.apiURL, session: session)
        self.webhooks = WebhookServiceProxy()
    }

    /// Verifies an access token and returns the associated user.
    public func verifyToken(_ accessToken: String) async throws -> User {
        var request = try makeRequest(method: "GET", path: "/v1/auth/verify")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        return try await perform(request)
    }

    private func makeRequest(method: String, path: String, body: (any Encodable)? = nil) throws -> URLRequest {
        guard let url = URL(string: "\(apiURL)\(path)") else {
            throw AuthupError(statusCode: 0, message: "Invalid URL: \(apiURL)\(path)", code: nil)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(secretKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("authup-swift/0.1.0", forHTTPHeaderField: "User-Agent")

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthupError(statusCode: 0, message: "Invalid response", code: nil)
        }

        if httpResponse.statusCode >= 400 {
            if let apiError = try? decoder.decode(AuthupError.self, from: data) {
                throw AuthupError(
                    statusCode: httpResponse.statusCode,
                    message: apiError.message,
                    code: apiError.code
                )
            }
            throw AuthupError(
                statusCode: httpResponse.statusCode,
                message: String(data: data, encoding: .utf8) ?? "Unknown error",
                code: nil
            )
        }

        return try decoder.decode(T.self, from: data)
    }

    private func performVoid(_ request: URLRequest) async throws {
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthupError(statusCode: 0, message: "Invalid response", code: nil)
        }

        if httpResponse.statusCode >= 400 {
            if let apiError = try? decoder.decode(AuthupError.self, from: data) {
                throw AuthupError(
                    statusCode: httpResponse.statusCode,
                    message: apiError.message,
                    code: apiError.code
                )
            }
            throw AuthupError(
                statusCode: httpResponse.statusCode,
                message: String(data: data, encoding: .utf8) ?? "Unknown error",
                code: nil
            )
        }
    }
}

/// Handles user management operations.
public final class UserService: Sendable {
    private let secretKey: String
    private let apiURL: String
    private let session: URLSession
    private let decoder: JSONDecoder

    init(secretKey: String, apiURL: String, session: URLSession) {
        self.secretKey = secretKey
        self.apiURL = apiURL
        self.session = session
        self.decoder = JSONDecoder()
    }

    /// Lists users with optional pagination.
    public func list(options: ListOptions? = nil) async throws -> ListResult<User> {
        var path = "/v1/users"
        if let options = options {
            var params: [String] = []
            if let page = options.page { params.append("page=\(page)") }
            if let perPage = options.perPage { params.append("perPage=\(perPage)") }
            if !params.isEmpty { path += "?\(params.joined(separator: "&"))" }
        }
        return try await perform(makeRequest(method: "GET", path: path))
    }

    /// Gets a user by ID.
    public func get(_ userId: String) async throws -> User {
        return try await perform(makeRequest(method: "GET", path: "/v1/users/\(userId)"))
    }

    /// Creates a new user.
    public func create(_ params: CreateUserParams) async throws -> User {
        return try await perform(makeRequest(method: "POST", path: "/v1/users", body: params))
    }

    /// Updates an existing user.
    public func update(_ userId: String, params: UpdateUserParams) async throws -> User {
        return try await perform(makeRequest(method: "PATCH", path: "/v1/users/\(userId)", body: params))
    }

    /// Deletes a user by ID.
    public func delete(_ userId: String) async throws {
        try await performVoid(makeRequest(method: "DELETE", path: "/v1/users/\(userId)"))
    }

    /// Bans a user by ID.
    public func ban(_ userId: String) async throws -> User {
        return try await perform(makeRequest(method: "POST", path: "/v1/users/\(userId)/ban"))
    }

    /// Unbans a user by ID.
    public func unban(_ userId: String) async throws -> User {
        return try await perform(makeRequest(method: "POST", path: "/v1/users/\(userId)/unban"))
    }

    private func makeRequest(method: String, path: String, body: (any Encodable)? = nil) throws -> URLRequest {
        guard let url = URL(string: "\(apiURL)\(path)") else {
            throw AuthupError(statusCode: 0, message: "Invalid URL", code: nil)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(secretKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("authup-swift/0.1.0", forHTTPHeaderField: "User-Agent")

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthupError(statusCode: 0, message: "Invalid response", code: nil)
        }
        if httpResponse.statusCode >= 400 {
            if let apiError = try? decoder.decode(AuthupError.self, from: data) {
                throw AuthupError(statusCode: httpResponse.statusCode, message: apiError.message, code: apiError.code)
            }
            throw AuthupError(statusCode: httpResponse.statusCode, message: String(data: data, encoding: .utf8) ?? "Unknown error", code: nil)
        }
        return try decoder.decode(T.self, from: data)
    }

    private func performVoid(_ request: URLRequest) async throws {
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthupError(statusCode: 0, message: "Invalid response", code: nil)
        }
        if httpResponse.statusCode >= 400 {
            if let apiError = try? decoder.decode(AuthupError.self, from: data) {
                throw AuthupError(statusCode: httpResponse.statusCode, message: apiError.message, code: apiError.code)
            }
            throw AuthupError(statusCode: httpResponse.statusCode, message: String(data: data, encoding: .utf8) ?? "Unknown error", code: nil)
        }
    }
}

/// Proxy for webhook verification (delegates to `WebhookVerifier`).
public final class WebhookServiceProxy: Sendable {
    /// Verifies a webhook payload and returns the parsed data.
    public func verify(payload: Data, signature: String, secret: String) throws -> [String: Any] {
        return try WebhookVerifier.verify(payload: payload, signature: signature, secret: secret)
    }
}
