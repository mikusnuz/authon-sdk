import SwiftUI

struct MfaView: View {
    @EnvironmentObject private var authService: AuthonService

    @State private var mfaStatus: MfaStatus?
    @State private var setupResponse: MfaSetupResponse?
    @State private var isLoading = false
    @State private var otpCode = ""
    @State private var disableCode = ""
    @State private var errorMessage: String?
    @State private var showSetupSheet = false
    @State private var showDisableConfirm = false
    @State private var verifySuccess = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if isLoading && mfaStatus == nil {
                    loadingSection
                } else if let status = mfaStatus {
                    statusCard(status)
                    if status.enabled {
                        enabledActions(status)
                    } else {
                        disabledActions
                    }
                }
            }
            .padding(20)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Two-Factor Auth")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear(perform: fetchStatus)
        .sheet(isPresented: $showSetupSheet, onDismiss: fetchStatus) {
            MfaSetupSheet(setupResponse: $setupResponse, authService: authService)
        }
        .loadingOverlay(isLoading && mfaStatus != nil)
    }

    private var loadingSection: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .purple))
                .scaleEffect(1.3)
            Text("Loading 2FA status...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    private func statusCard(_ status: MfaStatus) -> some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(status.enabled ? Color.green.opacity(0.2) : Color.orange.opacity(0.2))
                    .frame(width: 70, height: 70)
                Image(systemName: status.enabled ? "shield.fill" : "shield.slash.fill")
                    .font(.title)
                    .foregroundStyle(status.enabled ? .green : .orange)
            }

            Text(status.enabled ? "2FA Enabled" : "2FA Disabled")
                .font(.title3.bold())
                .foregroundStyle(.white)

            Text(status.enabled
                 ? "Your account is protected with TOTP-based two-factor authentication."
                 : "Add an extra layer of security by enabling two-factor authentication.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            if let remaining = status.backupCodesRemaining, status.enabled {
                HStack(spacing: 6) {
                    Image(systemName: "doc.on.doc.fill")
                        .font(.caption)
                        .foregroundStyle(.purple)
                    Text("\(remaining) backup codes remaining")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func enabledActions(_ status: MfaStatus) -> some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            if verifySuccess {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                    Text("Code verified successfully").font(.footnote).foregroundStyle(.green)
                    Spacer()
                }
                .padding(12)
                .background(Color.green.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Verify TOTP Code")
                    .font(.headline)
                    .foregroundStyle(.white)

                OtpTextField(code: $otpCode)

                Button(action: verifyCode) {
                    Text("Verify Code")
                        .font(.body.bold())
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background(otpCode.count == 6 ? Color.purple : Color.purple.opacity(0.4))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(otpCode.count != 6)
            }

            Divider().background(Color.white.opacity(0.1))

            Button(role: .destructive) {
                showDisableConfirm = true
            } label: {
                Label("Disable 2FA", systemImage: "shield.slash.fill")
                    .font(.body.weight(.medium))
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity)
                    .frame(height: 46)
                    .background(Color.red.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .confirmationDialog("Disable Two-Factor Authentication?", isPresented: $showDisableConfirm, titleVisibility: .visible) {
                Button("Disable", role: .destructive) {
                    showDisableSheet()
                }
            } message: {
                Text("This will make your account less secure. You'll need your TOTP code to confirm.")
            }
        }
    }

    private var disabledActions: some View {
        VStack(spacing: 14) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            Button(action: startSetup) {
                Label("Enable Two-Factor Auth", systemImage: "shield.fill")
                    .font(.body.bold())
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(.purple)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Text("You'll need an authenticator app like Google Authenticator, Authy, or 1Password.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
    }

    private func fetchStatus() {
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                mfaStatus = try await authService.getMfaStatus()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func startSetup() {
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                setupResponse = try await authService.setupMfa()
                showSetupSheet = true
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func verifyCode() {
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                try await authService.verifyMfa(code: otpCode)
                verifySuccess = true
                otpCode = ""
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) { verifySuccess = false }
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func showDisableSheet() {
        // In a production app this would present a sheet for entering the TOTP code to confirm disable
        // For simplicity, we attempt with an empty prompt and let the user enter their code
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                try await authService.disableMfa(code: otpCode)
                mfaStatus = MfaStatus(enabled: false, totpConfigured: false, backupCodesRemaining: nil)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - MFA Setup Sheet

struct MfaSetupSheet: View {
    @Binding var setupResponse: MfaSetupResponse?
    let authService: AuthonService
    @Environment(\.dismiss) private var dismiss

    @State private var verifyCode = ""
    @State private var isVerifying = false
    @State private var errorMessage: String?
    @State private var verified = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if verified {
                        verifiedSection
                    } else if let setup = setupResponse {
                        setupContent(setup)
                    }
                }
                .padding(24)
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Setup 2FA")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(.secondary)
                }
            }
            .loadingOverlay(isVerifying)
        }
    }

    private func setupContent(_ setup: MfaSetupResponse) -> some View {
        VStack(spacing: 20) {
            Text("Scan the QR code with your authenticator app.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            // QR Code placeholder (in a real app, use CoreImage or a QR library)
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white)
                    .frame(width: 200, height: 200)
                VStack(spacing: 8) {
                    Image(systemName: "qrcode")
                        .font(.system(size: 80))
                        .foregroundStyle(.black)
                    Text("QR Code")
                        .font(.caption)
                        .foregroundStyle(.gray)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Manual Entry Key")
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(.secondary)
                Text(setup.secret)
                    .font(.system(.body, design: .monospaced))
                    .foregroundStyle(.purple)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .textSelection(.enabled)
            }

            if let backupCodes = setup.backupCodes, !backupCodes.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Backup Codes — Save these now")
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.orange)
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        ForEach(backupCodes, id: \.self) { code in
                            Text(code)
                                .font(.system(.caption, design: .monospaced))
                                .foregroundStyle(.white)
                                .padding(.vertical, 6)
                                .frame(maxWidth: .infinity)
                                .background(Color.white.opacity(0.07))
                                .clipShape(RoundedRectangle(cornerRadius: 6))
                        }
                    }
                }
            }

            Divider().background(Color.white.opacity(0.1))

            VStack(spacing: 12) {
                if let errorMessage = errorMessage {
                    ErrorBanner(message: errorMessage)
                }
                Text("Enter the 6-digit code from your authenticator to confirm setup.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                OtpTextField(code: $verifyCode)

                Button(action: confirmSetup) {
                    Text("Confirm & Enable")
                        .font(.body.bold())
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(verifyCode.count == 6 ? Color.purple : Color.purple.opacity(0.4))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(verifyCode.count != 6)
            }
        }
    }

    private var verifiedSection: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 60))
                .foregroundStyle(.green)

            Text("2FA Enabled!")
                .font(.title2.bold())
                .foregroundStyle(.white)

            Text("Your account is now protected with two-factor authentication.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button("Done") { dismiss() }
                .font(.body.bold())
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(.purple)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private func confirmSetup() {
        errorMessage = nil
        isVerifying = true
        Task {
            defer { isVerifying = false }
            do {
                try await authService.verifyMfa(code: verifyCode)
                verified = true
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - OTP Text Field

struct OtpTextField: View {
    @Binding var code: String

    var body: some View {
        TextField("000000", text: $code)
            .keyboardType(.numberPad)
            .multilineTextAlignment(.center)
            .font(.system(size: 32, weight: .bold, design: .monospaced))
            .tracking(8)
            .frame(height: 64)
            .background(Color.white.opacity(0.07))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.purple.opacity(0.5), lineWidth: 1.5))
            .foregroundStyle(.white)
            .onChange(of: code) { newValue in
                code = String(newValue.filter { $0.isNumber }.prefix(6))
            }
    }
}
