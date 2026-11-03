import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-package → Rules: group by feature/domain, never by type.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct TypeBucketTests {
    private static var rule: Rule {
        .init(
            id: "no_type_bucket",
            description: "no_type_bucket — no type folder (`Models/`, `Services/`, `Helpers/`…) at a target's root.",
            rationale: "Each domain folder owns its types; root buckets mix every domain together.",
            fixHint: "Move the file into its domain folder (`Sources/<Target>/<Domain>/Models/`). "
                + "See architecture-package → Rules.",
            badExample: "Sources/Kit/Models/Invoice.swift",
            goodExample: "Sources/Kit/Billing/Models/Invoice.swift"
        )
    }

    private static let buckets: Set<String> = ["Models", "Services", "Helpers", "Managers", "Utils"]

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
