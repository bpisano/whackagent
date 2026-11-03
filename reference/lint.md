# Lint

Strict linter wired into the build: a violation = a build error, for agents, devs and CI alike. Config `lint.tool`, `lint.fix_command`. Templates = `${CLAUDE_PLUGIN_ROOT}/templates/lint/`.

## Tools

| `lint.tool` | config | autofix (`fix_command` empty) | baseline |
|---|---|---|---|
| `swiftlint` | `.swiftlint.yml` | `swiftlint --fix <files>`, else `swift package plugin --allow-writing-to-package-directory swiftlint --fix` | `swiftlint lint --write-baseline .swiftlint.baseline` |
| `eslint` | `eslint.config.js` | `npx eslint --fix <files>` | `npx eslint . --suppress-all` |
| `ruff` | `pyproject.toml` | `ruff check --fix <files>` | none |
| `golangci-lint` | `.golangci.yml` | `golangci-lint run --fix` | `new-from-rev` = setup commit |
| `clippy` | `Cargo.toml` `[lints]` | `cargo clippy --fix --allow-dirty` | none |
| `detekt` | `detekt.yml` | `detekt --auto-correct` | `detekt --create-baseline` |

Detect: config file present → that tool. Swift → `swiftlint`, TypeScript → `eslint`. Other language → standard tool above, unknown → `none`.

## Setup

One **Plan** (config, wiring, autofix commit, baseline, draft). Linter config already there → keep it, diff vs template, offer missing rules. Never overwrite.

1. **Config**
   - Swift: `swift/.swiftlint.yml` → repo root. `swift/Tests.swiftlint.yml` → `.swiftlint.yml` in each test folder (`Tests/`, `<App>Tests/`, `<App>UITests/`). `review.public_doc: false` → drop `missing_docs`.
   - TypeScript: `typescript/eslint.config.js` → root. Dev deps `eslint typescript typescript-eslint`.
   - Other: strict defaults only, no template. Ruff `select = ["ALL"]` minus formatter conflicts (`COM812`, `ISC001`), `D` if `public_doc: false`. golangci-lint `default: standard`, `issues.max-issues-per-linter: 0`. Clippy `[lints.clippy] all = "deny"`. Detekt `maxIssues: 0`.
2. **Wire** into the build:
   - SwiftPM: dependency `.package(url: "https://github.com/SimplyDanny/SwiftLintPlugins", from: "<latest tag>")`, every target `plugins: [.plugin(name: "SwiftLintBuildToolPlugin", package: "SwiftLintPlugins")]`.
   - Xcode project: edit `project.pbxproj`. One `XCRemoteSwiftPackageReference` (`kind = upToNextMajorVersion; minimumVersion = <latest tag>;`) in the project's `packageReferences`. Per target: an `XCSwiftPackageProductDependency` (`package` → it, `productName = "plugin:SwiftLintBuildToolPlugin"`), a `PBXTargetDependency` with `productRef` → it, listed in the target's `dependencies`. New 24-hex ids, unused elsewhere. Check `xcodebuild -list` parses.
   - Plugin trust: every CLI build passes `-skipPackagePluginValidation` (XcodeBuildMCP `extraArgs`, wrapper in `build.command`, CI). Say: in Xcode, click **Trust & Enable** once; add the flag to CI.
   - TypeScript: `"lint": "eslint . --max-warnings 0"`, `"prebuild": "npm run lint"`.
   - `build.command` set → prefix it: `<lint> && <build>`. Same for other tools.
3. **Autofix** the whole repo, commit alone (`chore: lint autofix`, **git → Commits**). Say how many files.
4. **Baseline** the rest (**Tools**). Swift → add `baseline: .swiftlint.baseline` to the yml. No baseline tool → list the count, recommend fixing now in one task.
   - Anything frozen → draft `Clear lint baseline` (**store → create**), summary = count per rule.
5. **Prove** — one build, green. Red → stop, report the first error.

## Rules

- Linter config + baseline = the project's. `/wa-update` offers new template rules, never rewrites.
- Template rule new to a project → its violations join the baseline, as setup.
- Each lint-backed module section carries `lint: <rule ids>`. The build proves it; the verifier skips it.
