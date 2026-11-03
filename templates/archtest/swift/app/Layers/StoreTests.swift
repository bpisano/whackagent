import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-app → Layers: Store = @MainActor @Observable, state + business logic.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct StoreTests {
    private static var rule: Rule {
        .init(
            id: "store_main_actor_observable",
            description: "store_main_actor_observable — every `FooStore` is a `@MainActor @Observable` class.",
            rationale: "Stores hold UI state: main actor for safety, Observation to feed view models.",
            fixHint: "Declare `@MainActor @Observable final class FooStore`. See architecture-app → Layers.",
            badExample: "actor ProfileStore { }",
            goodExample: "@MainActor\n@Observable\nfinal class ProfileStore { }"
        )
    }

    @Test
    func `store_main_actor_observable`() {
        let scope: any HarmonizeScope = Harmonize.productionCode()
        let classes: [Class] = scope.classes(includeNested: true).withNameEndingWith("Store")
        let structs: [Struct] = scope.structs(includeNested: true).withNameEndingWith("Store")
        let actors: [ActorDeclaration] = scope.actors(includeNested: true).withNameEndingWith("Store")
        let baseline: [[String]] = ArchBaseline.split(
            "store_main_actor_observable",
            among: [classes.map(\.name), structs.map(\.name), actors.map(\.name)]
        )
        classes.assertTrue(rule: Self.rule, baseline: baseline[0]) {
            $0.hasAttribute(named: "MainActor") && $0.hasAttribute(named: "Observable")
        }
        structs.assertEmpty(rule: Self.rule, baseline: baseline[1])
        actors.assertEmpty(rule: Self.rule, baseline: baseline[2])
    }
}
