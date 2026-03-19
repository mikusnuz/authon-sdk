import SwiftUI

struct DeleteAccountView: View {
    @EnvironmentObject private var authService: AuthonService
    @Environment(\.dismiss) private var dismiss

    @State private var password = ""
    @State private var confirmText = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showFinalConfirm = false

    private let requiredConfirmText = "DELETE"

    private var canDelete: Bool {
        !password.isEmpty && confirmText == requiredConfirmText
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                warningSection
                confirmationSection
                deleteButton
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 40)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Delete Account")
        .navigationBarTitleDisplayMode(.inline)
        .confirmationDialog("This action is irreversible.", isPresented: $showFinalConfirm, titleVisibility: .visible) {
            Button("Permanently Delete Account", role: .destructive, action: performDelete)
        } message: {
            Text("All your data will be permanently deleted and cannot be recovered.")
        }
        .loadingOverlay(isLoading)
    }

    private var warningSection: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.15))
                    .frame(width: 80, height: 80)
                Image(systemName: "trash.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(.red)
            }

            Text("Delete Your Account")
                .font(.title2.bold())
                .foregroundStyle(.white)

            VStack(spacing: 10) {
                DangerItem(text: "All your personal data will be permanently deleted")
                DangerItem(text: "Your sessions will be immediately invalidated")
                DangerItem(text: "This action cannot be undone")
            }
            .padding(16)
            .background(Color.red.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
            )
        }
    }

    private var confirmationSection: some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            AuthSecureField(title: "Enter your password to confirm", text: $password)

            VStack(alignment: .leading, spacing: 6) {
                Text("Type **\(requiredConfirmText)** to confirm")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                TextField("", text: $confirmText)
                    .autocapitalization(.allCharacters)
                    .autocorrectionDisabled()
                    .padding(.horizontal, 14)
                    .frame(height: 48)
                    .background(Color.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(
                                confirmText.isEmpty ? Color.white.opacity(0.15) :
                                    (confirmText == requiredConfirmText ? Color.red.opacity(0.6) : Color.orange.opacity(0.5)),
                                lineWidth: 1
                            )
                    )
                    .foregroundStyle(.white)
            }
        }
    }

    private var deleteButton: some View {
        Button {
            showFinalConfirm = true
        } label: {
            Label("Permanently Delete Account", systemImage: "trash.fill")
                .font(.body.bold())
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(canDelete ? Color.red : Color.red.opacity(0.3))
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(!canDelete || isLoading)
    }

    private func performDelete() {
        errorMessage = nil
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                try await authService.deleteAccount(password: password)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

struct DangerItem: View {
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "xmark.circle.fill")
                .foregroundStyle(.red)
                .font(.callout)
            Text(text)
                .font(.footnote)
                .foregroundStyle(.secondary)
            Spacer()
        }
    }
}
