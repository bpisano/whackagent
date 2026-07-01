# Swift — Architecture (iOS app)

> whackagent convention module · review category: **architecture**. Copied when project **iOS/app** target, next to `architecture-global.md` (platform-agnostic principles — YAGNI/SOLID/DRY, composition, DI, testability). This file hold **iOS-specific** part: layers + file tree. Library/CLI/server use `architecture-package.md`. Edit project copy in `.whackagent/conventions/` to adapt.

## Layers

Strict four-layer architecture:

```
Coordinator (View struct: navigation + composition + child injection)
   → ViewModel (protocol FooViewModel + @Observable UIFooViewModel + MockFooViewModel; view generic over the protocol)
      → Store (@MainActor @Observable; state + business logic; shared singleton or per-instance)
         → View (generic over its ViewModel; UI only; talks up via .onX callback modifiers)
```

No Combine. Store→view-model propagation use `Observations` / `AsyncStream`.

## File tree — group by feature, never by type

Each feature own folder hold all it need (coordinator/view, its `ViewModels/` trio, `Components/`, own `Models/`). **Never** collect in global `Models/`, `Networking/`, or `Persistence/` bucket.

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

## Review checklist (architecture category — iOS-specific)

> Platform-agnostic checks (YAGNI/SOLID/DRY, composition, protocol-driven, enum-vs-struct, testability) live in `architecture-global.md`. Below = app-specific only.

- **No flat tree.** Files grouped into feature folders with sub-folders (`ViewModels/`, `Components/`, `Models/`). Pile of files at target root = finding.
- **Group by feature, not by type.** No global `Models/`/`Services/` buckets for app features.
- **Feature-local models** live in that feature's `Models/`. Shared domain models come from client's `DTO/` or shared package — not `Core/Domain/` folder.
- **Extensions**: one file per extended type, `<Type>Extension.swift`, in `Utils/Extensions/`.
- **Naming non-negotiable**: `FooCoordinator`, `FooViewModel` (protocol), `UIFooViewModel` (impl), `MockFooViewModel`, `FooStore`, `FooRoute`, `FooView<ViewModel: FooViewModel>`.
- **Layer boundaries respected**: views UI only, talk up via callbacks; business logic in stores; view-models bridge.