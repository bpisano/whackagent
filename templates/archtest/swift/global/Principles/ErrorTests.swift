import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-global → Design principles: errors as enums.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct ErrorTests {
    private static var rule: Rule {
        .init(
            id: "error_is_enum",
            description: "error_is_enum — every Error type is an enum.",
            rationale: "Errors are sum types: callers switch over every case, no codes or sentinels.",
            fixHint: "Turn it into `enum FooError: Error`, one case per failure, data as associated values. "
                + "See architecture-global → Design principles.",
            badExample: "struct LoginError: Error { let code: Int }",
            goodExample: "enum LoginError: Error { case wrongPassword, locked(until: Date) }"
        )
    }

    private static let errorProtocols: Set<String> = ["Error", "LocalizedError"]

    @Test
    func `error_is_enum`() {
        let scope: any HarmonizeScope = Harmonize.productionCode()
        let isError: ([String]) -> Bool = { $0.contains { Self.errorProtocols.contains(ProjectTree.baseName($0)) } }
        let structs: [Struct] = scope.structs(includeNested: true)
        let classes: [Class] = scope.classes(includeNested: true)
        let baseline: [[String]] = ArchBaseline.split("error_is_enum", among: [structs.map(\.name), classes.map(\.name)])
        structs.assertFalse(rule: Self.rule, baseline: baseline[0]) { isError($0.inheritanceTypesNames) }
        classes.assertFalse(rule: Self.rule, baseline: baseline[1]) { isError($0.inheritanceTypesNames) }
    }
}
