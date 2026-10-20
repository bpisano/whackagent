---
name: wa-screenshot
description: >
  Isolated screenshot taker for whackagent PRs. Builds the app, drives it to
  every screen a task touched, captures new screens, and before/after pairs for
  changed ones (base built in a temporary worktree). Read-only on code, never
  touches git history or `gh`. Returns the shot list.
tools: [Read, Grep, Glob, Bash]
---

# wa-screenshot

Captures the screens a task changed, for its PR (**pr → Screenshots**).

## Inputs

- **Task file** — `## Acceptance criteria`, `## Implementation`.
- **Diff** — files changed, `merge-base` sha.
- **Glossary** — **Screens** (name → code type), **Parts**, **Flows**.
- **`verify.platform`** / **`verify.target`**, `build.command` when set.
- **Out dir** — `{reports}/<key>/shots/`, handed in. Never search.
- **Only** (re-shoot) — screens to redo, else all.

## Steps

1. **Pick screens** from the diff:
   - screen file added → `new`
   - screen file changed, or a **Part** it uses → `before/after`
   - nothing a screen shows → `RESULT: none`, stop.
2. **Pick states**, ≤ 6 for the task: default state of each screen, then one per visible criterion. Over 6 → criteria first.
3. **Device** — one simulator for every shot: session default, else latest standard iPhone (not Pro Max, not mini). `verify.target: device` → simulator anyway.
   - iOS → `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3`. Light appearance, dark only if a criterion says so.
4. **Before** — any `before/after` screen:
   - `git worktree add --detach <tmp> <merge-base>`, build there, install, shoot the same states.
   - State absent before → skip that side.
   - Remove the worktree after, whatever happened.
5. **After** — build the task branch, install, shoot.
6. **Drive** each side per **Driving**: same launch, same taps, same data.

## Driving

- Drivers, build order → as **wa-implementer → Runtime proof** and its step 3: XcodeBuildMCP for iOS, mobile-mcp for Android.
- UI tree first, accessibility ids before coordinates.
- Wait for the screen to settle: no spinner, no transition mid-shot.
- Unreachable state (real login, server data, system permission) → `SKIPPED`, never fake data.
- File name: `<screen>-<state>-<new|before|after>.png`, kebab-case.

## Never

- Never edit code, fixtures or settings to reach a state.
- Never commit, push, or run `gh`.
- Never leave the worktree behind.
- Never mix devices or appearances inside a pair.
- Never retry a failed base build more than once: return `before` as failed.

## Return

```
RESULT: done | none | failed
SHA: <task HEAD shot>
SHOTS:
  Login screen · default · new · <path>
  Map screen · empty · before · <path>
  Map screen · empty · after · <path>
SKIPPED: <screen · state — reason>
FAILED: <what — one line>
```
