# Shots

PR screenshots replayed by XCUITest on iOS: `wa-screenshot` writes the path once, `xcodebuild` replays it on both sides. Config `pr_screenshots.replay`. Template = `${CLAUDE_PLUGIN_ROOT}/templates/shots/`.

## Target

```
<App>.xcodeproj
<App>Screenshots/                 ← UI Testing Bundle, synchronized folder (Xcode 16+)
├── Support/ShotCase.swift        ← committed, from template
└── Generated/                    ← git-ignored; one task's tests, only during a run
```

- Target `<App>Screenshots`, target to test = the app.
- Shared scheme `<App>Screenshots`, test action = this target only. In no other scheme or test plan: CI and dev tests never run it.
- Present = `xcodebuild -list` shows scheme `<App>Screenshots`.

## Setup

Only `verify.platform` `ios` | `both` + `pr_screenshots.mode: auto`. One **Plan** row. Target present → keep it, diff `ShotCase.swift` with the template, copy on yes.

1. **Create**, first that applies:
   - `project.yml` (XcodeGen) / `Project.swift` (Tuist) → add target + scheme to the spec, regenerate.
   - Xcode MCP → `XcodeNewTarget`, UI Testing Bundle `<App>Screenshots`, target the app.
   - Else → say: File › New › Target › UI Testing Bundle `<App>Screenshots`. Then **Warning**, `pr_screenshots.replay: off`, `→ next: /wa-setup pr` once done. Stop.
2. **Clean** — delete the test files Xcode generated. Copy `ShotCase.swift` → `<App>Screenshots/Support/`.
3. **Schemes** — remove the target from the app scheme's test action and test plans. Shared scheme `<App>Screenshots` testing it alone.
4. **Ignore** — `<App>Screenshots/Generated/` → `.gitignore`.
5. **Prove** — `xcodebuild build-for-testing -scheme <App>Screenshots -destination 'generic/platform=iOS Simulator'` green. Red → stop, report the first error.
6. `pr_screenshots.replay: on`.

## Rules

- Target = the project's. `/wa-update` offers `ShotCase.swift` diffs, never rewrites.
- `Generated/` holds files only during a `wa-screenshot` run. Never committed.
- Never add launch arguments, hooks, ids or fixtures to the app for a shot.
- `replay: on` + scheme missing → `wa-screenshot` drives instead, **Warning** `→ next: /wa-setup pr`.
