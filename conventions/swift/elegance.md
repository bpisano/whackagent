# Swift — Elegance (idiomatic Swift)

> whackagent convention module · review category: **elegance**. Load every Swift project. This "real Swift, not C written in Swift" gate.

## Code speaks for itself

Bar: archi-clean, like senior iOS dev write. Names + structure carry meaning — reader get it, no comments. Need comment to explain *what* code do? Rename/restructure instead. Headline goal; all below serve it.

## Idiomatic Swift, not C-in-Swift

Write to grain of language. Reject patterns from C/Objective-C/Java when Swift offer better.

- **Value types first.** `struct`/`enum` for models and state. Reach for `class` only when need reference semantics or identity.
- **`enum` for fixed state**, not booleans-and-flags or magic strings/ints. Model impossible states out of existence. Cases open/extensible or each own behavior → protocol + struct instead (see architecture module).
- **Optionals over sentinels.** No `-1` / `""` / `NSNotFound` mean "absent". Use `Optional`, `guard let`, `if let`, `??`.
- **Functional transforms.** `map` / `filter` / `compactMap` / `reduce` / `first(where:)` over manual index loops and mutable accumulators.
- **`guard` for early exit.** Flatten happy path; bail on preconditions at top.
- **Protocol-oriented + generics** over class hierarchies. Constrain with `where`. Prefer `some`/`any` right.
- **`Result` / `throws`** for failure, not out-parameters or sentinel returns.
- **`Sequence`/`Collection` idioms.** Slices, `zip`, `enumerated`, `lazy` where it pay.
- **No stringly-typed APIs.** Use enums, `KeyPath`, strong types, not strings passed around.
- **Let type system work.** `let` over `var`; immutability default; phantom/wrapper types where they prevent bugs.

Reviewer see C-style index loop, class that should be struct, boolean soup that should be enum, or sentinel value — that finding.

## Advanced features (use sparingly)

Easy forget, but can make truly complex code far more elegant. Use with care — no reach on simple cases; they earn place only when cut real complexity.

- **`@resultBuilder`** — for embedded DSLs / declarative composition (build tree/config from nested expressions). Worth it when callers gain declarative syntax.
- **`@propertyWrapper`** — factor out repeated property behavior (validation, storage, transformation). Worth it when same wrapping logic recur across properties.
- **`callAsFunction`** — give type natural call-site (`thing(x)`) when conceptually function/operation object. Worth it for single-purpose operation types.

Rule: prefer plain version first. Reach for these only to simplify case truly too complex without them — never to show off.

## Concurrency

Full Swift concurrency. **No Combine.**

- Use `async`/`await`, `AsyncSequence`/`AsyncStream`, `Observations` / `withObservationTracking` for reactive propagation.
- Never `CurrentValueSubject`, `PassthroughSubject`, `.sink`, `AnyCancellable`, or completion handlers.
- `Sendable` on all domain models.
- `actor` / `@MainActor` isolation for shared mutable state.
- Always use `Mutex` over `NSLock`.