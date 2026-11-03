import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-app / architecture-package → Extensions.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct ExtensionTests {
    private static var rule: Rule {
        .init(
            id: "extension_folder",
            description: "extension_folder — every `<Type>Extension.swift` lives in an `Extensions/` folder.",
            rationale: "Extensions of outside types are found in one place, never scattered among features.",
            fixHint: "Move the file to `Utils/Extensions/` (app) or the feature's `Extensions/` (package). "
                + "See architecture-app / architecture-package → Extensions.",
            badExample: "MyApp/Profile/DateExtension.swift",
            goodExample: "MyApp/Utils/Extensions/DateExtension.swift"
        )
    }

    @Test
    func `extension_folder`() {
        let files: [SwiftSourceCode] = Harmonize.productionCode().sources()
            .filter { $0.fileName?.hasSuffix("Extension.swift") == true }
        files.assertTrue(rule: Self.rule, baseline: ArchBaseline.names("extension_folder")) { file in
            ProjectTree.components(of: file).dropLast().contains("Extensions")
        }
    }
}
