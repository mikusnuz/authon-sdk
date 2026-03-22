import SwiftUI

public struct SignedIn<Content: View>: View {
    @EnvironmentObject private var authon: Authon
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        if authon.isSignedIn {
            content
        }
    }
}
