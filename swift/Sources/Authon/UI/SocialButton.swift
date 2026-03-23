import SwiftUI

public struct SocialButton: View {
    let provider: OAuthProvider
    var onSuccess: ((AuthonUser) -> Void)?
    var onError: ((Error) -> Void)?

    @EnvironmentObject private var authon: Authon
    @State private var isLoading = false

    public init(provider: OAuthProvider, onSuccess: ((AuthonUser) -> Void)? = nil, onError: ((Error) -> Void)? = nil) {
        self.provider = provider
        self.onSuccess = onSuccess
        self.onError = onError
    }

    public var body: some View {
        Button {
            guard !isLoading else { return }
            Task {
                isLoading = true
                defer { isLoading = false }
                do {
                    let user = try await authon.signInWithOAuth(provider)
                    onSuccess?(user)
                } catch {
                    onError?(error)
                }
            }
        } label: {
            HStack(spacing: 0) {
                ProviderIcon(provider: provider)
                    .foregroundStyle(Color(hex: provider.brandColor.text))
                    .frame(width: 20)
                    .padding(.leading, 16)

                Spacer()

                Text("Continue with \(provider.displayName)")
                    .font(.system(size: 15, weight: .medium))

                Spacer()

                // Invisible spacer matching icon width for symmetry
                Color.clear
                    .frame(width: 20)
                    .padding(.trailing, 16)
            }
            .overlay(alignment: .trailing) {
                if isLoading {
                    ProgressView()
                        .controlSize(.small)
                        .tint(Color(hex: provider.brandColor.text))
                        .padding(.trailing, 16)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(Color(hex: provider.brandColor.bg))
            .foregroundStyle(Color(hex: provider.brandColor.text))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(Color.gray.opacity(0.2), lineWidth: provider.brandColor.bg == "#ffffff" ? 1 : 0)
            )
        }
        .buttonStyle(.plain)
        .disabled(isLoading)
    }
}
