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

Then confirm with user:

1. **Discussion language** — which language to talk in? (default: detect from user; fr/en)
2. **Primary language + project kind** — confirm detected language and kind (app / package / cli / server). Kind picks architecture module.
3. **Review toggles** — surface public-doc one explicitly, varies by company: _"Require `///` documentation on every public API? (some teams skip this)"_ → sets `review.public_doc`. Offer to flip other toggles.
4. **Commit policy** — _"Once YOU validate a feature, may I commit it myself, or always wait for you to commit?"_ → sets `auto_commit_after_validation`. Remind: commits always use your name, never Claude's. Outside autopilot, nothing committed before you validate.

Keep short — 4 questions. Rest take template default.

## 2. Scaffold `.whackagent/`

Create directory and files (do not overwrite existing without asking):

- `config.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/config.md`, fill answers above, set `review.categories` to modules you actually copy (next bullet).
- `conventions/` — copy **only relevant** convention modules into `.whackagent/conventions/`:
  - **Swift** (`${CLAUDE_PLUGIN_ROOT}/conventions/swift/`): always `style.md`, `elegance.md`, `testing.md`, and `architecture-global.md` (platform-agnostic YAGNI/SOLID/DRY/DI — every Swift project). Kind module: `architecture-app.md` if kind is `app`, else `architecture-package.md`. Add `swiftui.md` **only if SwiftUI used** (skip for package/CLI with no SwiftUI — whole point).
  - **TypeScript / generic**: copy single `${CLAUDE_PLUGIN_ROOT}/conventions/<lang>.md` and point every `review.categories` entry at it.
  - Set `review.categories` in config to match what you copied: `architecture` loads `[architecture-global.md, <kind module>]`, `arborescence` loads just the kind module; drop `swiftui.md` from `style` if not copied.
- `BACKLOG.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/BACKLOG.md`.
- `wiki/index.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/wiki-index.md`.
- Create empty `tasks/` and `reports/` directories (`.gitkeep` fine).

## 3. Index the code (graphify)

If `graphify: true`, run **graphify** skill on project source code (repo root, not `.whackagent/`) so later skills query architecture instead of blind-scanning. If graphify unavailable, note it and continue — skills fall back to Grep/Glob.

## 4. Seed the wiki (optional, offer it)

Offer to bootstrap few wiki pages from freshly built graph (e.g. `architecture`, plus one page per major subsystem). Only if user says yes.

## 5. Compress docs (if `compress_wiki: true`)

To cut re-read tokens, run **caveman-compress** skill on `.whackagent/config.md` and every wiki page just written (`.whackagent/wiki/*.md`). After each compression, delete `*.original.md` backup it creates — git history is backup. Do **not** compress `BACKLOG.md`, task files, or reports. Skip this step entirely if `compress_wiki: false`.

## Next step

End by suggesting: **`/wa-board`** to see backlog and pick first task, or `/wa-task <description>` to create one.