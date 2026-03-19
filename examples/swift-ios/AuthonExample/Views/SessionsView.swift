import SwiftUI

struct SessionsView: View {
    @EnvironmentObject private var authService: AuthonService

    @State private var sessions: [AppSession] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var sessionToRevoke: AppSession?
    @State private var showRevokeConfirm = false

    var body: some View {
        Group {
            if isLoading && sessions.isEmpty {
                loadingView
            } else if let errorMessage = errorMessage {
                errorView(errorMessage)
            } else if sessions.isEmpty {
                emptyView
            } else {
                sessionList
            }
        }
        .background(Color.black.ignoresSafeArea())
        .navigationTitle("Sessions")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await loadSessions() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .foregroundStyle(.purple)
                }
                .disabled(isLoading)
            }
        }
        .onAppear {
            Task { await loadSessions() }
        }
        .confirmationDialog("Revoke this session?", isPresented: $showRevokeConfirm, titleVisibility: .visible) {
            Button("Revoke", role: .destructive) {
                if let session = sessionToRevoke {
                    Task { await revokeSession(session) }
                }
            }
        } message: {
            Text("The device using this session will be signed out immediately.")
        }
        .loadingOverlay(isLoading && !sessions.isEmpty)
    }

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .purple))
                .scaleEffect(1.3)
            Text("Loading sessions...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 14) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") {
                Task { await loadSessions() }
            }
            .foregroundStyle(.purple)
        }
        .padding(40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyView: some View {
        VStack(spacing: 14) {
            Image(systemName: "list.bullet.rectangle")
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text("No sessions found")
                .font(.headline)
                .foregroundStyle(.white)
            Text("Active sessions will appear here.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var sessionList: some View {
        List {
            Section {
                ForEach(sessions) { session in
                    SessionRow(session: session) {
                        sessionToRevoke = session
                        showRevokeConfirm = true
                    }
                }
            } header: {
                Text("\(sessions.count) active session\(sessions.count == 1 ? "" : "s")")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .textCase(nil)
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
    }

    private func loadSessions() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            sessions = try await authService.listSessions()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func revokeSession(_ session: AppSession) async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await authService.revokeSession(id: session.id)
            sessions.removeAll { $0.id == session.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct SessionRow: View {
    let session: AppSession
    let onRevoke: () -> Void

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(statusColor.opacity(0.2))
                    .frame(width: 42, height: 42)
                Image(systemName: "iphone")
                    .foregroundStyle(statusColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Session")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                    Spacer()
                    statusBadge
                }

                Text("Last active \(relativeDate(session.lastActiveAt))")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text("Expires \(relativeDate(session.expireAt))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Button(action: onRevoke) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(.red.opacity(0.7))
                    .font(.title3)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 4)
        .listRowBackground(Color.white.opacity(0.05))
    }

    private var statusColor: Color {
        session.status == "active" ? .green : .gray
    }

    private var statusBadge: some View {
        Text(session.status.capitalized)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(statusColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(statusColor.opacity(0.15))
            .clipShape(Capsule())
    }

    private func relativeDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        let relative = RelativeDateTimeFormatter()
        relative.unitsStyle = .abbreviated
        return relative.localizedString(for: date, relativeTo: Date())
    }
}
