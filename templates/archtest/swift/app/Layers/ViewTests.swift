import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-app → Layers: View = UI only, generic over its ViewModel, never touches a Store.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct ViewTests {
    private static var generic: Rule {
        .init(
            id: "view_generic_over_view_model",
            description: "view_generic_over_view_model — a View holds its view model through a generic parameter.",
            rationale: "`FooView<ViewModel: FooViewModel>` renders the mock in previews and the UI one in the app.",
            fixHint: "Declare `struct FooView<ViewModel: FooViewModel>: View` and type the property `ViewModel`. "
                + "See architecture-app → Layers.",
            badExample: "struct ProfileView: View { let viewModel: UIProfileViewModel }",
            goodExample: "struct ProfileView<ViewModel: ProfileViewModel>: View { let viewModel: ViewModel }"
        )
    }

    private static var noStore: Rule {
        .init(
            id: "view_no_store_access",
            description: "view_no_store_access — a View never holds a Store: only its coordinator does.",
            rationale: "Business logic lives in stores; views reach it through the view model.",
            fixHint: "Expose what the view needs on its view model; the coordinator injects the store there. "
                + "See architecture-app → Layers.",
            badExample: "@Environment(ProfileStore.self) private var store: ProfileStore",
            goodExample: "let viewModel: ViewModel  // reads ProfileStore inside UIProfileViewModel"
        )
    }

    @Test
    func `view_generic_over_view_model`() {
        views().assertTrue(rule: Self.generic, baseline: ArchBaseline.names("view_generic_over_view_model")) { view in
            let generics: [String] = view.node.genericParameterClause?.parameters.map(\.name.text) ?? []
            return view.variables
                .filter { Self.mentions("ViewModel", in: $0) }
                .allSatisfy { generics.contains($0.typeAnnotation?.name ?? "") }
        }
    }

    @Test
    func `view_no_store_access`() {
        views().assertTrue(rule: Self.noStore, baseline: ArchBaseline.names("view_no_store_access")) { view in
            !view.variables.contains { Self.mentions("Store", in: $0) }
        }
    }

    /// Views, coordinators excepted: they compose and inject.
    private func views() -> [Struct] {
        Harmonize.productionCode().structs(includeNested: true)
            .filter { $0.inheritanceTypesNames.map(ProjectTree.baseName).contains("View") }
            .withoutNameEndingWith("Coordinator")
    }

    /// Type, initial value or wrapper argument names a type ending with `suffix`.
    private static func mentions(_ suffix: String, in variable: Variable) -> Bool {
        let texts: [String] = [variable.typeAnnotation?.name, variable.initializerClause?.description]
            .compactMap(\.self) + variable.attributes.map(\.description)
        return texts.contains { text in
            text.split { !$0.isLetter && !$0.isNumber && $0 != "_" }.contains { $0.hasSuffix(suffix) }
        }
    }
}
