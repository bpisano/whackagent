# Swift — Elegance (idiomatic Swift)

> whackagent convention module · review category: **elegance**. Loaded every Swift project. This "real Swift, not C written in Swift" gate.

## Code speaks for itself

The bar: archi-clean, as written by a senior iOS dev. Names + structure carry the meaning — a reader understands it without comments. Need a comment to explain *what* code does? Rename/restructure instead. Headline goal; everything below serves it.

## Idiomatic Swift, not C-in-Swift

Write to grain of language. Reject patterns ported from C/Objective-C/Java when Swift offer better one.

- **Value types first.** `struct`/`enum` for models and state. Reach for `class` only when need reference semantics or identity.
- **`enum` for fixed state**, not booleans-and-flags or magic strings/ints. Model impossible states out of existence. Cases open/extensible or each owns its own behavior → protocol + struct instead (see architecture module).
- **Optionals over sentinels.** No `-1` / `""` / `NSNotFound` to mean "absent". Use `Optional`, `guard let`, `if let`, `??`.
- **Functional transforms.** `map` / `filter` / `compactMap` / `reduce` / `first(where:)` over manual index loops and mutable accumulators.
- **`guard` for early exit.** Flatten happy path; bail on preconditions at top.
- **Protocol-oriented + generics** over class hierarchies. Constrain with `where`. Prefer `some`/`any` appropriately.
- **`Result` / `throws`** for failure, not out-parameters or sentinel returns.
- **`Sequence`/`Collection` idioms.** Slices, `zip`, `enumerated`, `lazy` where it pays.
- **No stringly-typed APIs.** Use enums, `KeyPath`, strong types instead of passing strings around.
- **Let type system work.** `let` over `var`; immutability by default; phantom/wrapper types where they prevent bugs.

Reviewer see C-style index loop, class that should be struct, boolean soup that should be enum, or sentinel value — that finding.

## Advanced features (use sparingly)

Easy to forget, but can make genuinely complex code far more elegant. Use with care — don't reach for them on simple cases; they earn their place only when they cut real complexity.

- **`@resultBuilder`** — for embedded DSLs / declarative composition (building a tree/config from nested expressions). Worth it when callers benefit from declarative syntax.
- **`@propertyWrapper`** — to factor out repeated property behavior (validation, storage, transformation). Worth it when the same wrapping logic recurs across properties.
- **`callAsFunction`** — to give a type a natural call-site (`thing(x)`) when it's conceptually a function/operation object. Worth it for single-purpose operation types.

Rule: prefer the plain version first. Reach for these only to simplify a case that's genuinely too complex without them — and never just to show off.

## Concurrency

Full Swift concurrency. **No Combine.**

- Use `async`/`await`, `AsyncSequence`/`AsyncStream`, `Observations` / `withObservationTracking` for reactive propagation.
- Never `CurrentValueSubject`, `PassthroughSubject`, `.sink`, `AnyCancellable`, or completion handlers.
- `Sendable` on all domain models.
- `actor` / `@MainActor` isolation for shared mutable state.
- Always use `Mutex` over `NSLock`.
