import SwiftUI

/// A view modifier that redirects unauthenticated users to the sign-in screen.
struct AuthGuard: ViewModifier {
    @EnvironmentObject private var authService: AuthonService
    @State private var showSignIn = false

    func body(content: Content) -> some View {
        content
            .onChange(of: authService.isAuthenticated) { isAuthenticated in
                if !isAuthenticated {
                    showSignIn = true
                }
            }
            .fullScreenCover(isPresented: $showSignIn) {
                NavigationStack {
                    SignInView()
                }
            }
    }
}

extension View {
    /// Wraps a view in an authentication guard that redirects to sign-in when the user is not authenticated.
    func requiresAuth() -> some View {
        modifier(AuthGuard())
    }
}

// MARK: - Loading Overlay Modifier

struct LoadingOverlay: ViewModifier {
    let isLoading: Bool

    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading)
                .blur(radius: isLoading ? 1.5 : 0)

            if isLoading {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()

                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.4)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: isLoading)
    }
}

extension View {
    func loadingOverlay(_ isLoading: Bool) -> some View {
        modifier(LoadingOverlay(isLoading: isLoading))
    }
}
