import Foundation
import Security

#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

final class SessionManager {
    private static let keychainService = "dev.authon.sdk"
    private static let keychainAccount = "tokens"

    private var tokens: TokenPair?
    private var refreshTimer: Timer?
    private let api: AuthonAPI
    private let onRefreshed: (TokenPair, AuthonUser) -> Void
    private let onExpired: () -> Void

    init(api: AuthonAPI, onRefreshed: @escaping (TokenPair, AuthonUser) -> Void, onExpired: @escaping () -> Void) {
        self.api = api
        self.onRefreshed = onRefreshed
        self.onExpired = onExpired
        setupForegroundObserver()
    }

    // MARK: - Keychain

    func loadFromKeychain() -> TokenPair? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.keychainService,
            kSecAttrAccount as String: Self.keychainAccount,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        guard let pair = try? decoder.decode(TokenPair.self, from: data) else {
            return nil
        }

        tokens = pair
        return pair
    }

    func saveToKeychain(_ tokenPair: TokenPair) {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        guard let data = try? encoder.encode(tokenPair) else { return }

        // Delete any existing item first
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.keychainService,
            kSecAttrAccount as String: Self.keychainAccount
        ]
        SecItemDelete(deleteQuery as CFDictionary)

        // Add new item
        let addQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.keychainService,
            kSecAttrAccount as String: Self.keychainAccount,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        SecItemAdd(addQuery as CFDictionary, nil)
    }

    func clearKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: Self.keychainService,
            kSecAttrAccount as String: Self.keychainAccount
        ]
        SecItemDelete(query as CFDictionary)
    }

    // MARK: - Token Management

    func setTokens(_ pair: TokenPair) {
        tokens = pair
        saveToKeychain(pair)
        scheduleRefresh()
    }

    func getAccessToken() -> String? {
        return tokens?.accessToken
    }

    func isAuthenticated() -> Bool {
        guard let tokens else { return false }
        // expiresAt is in milliseconds
        return tokens.expiresAt > Date().timeIntervalSince1970 * 1000
    }

    // MARK: - Auto-Refresh

    func scheduleRefresh() {
        refreshTimer?.invalidate()
        refreshTimer = nil

        guard let tokens else { return }

        let nowMs = Date().timeIntervalSince1970 * 1000
        let expiresInMs = tokens.expiresAt - nowMs
        // Refresh 60 seconds before expiry, minimum 30 seconds from now
        let refreshInMs = max(expiresInMs - 60_000, 30_000)
        let refreshInSec = refreshInMs / 1000

        if refreshInSec <= 0 {
            // Already expired, try refresh immediately
            performRefresh()
            return
        }

        refreshTimer = Timer.scheduledTimer(withTimeInterval: refreshInSec, repeats: false) { [weak self] _ in
            self?.performRefresh()
        }
    }

    private func performRefresh() {
        guard let refreshToken = tokens?.refreshToken else {
            onExpired()
            return
        }

        Task { [weak self] in
            guard let self else { return }
            do {
                struct RefreshBody: Encodable {
                    let refreshToken: String
                }
                let response: ApiAuthResponse = try await self.api.request(
                    "POST",
                    "/v1/auth/token/refresh",
                    body: RefreshBody(refreshToken: refreshToken)
                )
                let newPair = TokenPair(
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    expiresAt: Date().timeIntervalSince1970 * 1000 + Double(response.expiresIn) * 1000
                )
                self.tokens = newPair
                self.saveToKeychain(newPair)
                self.scheduleRefresh()
                self.onRefreshed(newPair, response.user)
            } catch {
                self.tokens = nil
                self.clearKeychain()
                self.refreshTimer?.invalidate()
                self.refreshTimer = nil
                self.onExpired()
            }
        }
    }

    // MARK: - Foreground Check

    func checkOnForeground() {
        guard let tokens else { return }
        let nowMs = Date().timeIntervalSince1970 * 1000
        if tokens.expiresAt <= nowMs {
            // Token expired, try refresh
            performRefresh()
        } else {
            // Re-schedule refresh
            scheduleRefresh()
        }
    }

    private func setupForegroundObserver() {
        #if canImport(UIKit)
        NotificationCenter.default.addObserver(
            forName: UIApplication.willEnterForegroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.checkOnForeground()
        }
        #elseif canImport(AppKit)
        NotificationCenter.default.addObserver(
            forName: NSApplication.willBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.checkOnForeground()
        }
        #endif
    }

    // MARK: - Destroy

    func destroy() {
        refreshTimer?.invalidate()
        refreshTimer = nil
        tokens = nil
        NotificationCenter.default.removeObserver(self)
    }
}
