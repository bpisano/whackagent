# Archtest

Architecture rules as unit tests: a violation = a red test, for agents, devs and CI alike. Config `archtest.tool`, `archtest.command`. Templates = `${CLAUDE_PLUGIN_ROOT}/templates/archtest/`.

## Tools

| `archtest.tool` | lives in | run (`command` empty) | baseline |
|---|---|---|---|
| `harmonize` | `Architecture/` SwiftPM package + `.harmonize.yaml` at root | `swift test --package-path Architecture` | `Support/ArchBaseline.swift` |

Detect: `Architecture/Package.swift` depends on Harmonize → `harmonize`. Swift → `harmonize`. Other language → `none`.

## Layout

```
.harmonize.yaml                      ← root marker, excludes
Architecture/
├── Package.swift                    ← Harmonize 1.3.0, macOS host
└── Tests/ArchitectureTests/
    ├── Support/{ArchBaseline,ProjectTree}.swift
    ├── Principles/InheritanceTests.swift   ← one file = one subject
    └── Layers/ViewModelTests.swift         ← one @Test = one rule id
```

- `@Test` name = rule id = `Rule(id:)` = the module's `arch:` tag.
- Each `Rule` carries why + how to fix, citing its module section: the failure explains itself.
- Every `@Suite` is `@MainActor`: Harmonize deadlocks on the cooperative pool.
- Cost: first run ~20 s (swift-syntax), then ~3 s. `Architecture/.build/` stays local, git-ignored.

## Setup

One **Plan** (package, rules, baseline, draft). Existing `Architecture/` → keep it, diff vs template, offer missing rules. Never overwrite.

1. **Copy** from `swift/`:
   - `.harmonize.yaml` → repo root. `Package.swift` → `Architecture/`. `Architecture/.build/` → `.gitignore`.
   - `Support/` + `global/*` + `<kind>/*` → `Architecture/Tests/ArchitectureTests/` (`app` → `app/`, else `package/`). Subject folders merge.
2. **Run** `archtest.command`. Build error → stop, report the first.
3. **Baseline** each failing rule: the violation's type name (file name for `FileTree/` rules) → `ArchBaseline.entries["<id>"]`. Edit that dictionary only. Re-run: green.
   - Anything frozen → draft `Clear architecture baseline` (**store → create**), summary = count per rule.
4. **Wire**: say add the command to CI next to the tests. Xcode: drag `Architecture/` into the workspace to see it in the Test navigator.
5. **Prove** — one green run.

## Rules

- `Architecture/` + `.harmonize.yaml` = the project's. `/wa-update` offers new template rules, never rewrites.
- Template rule new to a project → its violations join the baseline, as setup.
- Baseline shrinks only: an entry that passes or matches nothing fails the run → the fix deletes it, same change.
- Run by `wa-verifier`, once per review round: the implementer never pays the build. Failures = findings, fixed like any other.
- Agents never touch `Architecture/` or `.harmonize.yaml` — no edit, no new baseline entry, no `.disabled` — except deleting a stale entry. Rule unmeetable → `BLOCKED:`.
- A rule changes through a task: module section + test, same commit.
- Each archtest-backed module section carries `arch: <rule ids>`. The tests prove it; the verifier runs them, never judges it by eye.
