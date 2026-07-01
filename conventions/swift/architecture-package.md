# Swift — Architecture (package / non-app)

> whackagent convention module · review category: **architecture**. Copied for **non-iOS-app** Swift: SwiftPM libraries, CLI tools, server-side. Freer than app — but not free-for-all. Here rules.

No Coordinator-Store mandate here (app-only). Surviving discipline:

## Design principles (general)

Platform-agnostic — apply on every Swift project (app, library, CLI, server).

- **Composition over inheritance.** No class inheritance for domain logic. Data = `struct` (value, immutable by default); shared mutable state = `actor`, not a base class. Dependencies are fields, injected — never inherited.
- **Protocol-driven boundaries (dependency inversion).** Depend on a `protocol`, never a concrete type. Hold collaborators as `any SomeProtocol`; inject the concrete impl through `init`. This is what makes things swappable + testable (fakes). Use `associatedtype` + generics for reusable architectures, specialize with `typealias`.
- **Protocol + struct over enum when cases not fixed.** `enum` only for a fixed, closed one-of (domain values, events, errors — each case carries its own associated data). When the set is open/extensible, or each case owns its own creation/logic, model it as a `protocol` with conforming `struct`s. Reach for the enum only when cases are truly finite + stable.
- **Constructor injection.** Every dependency required or defaulted in `init`. No service locators, no global singletons for logic. Complex construction → a factory `struct` or `static func` factory.
- **Errors as enums.** `enum FooError: Error` (sum types) over exceptions/codes/sentinels.
- **Single responsibility, small files.** One type, one reason to change; files stay small + focused. One primary type per file; extensions in `Type+Category.swift`.
- **Testability by design.** Protocol boundaries + constructor DI make fakes trivial. A type that's hard to test means the design is wrong.

## Rules (file tree / modules)

- **Group by feature/domain, never by type.** No top-level `Models/`, `Services/`, `Extensions/`, `Helpers/` buckets holding whole codebase. Feature/domain folder owns own types.
- **No flat tree.** More than ~5–7 files in folder → add sub-folders. Pile of files directly under `Sources/<Target>/` = finding. Nest as area grows.
- **Targets = independent responsibilities.** Split into multiple SwiftPM targets when concerns genuinely independent (e.g. `Core`, `Networking`, `FeatureX`). Dependencies point one direction; no cycles.
- **Public API surface intentional.** Only `public` what consumers need; rest stays `internal`. Document public API (per `public_doc` toggle). Package exported surface = its contract.
- **Tests mirror source tree.** `Tests/<Target>Tests/` follows same folder structure as `Sources/<Target>/`.
- **Extensions**: one file per extended type, `<Type>Extension.swift`, in `Extensions/` folder local to feature needing it — or shared `Extensions/` only when truly cross-cutting.
- **Value types first** (see elegance module): structs/enums for models.

## Example layout

```
Sources/<Target>/
├── <Domain>/                     # one folder per domain/feature
│   ├── <Domain>.swift
│   ├── Models/                   # domain-local value types
│   └── Internal/                 # implementation detail, kept internal
├── <OtherDomain>/
│   └── …
├── Networking/                   # a cohesive subsystem, only if it earns its place
│   ├── Client.swift
│   ├── DTO/
│   └── Requests/
└── Extensions/<Type>Extension.swift   # only genuinely cross-cutting ones
Tests/<Target>Tests/              # mirrors Sources/<Target>/
└── <Domain>/<Domain>Tests.swift
```

## Review checklist (architecture category)

- No flat dump of files at target root.
- Grouping by domain, not file type.
- Folder nesting reflects size of each area; large areas get sub-folders.
- Target/module boundaries coherent; dependency direction clean.
- `public` intentional and minimal; internals `internal`.
- Tests mirror source structure.
- **Composition, not inheritance**: no domain class inheritance; structs + actors, deps injected.
- **Protocol-driven**: collaborators depended on via `protocol`/`any`, injected through init.
- **enum vs protocol+struct**: enum only for fixed closed sets; open/extensible or self-creating cases → protocol + structs.

> **Project override.** This default for non-app Swift. If repo has own structural rules, edit this file in `.whackagent/conventions/` to match — reviewer reads project copy.