import SwiftUI

public struct SignUpView: View {
    public var onSuccess: ((AuthonUser) -> Void)?

    @EnvironmentObject private var authon: Authon
    @Environment(\.colorScheme) private var colorScheme

    // Form state
    @State private var email = ""
    @State private var password = ""
    @State private var displayName = ""
    @State private var error: String?
    @State private var isLoading = false

    // Navigation
    @State private var showSignIn = false

    // Branding
    @State private var branding: BrandingConfig = .default

    public init(onSuccess: ((AuthonUser) -> Void)? = nil) {
        self.onSuccess = onSuccess
    }

    private var theme: AuthonTheme {
        AuthonTheme(branding: branding, colorScheme: colorScheme)
    }

    public var body: some View {
        if showSignIn {
            SignInView(onSuccess: onSuccess)
                .environmentObject(authon)
        } else {
            mainContent
                .task {
                    branding = (try? await authon.getBranding()) ?? .default
                }
        }
    }

    @ViewBuilder
    private var mainContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Logo
                logoView

                // Title
                Text("Create account")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(theme.textColor)

                // Error message
                errorView

                // Registration form
                if branding.showEmailPassword != false {
                    registrationForm
                }

                // Divider
                if branding.showDivider != false {
                    dividerView
                }

                // Social Buttons
                SocialButtons(onSuccess: onSuccess)

                // Sign In link
                signInLink

                // Terms & Privacy
                termsView

                // Secured by
                if branding.showSecuredBy != false {
                    securedByView
                }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 32)
        }
        .background(theme.backgroundColor)
    }

    // MARK: - Logo

    @ViewBuilder
    private var logoView: some View {
        if let logoUrl = theme.logoDataUrl, !logoUrl.isEmpty,
           let url = URL(string: logoUrl) {
            AsyncImage(url: url) { image in
                image
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: 120, maxHeight: 48)
            } placeholder: {
                EmptyView()
            }
        } else if let brandName = branding.brandName, !brandName.isEmpty {
            Text(brandName)
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.textColor)
        }
    }

    // MARK: - Error

    @ViewBuilder
    private var errorView: some View {
        if let error, !error.isEmpty {
            Text(error)
                .font(.system(size: 13))
                .foregroundStyle(.red)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(Color.red.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    // MARK: - Registration Form

    @ViewBuilder
    private var registrationForm: some View {
        VStack(spacing: 12) {
            // Display Name field
            VStack(alignment: .leading, spacing: 4) {
                Text("Name")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(theme.secondaryTextColor)
                TextField("Your name (optional)", text: $displayName)
                    .textFieldStyle(.plain)
                    .font(.system(size: 15))
                    .foregroundStyle(theme.textColor)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(theme.backgroundColor)
                    .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius * 0.67))
                    .overlay(
                        RoundedRectangle(cornerRadius: theme.borderRadius * 0.67)
                            .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                    )
                    #if canImport(UIKit)
                    .autocorrectionDisabled()
                    #endif
            }

            // Email field
            VStack(alignment: .leading, spacing: 4) {
                Text("Email")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(theme.secondaryTextColor)
                TextField("you@example.com", text: $email)
                    .textFieldStyle(.plain)
                    .font(.system(size: 15))
                    .foregroundStyle(theme.textColor)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(theme.backgroundColor)
                    .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius * 0.67))
                    .overlay(
                        RoundedRectangle(cornerRadius: theme.borderRadius * 0.67)
                            .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                    )
                    #if canImport(UIKit)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    #endif
            }

            // Password field
            VStack(alignment: .leading, spacing: 4) {
                Text("Password")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(theme.secondaryTextColor)
                SecureField("Create a password", text: $password)
                    .textFieldStyle(.plain)
                    .font(.system(size: 15))
                    .foregroundStyle(theme.textColor)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(theme.backgroundColor)
                    .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius * 0.67))
                    .overlay(
                        RoundedRectangle(cornerRadius: theme.borderRadius * 0.67)
                            .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                    )
            }

            // Create Account button
            Button {
                performSignUp()
            } label: {
                HStack(spacing: 8) {
                    if isLoading {
                        ProgressView()
                            .controlSize(.small)
                            .tint(.white)
                    }
                    Text("Create Account")
                        .font(.system(size: 15, weight: .semibold))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(theme.primaryGradient)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius))
            }
            .buttonStyle(.plain)
            .disabled(isLoading || email.isEmpty || password.isEmpty)
            .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1)
        }
    }

    // MARK: - Divider

    @ViewBuilder
    private var dividerView: some View {
        HStack(spacing: 12) {
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(height: 1)
            Text("or")
                .font(.system(size: 13))
                .foregroundStyle(theme.secondaryTextColor)
            Rectangle()
                .fill(Color.gray.opacity(0.3))
                .frame(height: 1)
        }
    }

    // MARK: - Sign In Link

    @ViewBuilder
    private var signInLink: some View {
        HStack(spacing: 4) {
            Text("Already have an account?")
                .font(.system(size: 13))
                .foregroundStyle(theme.secondaryTextColor)
            Button {
                showSignIn = true
            } label: {
                Text("Sign In")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(theme.primaryColor)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Terms & Privacy

    @ViewBuilder
    private var termsView: some View {
        let hasTerms = branding.termsUrl != nil
        let hasPrivacy = branding.privacyUrl != nil

        if hasTerms || hasPrivacy {
            HStack(spacing: 4) {
                Text("By signing up, you agree to our")
                    .font(.system(size: 11))
                    .foregroundStyle(theme.secondaryTextColor)

                if hasTerms {
                    Link("Terms", destination: URL(string: branding.termsUrl!)!)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(theme.primaryColor)
                }

                if hasTerms && hasPrivacy {
                    Text("&")
                        .font(.system(size: 11))
                        .foregroundStyle(theme.secondaryTextColor)
                }

                if hasPrivacy {
                    Link("Privacy", destination: URL(string: branding.privacyUrl!)!)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(theme.primaryColor)
                }
            }
        }
    }

    // MARK: - Secured By

    @ViewBuilder
    private var securedByView: some View {
        HStack(spacing: 4) {
            Image(systemName: "lock.fill")
                .font(.system(size: 10))
            Text("Secured by Authon")
                .font(.system(size: 11))
        }
        .foregroundStyle(theme.secondaryTextColor)
        .padding(.top, 8)
    }

    // MARK: - Actions

    private func performSignUp() {
        guard !isLoading else { return }
        isLoading = true
        error = nil

        Task {
            defer { isLoading = false }
            do {
                let name = displayName.isEmpty ? nil : displayName
                let user = try await authon.signUp(email: email, password: password, displayName: name)
                onSuccess?(user)
            } catch {
                self.error = error.localizedDescription
            }
        }
    }
}
