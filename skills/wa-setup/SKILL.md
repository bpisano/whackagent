---
name: wa-setup
description: Interactively bootstrap the whackagent workflow in a project.
---

# /wa-setup

Set up orchestrated dev flow for project. Short interactive setup, then scaffold, then index.

## 1. Interactive config (ask one at a time, propose a default)

Detect first, ask second. Scan repo to guess:
- **primary language** — `Package.swift`/`*.xcodeproj` → swift; `tsconfig.json`/`package.json` → typescript; else generic.
- **project kind** (Swift) — `*.xcodeproj`/`*.xcworkspace` with app target, or `@main App`/UIKit lifecycle → `app`; `Package.swift` library/executable → `package`; CLI/server as applicable.
- **SwiftUI usage** — any `import SwiftUI` in source.
- **Its own build wrapper** — a repo-local CLI (`cli/`, `bin/`, `scripts/`), a `Makefile` with a build target, or — the strongest signal — the project's own `CLAUDE.md`/README saying *"ALWAYS use X to build"*. Read that instruction if it exists: a project that mandates a wrapper mandates it for the implementer too.

Then confirm with user:

1. **Discussion language** — which language to talk in? (default: detect from user; fr/en)
2. **Primary language + project kind** — confirm detected language and kind (app / package / cli / server). Kind picks architecture module.
3. **When to review** — _"Review the code at every step (after coding, and after each feedback round), or once at the end when you validate the task? (recommended: at validation — feedback rounds stay fast, and nothing gets committed unreviewed either way)"_ → sets `review.when` (`each_round` | `on_validation`). Say the trade plainly: `each_round` catches drift earlier but adds a verifier fan-out to every note; `on_validation` reviews the whole diff in one pass at the end.
4. **Review toggles** — surface the public-doc one explicitly, it varies by company: _"Require `///` documentation on every public API? (some teams skip this)"_ → sets `review.public_doc`. Offer to flip the other toggles too.
5. **Build command** — only ask when detection found a wrapper: _"I see `<X>` — should the implementer build with it, or use XcodeBuildMCP / the language default?"_ → sets `build.command` (+ `build.test_command` if there's a test target). Nothing detected → leave both empty, don't ask. **The project wins over the plugin's default**: a repo that documents its own build path documents it for the agents too, and an implementer torn between two mandates picks one silently.
6. **Commit policy** — _"Once YOU validate a feature, may I commit it myself, or always wait for you to commit?"_ → sets `auto_commit_after_validation`. Remind: commits always use your name, never Claude's. Outside autopilot, nothing committed before you validate.
7. **Branch policy** — _"Should `/wa-code` work on its own branch per task (`wa/<slug>`), or code straight on the current branch?"_ → sets `branch.per_task`. If yes, confirm `branch.prefix` and `branch.base` (`current`, or a fixed base like `main`). Mention the pairing: with per-task branches **and** auto-commit on, validating a task commits it and checks out the next task's branch for you (`branch.checkout_next`, on by default) — offer to turn that off. `/wa-autopilot` branches per task regardless.

Keep short — 6 to 7 questions (the build one only fires on a detected wrapper). Rest take template default.

**Only if project kind is `app`:** offer the runtime check — _"After a green build, should the implementer drive the app on a simulator/device to confirm the task actually works (taps + screenshots)?"_ → sets `verify.enabled` + `verify.platform`/`verify.target`. iOS drives through **XcodeBuildMCP** (same server it builds with, nothing extra to install); Android or a physical device needs the **mobile-mcp** server (`mobile-next/mobile-mcp`) configured — say so.

## 2. Scaffold `.whackagent/`

Create directory and files (do not overwrite existing without asking):

- `config.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/config.md`, fill answers above, set `review.categories` to modules you actually copy (next bullet).
- `conventions/` — copy **only relevant** convention modules into `.whackagent/conventions/`:
  - **Swift** (`${CLAUDE_PLUGIN_ROOT}/conventions/swift/`): always `style.md`, `elegance.md`, `testing.md`, and `architecture-global.md` (platform-agnostic YAGNI/SOLID/DRY/DI — every Swift project). Kind module: `architecture-app.md` if kind is `app`, else `architecture-package.md`. Add `swiftui.md` **only if SwiftUI used** (skip for package/CLI with no SwiftUI — whole point).
  - **TypeScript / generic**: copy single `${CLAUDE_PLUGIN_ROOT}/conventions/<lang>.md` and point every `review.categories` entry at it.
  - Set `review.categories` in config to match what you copied: `conventions` loads everything you copied (`style.md`, `elegance.md`, `architecture-global.md`, the kind module, plus `swiftui.md`/`testing.md` when they exist), `correctness` loads nothing.
- **Xcode projects only** (repo has `.xcodeproj`/`.xcworkspace`): create `.xcodebuildmcp/config.yaml` at repo root (not in `.whackagent/`) so XcodeBuildMCP builds incrementally instead of full-rebuilding every time. Content:
  ```yaml
  schemaVersion: 1
  incrementalBuildsEnabled: true
  ```
  Skip if the file already exists (don't clobber a user's config). This is why an implementer with no `build.command` builds through XcodeBuildMCP — command-line `xcodebuild` ignores this file and rebuilds from scratch. With a `build.command` set, the wrapper owns the build dir instead, and this file is just harmless.
- `BACKLOG.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/BACKLOG.md`.
- `wiki/index.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/wiki-index.md`.
- Create empty `tasks/` and `reports/` directories (`.gitkeep` fine).

## 3. Seed the wiki (optional, offer it)

Offer to bootstrap few wiki pages by reading the source (e.g. `architecture`, plus one page per major subsystem). Only if user says yes.

## 4. Compress docs (if `compress_wiki: true`)

To cut re-read tokens, run **caveman-compress** skill on `.whackagent/config.md` and every wiki page just written (`.whackagent/wiki/*.md`). After each compression, delete `*.original.md` backup it creates — git history is backup. Do **not** compress `BACKLOG.md`, task files, or reports. Skip this step entirely if `compress_wiki: false`.

## Next step

End by suggesting: **`/wa-board`** to see backlog and pick first task, or `/wa-task <description>` to create one.