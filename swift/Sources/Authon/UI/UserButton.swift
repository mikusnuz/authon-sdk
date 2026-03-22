import SwiftUI

public struct UserButton: View {
    @EnvironmentObject private var authon: Authon
    @Environment(\.colorScheme) private var colorScheme

    @State private var branding: BrandingConfig = .default

    public init() {}

    private var theme: AuthonTheme {
        AuthonTheme(branding: branding, colorScheme: colorScheme)
    }

    public var body: some View {
        Menu {
            if let user = authon.user {
                if let name = user.displayName, !name.isEmpty {
                    Text(name)
                }
                if let email = user.email {
                    Text(email)
                }
                Divider()
            }
            Button(role: .destructive) {
                Task {
                    try? await authon.signOut()
                }
            } label: {
                Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
            }
        } label: {
            avatarView
        }
        .task {
            branding = (try? await authon.getBranding()) ?? .default
        }
    }

    @ViewBuilder
    private var avatarView: some View {
        let size: CGFloat = 36

        if let avatarUrl = authon.user?.avatarUrl,
           !avatarUrl.isEmpty,
           let url = URL(string: avatarUrl) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: size, height: size)
                        .clipShape(Circle())
                default:
                    initialsView(size: size)
                }
            }
        } else {
            initialsView(size: size)
        }
    }

    private func initialsView(size: CGFloat) -> some View {
        let initials: String = {
            if let name = authon.user?.displayName, !name.isEmpty {
                return String(name.prefix(1)).uppercased()
            }
            if let email = authon.user?.email, !email.isEmpty {
                return String(email.prefix(1)).uppercased()
            }
            return "?"
        }()

        return ZStack {
            Circle()
                .fill(theme.primaryGradient)
                .frame(width: size, height: size)
            Text(initials)
                .font(.system(size: size * 0.4, weight: .semibold))
                .foregroundStyle(.white)
        }
    }
}
