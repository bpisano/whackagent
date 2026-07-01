# Swift — Coding style

> whackagent convention module · review category: **style**. Load every Swift project. `wa-reviewer` (style) and `wa-implementer` obey.

## One type per file

One `class` / `struct` / `enum` / `protocol` per file. Filename match top-level type (`UserStore.swift` hold `UserStore`).

Only exception: `private extension` nesting helper types of main type may share file.

```swift
// Badge.swift
struct Badge: View { /* ... */ }

private extension Badge {
    enum Layout {                 // ✅ nested helper, same file
        static let size: CGFloat = 56
    }
}
```

## Explicit types

Annotate type every declaration, even when compiler infer.

```swift
let count: Int = 0
let items: [Item] = []
let store: UserStore = .init()   // ✅
let store = UserStore()          // ❌ type not explicit
```

Exception — optional binding take no explicit type:

```swift
guard let value else { return }            // ✅
if let coordinate { center(on: coordinate) } // ✅
```

## `.init()`

Use `.init()` on right when type explicit on left — never repeat type name.

```swift
let store: UserStore = .init()      // ✅
let store: UserStore = UserStore()  // ❌ redundant
```

## Member order

Members fixed order. Within each section, order by access: `public` → internal (no keyword) → `private`, separate access subgroups one blank line.

1. Static stored properties
2. Instance stored properties
3. `init` then `deinit`
4. Static methods
5. Instance methods

```swift
@MainActor
@Observable
final class UserStore {
    static let shared: UserStore = .init()

    private(set) var users: [User] = []

    private let repository: any UserRepository

    init(repository: any UserRepository) {
        self.repository = repository
    }

    static func live() -> UserStore {
        .init(repository: LiveUserRepository())
    }

    func load() async throws {
        users = try await repository.fetchAll()
    }

    private func broadcast() { /* ... */ }
}
```

## Comments

- No comments for obvious code.
- No comments when editing code after user feedback.
- Add `///` doc comments for all public API (structs, classes, methods, properties, enums, protocols). Include `- Parameters:`, `- Returns:` and `- Throws:` sections when applicable. *(Disable via `public_doc` toggle for teams not requiring it.)*

## File header

Keep default Xcode header: filename, project name, blank line, then `Created by` + author + date (`DD/MM/YYYY`). Nothing else.

```swift
//
//  File.swift
//  ProjectName
//
//  Created by Benjamin Pisano on 20/05/2026.
//
```

## Multi-line declarations

When single function call or declaration span multiple lines, break after opening parenthesis and before closing parenthesis. Indent inner lines one tab (4 spaces). No trailing commas.

```swift
func doSomething(
    with parameter: SomeType,
    and anotherParameter: AnotherType
) -> ReturnType {
    /* ... */
}
```

Same for multi-line `if let` / `guard let`:

```swift
guard
    let first = items.first,
    let second = items.dropFirst().first
else {
    return
}

if
    let first = items.first,
    let second = items.dropFirst().first
{
    /* ... */
}
```

## Pattern matching

Bind with `case let` once on left, not `let` on each value.

```swift
case let .example(a, b):   // ✅
case .example(let a, let b): // ❌
```