import SwiftUI

public struct SocialButtons: View {
    var onSuccess: ((AuthonUser) -> Void)?
    var onError: ((Error) -> Void)?

    @EnvironmentObject private var authon: Authon
    @State private var providers: [OAuthProvider] = []

    /// `onError` receives `AuthonMfaRequiredError` when the account needs MFA; continue with
    /// `Authon.verifyMfa(mfaToken:code:)`.
    public init(onSuccess: ((AuthonUser) -> Void)? = nil, onError: ((Error) -> Void)? = nil) {
        self.onSuccess = onSuccess
        self.onError = onError
    }

    public var body: some View {
        VStack(spacing: 8) {
            ForEach(providers, id: \.self) { provider in
                SocialButton(provider: provider, onSuccess: onSuccess, onError: onError)
            }
        }
        .task {
            providers = (try? await authon.getProviders()) ?? []
        }
    }
}
