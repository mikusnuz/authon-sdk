import Foundation

final class AuthonAPI: Sendable {
    let publishableKey: String
    let apiURL: String
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(publishableKey: String, apiURL: String) {
        self.publishableKey = publishableKey
        self.apiURL = apiURL.hasSuffix("/") ? String(apiURL.dropLast()) : apiURL
        self.session = .shared
        let dec = JSONDecoder()
        dec.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder = dec
        let enc = JSONEncoder()
        enc.keyEncodingStrategy = .convertToSnakeCase
        self.encoder = enc
    }

    // MARK: - Public API

    func request<T: Decodable>(_ method: String, _ path: String, body: (any Encodable)? = nil) async throws -> T {
        let req = try buildRequest(method: method, path: path, accessToken: nil, body: body)
        return try await perform(req)
    }

    func requestVoid(_ method: String, _ path: String, body: (any Encodable)? = nil) async throws {
        let req = try buildRequest(method: method, path: path, accessToken: nil, body: body)
        try await performVoid(req)
    }

    func requestAuth<T: Decodable>(_ method: String, _ path: String, accessToken: String, body: (any Encodable)? = nil) async throws -> T {
        let req = try buildRequest(method: method, path: path, accessToken: accessToken, body: body)
        return try await perform(req)
    }

    func requestAuthVoid(_ method: String, _ path: String, accessToken: String, body: (any Encodable)? = nil) async throws {
        let req = try buildRequest(method: method, path: path, accessToken: accessToken, body: body)
        try await performVoid(req)
    }

    // MARK: - Private

    private func buildRequest(method: String, path: String, accessToken: String?, body: (any Encodable)?) throws -> URLRequest {
        guard let url = URL(string: "\(apiURL)\(path)") else {
            throw AuthonError(statusCode: 0, message: "Invalid URL: \(apiURL)\(path)", code: "invalid_url")
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(publishableKey, forHTTPHeaderField: "x-api-key")
        req.setValue("authon-swift/0.3.0", forHTTPHeaderField: "User-Agent")

        if let accessToken {
            req.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            req.httpBody = try encoder.encode(AnyEncodableWrapper(body))
        }

        return req
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        let httpResponse = response as! HTTPURLResponse

        if httpResponse.statusCode >= 400 {
            throw try parseError(data: data, statusCode: httpResponse.statusCode)
        }

        return try decoder.decode(T.self, from: data)
    }

    private func performVoid(_ request: URLRequest) async throws {
        let (data, response) = try await session.data(for: request)
        let httpResponse = response as! HTTPURLResponse

        if httpResponse.statusCode >= 400 {
            throw try parseError(data: data, statusCode: httpResponse.statusCode)
        }
    }

    private func parseError(data: Data, statusCode: Int) throws -> AuthonError {
        if let decoded = try? decoder.decode(AuthonError.self, from: data) {
            return AuthonError(statusCode: statusCode, message: decoded.message, code: decoded.code)
        }
        let text = String(data: data, encoding: .utf8) ?? HTTPURLResponse.localizedString(forStatusCode: statusCode)
        return AuthonError(statusCode: statusCode, message: text, code: nil)
    }
}

// MARK: - AnyEncodableWrapper

private struct AnyEncodableWrapper: Encodable {
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
