# Swift — Testing & mocks

> whackagent convention module · review category: **style**. Loads when project has (or should have) tests.

## Testing

- Swift Testing — never XCTest.
- Group tests in `@Suite struct`, one suite per file (one-type rule).
- Use backtick name syntax so test name carries description without duplicating in string.
- Assert with `#expect`; use `#require` to unwrap or stop test on failure.
- Use `async`/`await` for async tests.
- Put `@Suite` and `@Test` attributes on separate line from declaration.

```swift
@Suite
struct UserStoreTests {
    @Test
    func `loads users from repository`() async throws {
        let store: UserStore = .init(repository: StubUserRepository())

        try await store.load()

        let first: User = try #require(store.users.first)
        #expect(first.name == "Ada")
        #expect(store.users.count == 3)
    }
}
```

## Model mocks

Model needs mock (previews, tests) → add `static func mock(...)` in extension in **same file** as model. Every parameter mirrors stored property and **has default value**, so `.mock()` works bare and any field overridable.

```swift
// User.swift
struct User: Identifiable, Sendable {
    let id: UUID
    let name: String
    let isAdmin: Bool
}

extension User {
    static func mock(
        id: UUID = .init(),
        name: String = "Ada Lovelace",
        isAdmin: Bool = false
    ) -> User {
        .init(id: id, name: name, isAdmin: isAdmin)
    }
}
```

```swift
User.mock()                 // ✅ all defaults
User.mock(isAdmin: true)    // ✅ override one field
```