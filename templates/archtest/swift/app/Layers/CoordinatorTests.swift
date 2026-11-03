import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-app → Layers: Coordinator = View struct, navigation + composition + child injection.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct CoordinatorTests {
    private static var rule: Rule {
        .init(
            id: "coordinator_is_view",
            description: "coordinator_is_view — every `FooCoordinator` is a `struct` conforming to `View`.",
            rationale: "Coordinators are SwiftUI views that own navigation and inject children: no reference type.",
            fixHint: "Declare `struct FooCoordinator: View` and build children in `body`. See architecture-app → Layers.",
            badExample: "final class ProfileCoordinator { }",
            goodExample: "struct ProfileCoordinator: View { var body: some View { … } }"
        )
    }

    @Test
    func `coordinator_is_view`() {
        let scope: any HarmonizeScope = Harmonize.productionCode()
        let structs: [Struct] = scope.structs(includeNested: true).withNameEndingWith("Coordinator")
        let classes: [Class] = scope.classes(includeNested: true).withNameEndingWith("Coordinator")
        let baseline: [[String]] = ArchBaseline.split(
            "coordinator_is_view",
            among: [structs.map(\.name), classes.map(\.name)]
        )
        structs.assertTrue(rule: Self.rule, baseline: baseline[0]) {
            $0.inheritanceTypesNames.map(ProjectTree.baseName).contains("View")
        }
        classes.assertEmpty(rule: Self.rule, baseline: baseline[1])
    }
}
