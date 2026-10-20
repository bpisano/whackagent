---
name: wa-setup
description: Interactively bootstrap the whackagent workflow in a project — or reconfigure one that's already set up.
---

# /wa-setup

Set up orchestrated dev flow for project. Short interactive setup, then scaffold, then index.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` · other `reference/` files cited below → read when that step runs.

Wording (screen + reports): **reference/voice.md** — telegraphic, tech terms stay English.

Runs on fresh project **and** on one already set up. Second time = **reconfigure**, not re-install: current values become defaults, nothing you edited get overwritten.

## 0. Which mode

`.whackagent/config.md` exists → **reconfigure** (jump to *Reconfigure mode*). Absent → **first setup**, steps 1–4.

Optional arg narrow scope: `/wa-setup paths`, `/wa-setup review`, `/wa-setup build` (+ `tools`), `/wa-setup branch` (+ `close`, `pr`), `/wa-setup commit`, `/wa-setup verify`, `/wa-setup languages`, `/wa-setup backlog`, `/wa-setup migrate` (migrations only, *Migrations*). Reconfigure only — on fresh project arg meaningless, say so and run full setup.

## 1. Interactive config (ask one at a time, propose a default)

Detect first, ask second. Scan repo to guess:
- **primary language** — `Package.swift`/`*.xcodeproj` → swift; `build.gradle(.kts)`/`settings.gradle(.kts)` with `.kt` sources → kotlin; `tsconfig.json`/`package.json` → typescript; anything else (Rust, Go, Python, C#, Java, Dart, …) → generic. Polyglot repo (KMP + iOS app, backend + web) → language holding most task-relevant code; offer second pack.
- **project kind** — pick architecture module and what runtime check drives:
  - `app` — mobile or desktop GUI: Xcode app target / `@main App` / UIKit lifecycle; Gradle `com.android.application` plugin; Compose Desktop, Electron, Tauri, .NET MAUI/WPF, Flutter.
  - `web` — browser front end: Vite/Next/Remix/Angular/SvelteKit config, `index.html` entry.
  - `server` — HTTP/RPC service: Ktor, Spring, Vapor, Express/Fastify/Nest, Axum/Actix, Go `net/http`, ASP.NET.
  - `cli` — executable entry point with args, no GUI/server.
  - `package` — library/SDK (`com.android.library`, SwiftPM library, npm lib, crate lib).
- **UI toolkit** — `import SwiftUI` → swiftui; `androidx.compose`/`org.jetbrains.compose` in Gradle or `@Composable` in source → compose. Only toolkits with convention module count; others get no UI module.
- **Apple references** — Swift + SwiftUI only: `xcrun agent skills export --output-dir <temp dir>` succeeds (Xcode 27+) and yields `swiftui-*` folders. `xcrun` can't find `agent` (active developer dir = CommandLineTools or older Xcode) → retry once with `DEVELOPER_DIR=<newest /Applications/Xcode*.app>/Contents/Developer`, never `xcode-select -s`. Still fails → skip silently, question 11 never asked, one line `apple refs: none (needs Xcode 27+)`.
- **Its own build wrapper** — repo-local CLI (`cli/`, `bin/`, `scripts/`), `Makefile` with build target, or strongest signal — project's own `CLAUDE.md`/README saying *"ALWAYS use X to build"*. Read that instruction if exists: project that mandates wrapper mandates it for implementer too.
- **Its own quality tools** — Gradle plugin applied in build files or version catalog (`libs.versions.toml` `[plugins]`) with id holding `detekt`, `ktlint` or `spotless` — company wrappers too (`studio.lunabee.plugin.detekt`); command = task it registers (`./gradlew tasks --all | grep -i <tool>`), never guessed. Config file present = project runs it: `detekt.yml` / `config/detekt/`, `.swiftlint.yml`, `.swiftformat`, ktlint (`.editorconfig` `ktlint_*`, Gradle plugin), eslint / biome / prettier config, `ruff.toml` / `[tool.ruff]`, `.golangci.yml`, `clippy.toml`, `.rubocop.yml`. Plus lint/check targets in `Makefile`, `package.json` scripts, CI workflow. Command = how repo already runs it (Gradle task, script, CI step), never invented flags.

Then confirm with user:

1. **Discussion language** — which language to talk in? (default: detect from user, else en)
2. **Primary language + project kind** — confirm detected language and kind (app / web / server / cli / package). Kind picks architecture module.
3. **Where the backlog lives** — ask **early**: answer reshapes questions 8–9. _"Keep the backlog as files in the repo, or on a GitHub Project so several agents in different worktrees share it without stepping on each other? (recommended: files — nothing to wire up; switch to GitHub once you run agents in parallel)"_ → sets `backlog.provider` (`local` | `github`). Detect first: repo has GitHub remote and `gh` logged in → offer it; else don't ask, `local`. `github` → say it forces `branch.per_task: true` + `branch.base` = `close.target` (one named fork point), ignores `close.strategy` for tickets (`/wa-validate` marks PR ready, `/wa-close` merges it on yes) and drops `{backlog}` file; run *GitHub backlog* below **after** the questions.
   **Local** → one follow-up: _"Track release milestones (0.2.0, sprint 14…)? New tasks then join the highest one, so they never grow current scope. (recommended: none for now — add a line under `backlog.milestones` the day you plan a release)"_ → sets `backlog.milestones` (oldest first). GitHub → skip: repo milestones used (**reference/milestones.md**).
4. **When to review** — _"Review the code at every step (after coding, and after each feedback round), or once when you run `/wa-validate` — your green light saying the feature matches the spec? (recommended: at `/wa-validate` — you iterate fast, and the review reads the final diff instead of code that's still moving)"_ → sets `review.when` (`each_round` | `on_validation`). Say trade plainly: `each_round` catch drift earlier but add verifier round to every note; `on_validation` review whole diff one pass. Either way nothing close unreviewed: `/wa-close` refuse task verifier never saw.
5. **Review toggles** — surface public-doc one explicitly, vary by company: _"Require doc comments (`///`, KDoc, TSDoc, …) on every public API? (recommended: yes for `package` — others call that API and read its docs; no for app, web, server or CLI code only your team calls)"_ → sets `review.public_doc`. Offer flip other toggles too.
6. **Build command** — ask only when detection found wrapper: _"I see `<X>` — should the implementer build with it, or use the detected build tool (XcodeBuildMCP, `./gradlew`, package scripts, …)? (recommended: `<X>` — your project documents it, agents should build the way your team does)"_ → sets `build.command` (+ `build.test_command` if test target exists). Nothing detected → leave both empty, don't ask. **Project win over plugin default**: repo that documents own build path documents it for agents too, and implementer torn between two mandates pick one silently.
   **Then tools** — ask only when detection found some: _"I see `<detekt, swiftlint>` — run them after each coding round (failures fixed with the code), at `/wa-validate` (failures join the review), or both? (recommended: both — cheap, and the verifier stops spending time on what the tool catches)"_ → one `tools:` entry each: `name`, `run`, `fix` when tool has fixer (`--auto-correct`, `--fix`, `-F`), `when`. Show entries in one block to confirm. Slow tool (minutes, full analysis) → recommend `validation` alone. Nothing detected → `tools: []`, don't ask.
7. **Commit policy** — _"Once YOU validate a feature, may I commit it myself, or always wait for you to commit? (recommended: commit yourself — `/wa-close` shows its plan and waits for your yes first, and next-task checkout needs it)"_ → sets `auto_commit_after_validation`. **GitHub backlog** → skip question: every round commits and pushes (**reference/provider-github.md**, *Agent round*), key ignored for tickets — say so; identity line below still shown. Leave `commit.author_name` / `author_email` **empty**: config versioned, shared — personal identity there make every teammate commit as you. Show `git config user.name` / `user.email` in one line as identity commits will use; none set → tell user set it in git config, never in whackagent config. Remind: commits always use committer's git name, never Claude's. Outside autopilot, nothing committed before you validate.
8. **Branch policy** — _"Should `/wa-code` code straight on the current branch, on its own branch per task (`wa/<slug>`, checked out here), or on its own branch in a separate worktree per task (`../<repo>-worktrees/<slug>` — this checkout never switches, several tasks open side by side)? (recommended: branch per task — isolated work, one checkout for your IDE and build cache; worktree once you juggle tasks in parallel)"_ → current = `per_task: false`; branch = `per_task: true`; worktree = `per_task: true` + `branch.worktree: true`. Worktree trade to say: each worktree builds cold once, and you test from it (open IDE / simulator / dev server there). Worktree → confirm `paths.worktrees` (default `../<repo>-worktrees`): resolved from **main checkout root** (even when setup run from a worktree), **must land outside the repo** — path inside → refuse, ask again (**reference/worktrees.md**). Always write it relative — never absolute: user-specific path in shared config. If per task, confirm `branch.prefix` and `branch.base` (`current`, or fixed base like `main`). Mention pairing: with per-task branches **and** auto-commit on, closing task commit it and check out next task branch (worktree: create its worktree) for you (`branch.checkout_next`, on by default) — offer turn off. `/wa-autopilot` branch per task regardless. Say `branch.sprint_prefix` exist (`sprint/<sprint>`, tasks of sprint fork off it, `/wa-close` merge back) but **don't ask** — default work, sprints may never come up. Same for `branch.tracks` (long-shot feature on own long-lived trunk beside base, **reference/tracks.md**): mention, **don't ask**, default empty. User names one (`server` on `develop_synchro`) → write `{<milestone title>: <branch>}`, check branch exists on remote and milestone of that title exists — missing → tell them create it (GitHub milestone, or `backlog.milestones` line), never create it yourself.
   **GitHub backlog** → don't ask `per_task` (forced `true`); ask only branch vs worktree (same wording minus current branch), then confirm **one named branch** (never `current`) written to both `branch.base` and `close.target`: ticket branches fork from it, ticket PRs land on it, BOARD.md `<base>` (recommended: repo default branch — where PRs land today). Prefix stays `wa/` unless they insist — hooks workflow `branches:` filter must match. Skip close question below: `close.strategy` ignored for tickets (`/wa-validate` marks PR ready, `/wa-close` merges it on yes).
   **Then, only when `per_task` (GitHub: always): test branch** — _"When two or more coded tasks wait for your test on the same base (sprint branch or trunk), should I merge them into one local throwaway branch `wa-test/<base>` so you test them all in one launch? (recommended: yes — one build instead of switching N branches; never pushed, a conflicting task is skipped, never resolved there)"_ → `branch.test_branch` (`true` | `false`). Worktree mode → say it gets own worktree `{worktrees}/wa-test-<base>`. Rules **reference/test-branch.md**.
   **Then, only when `per_task`: what happen to branch when its task close** — _"When a task is done, should I open a PR onto `main`, merge it locally, or leave the branch alone and let you do the PR? (recommended: leave it alone — you keep control of what gets proposed to the team; switch to `pr` once you trust the flow)"_ → sets `close.strategy` (`nothing` | `pr` | `merge`) + `close.target`. Two things to say: task in **sprint** always merge into its sprint branch first, this setting only decide what happen to sprint branch at end; and `pr` need `gh` authenticated, and **ask every time before opening one**. `close.delete_branch` stay `auto` unless they ask — delete only what already landed elsewhere.
   **Then, when a PR can happen** (GitHub backlog, or `close.strategy: pr`): **PR shape** — detect PR template (`.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`), CODEOWNERS, PR section in `CONTRIBUTING.md`, title convention from last merged PRs (`gh pr list --state merged -L 10 --json title`), repo labels (`gh label list`). Show proposed `pr:` block in one go: _"PRs will use `<template | no template>`, title `<"{title}">`, labels `<[]>`, assigned to you, reviewers `<[] — CODEOWNERS only>`, rules from `<doc | none>`. Change anything? (recommended: as detected — it's what your team already does)"_ Nothing detected → defaults, one line, no question.
   **Then, GitHub backlog + kind `app` or `web` only: PR screenshots** — _"When a ticket's diff changes UI, shoot its screens once at `/wa-validate` — new screen as is, changed screen before | after —, every coding round (final state only), or never? (recommended: at validation — reviewers see what changed, and it costs one build of the base instead of shots every round)"_ → sets `pr.screenshots` (`validation` | `each_round` | `off`). Say upload uses `gh pr edit --attach` (gh ≥ 2.102); older `gh` → needs `gh image` extension or browser.
9. **Where things live** — _"Keep the backlog, tasks and wiki inside `.whackagent/`, or put some of them somewhere the team already reads — `docs/wiki/`, say? (recommended: `.whackagent/` — one folder, nothing to wire up; move them if teammates who don't run whackagent need to read them)"_ → sets `paths.*`. Ask **once, as one question**; split into per-path answers only if they say "some of them". Two things to say when they move something:
   - shared wiki or backlog want **committed, browsable** folder (`docs/`) — `.whackagent/` read fine for agents, bad for human on GitHub;
   - `paths.reports` = run output, not knowledge — stays local, gitignored at scaffold, unless asked.
   Sibling repo → relative path (`../team-wiki/docs`). **Never user-specific absolute path** (`/Users/<name>/…`, `/home/<name>/…`, `~/…`) in config: versioned, shared, break on every other machine. `.whackagent/config.md` itself never move — it carry the paths.
   **GitHub backlog** → no backlog file: ask only about **wiki** (and tasks folder). Wording: _"Keep the wiki inside `.whackagent/`, or put it where the team reads — `docs/wiki/`? (recommended: `.whackagent/wiki` — agents read it fine; move it to `docs/wiki` only if teammates who don't run whackagent should browse it on GitHub)"_ Never mention backlog location — it's the Project. Say task specs live in `{tasks}` **on each ticket branch**, merged with the code.

10. **Release flow** — search markdown per **wa-release → Release doc** step 2, silently. Candidate found → _"Your release flow is in `<path#Heading>` — use it for `/wa-release`? (recommended: yes — it's what the team already follows)"_ → sets `release.doc`. Nothing found → no question, leave empty, say `release flow: none documented — /wa-release will set it up`.
11. **Apple references** — only when detection found them. _"Your Xcode ships Apple's own SwiftUI guidance for agents (best practices, what's new in this SDK). Copy it into `{conventions}/apple/` so implementer and reviewer check APIs against it? (recommended: yes — they open only the page for the topic they touch, costs nothing otherwise)"_ Yes → _"Commit `apple/` (~170 KB of Apple-written pages) or keep it local, gitignored? (recommended: commit on a private repo — teammates without Xcode 27 and autopilot worktrees, which see only committed files, read the same pages; gitignore on a public repo — Apple's text, no license to redistribute it)"_ Gitignore → append `<conventions>/apple/` to root `.gitignore`. Say it's a snapshot of this Xcode: `/wa-setup` refreshes it after an update.

Keep short — 7 to 10 questions (build one fire only on detected wrapper; close policy only when `per_task` and backlog local; PR shape only when PR can happen). Rest take template default.

**Only if project is runnable (kind `app`, `web`, `server`, `cli`):** ask **who tests it** after green build — _"In autopilot the agent exercises what it built itself (taps + screenshots, browser, curl, CLI run) since nobody's watching. When you're at the keyboard, should it do the same, or stop at build + tests and let you test? (recommended: you test — you'll run it anyway, and driving it costs a few minutes per round)"_ → sets `verify.mode` (`autopilot` | `always` | `off`). Name third option only if they push back on autopilot driving at all: `off` = nobody drives it, ever. `package` → `verify.platform: none`, don't ask.

Then set `verify.platform` + `verify.target` from detection (confirm in one line, list when several — KMP app with iOS + Android = `[ios, android]`) and say what driver it needs:
- `ios` → **XcodeBuildMCP** (same server it builds with, nothing extra); physical device → **mobile-mcp**.
- `android` → **mobile-mcp** (`mobile-next/mobile-mcp`), emulator or device.
- `web` → browser automation MCP (Playwright MCP, Claude in Chrome).
- `desktop` → desktop/computer-use MCP if they have one; else GUI proof unavailable, build + tests only.
- `server`, `cli` → nothing to install: Bash (`curl`, the binary).
Driver missing → say so now, not at first autopilot run.

### GitHub backlog (only when `backlog.provider: github`)

Follow `${CLAUDE_PLUGIN_ROOT}/providers/github/README.md` → **Setup**, one step at a time, each confirmed — in order below: scaffold and secret land **before** board PR opens.

1. `gh auth status` has scope `project` — missing → give user `! gh auth refresh -h github.com -s project`, wait.
2. Project: list theirs (`gh project list --owner <owner>`) and owner's templates (`wa-backlog templates`), propose reuse, template or new — recommend **template** when owner has one (copy brings team's views, fields and Project workflows), else **new** (`<repo> backlog`), unless they name a board the team already works from: a fresh board gets whackagent's six columns cleanly, an adopted one keeps its columns and needs `--state` mapping. Several templates → list them, ask which. Run `wa-backlog provision --title … [--template <n>] | --project <n>` (+ `--state x=Name` when adopting a board whose column names differ — ask for any state it can't match; never rename their columns). New board (no template) → columns = six states, lifecycle order: GitHub's default `In Progress` dropped. Output `status_options_extra` non-empty (template copy or adopted board: columns no state maps to) → ask per column, drop or keep (recommend: drop GitHub defaults like `In Progress` — nobody chose them; keep team-named ones like `Blocked` — team uses them, hooks ignore them). Say dropping any also reorders: six state columns in lifecycle order first, kept extras after. Columns to drop → re-run with `--prune-status "<name>"` once per column. Column still holding cards stays (`status_options_held` names cards) → say so, never move cards for user. Pass `--tasks-path {tasks}`, `--branch-prefix <branch.prefix>`, `--sprint-prefix <branch.sprint_prefix>` (hooks close sprint parent issue when that branch lands) and `--stale-after-hours <stale-hours>` always explicit (default `24` → repo variable `WA_STALE_AFTER_HOURS`; same value fills BOARD.md `<stale-hours>`), plus `--track <title>` per `branch.tracks` key (provider never picks track as default milestone). `branch.tracks` edited later → re-run provision with full list. Output `conflicting_workflows` non-empty (GitHub's built-in *Pull request linked to issue* moves cards to its own column) → ask user to switch it off: Project → ⋯ → Workflows (recommend: yes — hooks take a card back only while a coding claim is held; API can only delete it, so never done for them).
3. **Scaffold** now — sections 2–4 below (*Scaffold* without `{backlog}` file: board replaces it; `{tasks}` still created, holds specs on ticket branches · wiki seed offer · compression), not repeated after — so it rides board PR. Never committed straight to default branch.
4. Secret `WA_PROJECT_TOKEN` — **before board PR opens**: hooks fail on first event without it. Say plainly: classic PAT, scopes `repo` + `project`; `repo` reaches **every private repo of the token's account**, not only this one — recommend dedicated bot account (machine user) given access to this repo alone; personal token only for solo test repo. Give token link + `! pbpaste | gh secret set WA_PROJECT_TOKEN -R <repo>`, wait, check `provision` / `gh secret list`.
5. **Board PR** — branch `wa-setup/board-hooks`, one PR onto default branch, every file below listed in body. Never push default branch. Board live once merged — say so; secret still missing → merge only after it's set.
   - **Project scaffold** (step 3) — `.whackagent/config.md`, `{conventions}/`, `{wiki}/` (`index.md` + seeded pages), `{tasks}/.gitkeep`, `{reports}/.gitkeep`, `.gitignore` reports lines: teammates' agents get same config on merge.
   - **Caller** `providers/github/whackagent-board.yml` → `.github/workflows/whackagent-board.yml` (logic runs from whackagent `board.yml@hooks-v2`, auto-updated). Fix `branches:` filter if prefix isn't `wa/`.
   - **Contract** `templates/BOARD.md` → repo root `BOARD.md`, placeholders filled: `<board-cli>` = `.github/board/wa-backlog` · `<branch-prefix>` · `<sprint-prefix>` · `<base>` = `branch.base` (= `close.target`, one value) · `<tasks-path>` = `{tasks}` · `<project-url>` (provision output) · `<stale-hours>` = value passed to `--stale-after-hours`. Header comment stays. Empty `branch.sprint_prefix` → no `<sprint-prefix>` to fill; rewrite both spots: *Working a ticket* 3b *Fork point* bullet → `<base>` (or its track branch), sprints have no branch; *Sprints* second bullet → sprint tickets fork from and PR onto `<base>` like any, no sprint PR, workflow closes parent when last sub-issue lands.
   - **Board CLI** `${CLAUDE_PLUGIN_ROOT}/providers/github/wa-backlog` → `.github/board/wa-backlog`, executable (`git add --chmod=+x`). Any agent with shell runs it — whackagent skills keep plugin's copy.
   - **Pointers** `templates/board-pointer.md` (between its markers) → `AGENTS.md` (created if absent), `CLAUDE.md` (created if absent: Claude Code never reads `AGENTS.md`), `.github/copilot-instructions.md` when present, `.cursor/rules/board.mdc` (frontmatter `alwaysApply: true`) when `.cursor/` exists. Block already there → replaced whole, rest of file untouched.
   - **PR template** `templates/pr-board-sections.md` appended to each template (detection **reference/pull-requests.md**, *Template*); none → `.github/pull_request_template.md` with sections alone. Sections already there (marker) → replaced, team's sections untouched.
   - **Reconfigure** — caller `template version` below plugin's, no `uses:` line (old full copy), or any board file's `board-contract` stamp below plugin's (script `CONTRACT_VERSION`) → offer same PR refreshing every board file together (recommend: yes — one contract version, files move together; a mismatch makes the CLI warn).
6. Offer (ask each, with recommendation):
   - import open issues (`wa-backlog get <n>` adds each as `todo`) — recommend **yes** when repo has open issues: every issue is a ticket anyway, hook only catches new ones. Issues whose body already holds `## Acceptance criteria` → say so: they land `todo` too (hook only sees new edits) → list them, offer `wa-backlog set-state <n> grilled` each (setup migration, **providers/CONTRACT.md** → *Verbs*) — recommend **yes** for issues written by repo members: spec already there; outsider-written ones stay `todo` until a maintainer grills them.
   - smoke test (README step 5) — recommend **yes** once hooks PR merged: proves token, variables and hooks before real work; costs one throwaway issue.

**Migrating an existing local backlog** (reconfigure `local` → `github`) — offer once, apply on yes, per task:
- not `done`/`canceled` → `wa-backlog create` (title, summary, size, sprint, `--milestone` = task `milestone:` or `""`), board order = `{backlog}` order. First list task milestones missing on GitHub → user creates them there (recommended: keeps scope) or drops them — never create them yourself. `backlog.milestones` dropped from config after.
- `todo` + `grilled: false` → stays `todo`.
- `todo` + `grilled: true` → rename file `{tasks}/<n>-<slug>.md`, rewrite frontmatter to GitHub shape (`issue: <n>`), create `wa/<n>-<slug>` with `gh issue develop <n> --name … --base <fork point> --checkout` (linked to issue), commit there, push — hook moves it to `grilled` (tests hook for real).
- `in-progress` / `review` / `validated` → same, local branch renamed `wa/<n>-<slug>`, pushed; ticket lands `grilled`. User re-claims to continue — never auto-claim for a session that may be gone.
- `done` / `canceled` → not imported, history stays in git.
- then delete `{backlog}` in one commit. GitHub → local: not supported.

## 2. Scaffold

Create directory and files (do not overwrite existing without asking).

**Everything below land at its `paths.*` value, not at literal path written here** — `{tasks}`, `{wiki}`, `{backlog}`, `{reports}`, `{conventions}` = whatever step 1 question 9 settled on. Create parent folders as needed; path outside `.whackagent/` normal, not mistake. `config.md` one exception: always `.whackagent/config.md`.

- `.whackagent/config.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/config.md`, fill answers above (including `paths:` block), set `review.modules` to modules you actually copy (next bullet).
- `{conventions}/` — copy **only relevant** convention modules there:
  - **Multi-module packs** — **Swift** (`${CLAUDE_PLUGIN_ROOT}/conventions/swift/`), **Kotlin** (`…/conventions/kotlin/`): always `style.md`, `elegance.md`, `testing.md`, `architecture-global.md` (YAGNI/SOLID/DRY/DI — every project in that language). Kind module: `architecture-app.md` if kind is `app`, else `architecture-package.md`. UI module **only if that toolkit used**: `swiftui.md` (Swift), `compose.md` (Kotlin) — skip for server/CLI/library with no UI, whole point.
  - **Single-file packs** — **TypeScript**, **generic** (every other language): copy `${CLAUDE_PLUGIN_ROOT}/conventions/<lang>.md` and set `review.modules` to it alone. Generic = fallback, not second class: tell user it's the file to grow with their team's real rules.
  - **Apple references** (question 11 yes) — from temp export copy only `swiftui-*` folders into `apple/` beside Swift modules (`{conventions}/apple/`; polyglot: `{conventions}/swift/apple/`), then `chmod -R u+w` (Xcode exports read-only). Other exported skills = one-off tasks (security audit, C bounds safety, test migration), not references. Copy `${CLAUDE_PLUGIN_ROOT}/conventions/swift/apple.md` beside the other modules, list it in `review.modules`. Delete temp export. Never export straight into `{conventions}/`: dumps every skill.
  - Polyglot repo with two packs → copy both into sub-folders (`{conventions}/swift/`, `{conventions}/kotlin/`), list both in `review.modules`.
  - Set `review.modules` in config to exactly what you copied — verifier read that list and nothing else, so module copied but left out of list = rulebook nobody opens.
- **Xcode projects only** (repo has `.xcodeproj`/`.xcworkspace`): create `.xcodebuildmcp/config.yaml` at repo root (not in `.whackagent/`) so XcodeBuildMCP build incrementally instead of full-rebuild every time. Content:
  ```yaml
  schemaVersion: 1
  incrementalBuildsEnabled: true
  ```
  Skip if the file already exists (don't clobber a user's config). This is why an implementer with no `build.command` builds through XcodeBuildMCP — command-line `xcodebuild` ignores this file and rebuilds from scratch. With a `build.command` set, the wrapper owns the build dir instead, and this file is just harmless.
- `{backlog}` — copy `${CLAUDE_PLUGIN_ROOT}/templates/BACKLOG.md`. **Skip under `backlog.provider: github`.**
- `{wiki}/index.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/wiki-index.md`.
- `{wiki}/glossary.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/glossary.md`. Kind `server`, `cli`, `package` → drop `## Screens`. Plain Markdown for whole team; skills use it when present, nothing needs it.
- Create empty `{tasks}/` and `{reports}/` directories (`.gitkeep` fine).
- **Gitignore reports** — append to repo root `.gitignore` (create if absent) `<reports>/*` + `!<reports>/.gitkeep`, `<reports>` = `paths.reports` relative to repo root. Rule already covering it (`git check-ignore -q <reports>/x.md`) → skip. Path outside repo → skip. Why: reports = run output, every section already in task file + wiki; tracked, they're PR noise, churn every feedback round, diverge across machines.

## 3. Seed the wiki (optional, offer it)

Offer to bootstrap few wiki pages by reading the source (e.g. `architecture`, plus one page per major subsystem) (recommended: yes on existing codebase — agents read wiki first instead of re-scanning source every run; no on near-empty repo, nothing to describe yet). Only if user says yes.

Seeding → also propose first glossary rows from code (model types, screen/route names), one block, written on yes.

## 4. Compress docs (if `compress_wiki: true`)

To cut re-read tokens, run **caveman-compress** skill on `.whackagent/config.md` and every wiki page just written (`{wiki}/*.md`). After each compression, delete `*.original.md` backup it creates — git history is backup. Do **not** compress the backlog, task files, or reports. Skip this step entirely if `compress_wiki: false`.

**Wiki outside `.whackagent/` + `compress_wiki: true` → ask before compressing.** A wiki you moved to `docs/` is one a teammate reads directly; caveman prose is for the agents' token budget, not for humans. Recommend flipping `compress_wiki: false` in that case.

## Reconfigure mode — the project is already set up

The project already works. You're here to **change settings and pick up what the plugin added since**, not to reinstall. Everything the user wrote — config values, free-form notes, edited convention modules, the backlog — is theirs.

### 1. Take stock, before asking anything

1. **Read `.whackagent/config.md`.**
2. **Re-run the detection pass** from step 1 and compare it to the config. Drift is worth a line each — the project adopted SwiftUI or Compose, a build wrapper or lint config appeared, the kind changed from `package` to `app`. **Surface it, never auto-apply**: a value the user set by hand outranks anything you detect.
3. **Diff the config's keys against `${CLAUDE_PLUGIN_ROOT}/templates/config.md`.** Keys in the template and missing from the config are features shipped after this project was set up (`paths:` is exactly that for anything set up before it existed). They're the main reason to re-run this command — list them with their default and what they buy, and ask.
4. **Check the paths resolve.** A `paths.*` key pointing at nothing means files moved by hand: say which key and what it points at, offer to re-point the key or move the files back. Don't scaffold over it.
5. **Check reports stay local.** `git check-ignore -q {reports}/x.md` fails → offer the gitignore lines from scaffold step (recommended: yes — nothing reads reports beyond the run that wrote them). Reports already tracked (`git ls-files {reports}` beyond `.gitkeep`) → also offer `git rm --cached` on them: files stay on disk, leave the index. Never without yes. `paths.reports` moved → move its gitignore lines with it.
6. **Check config holds nothing user-specific.** Path under a home dir (`/Users/`, `/home/`, `~`) → ⚠️, offer relative form (`paths.worktrees` → `../<repo>-worktrees`). Personal `commit.author_name` / `author_email` → ⚠️, offer empty (each committer's git identity). Recommended: yes both — config versioned, shared.
7. **Check board files current** (`backlog.provider: github`). Fetch, then on `origin/<branch.base>`: `.github/workflows/whackagent-board.yml` first line `template version: <v>` vs plugin's `providers/github/whackagent-board.yml`, and `BOARD.md` first line `board-contract: <x>` vs `${CLAUDE_PLUGIN_ROOT}/templates/BOARD.md`. Behind, or file missing → ⚠️ row, offer `/wa-setup backlog` board PR (*GitHub backlog* step 5, *Reconfigure*) (recommended: yes — caller below v16 stops every agent round at **reference/provider-github.md**, *Hooks version gate*; contract mismatch makes CLI warn).
8. **Glossary.** `{wiki}/glossary.md` missing → 🆕 row: offer template + `[[glossary]]` line in `{wiki}/index.md` (recommended: yes — one word per thing across UI, code, tasks, PRs; plain Markdown teammates read without whackagent). Present → content theirs, never touched.
9. **Apple references** (Swift + SwiftUI, export works per detection). Re-export to temp dir, `diff -rq -x SKILL.md` against `apple/` (Xcode shuffles `SKILL.md` frontmatter every export: noise). Absent → 🆕 row, question 11 asked as new. Pages differ or `swiftui-*` folder appeared/vanished → ⚠️ row, refresh behind a yes. Same → no row. No Xcode 27 here → leave what's there, no row.
10. **Detect migrations** — *Migrations* below. Each match → 🆕 row.

### 2. Show the state, then ask what changes

One table — current value, and a flag on anything worth attention:

```
| Setting      | Current               | |
|--------------|-----------------------|-|
| review.when  | on_validation         | |
| paths.wiki   | .whackagent/wiki      | 🆕 movable (docs/wiki) for team sharing |
| verify.mode  | autopilot             | |
| build.command| (empty)               | ⚠️ `make build` detected since |
```

Then **one question: what do you want to change?** Re-ask a full question (step 1's wording) only for what they name, plus every new key from stock-taking step 3 — those they've never been asked. Current value is the default in every one; "leave it" is always a valid answer. Don't walk all ten questions at somebody who came to flip one toggle.

With an arg (`/wa-setup paths`), skip the table's unrelated rows and go straight to that section's questions.

### 3. Apply

**Edit the config in place, key by key. Never re-copy the template over it** — that erases the free-form notes, the per-project comments and every value you didn't ask about. Add a missing key with the template's default plus its comment block; leave every untouched key byte-for-byte.

**A path change means moving files — do it, don't just rewrite the key.** Nothing back-fills, and a re-pointed `paths.wiki` with the pages left behind is a wiki that silently vanished.

1. **List what will move, ask, then move.** `git mv` when the files are tracked, plain move otherwise; create parent folders first.
2. **Target already exists and isn't empty → stop and ask.** Merge into it, pick another path, or abort — never overwrite, never mix two wikis silently.
3. **Fix the links after the move**: backlog → task files (relative to the backlog's own folder), and any `[[page]]` or task `wiki:` reference whose page moved.
4. **Dirty tree → say so before moving anything.** A move mixed into uncommitted work is painful to unpick.
5. **Wiki moved out of `.whackagent/` → recommend `compress_wiki: false`** (same reason as step 4: humans read it now).

**Conventions dir — additive only.** Copy in modules that are missing (a module the plugin added, or `swiftui.md`/`compose.md` because the project uses that toolkit now) and update `review.modules` to match. **Never overwrite a module that's already there**: those copies hold the rules `/wa-feedback` captured from the user. A plugin-side module changed upstream → say so, show the diff, copy only on their yes.

**`apple/` = one exception: replaced whole on refresh.** Apple's text, nobody edits it, stale page teaches changed API. Delete old `swiftui-*` folders, copy fresh ones, `chmod -R u+w`. `apple.md` follows additive rule above, never copied without its `apple/` folder.

**Never re-scaffold what exists.** Backlog, task files, reports and wiki pages are content — this command doesn't touch their contents, ever. One exception: a migration the user said yes to, and only what its `## Detect` matched (*Migrations*). Missing entirely (a `{tasks}` folder someone deleted) → recreate the empty folder, mention it.

**Don't re-run the wiki seeding or the compression pass** over pages that already exist. Compression is for pages written this run; there are none.

### 4. Report

What changed, one line each: config keys (before → after), files moved, modules added, migrations applied (✅ / ❌ / skipped). Nothing changed → say that plainly rather than inventing a diff.

### Migrations

Format change old projects must follow (task frontmatter, backlog shape) = one file in `migrations/` beside this file, `NNNN-<name>.md`: `## Detect` (condition on project files), `## Plan` (row shown, recommended answer), `## Apply` (edits).

1. **Detect** — every file, number order (`0001` < `0002`). Its `## Detect` matches → one row from its `## Plan`. **No ledger**: Detect alone decides. Applied migration no longer matches, so re-running is safe.
2. **Show** — rows under stock-taking table, one answer each (`yes` / `skip`, or what its Plan lists). Dirty tree → say so first.
3. **Apply** on yes, number order, before config edits: its `## Apply`, only on what Detect matched. Case its file doesn't cover → stop that row, ask. Failure → stop, rows after untouched.
4. **Never** touch GitHub board data (issues, Project, labels), `BOARD.md`, hooks workflow or board CLI: those keep own version gates (*Take stock* step 7). Never commit: user reviews diff.

## Next step

End by suggesting: **`/wa-board`** to see backlog and pick first task, or `/wa-task <description>` to create one. Reconfigure run → **`/wa-board`** to check the backlog still reads right, above all after a path move.