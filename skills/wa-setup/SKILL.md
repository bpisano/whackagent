---
name: wa-setup
description: Interactively bootstrap the whackagent workflow in a project — or reconfigure one that's already set up.
---

# /wa-setup

Set up orchestrated dev flow for project. Short interactive setup, then scaffold, then index.

Runs on a fresh project **and** on one already set up. Second time it's a **reconfigure**, not a re-install: current values become the defaults, and nothing you edited gets overwritten.

## 0. Which mode

`.whackagent/config.md` exists → **reconfigure** (jump to *Reconfigure mode*). Absent → **first setup**, steps 1–4 below.

Optional arg narrows the scope: `/wa-setup paths`, `/wa-setup review`, `/wa-setup build`, `/wa-setup branch`, `/wa-setup commit`, `/wa-setup verify`, `/wa-setup languages`. Reconfigure only — on a fresh project the arg is meaningless, say so and run the full setup.

## 1. Interactive config (ask one at a time, propose a default)

Detect first, ask second. Scan repo to guess:
- **primary language** — `Package.swift`/`*.xcodeproj` → swift; `tsconfig.json`/`package.json` → typescript; else generic.
- **project kind** (Swift) — `*.xcodeproj`/`*.xcworkspace` with app target, or `@main App`/UIKit lifecycle → `app`; `Package.swift` library/executable → `package`; CLI/server as applicable.
- **SwiftUI usage** — any `import SwiftUI` in source.
- **Its own build wrapper** — a repo-local CLI (`cli/`, `bin/`, `scripts/`), a `Makefile` with a build target, or — the strongest signal — the project's own `CLAUDE.md`/README saying *"ALWAYS use X to build"*. Read that instruction if it exists: a project that mandates a wrapper mandates it for the implementer too.

Then confirm with user:

1. **Discussion language** — which language to talk in? (default: detect from user; fr/en)
2. **Primary language + project kind** — confirm detected language and kind (app / package / cli / server). Kind picks architecture module.
3. **When to review** — _"Review the code at every step (after coding, and after each feedback round), or once when you run `/wa-validate` — your green light saying the feature matches the spec? (recommended: at `/wa-validate` — you iterate fast, and the review reads the final diff instead of code that's still moving)"_ → sets `review.when` (`each_round` | `on_validation`). Say the trade plainly: `each_round` catches drift earlier but adds a verifier round to every note; `on_validation` reviews the whole diff in one pass. Either way `/wa-validate` is the only thing that closes a task.
4. **Review toggles** — surface the public-doc one explicitly, it varies by company: _"Require `///` documentation on every public API? (some teams skip this)"_ → sets `review.public_doc`. Offer to flip the other toggles too.
5. **Build command** — only ask when detection found a wrapper: _"I see `<X>` — should the implementer build with it, or use XcodeBuildMCP / the language default?"_ → sets `build.command` (+ `build.test_command` if there's a test target). Nothing detected → leave both empty, don't ask. **The project wins over the plugin's default**: a repo that documents its own build path documents it for the agents too, and an implementer torn between two mandates picks one silently.
6. **Commit policy** — _"Once YOU validate a feature, may I commit it myself, or always wait for you to commit?"_ → sets `auto_commit_after_validation`. Remind: commits always use your name, never Claude's. Outside autopilot, nothing committed before you validate.
7. **Branch policy** — _"Should `/wa-code` work on its own branch per task (`wa/<slug>`), or code straight on the current branch?"_ → sets `branch.per_task`. If yes, confirm `branch.prefix` and `branch.base` (`current`, or a fixed base like `main`). Mention the pairing: with per-task branches **and** auto-commit on, validating a task commits it and checks out the next task's branch for you (`branch.checkout_next`, on by default) — offer to turn that off. `/wa-autopilot` branches per task regardless.
8. **Where things live** — _"Keep the backlog, tasks and wiki inside `.whackagent/`, or put some of them somewhere the team already reads — `docs/wiki/`, say? (recommended: `.whackagent/` — one folder, nothing to wire up; move them if teammates who don't run whackagent need to read them)"_ → sets `paths.*`. Ask **once, as one question**; only split into per-path answers if they say "some of them". Two things to say when they move something:
   - a shared wiki or backlog wants a **committed, browsable** folder (`docs/`) — `.whackagent/` reads fine for the agents and badly for a human on GitHub;
   - `paths.reports` is run output, not knowledge — leave it local (and gitignore-able) unless they ask.
   Absolute paths work too (a wiki in a sibling repo). `.whackagent/config.md` itself never moves — it's what carries the paths.

Keep short — 7 to 8 questions (the build one only fires on a detected wrapper). Rest take template default.

**Only if project kind is `app`:** ask **who tests the app** after a green build — _"In autopilot the agent drives the app itself (taps + screenshots) since nobody's watching. When you're at the keyboard, should it do the same, or stop at build + tests and let you test? (recommended: you test — you'll open the app anyway, and driving it costs a few minutes per round)"_ → sets `verify.mode` (`autopilot` | `always` | `off`) + `verify.platform`/`verify.target`. Name the third option only if they push back on autopilot driving at all: `off` means nobody drives it, ever. iOS drives through **XcodeBuildMCP** (same server it builds with, nothing extra to install); Android or a physical device needs the **mobile-mcp** server (`mobile-next/mobile-mcp`) configured — say so.

## 2. Scaffold

Create directory and files (do not overwrite existing without asking).

**Everything below lands at its `paths.*` value, not at the literal path written here** — `{tasks}`, `{wiki}`, `{backlog}`, `{reports}`, `{conventions}` are whatever step 1 question 8 settled on. Create parent folders as needed; a path outside `.whackagent/` is normal, not a mistake. `config.md` is the one exception: always `.whackagent/config.md`.

- `.whackagent/config.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/config.md`, fill answers above (including the `paths:` block), set `review.modules` to the modules you actually copy (next bullet).
- `{conventions}/` — copy **only relevant** convention modules there:
  - **Swift** (`${CLAUDE_PLUGIN_ROOT}/conventions/swift/`): always `style.md`, `elegance.md`, `testing.md`, and `architecture-global.md` (platform-agnostic YAGNI/SOLID/DRY/DI — every Swift project). Kind module: `architecture-app.md` if kind is `app`, else `architecture-package.md`. Add `swiftui.md` **only if SwiftUI used** (skip for package/CLI with no SwiftUI — whole point).
  - **TypeScript / generic**: copy single `${CLAUDE_PLUGIN_ROOT}/conventions/<lang>.md` and set `review.modules` to it alone.
  - Set `review.modules` in config to exactly what you copied — the verifier reads that list and nothing else, so a module you copied but left out of the list is a rulebook nobody opens.
- **Xcode projects only** (repo has `.xcodeproj`/`.xcworkspace`): create `.xcodebuildmcp/config.yaml` at repo root (not in `.whackagent/`) so XcodeBuildMCP builds incrementally instead of full-rebuilding every time. Content:
  ```yaml
  schemaVersion: 1
  incrementalBuildsEnabled: true
  ```
  Skip if the file already exists (don't clobber a user's config). This is why an implementer with no `build.command` builds through XcodeBuildMCP — command-line `xcodebuild` ignores this file and rebuilds from scratch. With a `build.command` set, the wrapper owns the build dir instead, and this file is just harmless.
- `{backlog}` — copy `${CLAUDE_PLUGIN_ROOT}/templates/BACKLOG.md`.
- `{wiki}/index.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/wiki-index.md`.
- Create empty `{tasks}/` and `{reports}/` directories (`.gitkeep` fine).

## 3. Seed the wiki (optional, offer it)

Offer to bootstrap few wiki pages by reading the source (e.g. `architecture`, plus one page per major subsystem). Only if user says yes.

## 4. Compress docs (if `compress_wiki: true`)

To cut re-read tokens, run **caveman-compress** skill on `.whackagent/config.md` and every wiki page just written (`{wiki}/*.md`). After each compression, delete `*.original.md` backup it creates — git history is backup. Do **not** compress the backlog, task files, or reports. Skip this step entirely if `compress_wiki: false`.

**Wiki outside `.whackagent/` + `compress_wiki: true` → ask before compressing.** A wiki you moved to `docs/` is one a teammate reads directly; caveman prose is for the agents' token budget, not for humans. Recommend flipping `compress_wiki: false` in that case.

## Reconfigure mode — the project is already set up

The project already works. You're here to **change settings and pick up what the plugin added since**, not to reinstall. Everything the user wrote — config values, free-form notes, edited convention modules, the backlog — is theirs.

### 1. Take stock, before asking anything

1. **Read `.whackagent/config.md`.**
2. **Re-run the detection pass** from step 1 and compare it to the config. Drift is worth a line each — the project became SwiftUI, a build wrapper appeared, the kind changed from `package` to `app`. **Surface it, never auto-apply**: a value the user set by hand outranks anything you detect.
3. **Diff the config's keys against `${CLAUDE_PLUGIN_ROOT}/templates/config.md`.** Keys in the template and missing from the config are features shipped after this project was set up (`paths:` is exactly that for anything set up before it existed). They're the main reason to re-run this command — list them with their default and what they buy, and ask.
4. **Check the paths resolve.** A `paths.*` key pointing at nothing means files moved by hand: say which key and what it points at, offer to re-point the key or move the files back. Don't scaffold over it.

### 2. Show the state, then ask what changes

One table — current value, and a flag on anything worth attention:

```
| Réglage      | Actuel                | |
|--------------|-----------------------|-|
| review.when  | on_validation         | |
| paths.wiki   | .whackagent/wiki      | 🆕 déplaçable (docs/wiki) pour partage équipe |
| verify.mode  | autopilot             | |
| build.command| (vide)                | ⚠️ `make build` détecté depuis |
```

Then **one question: what do you want to change?** Re-ask a full question (step 1's wording) only for what they name, plus every new key from stock-taking step 3 — those they've never been asked. Current value is the default in every one; "leave it" is always a valid answer. Don't walk all eight questions at somebody who came to flip one toggle.

With an arg (`/wa-setup paths`), skip the table's unrelated rows and go straight to that section's questions.

### 3. Apply

**Edit the config in place, key by key. Never re-copy the template over it** — that erases the free-form notes, the per-project comments and every value you didn't ask about. Add a missing key with the template's default plus its comment block; leave every untouched key byte-for-byte.

**A path change means moving files — do it, don't just rewrite the key.** Nothing back-fills, and a re-pointed `paths.wiki` with the pages left behind is a wiki that silently vanished.

1. **List what will move, ask, then move.** `git mv` when the files are tracked, plain move otherwise; create parent folders first.
2. **Target already exists and isn't empty → stop and ask.** Merge into it, pick another path, or abort — never overwrite, never mix two wikis silently.
3. **Fix the links after the move**: backlog → task files (relative to the backlog's own folder), and any `[[page]]` or task `wiki:` reference whose page moved.
4. **Dirty tree → say so before moving anything.** A move mixed into uncommitted work is painful to unpick.
5. **Wiki moved out of `.whackagent/` → recommend `compress_wiki: false`** (same reason as step 4: humans read it now).

**Conventions dir — additive only.** Copy in modules that are missing (a module the plugin added, or `swiftui.md` because the project uses SwiftUI now) and update `review.modules` to match. **Never overwrite a module that's already there**: those copies hold the rules `/wa-feedback` captured from the user. A plugin-side module changed upstream → say so, show the diff, copy only on their yes.

**Never re-scaffold what exists.** Backlog, task files, reports and wiki pages are content — this command doesn't touch their contents, ever. Missing entirely (a `{tasks}` folder someone deleted) → recreate the empty folder, mention it.

**Don't re-run the wiki seeding or the compression pass** over pages that already exist. Compression is for pages written this run; there are none.

### 4. Report

What changed, one line each: config keys (before → after), files moved, modules added. Nothing changed → say that plainly rather than inventing a diff.

## Next step

End by suggesting: **`/wa-board`** to see backlog and pick first task, or `/wa-task <description>` to create one. Reconfigure run → **`/wa-board`** to check the backlog still reads right, above all after a path move.