// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Authup",
    platforms: [.iOS(.v15), .macOS(.v12)],
    products: [.library(name: "Authup", targets: ["Authup"])],
    targets: [.target(name: "Authup", path: "Sources/Authup")]
)
