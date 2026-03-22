import Foundation

// MARK: - AuthonUser

public struct AuthonUser: Codable, Sendable, Identifiable {
    public let id: String
    public let projectId: String
    public let email: String?
    public let displayName: String?
    public let avatarUrl: String?
    public let phone: String?
    public let emailVerified: Bool
    public let phoneVerified: Bool
    public let isBanned: Bool
    public let publicMetadata: [String: AnyCodable]?
    public let lastSignInAt: String?
    public let signInCount: Int
    public let createdAt: String
    public let updatedAt: String

    public init(
        id: String,
        projectId: String,
        email: String? = nil,
        displayName: String? = nil,
        avatarUrl: String? = nil,
        phone: String? = nil,
        emailVerified: Bool = false,
        phoneVerified: Bool = false,
        isBanned: Bool = false,
        publicMetadata: [String: AnyCodable]? = nil,
        lastSignInAt: String? = nil,
        signInCount: Int = 0,
        createdAt: String,
        updatedAt: String
    ) {
        self.id = id
        self.projectId = projectId
        self.email = email
        self.displayName = displayName
        self.avatarUrl = avatarUrl
        self.phone = phone
        self.emailVerified = emailVerified
        self.phoneVerified = phoneVerified
        self.isBanned = isBanned
        self.publicMetadata = publicMetadata
        self.lastSignInAt = lastSignInAt
        self.signInCount = signInCount
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// MARK: - AuthonSession

public struct AuthonSession: Codable, Sendable, Identifiable {
    public let id: String
    public let userId: String
    public let ipAddress: String?
    public let userAgent: String?
    public let deviceName: String?
    public let lastActiveAt: String?
    public let createdAt: String
    public let expiresAt: String

    public init(
        id: String,
        userId: String,
        ipAddress: String? = nil,
        userAgent: String? = nil,
        deviceName: String? = nil,
        lastActiveAt: String? = nil,
        createdAt: String,
        expiresAt: String
    ) {
        self.id = id
        self.userId = userId
        self.ipAddress = ipAddress
        self.userAgent = userAgent
        self.deviceName = deviceName
        self.lastActiveAt = lastActiveAt
        self.createdAt = createdAt
        self.expiresAt = expiresAt
    }
}

// MARK: - PasswordlessMethod

public enum PasswordlessMethod: String, Codable, Sendable {
    case magicLink = "magic_link"
    case emailOtp = "email_otp"
    case both
}

// MARK: - BrandingConfig

public struct BrandingConfig: Codable, Sendable {
    public var logoDataUrl: String?
    public var brandName: String?
    public var primaryColorStart: String?
    public var primaryColorEnd: String?
    public var lightBg: String?
    public var lightText: String?
    public var darkBg: String?
    public var darkText: String?
    public var borderRadius: Int?
    public var providerOrder: [String]?
    public var hiddenProviders: [String]?
    public var showEmailPassword: Bool?
    public var showDivider: Bool?
    public var termsUrl: String?
    public var privacyUrl: String?
    public var customCss: String?
    public var locale: String?
    public var showSecuredBy: Bool?
    public var showWeb3: Bool?
    public var showPasswordless: Bool?
    public var showPasskey: Bool?
    public var passwordlessMethod: PasswordlessMethod?

    public static let `default` = BrandingConfig(
        primaryColorStart: "#7c3aed",
        primaryColorEnd: "#4f46e5",
        lightBg: "#ffffff",
        lightText: "#111827",
        darkBg: "#0f172a",
        darkText: "#f1f5f9",
        borderRadius: 12,
        showEmailPassword: true,
        showDivider: true,
        locale: "en",
        showSecuredBy: true
    )

    public init(
        logoDataUrl: String? = nil,
        brandName: String? = nil,
        primaryColorStart: String? = nil,
        primaryColorEnd: String? = nil,
        lightBg: String? = nil,
        lightText: String? = nil,
        darkBg: String? = nil,
        darkText: String? = nil,
        borderRadius: Int? = nil,
        providerOrder: [String]? = nil,
        hiddenProviders: [String]? = nil,
        showEmailPassword: Bool? = nil,
        showDivider: Bool? = nil,
        termsUrl: String? = nil,
        privacyUrl: String? = nil,
        customCss: String? = nil,
        locale: String? = nil,
        showSecuredBy: Bool? = nil,
        showWeb3: Bool? = nil,
        showPasswordless: Bool? = nil,
        showPasskey: Bool? = nil,
        passwordlessMethod: PasswordlessMethod? = nil
    ) {
        self.logoDataUrl = logoDataUrl
        self.brandName = brandName
        self.primaryColorStart = primaryColorStart
        self.primaryColorEnd = primaryColorEnd
        self.lightBg = lightBg
        self.lightText = lightText
        self.darkBg = darkBg
        self.darkText = darkText
        self.borderRadius = borderRadius
        self.providerOrder = providerOrder
        self.hiddenProviders = hiddenProviders
        self.showEmailPassword = showEmailPassword
        self.showDivider = showDivider
        self.termsUrl = termsUrl
        self.privacyUrl = privacyUrl
        self.customCss = customCss
        self.locale = locale
        self.showSecuredBy = showSecuredBy
        self.showWeb3 = showWeb3
        self.showPasswordless = showPasswordless
        self.showPasskey = showPasskey
        self.passwordlessMethod = passwordlessMethod
    }
}

// MARK: - MFA Types

public struct MfaSetupResponse: Codable, Sendable {
    public let secret: String
    public let qrCodeUri: String
    public let backupCodes: [String]

    public init(secret: String, qrCodeUri: String, backupCodes: [String]) {
        self.secret = secret
        self.qrCodeUri = qrCodeUri
        self.backupCodes = backupCodes
    }
}

public struct MfaStatus: Codable, Sendable {
    public let enabled: Bool
    public let backupCodesRemaining: Int

    public init(enabled: Bool, backupCodesRemaining: Int) {
        self.enabled = enabled
        self.backupCodesRemaining = backupCodesRemaining
    }
}

// MARK: - Passkey Types

public struct PasskeyCredential: Codable, Sendable, Identifiable {
    public let id: String
    public let name: String?
    public let createdAt: String
    public let lastUsedAt: String?

    public init(id: String, name: String? = nil, createdAt: String, lastUsedAt: String? = nil) {
        self.id = id
        self.name = name
        self.createdAt = createdAt
        self.lastUsedAt = lastUsedAt
    }
}

// MARK: - Web3 Types

public enum Web3Chain: String, Codable, Sendable {
    case evm
    case solana
}

public enum Web3WalletType: String, Codable, Sendable {
    case metamask
    case pexus
    case walletconnect
    case coinbase
    case phantom
    case trust
    case other
}

public struct Web3Wallet: Codable, Sendable, Identifiable {
    public let id: String
    public let address: String
    public let chain: Web3Chain
    public let walletType: Web3WalletType
    public let chainId: Int?
    public let createdAt: String

    public init(
        id: String,
        address: String,
        chain: Web3Chain,
        walletType: Web3WalletType,
        chainId: Int? = nil,
        createdAt: String
    ) {
        self.id = id
        self.address = address
        self.chain = chain
        self.walletType = walletType
        self.chainId = chainId
        self.createdAt = createdAt
    }
}

public struct Web3NonceResponse: Codable, Sendable {
    public let message: String
    public let nonce: String

    public init(message: String, nonce: String) {
        self.message = message
        self.nonce = nonce
    }
}

// MARK: - Organization Types

public struct AuthonOrganization: Codable, Sendable, Identifiable {
    public let id: String
    public let projectId: String
    public let name: String
    public let slug: String
    public let logoUrl: String?
    public let metadata: [String: AnyCodable]?
    public let maxMembers: Int
    public let createdBy: String
    public let createdAt: String
    public let updatedAt: String

    public init(
        id: String,
        projectId: String,
        name: String,
        slug: String,
        logoUrl: String? = nil,
        metadata: [String: AnyCodable]? = nil,
        maxMembers: Int,
        createdBy: String,
        createdAt: String,
        updatedAt: String
    ) {
        self.id = id
        self.projectId = projectId
        self.name = name
        self.slug = slug
        self.logoUrl = logoUrl
        self.metadata = metadata
        self.maxMembers = maxMembers
        self.createdBy = createdBy
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

public enum OrganizationRole: String, Codable, Sendable {
    case owner
    case admin
    case member
}

public struct OrganizationMember: Codable, Sendable, Identifiable {
    public let id: String
    public let organizationId: String
    public let userId: String
    public let role: OrganizationRole
    public let joinedAt: String
    public let createdAt: String

    public init(
        id: String,
        organizationId: String,
        userId: String,
        role: OrganizationRole,
        joinedAt: String,
        createdAt: String
    ) {
        self.id = id
        self.organizationId = organizationId
        self.userId = userId
        self.role = role
        self.joinedAt = joinedAt
        self.createdAt = createdAt
    }
}

public enum InvitationStatus: String, Codable, Sendable {
    case pending
    case accepted
    case rejected
    case expired
}

public struct OrganizationInvitation: Codable, Sendable, Identifiable {
    public let id: String
    public let organizationId: String
    public let email: String
    public let role: String
    public let status: InvitationStatus
    public let invitedBy: String
    public let expiresAt: String
    public let createdAt: String

    public init(
        id: String,
        organizationId: String,
        email: String,
        role: String,
        status: InvitationStatus,
        invitedBy: String,
        expiresAt: String,
        createdAt: String
    ) {
        self.id = id
        self.organizationId = organizationId
        self.email = email
        self.role = role
        self.status = status
        self.invitedBy = invitedBy
        self.expiresAt = expiresAt
        self.createdAt = createdAt
    }
}

public struct OrganizationListResponse: Codable, Sendable {
    public let data: [AuthonOrganization]
    public let total: Int
    public let page: Int
    public let limit: Int

    public init(data: [AuthonOrganization], total: Int, page: Int, limit: Int) {
        self.data = data
        self.total = total
        self.page = page
        self.limit = limit
    }
}

// MARK: - Organization Params

public struct CreateOrganizationParams: Codable, Sendable {
    public let name: String
    public var slug: String?
    public var logoUrl: String?
    public var metadata: [String: AnyCodable]?
    public var maxMembers: Int?

    public init(
        name: String,
        slug: String? = nil,
        logoUrl: String? = nil,
        metadata: [String: AnyCodable]? = nil,
        maxMembers: Int? = nil
    ) {
        self.name = name
        self.slug = slug
        self.logoUrl = logoUrl
        self.metadata = metadata
        self.maxMembers = maxMembers
    }
}

public struct UpdateOrganizationParams: Codable, Sendable {
    public var name: String?
    public var slug: String?
    public var logoUrl: String?
    public var metadata: [String: AnyCodable]?
    public var maxMembers: Int?

    public init(
        name: String? = nil,
        slug: String? = nil,
        logoUrl: String? = nil,
        metadata: [String: AnyCodable]? = nil,
        maxMembers: Int? = nil
    ) {
        self.name = name
        self.slug = slug
        self.logoUrl = logoUrl
        self.metadata = metadata
        self.maxMembers = maxMembers
    }
}

public enum InviteMemberRole: String, Codable, Sendable {
    case admin
    case member
}

public struct InviteMemberParams: Codable, Sendable {
    public let email: String
    public var role: InviteMemberRole?

    public init(email: String, role: InviteMemberRole? = nil) {
        self.email = email
        self.role = role
    }
}

// MARK: - UpdateProfileParams

public struct UpdateProfileParams: Codable, Sendable {
    public var displayName: String?
    public var avatarUrl: String?
    public var phone: String?
    public var publicMetadata: [String: AnyCodable]?

    public init(
        displayName: String? = nil,
        avatarUrl: String? = nil,
        phone: String? = nil,
        publicMetadata: [String: AnyCodable]? = nil
    ) {
        self.displayName = displayName
        self.avatarUrl = avatarUrl
        self.phone = phone
        self.publicMetadata = publicMetadata
    }
}

// MARK: - OAuthProvider

public enum OAuthProvider: String, CaseIterable, Codable, Sendable {
    case google
    case apple
    case kakao
    case naver
    case facebook
    case github
    case discord
    case x
    case line
    case microsoft

    public var displayName: String {
        switch self {
        case .google: return "Google"
        case .apple: return "Apple"
        case .kakao: return "Kakao"
        case .naver: return "Naver"
        case .facebook: return "Facebook"
        case .github: return "GitHub"
        case .discord: return "Discord"
        case .x: return "X"
        case .line: return "LINE"
        case .microsoft: return "Microsoft"
        }
    }

    public struct BrandColor: Sendable {
        public let bg: String
        public let text: String
    }

    public var brandColor: BrandColor {
        switch self {
        case .google: return BrandColor(bg: "#ffffff", text: "#1f1f1f")
        case .apple: return BrandColor(bg: "#000000", text: "#ffffff")
        case .kakao: return BrandColor(bg: "#FEE500", text: "#191919")
        case .naver: return BrandColor(bg: "#03C75A", text: "#ffffff")
        case .facebook: return BrandColor(bg: "#1877F2", text: "#ffffff")
        case .github: return BrandColor(bg: "#24292e", text: "#ffffff")
        case .discord: return BrandColor(bg: "#5865F2", text: "#ffffff")
        case .x: return BrandColor(bg: "#000000", text: "#ffffff")
        case .line: return BrandColor(bg: "#06C755", text: "#ffffff")
        case .microsoft: return BrandColor(bg: "#ffffff", text: "#1f1f1f")
        }
    }
}

// MARK: - AuthonEvent

public enum AuthonEvent: Hashable, Sendable {
    case signedIn
    case signedOut
    case tokenRefreshed
    case mfaRequired
    case error(String)
}

// MARK: - AuthonError

public struct AuthonError: Error, LocalizedError, Codable, Sendable {
    public let statusCode: Int
    public let message: String
    public let code: String?

    public var errorDescription: String? { message }

    public init(statusCode: Int, message: String, code: String? = nil) {
        self.statusCode = statusCode
        self.message = message
        self.code = code
    }
}

// MARK: - AuthonMfaRequiredError

public struct AuthonMfaRequiredError: Error, Sendable {
    public let mfaToken: String

    public init(mfaToken: String) {
        self.mfaToken = mfaToken
    }
}

// MARK: - Internal Types

struct TokenPair: Codable, Sendable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: TimeInterval
}

struct ApiAuthResponse: Codable, Sendable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
    let user: AuthonUser
}

struct ProvidersResponse: Codable, Sendable {
    let providers: [String]
}

struct SignInRequest: Codable, Sendable {
    let email: String
    let password: String
}

struct SignUpRequest: Codable, Sendable {
    let email: String
    let password: String
    let displayName: String?
}
