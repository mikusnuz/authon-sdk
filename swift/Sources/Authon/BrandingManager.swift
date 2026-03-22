import Foundation

final class BrandingManager {
    private let api: AuthonAPI
    private var cachedBranding: BrandingConfig?
    private var cachedProviders: [OAuthProvider] = []
    private var lastFetch: Date?
    private let cacheTTL: TimeInterval = 300 // 5 minutes

    init(api: AuthonAPI) {
        self.api = api
    }

    // MARK: - Public

    func ensureLoaded() async throws {
        if let lastFetch, Date().timeIntervalSince(lastFetch) < cacheTTL {
            return
        }

        async let brandingTask: BrandingConfig = api.request("GET", "/v1/auth/branding")
        async let providersTask: ProvidersResponse = api.request("GET", "/v1/auth/providers")

        let (branding, providersResponse) = try await (brandingTask, providersTask)

        cachedBranding = branding
        cachedProviders = providersResponse.providers.compactMap { OAuthProvider(rawValue: $0) }
        lastFetch = Date()
    }

    func getBranding() -> BrandingConfig {
        return cachedBranding ?? .default
    }

    func getProviders() -> [OAuthProvider] {
        return cachedProviders
    }
}
