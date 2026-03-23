import SwiftUI

public struct SocialButton: View {
    let provider: OAuthProvider
    var onSuccess: ((AuthonUser) -> Void)?

    @EnvironmentObject private var authon: Authon
    @State private var isLoading = false
    @State private var error: String?

    public init(provider: OAuthProvider, onSuccess: ((AuthonUser) -> Void)? = nil) {
        self.provider = provider
        self.onSuccess = onSuccess
    }

    public var body: some View {
        Button {
            guard !isLoading else { return }
            Task {
                isLoading = true
                error = nil
                defer { isLoading = false }
                do {
                    let user = try await authon.signInWithOAuth(provider)
                    onSuccess?(user)
                } catch {
                    self.error = error.localizedDescription
                }
            }
        } label: {
            ZStack {
                HStack(spacing: 12) {
                    ProviderIcon(provider: provider)
                        .foregroundStyle(Color(hex: provider.brandColor.text))
                    Spacer()
                }
                .padding(.horizontal, 16)

                HStack(spacing: 8) {
                    Text("Continue with \(provider.displayName)")
                        .font(.system(size: 15, weight: .medium))
                    if isLoading {
                        ProgressView()
                            .controlSize(.small)
                    }
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
