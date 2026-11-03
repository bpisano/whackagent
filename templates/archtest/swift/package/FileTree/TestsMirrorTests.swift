import Foundation
import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-package → Rules: tests mirror the source tree.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct TestsMirrorTests {
    private static var rule: Rule {
        .init(
            id: "tests_mirror_sources",
            description: "tests_mirror_sources — `Tests/<Target>Tests/<path>/` matches a `Sources/<Target>/<path>/` folder.",
            rationale: "A test sits where its code sits: finding one finds the other.",
            fixHint: "Move the test file to the folder mirroring its source. See architecture-package → Rules.",
            badExample: "Tests/KitTests/InvoiceTests.swift  // source in Sources/Kit/Billing/",
            goodExample: "Tests/KitTests/Billing/InvoiceTests.swift"
        )
    }

    @Test
    func `tests_mirror_sources`() {
        let tests: [SwiftSourceCode] = Harmonize.testCode().sources()
            .filter { ProjectTree.components(of: $0).first == "Tests" }
        tests.assertTrue(rule: Self.rule, baseline: ArchBaseline.names("tests_mirror_sources")) { file in
            guard let test = ProjectTree.target(of: file), test.name.hasSuffix("Tests") else {
                return true
            }
            let folders: [String] = test.inner.dropLast()
            let source: URL = folders.reduce(
                ProjectTree.root.appendingPathComponent("Sources").appendingPathComponent(String(test.name.dropLast(5)))
            ) { $0.appendingPathComponent($1) }
            var isFolder: ObjCBool = false
            return FileManager.default.fileExists(atPath: source.path, isDirectory: &isFolder) && isFolder.boolValue
        }
    }
}
