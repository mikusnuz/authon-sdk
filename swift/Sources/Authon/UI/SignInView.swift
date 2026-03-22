import SwiftUI

public struct SignInView: View {
    public var onSuccess: ((AuthonUser) -> Void)?

    @EnvironmentObject private var authon: Authon
    @Environment(\.colorScheme) private var colorScheme

    // Form state
    @State private var email = ""
    @State private var password = ""
    @State private var mfaCode = ""
    @State private var otpEmail = ""
    @State private var otpCode = ""
    @State private var error: String?
    @State private var isLoading = false
    @State private var otpSent = false
    @State private var otpSending = false

    // MFA state
    @State private var mfaToken: String?

    // Navigation
    @State private var showSignUp = false

    // Branding
    @State private var branding: BrandingConfig = .default

    public init(onSuccess: ((AuthonUser) -> Void)? = nil) {
        self.onSuccess = onSuccess
    }

    private var theme: AuthonTheme {
        AuthonTheme(branding: branding, colorScheme: colorScheme)
    }

    public var body: some View {
        if showSignUp {
            SignUpView(onSuccess: onSuccess)
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
                Text("Sign in")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(theme.textColor)

                // Error message
                errorView

                if mfaToken != nil {
                    mfaView
                } else {
                    // Email/Password form
                    if branding.showEmailPassword != false {
                        emailPasswordForm
                    }

                    // Passwordless section
                    if branding.showPasswordless == true {
                        passwordlessSection
                    }

                    // Divider
                    if branding.showDivider != false {
                        dividerView
                    }

                    // Social Buttons
                    SocialButtons(onSuccess: onSuccess)

                    // Sign Up link
                    signUpLink
                }

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

    // MARK: - Email/Password Form

    @ViewBuilder
    private var emailPasswordForm: some View {
        VStack(spacing: 12) {
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
                SecureField("Password", text: $password)
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

            // Sign In button
            Button {
                performSignIn()
            } label: {
                HStack(spacing: 8) {
                    if isLoading {
                        ProgressView()
                            .controlSize(.small)
                            .tint(.white)
                    }
                    Text("Sign In")
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

    // MARK: - MFA View

    @ViewBuilder
    private var mfaView: some View {
        VStack(spacing: 16) {
            Text("Two-Factor Authentication")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(theme.textColor)

            Text("Enter the 6-digit code from your authenticator app")
                .font(.system(size: 13))
                .foregroundStyle(theme.secondaryTextColor)
                .multilineTextAlignment(.center)

            TextField("000000", text: $mfaCode)
                .textFieldStyle(.plain)
                .font(.system(size: 24, weight: .medium, design: .monospaced))
                .multilineTextAlignment(.center)
                .foregroundStyle(theme.textColor)
                .padding(.horizontal, 12)
                .padding(.vertical, 12)
                .background(theme.backgroundColor)
                .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius * 0.67))
                .overlay(
                    RoundedRectangle(cornerRadius: theme.borderRadius * 0.67)
                        .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                )
                #if canImport(UIKit)
                .keyboardType(.numberPad)
                #endif

            Button {
                performMfaVerify()
            } label: {
                HStack(spacing: 8) {
                    if isLoading {
                        ProgressView()
                            .controlSize(.small)
                            .tint(.white)
                    }
                    Text("Verify")
                        .font(.system(size: 15, weight: .semibold))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(theme.primaryGradient)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius))
            }
            .buttonStyle(.plain)
            .disabled(isLoading || mfaCode.count < 6)
            .opacity(mfaCode.count < 6 ? 0.6 : 1)

            Button {
                mfaToken = nil
                mfaCode = ""
                error = nil
            } label: {
                Text("Back to sign in")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.primaryColor)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Passwordless Section

    @ViewBuilder
    private var passwordlessSection: some View {
        VStack(spacing: 12) {
            Text("Or sign in with email code")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(theme.secondaryTextColor)

            if !otpSent {
                HStack(spacing: 8) {
                    TextField("you@example.com", text: $otpEmail)
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

                    Button {
                        sendOtp()
                    } label: {
                        HStack(spacing: 4) {
                            if otpSending {
                                ProgressView()
                                    .controlSize(.small)
                                    .tint(.white)
                            }
                            Text("Send")
                                .font(.system(size: 14, weight: .medium))
                        }
                        .padding(.horizontal, 16)
                        .frame(height: 40)
                        .background(theme.primaryGradient)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius * 0.67))
                    }
                    .buttonStyle(.plain)
                    .disabled(otpSending || otpEmail.isEmpty)
                }
            } else {
                VStack(spacing: 8) {
                    Text("Code sent to \(otpEmail)")
                        .font(.system(size: 13))
                        .foregroundStyle(theme.secondaryTextColor)

                    HStack(spacing: 8) {
                        TextField("Enter code", text: $otpCode)
                            .textFieldStyle(.plain)
                            .font(.system(size: 15, weight: .medium, design: .monospaced))
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
                            .keyboardType(.numberPad)
                            #endif

                        Button {
                            verifyOtp()
                        } label: {
                            HStack(spacing: 4) {
                                if isLoading {
                                    ProgressView()
                                        .controlSize(.small)
                                        .tint(.white)
                                }
                                Text("Verify")
                                    .font(.system(size: 14, weight: .medium))
                            }
                            .padding(.horizontal, 16)
                            .frame(height: 40)
                            .background(theme.primaryGradient)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: theme.borderRadius * 0.67))
                        }
                        .buttonStyle(.plain)
                        .disabled(isLoading || otpCode.isEmpty)
                    }

                    Button {
                        otpSent = false
                        otpCode = ""
                    } label: {
                        Text("Change email")
                            .font(.system(size: 12))
                            .foregroundStyle(theme.primaryColor)
                    }
                    .buttonStyle(.plain)
                }
            }
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

    // MARK: - Sign Up Link

    @ViewBuilder
    private var signUpLink: some View {
        HStack(spacing: 4) {
            Text("Don't have an account?")
                .font(.system(size: 13))
                .foregroundStyle(theme.secondaryTextColor)
            Button {
                showSignUp = true
            } label: {
                Text("Sign Up")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(theme.primaryColor)
            }
            .buttonStyle(.plain)
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

    private func performSignIn() {
        guard !isLoading else { return }
        isLoading = true
        error = nil

        Task {
            defer { isLoading = false }
            do {
                let user = try await authon.signIn(email: email, password: password)
                onSuccess?(user)
            } catch let mfaError as AuthonMfaRequiredError {
                mfaToken = mfaError.mfaToken
            } catch {
                self.error = error.localizedDescription
            }
        }
    }

    private func performMfaVerify() {
        guard !isLoading, let token = mfaToken else { return }
        isLoading = true
        error = nil

        Task {
            defer { isLoading = false }
            do {
                let user = try await authon.verifyMfa(mfaToken: token, code: mfaCode)
                mfaToken = nil
                mfaCode = ""
                onSuccess?(user)
            } catch {
                self.error = error.localizedDescription
            }
        }
    }

    private func sendOtp() {
        guard !otpSending else { return }
        otpSending = true
        error = nil

        Task {
            defer { otpSending = false }
            do {
                let method = branding.passwordlessMethod ?? .emailOtp
                if method == .magicLink {
                    try await authon.sendMagicLink(email: otpEmail)
                } else {
                    try await authon.sendEmailOtp(email: otpEmail)
                }
                otpSent = true
            } catch {
                self.error = error.localizedDescription
            }
        }
    }

    private func verifyOtp() {
        guard !isLoading else { return }
        isLoading = true
        error = nil

        Task {
            defer { isLoading = false }
            do {
                let user = try await authon.verifyPasswordless(email: otpEmail, code: otpCode)
                onSuccess?(user)
            } catch {
                self.error = error.localizedDescription
            }
        }
    }
}
