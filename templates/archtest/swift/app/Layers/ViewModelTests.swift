import Harmonize
import HarmonizeSemantics
import Testing

/// architecture-app → Layers: protocol FooViewModel + @Observable UIFooViewModel + MockFooViewModel.
@Suite
@MainActor  // Harmonize 1.3 deadlocks on the cooperative pool: run on main, like XCTest
struct ViewModelTests {
    private static var isProtocol: Rule {
        .init(
            id: "view_model_is_protocol",
            description: "view_model_is_protocol — a concrete view model is `UI<Name>` or `Mock<Name>`, behind protocol `<Name>`.",
            rationale: "Views depend on the protocol: previews and tests swap in the mock.",
            fixHint: "Declare `protocol FooViewModel`, rename the type `UIFooViewModel`, add `MockFooViewModel`. "
                + "See architecture-app → Layers.",
            badExample: "@Observable final class ProfileViewModel { }",
            goodExample: "protocol ProfileViewModel { }\n@Observable final class UIProfileViewModel: ProfileViewModel { }"
        )
    }

    private static var conforms: Rule {
        .init(
            id: "ui_view_model_conforms",
            description: "ui_view_model_conforms — `UIFooViewModel` conforms to `FooViewModel`.",
            rationale: "The UI implementation is one conformer of the protocol the view is generic over.",
            fixHint: "Add the protocol to the inheritance clause: `UIFooViewModel: FooViewModel`. "
                + "See architecture-app → Layers.",
            badExample: "final class UIProfileViewModel { }",
            goodExample: "final class UIProfileViewModel: ProfileViewModel { }"
        )
    }

    private static var observable: Rule {
        .init(
            id: "ui_view_model_observable",
            description: "ui_view_model_observable — `UIFooViewModel` is `@Observable`.",
            rationale: "Observation drives SwiftUI updates. No Combine, no ObservableObject.",
            fixHint: "Mark the class `@Observable`. See architecture-app → Layers.",
            badExample: "final class UIProfileViewModel: ObservableObject { }",
            goodExample: "@Observable\nfinal class UIProfileViewModel: ProfileViewModel { }"
        )
    }

    private static var hasMock: Rule {
        .init(
            id: "view_model_has_mock",
            description: "view_model_has_mock — every `FooViewModel` protocol has a `MockFooViewModel`.",
            rationale: "Previews and view tests run on the mock, never on live stores.",
            fixHint: "Add `MockFooViewModel: FooViewModel` beside it in `ViewModels/`. See architecture-app → Layers.",
            badExample: "protocol ProfileViewModel { }  // no mock",
            goodExample: "struct MockProfileViewModel: ProfileViewModel { }"
        )
    }

    private let scope: any HarmonizeScope = Harmonize.productionCode()

    @Test
    func `view_model_is_protocol`() {
        let isWrapped: (String) -> Bool = { $0.hasPrefix("UI") || $0.hasPrefix("Mock") }
        let classes: [Class] = scope.classes(includeNested: true).withNameEndingWith("ViewModel")
        let structs: [Struct] = scope.structs(includeNested: true).withNameEndingWith("ViewModel")
        let baseline: [[String]] = ArchBaseline.split(
            "view_model_is_protocol",
            among: [classes.map(\.name), structs.map(\.name)]
        )
        classes.assertTrue(rule: Self.isProtocol, baseline: baseline[0]) { isWrapped($0.name) }
        structs.assertTrue(rule: Self.isProtocol, baseline: baseline[1]) { isWrapped($0.name) }
    }

    @Test
    func `ui_view_model_conforms`() {
        uiViewModels().assertTrue(rule: Self.conforms, baseline: ArchBaseline.names("ui_view_model_conforms")) { type in
            let name: String = .init(type.name.dropFirst(2))
            return type.inheritanceTypesNames.map(ProjectTree.baseName).contains(name)
        }
    }

    @Test
    func `ui_view_model_observable`() {
        uiViewModels().assertTrue(rule: Self.observable, baseline: ArchBaseline.names("ui_view_model_observable")) {
            $0.hasAttribute(named: "Observable")
        }
    }

    @Test
    func `view_model_has_mock`() {
        let types: [String] = scope.classes(includeNested: true).map(\.name)
            + scope.structs(includeNested: true).map(\.name)
        let names: Set<String> = .init(types)
        scope.protocols().withNameEndingWith("ViewModel")
            .assertTrue(rule: Self.hasMock, baseline: ArchBaseline.names("view_model_has_mock")) {
                names.contains("Mock" + $0.name)
            }
    }

    private func uiViewModels() -> [Class] {
        scope.classes(includeNested: true)
            .withNameStartingWith("UI")
            .withNameEndingWith("ViewModel")
    }
}
