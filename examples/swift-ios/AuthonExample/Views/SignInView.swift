import SwiftUI

struct SignInView: View {
    @EnvironmentObject private var authService: AuthonService

    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var navigateToSignUp = false
    @State private var navigateToResetPassword = false

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                headerSection
                formSection
                socialSection
                footerLinks
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 40)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Sign In")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(isPresented: $navigateToSignUp) {
            SignUpView()
        }
        .navigationDestination(isPresented: $navigateToResetPassword) {
            ResetPasswordView()
        }
        .loadingOverlay(isLoading)
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 56))
                .foregroundStyle(.purple)

            Text("Welcome back")
                .font(.title2.bold())
                .foregroundStyle(.white)

            Text("Sign in to your Authon account")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var formSection: some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            AuthTextField(title: "Email", text: $email, keyboardType: .emailAddress)
            AuthSecureField(title: "Password", text: $password)

            Button(action: signIn) {
                Text("Sign In")
                    .font(.body.bold())
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(.purple)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(email.isEmpty || password.isEmpty || isLoading)
            .opacity(email.isEmpty || password.isEmpty ? 0.5 : 1)
        }
    }

    private var socialSection: some View {
        SocialButtonsView(
            onSuccess: { _ in },
            onError: { error in errorMessage = error.localizedDescription }
        )
    }

    private var footerLinks: some View {
        VStack(spacing: 14) {
            Button("Forgot password?") {
                navigateToResetPassword = true
            }
            .font(.footnote)
            .foregroundStyle(.purple)

            HStack(spacing: 4) {
                Text("Don't have an account?")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Button("Sign Up") {
                    navigateToSignUp = true
                }
                .font(.footnote.bold())
                .foregroundStyle(.purple)
            }
        }
    }

    private func signIn() {
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                _ = try await authService.signIn(email: email, password: password)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - Reusable Form Components

struct AuthTextField: View {
    let title: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)
            TextField("", text: $text)
                .keyboardType(keyboardType)
                .autocapitalization(.none)
                .autocorrectionDisabled()
                .padding(.horizontal, 14)
                .frame(height: 48)
                .background(Color.white.opacity(0.07))
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                )
                .foregroundStyle(.white)
        }
    }
}

struct AuthSecureField: View {
    let title: String
    @Binding var text: String

    @State private var isVisible = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)
            HStack {
                if isVisible {
                    TextField("", text: $text)
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                } else {
                    SecureField("", text: $text)
                }
                Button {
                    isVisible.toggle()
                } label: {
                    Image(systemName: isVisible ? "eye.slash" : "eye")
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal, 14)
            .frame(height: 48)
            .background(Color.white.opacity(0.07))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.white.opacity(0.15), lineWidth: 1)
            )
            .foregroundStyle(.white)
        }
    }
}

struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.red)
            Text(message)
                .font(.footnote)
                .foregroundStyle(.red)
            Spacer()
        }
        .padding(12)
        .background(Color.red.opacity(0.12))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
