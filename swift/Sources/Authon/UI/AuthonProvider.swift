import SwiftUI

// MARK: - EnvironmentKey

private struct AuthonEnvironmentKey: EnvironmentKey {
    static let defaultValue: Authon? = nil
}

extension EnvironmentValues {
    public var authon: Authon? {
        get { self[AuthonEnvironmentKey.self] }
        set { self[AuthonEnvironmentKey.self] = newValue }
    }
}

// MARK: - AuthonProvider

public struct AuthonProvider<Content: View>: View {
    @StateObject private var authon: Authon
    private let content: Content

    public init(
        publishableKey: String,
        apiURL: String = "https://api.authon.dev",
        @ViewBuilder content: () -> Content
    ) {
        _authon = StateObject(wrappedValue: Authon(publishableKey: publishableKey, apiURL: apiURL))
        self.content = content()
    }

    public var body: some View {
        content
            .environmentObject(authon)
            .environment(\.authon, authon)
            .task {
                await authon.initialize()
            }
    }
}
