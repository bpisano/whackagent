import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-package → Rules: no flat tree.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct FlatTargetTests {
    private static var rule: Rule {
        .init(
            id: "no_flat_target",
            description: "no_flat_target — at most 7 files directly under `Sources/<Target>/`.",
            rationale: "A pile of files at the target root hides the domains; folders show them.",
            fixHint: "Group the root files into domain folders. See architecture-package → Rules.",
            badExample: "Sources/Kit/{A,B,C,D,E,F,G,H}.swift",
            goodExample: "Sources/Kit/Billing/…, Sources/Kit/Sync/…"
        )
    }

    private static let maxRootFiles: Int = 7

    @Test
    func `no_flat_target`() {
        let files: [SwiftSourceCode] = Harmonize.productionCode().sources()
        let rootFiles: [String: Int] = files.reduce(into: [:]) { counts, file in
            guard let target = ProjectTree.target(of: file), target.inner.count == 1 else {
                return
            }
            counts[target.name, default: 0] += 1
        }
        files.assertFalse(rule: Self.rule, baseline: ArchBaseline.names("no_flat_target")) { file in
            guard let target = ProjectTree.target(of: file), target.inner.count == 1 else {
                return false
            }
            return rootFiles[target.name, default: 0] > Self.maxRootFiles
        }
    }
}
