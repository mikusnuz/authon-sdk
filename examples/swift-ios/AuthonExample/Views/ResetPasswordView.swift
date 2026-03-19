import SwiftUI

struct ResetPasswordView: View {
    @EnvironmentObject private var authService: AuthonService
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var isLoading = false
    @State private var emailSent = false
    @State private var errorMessage: String?

    // Token-based reset (entered from email link)
    @State private var resetToken = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var showTokenForm = false
    @State private var resetComplete = false

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                headerSection

                if resetComplete {
                    successSection
                } else if showTokenForm {
                    tokenResetSection
                } else if emailSent {
                    emailSentSection
                } else {
                    requestSection
                }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 40)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Reset Password")
        .navigationBarTitleDisplayMode(.inline)
        .loadingOverlay(isLoading)
    }

    private var headerSection: some View {
        VStack(spacing: 10) {
            Image(systemName: "key.horizontal.fill")
                .font(.system(size: 52))
                .foregroundStyle(.purple)

            Text("Forgot your password?")
                .font(.title3.bold())
                .foregroundStyle(.white)

            Text("Enter your email and we'll send you a reset link.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private var requestSection: some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            AuthTextField(title: "Email Address", text: $email, keyboardType: .emailAddress)

            Button(action: requestReset) {
                Text("Send Reset Link")
                    .font(.body.bold())
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(email.isEmpty ? Color.purple.opacity(0.4) : Color.purple)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(email.isEmpty || isLoading)

            Button("I have a reset token") {
                showTokenForm = true
            }
            .font(.footnote)
            .foregroundStyle(.secondary)
        }
    }

    private var emailSentSection: some View {
        VStack(spacing: 16) {
            Image(systemName: "envelope.badge.fill")
                .font(.system(size: 52))
                .foregroundStyle(.purple)

            Text("Check your inbox")
                .font(.title3.bold())
                .foregroundStyle(.white)

            Text("We sent a password reset link to **\(email)**. Check your email and follow the instructions.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button("Enter reset token manually") {
                showTokenForm = true
            }
            .font(.footnote)
            .foregroundStyle(.purple)

            Button("Back to Sign In") {
                dismiss()
            }
            .font(.footnote)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 8)
    }

    private var tokenResetSection: some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Reset Token")
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(.secondary)
                TextField("Paste your token here", text: $resetToken)
                    .autocapitalization(.none)
                    .autocorrectionDisabled()
                    .padding(.horizontal, 14)
                    .frame(height: 48)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.white.opacity(0.15), lineWidth: 1))
                    .foregroundStyle(.white)
            }

            AuthSecureField(title: "New Password", text: $newPassword)
            AuthSecureField(title: "Confirm New Password", text: $confirmPassword)

            Button(action: performReset) {
                Text("Reset Password")
                    .font(.body.bold())
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(resetFormValid ? Color.purple : Color.purple.opacity(0.4))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(!resetFormValid || isLoading)
        }
    }

    private var successSection: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 52))
                .foregroundStyle(.green)

            Text("Password Reset")
                .font(.title3.bold())
                .foregroundStyle(.white)

            Text("Your password has been successfully reset. You can now sign in with your new password.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button("Back to Sign In") {
                dismiss()
            }
            .font(.body.bold())
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(.purple)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var resetFormValid: Bool {
        !resetToken.isEmpty && !newPassword.isEmpty && newPassword == confirmPassword && newPassword.count >= 8
    }

    private func requestReset() {
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                try await authService.requestPasswordReset(email: email)
                emailSent = true
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func performReset() {
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                try await authService.resetPassword(token: resetToken, newPassword: newPassword)
                resetComplete = true
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
