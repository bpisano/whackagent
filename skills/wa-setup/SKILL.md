---
name: wa-setup
description: Configures whackagent in a project, or re-asks its questions to change settings.
---

# /wa-setup

Sets up whackagent. Re-run = same questions, current answers as defaults. Plugin updates → `/wa-update`.

Read: voice, components, tasks, git, store-files, store-github

## Steps

1. **Pick the run.** No `.whackagent/config.md` → **First setup**. Else **Re-run**.
   - Arg (`tasks`, `paths`, `review`, `build`, `branch`, `commit`, `verify`, `languages`) → that section's **Questions** only. First setup + arg → say it's ignored.
2. **Run the block.**

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
   - Glossary candidates (**voice → Learning**):
     - recurring domain nouns in code, strings, README → **Concepts**
     - UI: screen types (`*View`, `*Screen`, routes) → **Screens**; views on 2+ screens → **Parts**; navigation (`NavigationStack`, coordinators, router) → **Flows**
   - Build wrapper: `cli/`, `bin/`, `scripts/`, `Makefile` target. Project `CLAUDE.md` / README "ALWAYS use X to build" → strongest, binds the implementer.
2. **Ask** **Questions**.
3. **Scaffold** → **Scaffold**; `github` → **GitHub scaffold** too.
4. **Offer wiki seeding**: `architecture` + one page per subsystem, from source. Yes only.
5. **Compress** if `compress_wiki: true`: `caveman-compress` config + wiki pages written now, delete `*.original.md`. Never backlog, tasks, reports. Wiki outside `.whackagent/` → ask first, recommend `compress_wiki: false`.

## Questions

One **Question** each, detected value as default. 7–12 total, rest = template default. Ask 8 before 7.

1. **Languages** — discussion: detected from the user. `pr_language` (`github` or `close.strategy: pr`): language of the last 10 merged PRs (`gh pr list --state merged`), else discussion.
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
10. **Apple references** — detected only. Copy into `{conventions}/apple/`? Recommend yes (agents open one topic page). Say: Apple text lands in your repo (public: your call); `/wa-update` refreshes.
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
  - Glossary (all): `${CLAUDE_PLUGIN_ROOT}/templates/glossary.md` → `{conventions}/glossary.md`. **Concepts**: one column per UI language, source first; no UI → `en`. No UI → drop **Screens**, **Parts**, **Flows**. Scan rows as one **Glossary rows** (recommend keep). Nothing found → tables empty.
  - PR: `${CLAUDE_PLUGIN_ROOT}/templates/pr.md` → `{conventions}/pr.md`, unless `.github/pull_request_template.md` exists. Not in `review.modules`.
  - `review.modules` = exactly what was copied, `wording.md` + `glossary.md` included.
- **Xcode** → `.xcodebuildmcp/config.yaml` at repo root, unless present: `schemaVersion: 1`, `incrementalBuildsEnabled: true`.
- Templates below = `${CLAUDE_PLUGIN_ROOT}/templates/`. `files` → `{backlog}` from `BACKLOG.md`, empty `{tasks}/`.
- `{wiki}/index.md` from `wiki-index.md`, glossary link relative to `{wiki}`; empty `{reports}/`.

## GitHub scaffold

Team-visible. One **Plan** (auth, project, status, size, variables, hook, secret, config, import). Helper → **store-github → Helper**.

1. **Auth** — needs `project` scope. Missing → user runs `! gh auth refresh -h github.com -s project`, re-check.
2. **Provision** — always `--tasks-path {tasks} --branch-prefix <prefix>`. Adds `Size`, type labels (**tasks → Types**), links repo, sets `WA_*` variables.
   - Repo has `enhancement` (GitHub default) → offer `--type improvement=enhancement`, recommend yes.
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

## Re-run

1. **Detect** (**First setup** 1).
2. **Ask** **Questions**: current value = default. Detected differs → `Alt:` line (`Alt: SwiftUI detected`).
3. **Apply** what changed, each effect behind its **Plan**:
   - Config key by key, never re-copy the template. Rest byte-for-byte.
   - Path changed → move files: list, `git mv` (or move); dirty tree → say so first. Target not empty → stop: merge, other path, abort. Fix links (backlog → tasks relative to its folder, `[[page]]`, `wiki:`). Wiki left `.whackagent/` → recommend `compress_wiki: false`.
   - `files` → `github` → **GitHub scaffold** + **Import to GitHub**.
   - Module newly picked (Apple, wording, architecture swap) → copy per **Scaffold**. Never overwrite one present.
   - Folder deleted (key unchanged) → recreate empty, mention.
   - No wiki seeding, no compression.
4. **Report**: keys before → after, files moved, modules added. Nothing changed → say so.

## Import to GitHub

`files` → `github`. Legacy tasks (**store-files → Legacy**) → `→ next: /wa-update`, stop. **Plan** rows: milestones, issues, branches, drafts, archive, removed.

1. Open tasks only (`draft`…`to-close`); `done` / `canceled` stay as archive.
2. Backlog order: `create --title --summary --size [--type] [--sprint]` (drafts `--note`), `move <n> --bottom`. Then `blocked_by:` → `depend`.
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
- Re-run → `/wa-board`, above all after a path move.
