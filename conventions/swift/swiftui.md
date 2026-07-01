# Swift — SwiftUI

> whackagent convention module · review category: **style** (loaded by style + elegance reviewers). **Only copied into project when SwiftUI actually used.** SwiftPM library or CLI with no SwiftUI never see this file.

## View structure

View = Swift type — general member order still apply: `static` constants top, methods bottom. Only instance stored properties use property-wrapper order below:

1. `let` constants
2. `@State`
3. `@FocusState`
4. `@Binding`
5. `@Environment` (system-provided first, then custom)

```swift
struct ProfileView: View {
    private static let spacing: CGFloat = 16

    private let title: String

    @State private var isExpanded: Bool = false

    @Binding private var selection: Item?

    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.userStore) private var store

    var body: some View {
        /* ... */
    }
}
```

Decompose views into small reusable components, each own file even if private to parent. No nested types for views.

## View init

Make init pretty, match SwiftUI built-ins. Hide primary param behind label-less first arg.

```swift
struct ProfileView: View {
    private let title: String

    init(_ title: String) {
        self.title = title
    }
}
```

## Modifier-style customization

Expose optional/customization props through view-modifier methods, not init params. Give default value when possible.

```swift
struct ProfileView: View {
    let title: String

    private var isHighlighted: Bool = false

    var body: some View {
        Text(title)
            .foregroundStyle(isHighlighted ? .primary : .secondary)
    }
}

extension ProfileView {
    func highlighted(_ isHighlighted: Bool = true) -> Self {
        var copy: Self = self
        copy.isHighlighted = isHighlighted
        return copy
    }
}
```

## Custom styles expose a static accessor

Every custom style type (`ButtonStyle`, `LabelStyle`, `ToggleStyle`, …) **must** ship convenience extension on its protocol constrained to `Self == TheStyle`, so call sites use dotted form. Style without this extension = incomplete.

```swift
private struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View { /* ... */ }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var primary: Self {
        .init()
    }

    // with parameters, expose a func instead:
    // static func primary(_ variant: Variant = .filled) -> Self { .init(variant: variant) }
}
```

```swift
Button("Save") { save() }
    .buttonStyle(.primary)             // ✅ dotted accessor
    .buttonStyle(PrimaryButtonStyle()) // ❌ bare initializer
```

## Previews

Every View has `#Preview` in its file. Multiple states → one preview per state.

```swift
struct Badge: View {
    var isSelected: Bool = false
    /* ... */
}

#Preview("Selected") {
    Badge(isSelected: true)
}

#Preview("Deselected") {
    Badge(isSelected: false)
}
```