import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-global → Design principles: composition over inheritance.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct InheritanceTests {
    private static var rule: Rule {
        .init(
            id: "no_class_inheritance",
            description: "no_class_inheritance — a class never inherits from a class of this project.",
            rationale: "Composition over inheritance: shared behavior = injected dependency or protocol.",
            fixHint: "Data → struct, shared mutable state → actor, behavior → protocol + injected field. "
                + "See architecture-global → Design principles.",
            badExample: "final class ProfileStore: BaseStore { }",
            goodExample: "final class ProfileStore { private let client: any APIClient }"
        )
    }

    @Test
    func `no_class_inheritance`() {
        let classes: [Class] = Harmonize.productionCode().classes(includeNested: true)
        let projectClasses: Set<String> = .init(classes.map(\.name))
        classes.assertFalse(rule: Self.rule, baseline: ArchBaseline.names("no_class_inheritance")) { type in
            type.inheritanceTypesNames.contains { projectClasses.contains(ProjectTree.baseName($0)) }
        }
    }
}
