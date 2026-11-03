import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-app → File tree: group by feature, never by type.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct TypeBucketTests {
    private static var rule: Rule {
        .init(
            id: "no_type_bucket",
            description: "no_type_bucket — no global type folder (`Models/`, `Services/`, `Networking/`…) at the app root.",
            rationale: "Each feature owns its models, components and view models; global buckets grow into junk drawers.",
            fixHint: "Move the file into its feature (`Coordinators/<Feature>/Models/`, `UI/Views/<Feature>/Models/`) "
                + "or `Core/` for cross-cutting infra. See architecture-app → File tree.",
            badExample: "MyApp/Models/User.swift",
            goodExample: "MyApp/UI/Views/Profile/Models/User.swift"
        )
    }

    private static let buckets: Set<String> = [
        "Models", "Services", "Networking", "Persistence", "Helpers", "Managers", "Repositories"
    ]

    @Test
    func `no_type_bucket`() {
        Harmonize.productionCode().sources()
            .assertFalse(rule: Self.rule, baseline: ArchBaseline.names("no_type_bucket")) { file in
                guard let inner = ProjectTree.target(of: file)?.inner, inner.count > 1 else {
                    return false
                }
                return Self.buckets.contains(inner[0])
            }
    }
}
