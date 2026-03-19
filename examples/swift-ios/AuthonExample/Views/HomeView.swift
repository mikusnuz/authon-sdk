import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var authService: AuthonService
    @State private var showSignOutConfirm = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                welcomeBanner
                quickStatsSection
                actionsSection
            }
            .padding(20)
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Home")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showSignOutConfirm = true
                } label: {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                        .foregroundStyle(.red)
                }
            }
        }
        .confirmationDialog("Sign out of your account?", isPresented: $showSignOutConfirm, titleVisibility: .visible) {
            Button("Sign Out", role: .destructive) {
                Task { try? await authService.signOut() }
            }
        }
    }

    private var welcomeBanner: some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.purple.opacity(0.2))
                    .frame(width: 80, height: 80)
                Text(avatarInitials)
                    .font(.title.bold())
                    .foregroundStyle(.purple)
            }

            VStack(spacing: 4) {
                Text("Hello, \(authService.currentUser?.fullName ?? "User")")
                    .font(.title2.bold())
                    .foregroundStyle(.white)

                if let email = authService.currentUser?.email {
                    Text(email)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }

            statusBadge
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var statusBadge: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(Color.green)
                .frame(width: 8, height: 8)
            Text("Authenticated")
                .font(.caption.weight(.medium))
                .foregroundStyle(.green)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 5)
        .background(Color.green.opacity(0.12))
        .clipShape(Capsule())
    }

    private var quickStatsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Account Details")
                .font(.headline)
                .foregroundStyle(.white)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                StatCard(
                    icon: "envelope.fill",
                    label: "Email Verified",
                    value: (authService.currentUser?.emailVerified == true) ? "Yes" : "No",
                    color: (authService.currentUser?.emailVerified == true) ? .green : .orange
                )
                StatCard(
                    icon: "calendar",
                    label: "Member Since",
                    value: formattedDate(authService.currentUser?.createdAt),
                    color: .purple
                )
                StatCard(
                    icon: "person.text.rectangle.fill",
                    label: "Username",
                    value: authService.currentUser?.username ?? "—",
                    color: .blue
                )
                StatCard(
                    icon: "key.fill",
                    label: "User ID",
                    value: shortId(authService.currentUser?.id),
                    color: .gray
                )
            }
        }
    }

    private var actionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.headline)
                .foregroundStyle(.white)

            VStack(spacing: 10) {
                NavigationLink(destination: ProfileView()) {
                    ActionRow(icon: "person.crop.circle.fill", title: "Edit Profile", color: .purple)
                }
                NavigationLink(destination: MfaView()) {
                    ActionRow(icon: "shield.checkerboard", title: "Manage 2FA", color: .blue)
                }
                NavigationLink(destination: SessionsView()) {
                    ActionRow(icon: "list.bullet.rectangle.fill", title: "Active Sessions", color: .teal)
                }
                NavigationLink(destination: DeleteAccountView()) {
                    ActionRow(icon: "trash.fill", title: "Delete Account", color: .red)
                }
            }
        }
    }

    private var avatarInitials: String {
        let name = authService.currentUser?.fullName ?? "U"
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    private func formattedDate(_ dateString: String?) -> String {
        guard let dateString = dateString else { return "—" }
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "—" }
        return date.formatted(.dateTime.month(.abbreviated).year())
    }

    private func shortId(_ id: String?) -> String {
        guard let id = id else { return "—" }
        return "..." + String(id.suffix(8))
    }
}

struct StatCard: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)

            VStack(alignment: .leading, spacing: 3) {
                Text(value)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .lineLimit(1)
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct ActionRow: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(color.opacity(0.2))
                    .frame(width: 38, height: 38)
                Image(systemName: icon)
                    .foregroundStyle(color)
                    .font(.callout)
            }

            Text(title)
                .font(.body)
                .foregroundStyle(.white)

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.bold())
                .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.white.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
