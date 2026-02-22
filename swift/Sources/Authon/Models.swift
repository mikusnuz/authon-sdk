import Foundation

/// Represents an Authon user.
public struct User: Codable, Sendable {
    public let id: String
    public let email: String?
    public let emailVerified: Bool
    public let phone: String?
    public let phoneVerified: Bool
    public let username: String?
    public let firstName: String?
    public let lastName: String?
    public let displayName: String?
    public let avatarUrl: String?
    public let banned: Bool
    public let metadata: [String: AnyCodable]?
    public let externalAccounts: [ExternalAccount]?
    public let createdAt: String
    public let updatedAt: String
}

/// Represents an OAuth-linked external account.
public struct ExternalAccount: Codable, Sendable {
    public let provider: String
    public let providerId: String
    public let email: String?
}

/// Represents an active user session.
public struct Session: Codable, Sendable {
    public let id: String
    public let userId: String
    public let status: String
    public let lastActiveAt: String
    public let expireAt: String
    public let createdAt: String
}

/// Represents an incoming webhook event.
public struct WebhookEvent: Codable, Sendable {
    public let id: String
    public let type: String
    public let data: AnyCodable
    public let timestamp: String
}

/// A paginated list response.
public struct ListResult<T: Codable>: Codable where T: Sendable {
    public let data: [T]
    public let totalCount: Int
    public let page: Int
    public let perPage: Int
}

/// Options for list endpoints.
public struct ListOptions: Sendable {
    public let page: Int?
    public let perPage: Int?

    public init(page: Int? = nil, perPage: Int? = nil) {
        self.page = page
        self.perPage = perPage
    }
}

/// Parameters for creating a user.
public struct CreateUserParams: Codable, Sendable {
    public let email: String?
    public let phone: String?
    public let username: String?
    public let firstName: String?
    public let lastName: String?
    public let password: String?
    public let metadata: [String: AnyCodable]?

    public init(
        email: String? = nil,
        phone: String? = nil,
        username: String? = nil,
        firstName: String? = nil,
        lastName: String? = nil,
        password: String? = nil,
        metadata: [String: AnyCodable]? = nil
    ) {
        self.email = email
        self.phone = phone
        self.username = username
        self.firstName = firstName
        self.lastName = lastName
        self.password = password
        self.metadata = metadata
    }
}

/// Parameters for updating a user.
public struct UpdateUserParams: Codable, Sendable {
    public let email: String?
    public let phone: String?
    public let username: String?
    public let firstName: String?
    public let lastName: String?
    public let metadata: [String: AnyCodable]?

    public init(
        email: String? = nil,
        phone: String? = nil,
        username: String? = nil,
        firstName: String? = nil,
        lastName: String? = nil,
        metadata: [String: AnyCodable]? = nil
    ) {
        self.email = email
        self.phone = phone
        self.username = username
        self.firstName = firstName
        self.lastName = lastName
        self.metadata = metadata
    }
}

/// API error response.
public struct AuthonError: Error, Codable, Sendable {
    public let statusCode: Int
    public let message: String
    public let code: String?

    public var localizedDescription: String {
        if let code = code {
            return "\(code): \(message)"
        }
        return message
    }
}

/// A type-erased Codable value for dynamic JSON.
public struct AnyCodable: Codable, Sendable {
    public let value: Any

    public init(_ value: Any) {
        self.value = value
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self.value = NSNull()
        } else if let bool = try? container.decode(Bool.self) {
            self.value = bool
        } else if let int = try? container.decode(Int.self) {
            self.value = int
        } else if let double = try? container.decode(Double.self) {
            self.value = double
        } else if let string = try? container.decode(String.self) {
            self.value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            self.value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            self.value = dict.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported type")
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case is NSNull:
            try container.encodeNil()
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, .init(codingPath: encoder.codingPath, debugDescription: "Unsupported type"))
        }
    }
}
