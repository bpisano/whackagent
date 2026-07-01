# Swift — Architecture (iOS app)

> whackagent convention module · review category: **architecture**. Copied when project is **iOS/app** target. For libraries/CLI/server, `architecture-package.md` used instead. This file source of truth — edit project copy in `.whackagent/conventions/` to adapt.

## Design principles (general)

Platform-agnostic — apply on every Swift project (app, library, CLI, server). These come first; the app layers below are the iOS-specific part.

- **Composition over inheritance.** No class inheritance for domain logic. Data = `struct` (value, immutable by default); shared mutable state = `actor`, not a base class. Dependencies are fields, injected — never inherited.
- **Protocol-driven boundaries (dependency inversion).** Depend on a `protocol`, never a concrete type. Hold collaborators as `any SomeProtocol`; inject the concrete impl through `init`. This is what makes things swappable + testable (fakes). Use `associatedtype` + generics for reusable architectures, specialize with `typealias`.
- **Protocol + struct over enum when cases not fixed.** `enum` only for a fixed, closed one-of (domain values, events, errors — each case carries its own associated data). When the set is open/extensible, or each case owns its own creation/logic, model it as a `protocol` with conforming `struct`s. Reach for the enum only when cases are truly finite + stable.
- **Constructor injection.** Every dependency required or defaulted in `init`. No service locators, no global singletons for logic. Complex construction → a factory `struct` or `static func` factory.
- **Errors as enums.** `enum FooError: Error` (sum types) over exceptions/codes/sentinels.
- **Single responsibility, small files.** One type, one reason to change; files stay small + focused. One primary type per file; extensions in `Type+Category.swift`.
- **Testability by design.** Protocol boundaries + constructor DI make fakes trivial. A type that's hard to test means the design is wrong.

## Layers

Strict four-layer architecture:

```
Coordinator (View struct: navigation + composition + child injection)
   → ViewModel (protocol FooViewModel + @Observable UIFooViewModel + MockFooViewModel; view generic over the protocol)
      → Store (@MainActor @Observable; state + business logic; shared singleton or per-instance)
         → View (generic over its ViewModel; UI only; talks up via .onX callback modifiers)
```

No Combine anywhere — store→view-model propagation use `Observations` / `AsyncStream`.

## File tree — group by feature, never by type

Each feature own folder holding all it need (coordinator/view, its `ViewModels/` trio, `Components/`, own `Models/`). **Never** collect things in global `Models/`, `Networking/`, or `Persistence/` bucket.

```
<App>/
├── <App>App.swift
├── Coordinators/<Feature>/{<Feature>Coordinator, <Feature>Route, Models/, Components/, ViewModels/…}
├── Core/                              # cross-cutting infra + shared state
│   ├── AppState/
│   ├── Navigation/{Route,Router}.swift
│   ├── Stores/<Domain>/<Domain>Store.swift
│   └── <ClientName>/{<ClientName>.swift, DTO/, Requests/}
├── UI/
│   ├── Views/<Feature>/{<Feature>View, Models/, Components/, ViewModels/…}
│   └── Components/  ButtonStyles/  LabelStyles/  ViewModifiers/
├── Resources/{Assets.xcassets, Localizable.xcstrings}
└── Utils/Extensions/<Type>Extension.swift
```

## Review checklist (architecture category)

- **No flat tree.** Files grouped into feature folders with sub-folders (`ViewModels/`, `Components/`, `Models/`). Pile of files at target root = finding.
- **Group by feature, not by type.** No global `Models/`/`Services/` buckets for app features.
- **Feature-local models** live in that feature's `Models/`. Shared domain models come from client's `DTO/` or shared package — not `Core/Domain/` folder.
- **Extensions**: one file per extended type, `<Type>Extension.swift`, in `Utils/Extensions/`.
- **Naming non-negotiable**: `FooCoordinator`, `FooViewModel` (protocol), `UIFooViewModel` (impl), `MockFooViewModel`, `FooStore`, `FooRoute`, `FooView<ViewModel: FooViewModel>`.
- **Layer boundaries respected**: views UI only, talk up via callbacks; business logic in stores; view-models bridge.
- **Composition, not inheritance**: no domain class inheritance; structs + actors, deps injected.
- **Protocol-driven**: collaborators depended on via `protocol`/`any`, injected through init — not concrete instantiation inside.
- **enum vs protocol+struct**: enum only for fixed closed sets; open/extensible or self-creating cases → protocol + structs.