# Swift — Architecture (global)

> whackagent convention module · review category: **architecture**. Copied on **every** Swift project (app, library, CLI, server) alongside kind-specific module (`architecture-app.md` or `architecture-package.md`). This file hold platform-agnostic principles; kind-specific module hold layers + file-tree rules. Edit project copy in `.whackagent/conventions/` to adapt.

Architecture here = how feature **decomposed, made testable, kept modular** — not how code reads (that elegance module).

## YAGNI · SOLID · DRY

- **YAGNI** — build what task need now, nothing speculative. No hook/param/protocol/config with single caller and no near-term second use. Add generality when second real case arrive, not before.
- **SOLID** —
  - *Single responsibility*: one type, one reason to change. Type that fetch *and* parse *and* render = three types.
  - *Open/closed*: extend via new conforming types, not by growing `switch` case-by-case.
  - *Liskov*: conforming types honor protocol contract — no surprise crashes or no-ops.
  - *Interface segregation*: small focused protocols over one fat protocol; client depend only on what it use.
  - *Dependency inversion*: depend on abstractions (`protocol`), never concretions.
- **DRY** — no duplicated or re-implemented logic. Same block copy-pasted across files, or re-implementation of something already in codebase (graphify surface it) → factor it, reuse it.

## Design principles (general)

- **Composition over inheritance.** No class inheritance for domain logic. Data = `struct` (value, immutable by default); shared mutable state = `actor`, not base class. Dependencies = fields, injected — never inherited.
- **Protocol-driven boundaries (dependency inversion).** Depend on `protocol`, never concrete type. Hold collaborators as `any SomeProtocol`; inject concrete impl through `init`. This what make things swappable + testable (fakes). Use `associatedtype` + generics for reusable architectures, specialize with `typealias`.
- **Protocol + struct over enum when cases not fixed.** `enum` only for fixed, closed one-of (domain values, events, errors — each case carry own associated data). When set open/extensible, or each case own its creation/logic, model as `protocol` with conforming `struct`s. Reach for enum only when cases truly finite + stable.
- **Constructor injection.** Every dependency required or defaulted in `init`. No service locators, no global singletons for logic. Complex construction → factory `struct` or `static func` factory.
- **Errors as enums.** `enum FooError: Error` (sum types) over exceptions/codes/sentinels.
- **Single responsibility, small files.** One type, one reason to change; files stay small + focused. One primary type per file; extensions in `Type+Category.swift`.
- **Testability by design.** Protocol boundaries + constructor DI make fakes trivial. Type hard to test = design wrong.

## Review checklist (architecture category)

- **YAGNI**: no speculative abstraction/param/protocol with single caller and no near-term use.
- **DRY**: no duplicated logic; no re-implementation of something already in codebase.
- **Single responsibility**: no type doing several unrelated jobs; small, focused units.
- **Composition, not inheritance**: no domain class inheritance; structs + actors, deps injected.
- **Protocol-driven**: collaborators depended on via `protocol`/`any`, injected through init — not concrete instantiation inside.
- **enum vs protocol+struct**: enum only for fixed closed sets; open/extensible or self-creating cases → protocol + structs.
- **Testability**: every unit reachable with fakes through its init; anything hard to test = design finding.