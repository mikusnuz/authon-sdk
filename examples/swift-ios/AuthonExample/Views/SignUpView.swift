import SwiftUI

struct SignUpView: View {
    @EnvironmentObject private var authService: AuthonService
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var isLoading = false
    @State private var errorMessage: String?

    private var passwordMismatch: Bool {
        !confirmPassword.isEmpty && password != confirmPassword
    }

    private var formValid: Bool {
        !email.isEmpty && !password.isEmpty && password == confirmPassword && password.count >= 8
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                headerSection
                formSection
                socialSection
                signInLink
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 32)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Create Account")
        .navigationBarTitleDisplayMode(.large)
        .loadingOverlay(isLoading)
    }

    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "person.badge.plus.fill")
                .font(.system(size: 48))
                .foregroundStyle(.purple)

            Text("Create your account")
                .font(.title3.bold())
                .foregroundStyle(.white)

            Text("Get started with Authon today")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var formSection: some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            HStack(spacing: 12) {
                AuthTextField(title: "First Name", text: $firstName)
                AuthTextField(title: "Last Name", text: $lastName)
            }

            AuthTextField(title: "Email", text: $email, keyboardType: .emailAddress)
            AuthSecureField(title: "Password", text: $password)

            VStack(alignment: .leading, spacing: 6) {
                AuthSecureField(title: "Confirm Password", text: $confirmPassword)
                if passwordMismatch {
                    Text("Passwords do not match")
                        .font(.caption)
                        .foregroundStyle(.red)
                }
            }

            PasswordStrengthBar(password: password)

            Button(action: signUp) {
                Text("Create Account")
                    .font(.body.bold())
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(formValid ? Color.purple : Color.purple.opacity(0.4))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(!formValid || isLoading)
        }
    }

    private var socialSection: some View {
        SocialButtonsView(
            onSuccess: { _ in },
            onError: { error in errorMessage = error.localizedDescription }
        )
    }

    private var signInLink: some View {
        HStack(spacing: 4) {
            Text("Already have an account?")
                .font(.footnote)
                .foregroundStyle(.secondary)
            Button("Sign In") {
                dismiss()
            }
            .font(.footnote.bold())
            .foregroundStyle(.purple)
        }
    }

    private func signUp() {
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                _ = try await authService.signUp(
                    email: email,
                    password: password,
                    firstName: firstName.isEmpty ? nil : firstName,
                    lastName: lastName.isEmpty ? nil : lastName
                )
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - Password Strength Bar

struct PasswordStrengthBar: View {
    let password: String

    private var strength: Int {
        var score = 0
        if password.count >= 8 { score += 1 }
        if password.count >= 12 { score += 1 }
        if password.range(of: "[A-Z]", options: .regularExpression) != nil { score += 1 }
        if password.range(of: "[0-9]", options: .regularExpression) != nil { score += 1 }
        if password.range(of: "[^A-Za-z0-9]", options: .regularExpression) != nil { score += 1 }
        return score
    }

    private var color: Color {
        switch strength {
        case 0...1: return .red
        case 2...3: return .orange
        default:    return .green
        }
    }

    private var label: String {
        switch strength {
        case 0...1: return "Weak"
        case 2...3: return "Fair"
        case 4:     return "Strong"
        default:    return "Very Strong"
        }
    }

    var body: some View {
        if !password.isEmpty {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 4) {
                    ForEach(0..<5) { i in
                        RoundedRectangle(cornerRadius: 2)
                            .fill(i < strength ? color : Color.white.opacity(0.15))
                            .frame(height: 4)
                    }
                }
                Text("Password strength: \(label)")
                    .font(.caption)
                    .foregroundStyle(color)
            }
        }
    }
}
