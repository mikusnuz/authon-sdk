import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authService: AuthonService

    var body: some View {
        Group {
            if authService.isAuthenticated {
                AuthenticatedTabView()
            } else {
                NavigationStack {
                    SignInView()
                }
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authService.isAuthenticated)
    }
}

struct AuthenticatedTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }

            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }

            NavigationStack {
                SessionsView()
            }
            .tabItem {
                Label("Sessions", systemImage: "list.bullet.rectangle.fill")
            }
        }
        .tint(.purple)
    }
}
