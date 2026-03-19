import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authService: AuthonService

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var username = ""
    @State private var isLoading = false
    @State private var isSaved = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                avatarSection
                formSection
                saveButton
            }
            .padding(20)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear(perform: populateFields)
        .loadingOverlay(isLoading)
    }

    private var avatarSection: some View {
        VStack(spacing: 12) {
            ZStack(alignment: .bottomTrailing) {
                Circle()
                    .fill(Color.purple.opacity(0.25))
                    .frame(width: 100, height: 100)
                    .overlay(
                        Text(initials)
                            .font(.largeTitle.bold())
                            .foregroundStyle(.purple)
                    )

                Circle()
                    .fill(Color.purple)
                    .frame(width: 30, height: 30)
                    .overlay(
                        Image(systemName: "camera.fill")
                            .font(.caption2)
                            .foregroundStyle(.white)
                    )
                    .offset(x: 4, y: 4)
            }

            if let email = authService.currentUser?.email {
                Text(email)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }

    private var formSection: some View {
        VStack(spacing: 16) {
            if let errorMessage = errorMessage {
                ErrorBanner(message: errorMessage)
            }

            if isSaved {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text("Profile updated successfully")
                        .font(.footnote)
                        .foregroundStyle(.green)
                    Spacer()
                }
                .padding(12)
                .background(Color.green.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            HStack(spacing: 12) {
                AuthTextField(title: "First Name", text: $firstName)
                AuthTextField(title: "Last Name", text: $lastName)
            }

            AuthTextField(title: "Username", text: $username)
        }
    }

    private var saveButton: some View {
        Button(action: saveProfile) {
            Text("Save Changes")
                .font(.body.bold())
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(.purple)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(isLoading)
    }

    private var initials: String {
        let fn = firstName.prefix(1)
        let ln = lastName.prefix(1)
        let combined = "\(fn)\(ln)"
        return combined.isEmpty ? "U" : combined.uppercased()
    }

    private func populateFields() {
        guard let user = authService.currentUser else { return }
        firstName = user.firstName ?? ""
        lastName  = user.lastName ?? ""
        username  = user.username ?? ""
    }

    private func saveProfile() {
        errorMessage = nil
        isSaved = false
        isLoading = true
        Task {
            defer { isLoading = false }
            do {
                _ = try await authService.updateProfile(
                    firstName: firstName.isEmpty ? nil : firstName,
                    lastName:  lastName.isEmpty  ? nil : lastName,
                    username:  username.isEmpty   ? nil : username
                )
                isSaved = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    isSaved = false
                }
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
