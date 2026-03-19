import SwiftUI

@main
struct AuthonExampleApp: App {
    @StateObject private var authService = AuthonService.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .preferredColorScheme(.dark)
        }
    }
}
