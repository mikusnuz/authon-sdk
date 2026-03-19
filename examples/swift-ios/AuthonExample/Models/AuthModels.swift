import Foundation

struct AppUser: Codable {
    let id: String
    let email: String?
    let emailVerified: Bool
    let phone: String?
    let username: String?
    let firstName: String?
    let lastName: String?
    let displayName: String?
    let avatarUrl: String?
    let createdAt: String
    let updatedAt: String

    var fullName: String {
        let parts = [firstName, lastName].compactMap { $0 }.filter { !$0.isEmpty }
        if !parts.isEmpty { return parts.joined(separator: " ") }
        return displayName ?? username ?? email ?? "User"
    }
}

struct AppSession: Codable, Identifiable {
    let id: String
    let userId: String
    let status: String
    let lastActiveAt: String
    let expireAt: String
    let createdAt: String
}

struct MfaStatus: Codable {
    let enabled: Bool
    let totpConfigured: Bool
    let backupCodesRemaining: Int?
}

struct TokenPair: Codable {
    let accessToken: String
    let refreshToken: String?
}

struct SignInResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let user: AppUser
}

struct SignUpResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let user: AppUser
}

struct MfaSetupResponse: Codable {
    let secret: String
    let qrCodeUrl: String
    let backupCodes: [String]?
}

struct MfaVerifyResponse: Codable {
    let accessToken: String
    let refreshToken: String?
}

struct OAuthProvider: Identifiable {
    let id: String
    let displayName: String
    let iconSystemName: String
    let backgroundColor: String

    static let all: [OAuthProvider] = [
        OAuthProvider(id: "google",    displayName: "Google",    iconSystemName: "g.circle.fill",   backgroundColor: "#DB4437"),
        OAuthProvider(id: "github",    displayName: "GitHub",    iconSystemName: "chevron.left.forwardslash.chevron.right", backgroundColor: "#24292E"),
        OAuthProvider(id: "apple",     displayName: "Apple",     iconSystemName: "apple.logo",       backgroundColor: "#000000"),
        OAuthProvider(id: "twitter",   displayName: "Twitter",   iconSystemName: "bird.fill",        backgroundColor: "#1DA1F2"),
        OAuthProvider(id: "facebook",  displayName: "Facebook",  iconSystemName: "f.circle.fill",    backgroundColor: "#1877F2"),
        OAuthProvider(id: "discord",   displayName: "Discord",   iconSystemName: "gamecontroller.fill", backgroundColor: "#5865F2"),
        OAuthProvider(id: "linkedin",  displayName: "LinkedIn",  iconSystemName: "link.circle.fill", backgroundColor: "#0A66C2"),
        OAuthProvider(id: "microsoft", displayName: "Microsoft", iconSystemName: "square.grid.2x2.fill", backgroundColor: "#00A4EF"),
        OAuthProvider(id: "twitch",    displayName: "Twitch",    iconSystemName: "play.tv.fill",     backgroundColor: "#9146FF"),
        OAuthProvider(id: "spotify",   displayName: "Spotify",   iconSystemName: "music.note.list",  backgroundColor: "#1DB954"),
    ]
}

enum AuthError: LocalizedError {
    case invalidCredentials
    case networkError(String)
    case tokenMissing
    case mfaRequired
    case serverError(Int, String)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:   return "Invalid email or password."
        case .networkError(let m):  return "Network error: \(m)"
        case .tokenMissing:         return "Session token not found. Please sign in again."
        case .mfaRequired:          return "Two-factor authentication is required."
        case .serverError(let c, let m): return "Server error \(c): \(m)"
        case .unknown:              return "An unexpected error occurred."
        }
    }
}
