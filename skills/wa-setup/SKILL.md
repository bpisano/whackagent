---
name: wa-setup
description: Configures whackagent in a project, or changes its settings.
---

# /wa-setup

Sets up whackagent. Re-run = reconfigure, never reinstall.

Read: voice, components, tasks, git, store-files, store-github

## Steps

1. **Pick the mode.** `.whackagent/config.md` exists → **Reconfigure**, else **First setup**.
   - Arg (`tasks`, `paths`, `review`, `build`, `branch`, `commit`, `verify`, `languages`) narrows reconfigure. Fresh project + arg → say it's ignored.
2. **Run the mode block.**
3. **Report** (reconfigure): keys before → after, files moved, modules added. Nothing changed → say so.

## First setup

1. **Detect**, no questions yet:
   - Language: `Package.swift` / `*.xcodeproj` → swift · `tsconfig.json` / `package.json` → typescript · else generic.
   - Swift kind: app target or `@main App` / UIKit lifecycle → `app` · `Package.swift` lib/exe → `package` · else `cli` / `server`.
   - SwiftUI: any `import SwiftUI`.
   - GitHub: `origin` on github.com + `gh` installed. Team = org owner, or several authors in `git shortlog -sn | head`.
   - Apple refs (Swift + SwiftUI): `xcrun agent skills export --output-dir <temp>` yields `swiftui-*` folders (Xcode 27+).
   - UI project: kind `app`, or SwiftUI/UIKit, React/Vue/Svelte, Compose. Then scan silently:
     - catalogs (`.xcstrings`, `*.lproj`, `locales/`, `values-*/strings.xml`); source = dev region
     - 20–40 UI strings → person (tu/vous), tone; poor copy (verbose, literal) → not the reference, say so
     - context: README, `fastlane/metadata`, landing copy
   - Recurring domain nouns in code, strings, README → glossary candidates.
   - Build wrapper: `cli/`, `bin/`, `scripts/`, `Makefile` target. Project `CLAUDE.md` / README "ALWAYS use X to build" → strongest, binds the implementer.
2. **Ask** **Questions**.
3. **Scaffold** → **Scaffold**; `github` → **GitHub scaffold** too.
4. **Offer wiki seeding**: `architecture` + one page per subsystem, from source. Yes only.
5. **Compress** if `compress_wiki: true`: `caveman-compress` config + wiki pages written now, delete `*.original.md`. Never backlog, tasks, reports. Wiki outside `.whackagent/` → ask first, recommend `compress_wiki: false`.

## Questions

One **Question** each, detected value as default. 7–12 total, rest = template default. Ask 8 before 7.

1. **Discussion language** — detected from the user.
2. **Language + kind** — confirm (`app` / `package` / `cli` / `server`); kind picks the architecture module.
3. **Review timing** → `review.when`, recommend `on_validation`.
   - `each_round`: drift caught early, verifier round per note.
   - `on_validation`: whole diff once; fast iteration.
   - Either way `/wa-close` refuses an unreviewed task.
4. **Review toggles** — ask `review.public_doc` (`///` on public API). Offer the others.
5. **Build** — wrapper detected only: `<X>`, or XcodeBuildMCP / default? → `build.command` (+ `build.test_command` if tests). Project path wins.
6. **Commit** → `auto_commit_after_validation`.
   - Say: author = machine git config, never Claude (**git → Commits**). Never ask for or store an author.
   - `user.email` empty → say so now.
   - Outside autopilot, nothing committed before validation.
7. **Branch** — `github` → skip (`branch.per_task: true`, no close question: draft PR, user merges).
   - Branch per task (`wa/add-apple-login`) or current? → `branch.per_task`. Yes → confirm `branch.prefix`, `branch.base` (`current` or `main`).
   - Say: + auto-commit → closing checks out the next task branch (`branch.checkout_next`, offer off). `/wa-autopilot` always branches. `branch.sprint_prefix` exists, not asked.
   - `per_task` → **on close**: `close.strategy` (`nothing` | `pr` | `merge`) + `close.target`, recommend `nothing`.
     - Sprint task merges into its sprint branch first; this sets the sprint's end.
     - `pr` needs `gh`, asks before each PR. `close.delete_branch` stays `auto`.
8. **Task store** — GitHub remote only, else `files` → `tasks.backend`. Recommend `github` for a team, `files` alone.
   - Explain `github`: issue per task on a Project (column = state, order = priority, sprint = milestone); task file on `wa/<n>-<slug>`, a hook moves cards; locks; each round pushes, one draft PR per task.
   - Costs one PAT secret per repo.
9. **Paths** → `paths.*`, recommend `.whackagent/`. One question, per path only on "some of them". `github` → no backlog.
   - Shared wiki/backlog → committed folder (`docs/`). `paths.reports` stays local.
   - Absolute OK. `.whackagent/config.md` never moves.
10. **Apple references** — detected only. Copy into `{conventions}/apple/`? Recommend yes (agents open one topic page). Say: Apple text lands in your repo (public: your call); `/wa-setup` refreshes.
11. **Wording** — UI only → **Project voice** in `{conventions}/wording.md`. Up to 3, `AskUserQuestion`, user's language:
    - **Base tone** — 4 likeliest of `neutral`, `sober`, `complice`, `premium`, `energetic` (`${CLAUDE_PLUGIN_ROOT}/conventions/wording/tones.md`). Other → `base: custom`, text in **Voice**.
    - **Person** — languages with it only (tu/vous/impersonal, du/Sie, tú/usted).
    - **Audience** — `general`, `tech`, `young`, `pro`.
    - Detected first, recommended. Clear from scan → skip, confirm in summary.
    - Each option previews one button, empty state, error, destructive confirm; real strings if any.
12. **Verify** — kind `app` only → `verify.mode` + `verify.platform` / `verify.target`. Autopilot always drives. Attended: agent drives, or you test? Recommend you test (`autopilot`).
    - `always` = agent drives too. Name `off` only on pushback.
    - iOS → XcodeBuildMCP. Android / device → needs `mobile-next/mobile-mcp`, say so.

## Scaffold

- Never overwrite a file without asking. Paths = `paths.*` values, parents created; only `.whackagent/config.md` fixed.
- **Config**: `${CLAUDE_PLUGIN_ROOT}/templates/config.md`, answers + `paths:` filled.
- **Modules** `${CLAUDE_PLUGIN_ROOT}/conventions/` → `{conventions}/`, relevant only:
  - Swift: `style`, `elegance`, `testing`, `architecture-global`; `architecture-app` (`app`) else `architecture-package`; `swiftui` if used.
  - TypeScript / generic: `<lang>.md` alone.
  - Apple (Q10 yes): export's `swiftui-*` folders only → `{conventions}/apple/`, `apple.md` beside modules. Delete the export. Never export into `{conventions}/`. Commit `apple/`: worktrees see committed files only.
  - Wording (UI): `wording.md` + whole `wording/`. Fill **Project voice** (`languages` source first = `ui_strings_language`, `person`, `base`, `audience`). **Voice**: 2–3 sentences from scan, keep `<!-- to review -->`. **Validated examples** empty.
  - Glossary (all): `${CLAUDE_PLUGIN_ROOT}/templates/glossary.md` → `{conventions}/glossary.md`. One column per UI language, source first; no UI → `en`. Show scan rows, ask once (recommend keep), write. Nothing found → table empty.
  - `review.modules` = exactly what was copied, `wording.md` + `glossary.md` included.
- **Xcode** → `.xcodebuildmcp/config.yaml` at repo root, unless present: `schemaVersion: 1`, `incrementalBuildsEnabled: true`.
- Templates below = `${CLAUDE_PLUGIN_ROOT}/templates/`. `files` → `{backlog}` from `BACKLOG.md`, empty `{tasks}/`.
- `{wiki}/index.md` from `wiki-index.md`; empty `{reports}/`.

## GitHub scaffold

Team-visible. One **Plan** (auth, project, status, size, variables, hook, secret, config, import). Helper → **store-github → Helper**.

1. **Auth** — needs `project` scope. Missing → user runs `! gh auth refresh -h github.com -s project`, re-check.
2. **Provision** — always `--tasks-path {tasks} --branch-prefix <prefix>`. Adds `Size`, links repo, sets `WA_*` variables.
   - New → `provision --title "<repo>"`, repo owner's. Columns = eight states in order (`In Progress` dropped).
   - Adopt → `--project <n>` (+ `--owner` if not repo owner). Columns kept, missing states added; `--state todo="Ready"` maps a team name.
   - `status_options_extra` → name, ask; recommend dropping GitHub defaults, keeping team ones. Yes → `--prune-status`. Cards on them → user moves them.
   - One board per repo. Never repurpose a team board unasked.
3. **Hook** (mandatory): branch `wa-setup/board-hooks` off default → `${CLAUDE_PLUGIN_ROOT}/templates/github-board.yml` to `.github/workflows/whackagent-board.yml` → commit (**git → Commits**) → push → `gh pr create`.
   - Custom prefix → edit its `branches:` filter.
   - Say: cards move once merged; older sprint branches lack it.
4. **Secret** `WA_PROJECT_TOKEN`:
   - User makes a classic PAT: `https://github.com/settings/tokens/new?scopes=project,repo&description=whackagent-board`.
   - User runs `! pbpaste | gh secret set WA_PROJECT_TOKEN -R <owner>/<repo>`.
   - `provision --project <n>` → `secret_WA_PROJECT_TOKEN: true`. Missing → hook fails: setup not done.
5. **Config**: `tasks.backend: github`, `tasks.project: <owner>/<number>`, `branch.per_task: true`.
6. `.md` tasks exist → **Import to GitHub**, same **Plan**.
7. **Offer smoke test** (recommend yes): `create` → `claim <n> grilling` → `release <n> grilling --reset-to draft` → `cancel <n> --reason "smoke test"`.

## Reconfigure

1. **Take stock**:
   - Re-run detection; one line per drift vs config. Never auto-apply.
   - Keys in template, not config → new: list with default + gain, ask. Not in template → retired.
   - `commit.author_*` → delete unasked, say so.
   - `paths.*` key → nothing (moved by hand) → name key + target; offer re-point or move back. Never scaffold over it.
   - Legacy tasks (**store → Legacy**; `files` also kebab sprints) → offer **Lifecycle migration** / **GitHub layout migration** first.
   - Apple: re-export, `diff -rq --exclude=SKILL.md` on `swiftui-*`. Absent but available → 🆕 + Q10. Differ / folder added or gone → ⚠️ refresh. Same or no Xcode 27 → no row.
   - No `glossary.md` → 🆕. UI, no `wording.md` → 🆕 + Q11. `wording/` ≠ plugin → ⚠️ refresh. Became UI → offer it.
   - `github`: hook on default branch, `template version:` current (older → update PR, **GitHub scaffold** 3); secret in `gh secret list`; `github-board config --refresh` matches; `provision --project <n>` → all states, no extras (else `--prune-status`).
2. **Show** one table: setting · current · 🆕 / ⚠️ + why. Arg → skip unrelated rows, go straight to its section's **Questions**.
3. **Ask** what to change. Full **Questions** only for named items + new keys. Current = default, "leave it" valid.
4. **Apply**:
   - Edit config key by key, never re-copy the template. New key → default + its comment. Rest byte-for-byte.
   - Path change → move files: list, ask, `git mv` (or move); dirty tree → say so first. Target not empty → stop: merge, other path, abort. Fix links (backlog → tasks relative to its folder, `[[page]]`, `wiki:`). Wiki left `.whackagent/` → recommend `compress_wiki: false`.
   - Modules additive: add missing, update `review.modules`. Never overwrite one present, edited or not. Upstream change → diff, copy on yes.
   - `apple/`, `wording/` replaced whole on refresh. `apple/`: delete `swiftui-*` first (read-only). Only `SKILL.md` differs → skip.
   - `apple.md` / `wording.md` never without their folder. **Project voice**, **Voice**, glossary rows never overwritten.
   - Content untouched except **Lifecycle migration**, **GitHub layout migration**, **Import to GitHub**, each behind its **Plan**. Folder deleted (key unchanged) → recreate empty, mention.
   - No wiki seeding, no compression.

## Lifecycle migration

`files`. One **Plan** (states, headings, sprints, titles, backlog, counts), then rewrite every task + `{backlog}`. Dirty tree → say so.

- States: `in-progress` → `coding` · `review` → `to-test` · `validated` → `to-close` · `todo` + `grilled: false` → `draft` · + `true` → `todo`. Drop `grilled:`.
- Headings: `Contexte / Décisions`, `Critères d'acceptation`, `Implémentation`, `Vérification` → English (**voice → Language**).
- Sprints: kebab → title (**voice → Titles**). Branches unchanged.
- Bad titles (**voice → Titles**) → rewrite in plan. Slugs, file names never move.
- Backlog: sections renamed + reordered, line order kept.

## GitHub layout migration

Pre-0.13 (**store-github → Legacy**) → task file = truth. One **Plan**. Dirty tree → say so; end on the starting branch.

1. Hook + secret missing → **GitHub scaffold** 2–4.
2. `size:<x>` label → `set-field <n> size <x>`, `gh issue edit --remove-label`. Label definitions stay: say so.
3. Grilled (`Todo`+, body has `## Acceptance criteria`), board order:
   - Branch: reuse `<prefix><n>-*`, else `gh issue develop` (**store-github → Rounds**; base = sprint branch if milestone).
   - `{tasks}/<n>-<slug>.md`: `issue:`; `status:` = column (`Coding` → `to-test` if `## Implementation` filled, else `todo`, card moved); `wiki:` / `note:` from body; `created:` = `createdAt`. Body sections as-is; no title, summary, size, sprint.
   - Commit (**git → Commits**), push.
   - Re-read body, then `--body-file`: `<summary>`, blank, `https://github.com/<owner>/<repo>/blob/<branch>/{tasks}/<n>-<slug>.md`.
4. Drafts untouched.
5. Failure → stop, report per issue. Body rewritten only after its file is pushed.

## Import to GitHub

`files` → `github`. **Lifecycle migration** first if needed. **Plan** rows: milestones, issues, branches, drafts, archive, removed.

1. Open tasks only (`draft`…`to-close`); `done` / `canceled` stay as archive.
2. Backlog order: `create --title --summary --size [--sprint]` (drafts `--note`), `move <n> --bottom`. Then `blocked_by:` → `depend`.
3. Grilled (`todo` and later): `gh issue develop`. Old local `wa/<slug>` → rebase commits onto it, delete locally (pushed: remote stays, say so). File → `{tasks}/<n>-<slug>.md`, add `issue:`, drop `title`, `summary`, `size`, `sprint`, `blocked_by`. Commit, push.
4. Remove imported files + `{backlog}` from base **after** all exist. Any failure → stop, remove nothing, report.

## Never

- Never overwrite a user-edited value, module, or file.
- Never continue `github` without `project` scope.
- Never ask for or paste the token in chat.
- Never push the hook to the default branch directly.
- Never migrate `github` → `files`: unsupported, recommend staying.

## Next

- Repo near-empty → `/wa-pitch <pitch>`.
- First setup → `/wa-board`, or `/wa-task <idea>`.
- Reconfigure → `/wa-board`, above all after a path move.
