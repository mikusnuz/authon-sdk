import SwiftUI
import AuthenticationServices

struct SocialButtonsView: View {
    @EnvironmentObject private var authService: AuthonService
    var onSuccess: (AppUser) -> Void
    var onError: (Error) -> Void

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
    ]

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                line
                Text("or continue with")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                line
            }

            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(OAuthProvider.all) { provider in
                    SocialButton(provider: provider) {
                        await handleOAuth(provider: provider.id)
                    }
                }
            }
        }
    }

    private var line: some View {
        Rectangle()
            .fill(Color.white.opacity(0.15))
            .frame(height: 1)
    }

    private func handleOAuth(provider: String) async {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let anchor = windowScene.windows.first(where: { $0.isKeyWindow })
        else { return }

        do {
            let user = try await authService.signInWithOAuth(provider: provider, presentationAnchor: anchor)
            onSuccess(user)
        } catch {
            onError(error)
        }
    }
}

struct SocialButton: View {
    let provider: OAuthProvider
    let action: () async -> Void

    @State private var isLoading = false

    var body: some View {
        Button {
            Task {
                isLoading = true
                await action()
                isLoading = false
            }
        } label: {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .frame(width: 18, height: 18)
                } else {
                    Image(systemName: provider.iconSystemName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 18, height: 18)
                        .foregroundStyle(.white)
                }
                Text(provider.displayName)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(.white)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 42)
            .background(Color(hex: provider.backgroundColor) ?? .gray)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .disabled(isLoading)
    }
}

// MARK: - Color Helper

extension Color {
    init?(hex: String) {
        var sanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if sanitized.hasPrefix("#") { sanitized.removeFirst() }
        guard sanitized.count == 6, let value = UInt64(sanitized, radix: 16) else { return nil }
        self.init(
            red:   Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8)  & 0xFF) / 255,
            blue:  Double( value        & 0xFF) / 255
        )
    }
}
