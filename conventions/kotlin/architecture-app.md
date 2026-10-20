# Kotlin — Architecture (Android / KMP app)

> whackagent convention module · lens: **structure**. Android or Kotlin Multiplatform app: layers + file tree. Pairs with `architecture-global.md` (platform-agnostic principles). Base: Google's recommended app architecture.

**Project already has a screen pattern** (MVVM, MVI, presenter/reducer library, …) → follow it exactly; this file only fills gaps. Never mix a second pattern into one project.

## Layers

Unidirectional data flow — state down, events up:

```
UI layer
  Screen (Composable or View; UI only; renders UiState, forwards user events)
    → ViewModel / presenter (exposes immutable FooUiState as StateFlow; handles events; no Android UI types)
Domain layer (optional — YAGNI)
  UseCase (only when logic reused across screens or too complex for the ViewModel)
Data layer
  Repository (single source of truth for its data; exposes Flow / suspend; hides where data comes from)
    → DataSource (one per source: network, database, preferences, platform API)
```

- UI never talks to a data source directly. ViewModel never holds a `Context`, `View`, or Composable reference.
- Repository returns domain models, not DTOs or DB entities — mapping happens in data layer.
- State = one `data class FooUiState` (or sealed interface) per screen, immutable, updated via `update { }`.

## File tree — group by feature, never by type

Each feature own package hold all it need. **Never** global `viewmodels/`, `repositories/`, `models/` packages for app features.

```
app/src/main/kotlin/<package>/
├── <App>Application.kt
├── feature/<name>/
│   ├── ui/{<Name>Screen.kt, <Name>ViewModel.kt, <Name>UiState.kt, components/}
│   ├── domain/{<Action>UseCase.kt, model/}      # only when earned
│   └── data/{<Name>Repository.kt, <Name>RepositoryImpl.kt, remote/, local/}
├── core/                                        # cross-cutting: network, database, designsystem, navigation
│   ├── network/
│   ├── database/
│   └── designsystem/
└── navigation/
```

Multi-module project → one Gradle module per feature (`:feature:<name>`) and per core concern (`:core:data`, `:core:designsystem`); features depend on core, never on each other.

**KMP** → shared logic (domain, data, ViewModels when shared) in `commonMain`. Platform code behind `expect`/`actual` or an injected interface — keep `expect` surface small. `androidMain` / `iosMain` hold only what the platform forces.

## Review checklist (architecture category — app-specific)

> Platform-agnostic checks (YAGNI/SOLID/DRY, composition, interface-driven, sealed-vs-interface, testability) live in `architecture-global.md`. Below = app-specific only.

- **No flat tree.** Files grouped into feature packages with `ui/`, `data/` (and `domain/` when earned). Pile of files in root package = finding.
- **Group by feature, not by type.** No global `viewmodels/`/`repositories/` packages for app features.
- **UDF respected**: UI renders state + sends events; state mutated only in ViewModel/presenter; no two-way mutable state shared with UI.
- **Layer boundaries**: no data source or DTO in UI layer; no Android UI types in ViewModel; repository is the only door to its data.
- **Entity mapping on the entity**: DB entity → domain model mapping = member of the entity (`toModel(…)` / `to<DomainType>(…)`, extra inputs such as related rows as params; `fromModel()` in its companion). Never private mapper inside the data source.
- **Module direction**: feature → core, never feature → feature; `commonMain` never depends on platform code.
- **Naming**: `FooScreen`, `FooViewModel`, `FooUiState`, `FooRepository` (+ `FooRepositoryImpl` or `DefaultFooRepository`, whichever project uses), `FooDataSource`, `DoThingUseCase`.

> **Project override.** This default for Android/KMP apps. If repo has own structural rules, edit this file in project's conventions dir (`paths.conventions`, default `.whackagent/conventions/`) to match — reviewer read project copy.
