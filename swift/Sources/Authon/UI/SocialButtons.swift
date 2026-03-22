import SwiftUI

public struct SocialButtons: View {
    var onSuccess: ((AuthonUser) -> Void)?

    @EnvironmentObject private var authon: Authon
    @State private var providers: [OAuthProvider] = []

    public init(onSuccess: ((AuthonUser) -> Void)? = nil) {
        self.onSuccess = onSuccess
    }

    public var body: some View {
        VStack(spacing: 8) {
            ForEach(providers, id: \.self) { provider in
                SocialButton(provider: provider, onSuccess: onSuccess)
            }
        }
        .task {
            providers = (try? await authon.getProviders()) ?? []
        }
    }
}
