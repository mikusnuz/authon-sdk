// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AuthonExample",
    platforms: [.iOS(.v15)],
    dependencies: [
        .package(path: "../../swift"),
    ],
    targets: [
        .executableTarget(
            name: "AuthonExample",
            dependencies: [.product(name: "Authon", package: "swift")],
            path: "AuthonExample"
        ),
    ]
)
