// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Authon",
    platforms: [.iOS(.v15), .macOS(.v12)],
    products: [.library(name: "Authon", targets: ["Authon"])],
    targets: [.target(name: "Authon", path: "Sources/Authon")]
)
