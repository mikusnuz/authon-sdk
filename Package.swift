// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Authon",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "Authon", targets: ["Authon"])],
    targets: [.target(name: "Authon", path: "swift/Sources/Authon")]
)
