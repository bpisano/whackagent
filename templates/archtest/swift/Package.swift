// swift-tools-version: 6.0
// whackagent — architecture rules as unit tests (Harmonize).
// Run: swift test --package-path Architecture
// Agents never edit this package: a rule changes through a task, module + test together.

import PackageDescription

let package: Package = .init(
    name: "Architecture",
    platforms: [.macOS(.v14)],
    dependencies: [
        .package(url: "https://github.com/perrystreetsoftware/Harmonize.git", from: "1.3.0")
    ],
    targets: [
        .testTarget(
            name: "ArchitectureTests",
            dependencies: [
                .product(name: "Harmonize", package: "Harmonize"),
                .product(name: "HarmonizeSemantics", package: "Harmonize")
            ],
            path: "Tests/ArchitectureTests"
        )
    ]
)
