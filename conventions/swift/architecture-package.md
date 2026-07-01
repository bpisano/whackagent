# Swift — Architecture (package / non-app)

> whackagent convention module · review category: **architecture**. Copied for **non-iOS-app** Swift: SwiftPM libraries, CLI tools, server-side, alongside `architecture-global.md` (platform-agnostic principles — YAGNI/SOLID/DRY, composition, DI, testability). This file hold **package-specific** file-tree + module rules. Freer than app — but not free-for-all. Here rules.

No Coordinator-Store mandate here (app-only). Surviving discipline:

## Rules (file tree / modules)

- **Group by feature/domain, never by type.** No top-level `Models/`, `Services/`, `Extensions/`, `Helpers/` buckets holding whole codebase. Feature/domain folder own own types.
- **No flat tree.** More than ~5–7 files in folder → add sub-folders. Pile of files directly under `Sources/<Target>/` = finding. Nest as area grow.
- **Targets = independent responsibilities.** Split into multiple SwiftPM targets when concerns genuinely independent (e.g. `Core`, `Networking`, `FeatureX`). Dependencies point one direction; no cycles.
- **Public API surface intentional.** Only `public` what consumers need; rest stay `internal`. Document public API (per `public_doc` toggle). Package exported surface = its contract.
- **Tests mirror source tree.** `Tests/<Target>Tests/` follow same folder structure as `Sources/<Target>/`.
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

## Review checklist (architecture category — package-specific)

> Platform-agnostic checks (YAGNI/SOLID/DRY, composition, protocol-driven, enum-vs-struct, testability) live in `architecture-global.md`. Below = package-specific only.

- No flat dump of files at target root.
- Grouping by domain, not file type.
- Folder nesting reflect size of each area; large areas get sub-folders.
- Target/module boundaries coherent; dependency direction clean.
- `public` intentional and minimal; internals `internal`.
- Tests mirror source structure.

> **Project override.** This default for non-app Swift. If repo has own structural rules, edit this file in `.whackagent/conventions/` to match — reviewer reads project copy.