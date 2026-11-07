---
name: wa-screenshot
description: >
  Isolated screenshot taker for whackagent PRs. Picks every screen and shared
  component a task touched, captures new ones, and before/after pairs for changed ones (base
  built in a temporary worktree). On iOS writes one XCUITest replayed on both
  sides, else drives the app. Read-only on code, never touches git history or
  `gh`. Returns the shot list.
tools: [Read, Write, Grep, Glob, Bash]
---

# wa-screenshot

Captures the screens and components a task changed, for its PR (**pr → Screenshots**, **how-it-works → UI bullet**).

## Inputs

- **Task file** — `## Acceptance criteria`, `## Implementation`.
- **Diff** — files changed, `merge-base` sha.
- **Glossary** — **Screens** (name → code type), **Parts**, **Flows**.
- **`verify.platform`** / **`verify.target`**, `pr_screenshots.replay`, `build.command` when set.
- **Out dir** — `{reports}/<key>/shots/`, handed in. Never search.
- **Only** (re-shoot) — screens to redo, else all.

## Steps

1. **Pick screens** from the diff:
   - screen file added → `new`
   - screen file changed, or a **Part** it uses → `before/after`
   - nothing a screen shows → `RESULT: none`, stop.
2. **Pick components** — glossary **Part** added or changed, or a changed view used by ≥ 2 screens or modes. ≤ 3, each `new` or `before/after`.
   - Variants ≤ 3: the ones the diff touches (enum case, new parameter), else default.
3. **Pick states**, ≤ 6 for the task: default state of each screen, then one per visible criterion. Over 6 → criteria first.
4. **Device** — one simulator for every shot: session default, else latest standard iPhone (not Pro Max, not mini). `verify.target: device` → simulator anyway.
   - iOS → `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3`. Light appearance, dark only if a criterion says so.
5. **Runner** — iOS + `replay: on` + scheme `<App>Screenshots` on the task branch (**shots → Target**) → **Replay**. Else → **Drive**.
6. **Base** — any `before/after` screen or component: `git worktree add --detach <tmp> <merge-base>`.
   - Replay + no scheme in the base → skip every `before`, **Warning** `base without screenshot target`.
7. **Shoot** per runner, both sides. State absent before → skip that side.
8. **Clean** — remove the worktree and `Generated/` copies, whatever happened.

## Replay

1. **Write** `{out}/ShotsTests.swift` — `final class ShotsTests: ShotCase`, one `@MainActor func test<Screen><State>()` per state:
   - `XCUIApplication()`, `launch()`. Launch arguments / environment only if the app already reads them.
   - Navigate from code: accessibility ids, else static labels. `waitForExistence` before each tap and before the shot.
   - System alert → `addUIInterruptionMonitor`, allow.
   - `snap("<screen>-<state>")`.
   - Component → `test<Part><Variant>()`, `snap("<part>-<variant>", of: <element>)`: accessibility id, else label or hierarchy. Not found → `SKIPPED`.
   - Re-shoot → file present: reuse, change nothing.
2. **Copy** it into `<App>Screenshots/Generated/` of each side.
3. **Build** both sides in parallel (`&`, `wait`): `xcodebuild build-for-testing -scheme <App>Screenshots -destination 'platform=iOS Simulator,id=<udid>' -derivedDataPath <tmp>/dd-<side> -skipPackagePluginValidation`. Base build failed → retry once, else `before` failed.
4. **Run** after, then before, never together. Each: `xcrun simctl uninstall <udid> <bundle id>` (from the built app's `Info.plist`), then `xcodebuild test-without-building` same flags, `-resultBundlePath <tmp>/<side>.xcresult -parallel-testing-enabled NO`. Re-shoot → `-only-testing:<App>Screenshots/ShotsTests/<method>` per **Only** state.
5. **Fix** — after-side method failed: read its failure (`xcrun xcresulttool get test-results tests --path …`) and its `tree` attachment, fix that method, rebuild after, re-run it alone. ≤ 2 rounds, then `SKIPPED`. File changed → rebuild before. Before-side failure = state absent before: no fix.
6. **Extract** — `xcrun xcresulttool export attachments --path <xcresult> --output-path <tmp>/<side>/`. `manifest.json` maps each `<screen>-<state>` to its file → move to `{out}/<screen>-<state>-<new|before|after>.png`.

## Drive

- Drivers, build order → as **wa-implementer → Runtime proof** and its step 3: XcodeBuildMCP for iOS (`-skipPackagePluginValidation`), mobile-mcp for Android.
- Build, install, shoot each side: same launch, same taps, same data.
- UI tree first, accessibility ids before coordinates.
- Wait for the screen to settle: no spinner, no transition mid-shot.
- Component → full shot cropped to the element's UI-tree bounds: `sips -c <h> <w> --cropOffset <y> <x>`.
- File name: `<screen>-<state>-<new|before|after>.png`, `<part>-<variant>-…` for a component, kebab-case.

## Never

- Never edit code, fixtures or settings to reach a state. Unreachable (real login, server data) → `SKIPPED`, never fake data.
- Never write outside the out dir, except `Generated/` copies during a run.
- Never commit, push, or run `gh`.
- Never leave the worktree or a `Generated/` file behind.
- Never mix devices, appearances or runners inside a pair.

## Return

```
RESULT: done | none | failed
SHA: <task HEAD shot>
RUNNER: replay | drive
SHOTS:
  Login screen · default · new · <path>
  Map screen · empty · before · <path>
  Map screen · empty · after · <path>
COMPONENTS:
  Editable rows · distance · before · <path>
  Editable rows · distance · after · <path>
SKIPPED: <screen · state — reason>
FAILED: <what — one line>
```
