---
name: wa-setup
description: Configures whackagent in a project, or changes its settings.
---

# /wa-setup

Set up orchestrated dev flow for project. Short interactive setup, then scaffold, then index.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Runs on fresh project **and** on one already set up. Second time = **reconfigure**, not re-install: current values become defaults, nothing you edited get overwritten.

## 0. Which mode

`.whackagent/config.md` exists → **reconfigure** (jump to *Reconfigure mode*). Absent → **first setup**, steps 1–4.

Optional arg narrow scope: `/wa-setup tasks`, `/wa-setup paths`, `/wa-setup review`, `/wa-setup build`, `/wa-setup branch`, `/wa-setup commit`, `/wa-setup verify`, `/wa-setup languages`. Reconfigure only — on fresh project arg meaningless, say so and run full setup.

## 1. Interactive config (ask one at a time, propose a default)

Detect first, ask second. Scan repo to guess:
- **primary language** — `Package.swift`/`*.xcodeproj` → swift; `tsconfig.json`/`package.json` → typescript; else generic.
- **project kind** (Swift) — `*.xcodeproj`/`*.xcworkspace` with app target, or `@main App`/UIKit lifecycle → `app`; `Package.swift` library/executable → `package`; CLI/server as applicable.
- **SwiftUI usage** — any `import SwiftUI` in source.
- **GitHub remote** — `git remote get-url origin` on github.com, `gh` installed. Owner is an org, or several contributors in `git shortlog -sn | head` → a team shares this repo.
- **Apple references** — Swift + SwiftUI only: `xcrun agent skills export --output-dir <temp dir>` succeed and yield `swiftui-*` folders (Xcode 27+). Fail or none → no Apple references, question 10 never asked.
- **Its own build wrapper** — repo-local CLI (`cli/`, `bin/`, `scripts/`), `Makefile` with build target, or strongest signal — project's own `CLAUDE.md`/README saying *"ALWAYS use X to build"*. Read that instruction if exists: project that mandates wrapper mandates it for implementer too.

Then confirm with user:

1. **Discussion language** — which language to talk in? (default: detect from user; fr/en)
2. **Primary language + project kind** — confirm detected language and kind (app / package / cli / server). Kind picks architecture module.
3. **When to review** — _"Review the code at every step (after coding, and after each feedback round), or once when you run `/wa-validate` — your green light saying the feature matches the spec? (recommended: at `/wa-validate` — you iterate fast, and the review reads the final diff instead of code that's still moving)"_ → sets `review.when` (`each_round` | `on_validation`). Say trade plainly: `each_round` catch drift earlier but add verifier round to every note; `on_validation` review whole diff one pass. Either way nothing close unreviewed: `/wa-close` refuse task verifier never saw.
4. **Review toggles** — surface public-doc one explicitly, vary by company: _"Require `///` documentation on every public API? (some teams skip this)"_ → sets `review.public_doc`. Offer flip other toggles too.
5. **Build command** — ask only when detection found wrapper: _"I see `<X>` — should the implementer build with it, or use XcodeBuildMCP / the language default?"_ → sets `build.command` (+ `build.test_command` if test target exists). Nothing detected → leave both empty, don't ask. **Project win over plugin default**: repo that documents own build path documents it for agents too, and implementer torn between two mandates pick one silently.
6. **Commit policy** — _"Once YOU validate a feature, may I commit it myself, or always wait for you to commit?"_ → sets `auto_commit_after_validation`. Remind: commits always use your name, never Claude's. Outside autopilot, nothing committed before you validate.
7. **Branch policy** — `github` backend → skip: `branch.per_task: true` forced (task file lives on task branch), `close.strategy` not asked (task has its draft PR, `/wa-close` marks it ready, you merge). Else: _"Should `/wa-code` work on its own branch per task (`wa/add-apple-login`), or code straight on the current branch?"_ → sets `branch.per_task`. If yes, confirm `branch.prefix` and `branch.base` (`current`, or fixed base like `main`). Mention pairing: with per-task branches **and** auto-commit on, closing task commit it and check out next task branch for you (`branch.checkout_next`, on by default) — offer turn off. `/wa-autopilot` branch per task regardless. Say `branch.sprint_prefix` exist (`sprint/<sprint>`, tasks of sprint fork off it, `/wa-close` merge back) but **don't ask** — default work, sprints may never come up.
   **Then, only when `per_task`: what happen to branch when its task close** — _"When a task is done, should I open a PR onto `main`, merge it locally, or leave the branch alone and let you do the PR? (recommended: leave it alone — you keep control of what gets proposed to the team; switch to `pr` once you trust the flow)"_ → sets `close.strategy` (`nothing` | `pr` | `merge`) + `close.target`. Two things to say: task in **sprint** always merge into its sprint branch first, this setting only decide what happen to sprint branch at end; and `pr` need `gh` authenticated, and **ask every time before opening one**. `close.delete_branch` stay `auto` unless they ask — delete only what already landed elsewhere.
8. **Where tasks live** — ask only when detection found a GitHub remote; none → `files`, don't ask. _"Keep tasks as `.md` files in the repo, or as GitHub issues on a project board the whole team sees? (recommended: <GitHub when a team shares the repo — one backlog for everyone, PRs close their issues / files when you work alone — nothing to wire up>)"_ → sets `tasks.backend` (`files` | `github`). Say what `github` means in four lines: one issue per task on a Project board (column = state, card order = priority, sprints = milestones); task `.md` lives on its branch `wa/<n>-<slug>`, a workflow hook moves cards on push and merge; locks stop two people grilling or coding one task; every round commits + pushes, one draft PR per task. Costs one PAT secret per repo. It creates things other people see → see *GitHub scaffold*, always a plan and a yes first. Ask **before** question 7 — `github` answers it.
9. **Where things live** — _"Keep the backlog, tasks and wiki inside `.whackagent/`, or put some of them somewhere the team already reads — `docs/wiki/`, say? (recommended: `.whackagent/` — one folder, nothing to wire up; move them if teammates who don't run whackagent need to read them)"_ → sets `paths.*`. Ask **once, as one question**; split into per-path answers only if they say "some of them". Two things to say when they move something:
   - shared wiki or backlog want **committed, browsable** folder (`docs/`) — `.whackagent/` read fine for agents, bad for human on GitHub;
   - `paths.reports` = run output, not knowledge — leave local (and gitignore-able) unless asked.
   Absolute paths work too (wiki in sibling repo). `.whackagent/config.md` itself never move — it carry the paths.
10. **Apple references** — ask only when detection found them. _"Your Xcode ships Apple's own SwiftUI guidance for agents (best practices, what's new in this SDK). Copy it into `{conventions}/apple/` so the implementer and the reviewer check APIs against it? (recommended: yes — they open only the page for the topic they touch, so it costs nothing otherwise)"_ → decides whether scaffold copies them. Two things to say: it's **Apple-written content committed in your repo** — on a public repo, their call; and it's a snapshot of this Xcode, `/wa-setup` refreshes it after an update.

Keep short — 7 to 11 questions (build one fire only on detected wrapper; close policy only when `per_task`; task storage only with a GitHub remote; Apple references only when Xcode ships them; `github` → no branch/close questions, question 9 about wiki and tasks folder — backlog doesn't live in files). Rest take template default.

**Only if project kind is `app`:** ask **who tests the app** after green build — _"In autopilot the agent drives the app itself (taps + screenshots) since nobody's watching. When you're at the keyboard, should it do the same, or stop at build + tests and let you test? (recommended: you test — you'll open the app anyway, and driving it costs a few minutes per round)"_ → sets `verify.mode` (`autopilot` | `always` | `off`) + `verify.platform`/`verify.target`. Name third option only if they push back on autopilot driving at all: `off` = nobody drives it, ever. iOS drive through **XcodeBuildMCP** (same server it builds with, nothing extra to install); Android or physical device need **mobile-mcp** server (`mobile-next/mobile-mcp`) configured — say so.

## 2. Scaffold

Create directory and files (do not overwrite existing without asking).

**Everything below land at its `paths.*` value, not at literal path written here** — `{tasks}`, `{wiki}`, `{backlog}`, `{reports}`, `{conventions}` = whatever step 1 question 9 settled on. Create parent folders as needed; path outside `.whackagent/` normal, not mistake. `config.md` one exception: always `.whackagent/config.md`.

- `.whackagent/config.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/config.md`, fill answers above (including `paths:` block), set `review.modules` to modules you actually copy (next bullet).
- `{conventions}/` — copy **only relevant** convention modules there:
  - **Swift** (`${CLAUDE_PLUGIN_ROOT}/conventions/swift/`): always `style.md`, `elegance.md`, `testing.md`, and `architecture-global.md` (platform-agnostic YAGNI/SOLID/DRY/DI — every Swift project). Kind module: `architecture-app.md` if kind is `app`, else `architecture-package.md`. Add `swiftui.md` **only if SwiftUI used** (skip for package/CLI with no SwiftUI — whole point).
  - **Apple references** (question 10 = yes): from the temp export, copy every `swiftui-*` folder into `{conventions}/apple/`, nothing else — other exported skills (App Intents, C bounds safety, security settings…) off-topic for a convention check. Copy `apple.md` next to the other modules: the index that tells agents to open one reference per topic, never the folder. Delete the temp export. **Commit `apple/` with the rest** — autopilot worktrees only see committed files. Never `xcrun agent skills export` straight into `{conventions}/`: it dumps all ten skills.
  - **TypeScript / generic**: copy single `${CLAUDE_PLUGIN_ROOT}/conventions/<lang>.md` and set `review.modules` to it alone.
  - Set `review.modules` in config to exactly what you copied — verifier read that list and nothing else, so module copied but left out of list = rulebook nobody opens.
- **Xcode projects only** (repo has `.xcodeproj`/`.xcworkspace`): create `.xcodebuildmcp/config.yaml` at repo root (not in `.whackagent/`) so XcodeBuildMCP build incrementally instead of full-rebuild every time. Content:
  ```yaml
  schemaVersion: 1
  incrementalBuildsEnabled: true
  ```
  Skip if the file already exists (don't clobber a user's config). This is why an implementer with no `build.command` builds through XcodeBuildMCP — command-line `xcodebuild` ignores this file and rebuilds from scratch. With a `build.command` set, the wrapper owns the build dir instead, and this file is just harmless.
- `{backlog}` — copy `${CLAUDE_PLUGIN_ROOT}/templates/BACKLOG.md`. **`files` only.**
- `{wiki}/index.md` — copy `${CLAUDE_PLUGIN_ROOT}/templates/wiki-index.md`.
- Create empty `{tasks}/` (`files` only — `github` task files appear on task branches) and `{reports}/` directories (`.gitkeep` fine).
- **`github`** → *GitHub scaffold* below instead of backlog and tasks.

### GitHub scaffold — `tasks.backend: github`

Everything here is visible to the team the moment it exists. **One plan block, one yes**, then run it all. Helper = `${CLAUDE_PLUGIN_ROOT}/scripts/github-board` (**wa-board → Task store**), run from repo root.

```
GitHub — LunabeeStudio/french-map

auth      : gh ✅ · scope project ✅
project   : "french-map" created, linked to repo
status    : Draft · Grilling · Todo · Coding · To test · To close · Done · Canceled
size      : field Size — quickwin · medium · large
variables : WA_PROJECT_NUMBER=12 · WA_TASKS_PATH=.whackagent/tasks · WA_BRANCH_PREFIX=wa/ …
hook      : .github/workflows/whackagent-board.yml → PR from wa-setup/board-hooks
secret    : WA_PROJECT_TOKEN — you create a PAT, I store it (never in chat)
config    : tasks.backend: github · tasks.project: LunabeeStudio/12 · branch.per_task: true

ok? [y/n]
```

1. **Auth.** `gh auth status` must show `project` scope. Missing → ask user to run `! gh auth refresh -h github.com -s project` (browser device flow, can't be done for them), wait, re-check. Never continue without it.
2. **Provision.** `github-board provision --title "<repo>"` (new board, owned by repo owner — org or user) or `--project <n>` (adopt one, `--owner` if not repo owner). Adopting **never rewrites columns**: missing state options are added, existing ids kept; a state the team already has under another name → `--state todo="Ready"` maps it. Creates `Size` field if missing, links repo, writes repo variables (`WA_*`) — `--tasks-path {tasks}`, `--branch-prefix <branch.prefix>` so hook and helper agree with config. One board per repo — never repurpose a team board without asking.
3. **Hook — mandatory.** Copy `${CLAUDE_PLUGIN_ROOT}/templates/github-board.yml` to `.github/workflows/whackagent-board.yml` on branch `wa-setup/board-hooks` (from default branch), commit (configured author, never Claude), push, `gh pr create`. **Never push default branch directly.** Custom `branch.prefix` → edit `branches:` filter to match. Cards move only once that PR merges — say so; sprint branches forked before it don't carry it.
4. **Secret.** Hook writes to the Project, `GITHUB_TOKEN` can't. User creates classic PAT: `https://github.com/settings/tokens/new?scopes=project,repo&description=whackagent-board`, copies it, runs `! pbpaste | gh secret set WA_PROJECT_TOKEN -R <owner>/<repo>` — clipboard, **token never pasted in chat**. Re-run `provision --project <n>`: `secret_WA_PROJECT_TOKEN: true` confirms. Missing → hook fails every run, say so, don't mark setup done.
5. **Config.** `tasks.backend: github`, `tasks.project: <owner>/<number>`, `branch.per_task: true`. No `{backlog}`.
6. Existing `.md` tasks → *Import to GitHub* below, same plan block.
7. **Offer** (ask, recommend yes): smoke test — `create` → `claim <n> grilling` → `release <n> grilling --reset-to draft` → `cancel <n> --reason "smoke test"`. Proves auth, board and locks before a real task hits them.

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

5. **Legacy tasks.** `files` backend with tasks still on the old lifecycle — states `in-progress` / `review` / `validated`, a `grilled:` field, French section headings, kebab-case sprints → *Lifecycle migration* below. `github` backend with task content in issue bodies or `size:*` labels → *GitHub layout migration* below. Offer it first: every other skill refuses legacy tasks until it's done.
6. **Apple references.** Re-export to a temp dir, compare with `{conventions}/apple/`: `diff -rq --exclude=SKILL.md` over the `swiftui-*` folders. **Ignore `SKILL.md`** — Xcode writes its frontmatter keys in random order, every export differs there. Absent but available → 🆕 row, and question 10 gets asked like a new key (never asked before). References differ, or a `swiftui-*` folder appeared/vanished (new SDK) → ⚠️ row, refresh behind a yes. Same → no row. No Xcode 27 on this machine → leave what's there, no row.
7. **`github` wiring.** Hook installed on default branch (`.github/workflows/whackagent-board.yml`)? Its `template version:` header vs `${CLAUDE_PLUGIN_ROOT}/templates/github-board.yml` — older → offer update PR (same branch + PR path as *GitHub scaffold* step 3). Secret `WA_PROJECT_TOKEN` present (`gh secret list`)? Repo variables match config (`github-board config --refresh`: tasks path, branch prefix)? Status options cover every state? Any gap → row in table, fix behind a yes.

### 2. Show the state, then ask what changes

One table — current value, and a flag on anything worth attention:

```
| Setting      | Current               | |
|--------------|-----------------------|-|
| tasks.backend| files                 | 🆕 github possible — remote LunabeeStudio/french-map |
| board hook   | v1 (plugin v2)        | ⚠️ update PR available |
| PAT secret   | missing               | ⚠️ cards won't move — set WA_PROJECT_TOKEN |
| review.when  | on_validation         | |
| paths.wiki   | .whackagent/wiki      | 🆕 movable (docs/wiki) to share with team |
| verify.mode  | autopilot             | |
| build.command| (empty)               | ⚠️ `make build` detected since |
| Apple refs   | present               | ⚠️ installed Xcode ships newer pages — refresh available |
```

Then **one question: what do you want to change?** Re-ask a full question (step 1's wording) only for what they name, plus every new key from stock-taking step 3 — those they've never been asked. Current value is the default in every one; "leave it" is always a valid answer. Don't walk every question at somebody who came to flip one toggle.

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

**`{conventions}/apple/` is the one exception: replace it whole on refresh.** Nobody edits it — it's Apple's text, and a stale page teaches an API that changed. Delete the `swiftui-*` folders, copy the fresh ones (delete first — Xcode exports files read-only, copying over them fails), and skip the refresh entirely when only `SKILL.md` frontmatter order differs (pure diff noise). `apple.md` itself is a normal module: additive rule above — but **never copied without its `apple/` folder**. Plugin ships the index, Xcode ships the pages; index alone points agents at nothing.

**Never re-scaffold what exists.** Backlog, task files, reports and wiki pages are content — this command doesn't touch their contents — except *Lifecycle migration*, *GitHub layout migration* and *Import to GitHub*, each behind its own plan and yes. Missing entirely (a `{tasks}` folder someone deleted) → recreate the empty folder, mention it.

**Don't re-run the wiki seeding or the compression pass** over pages that already exist. Compression is for pages written this run; there are none.

### Lifecycle migration — old tasks onto the current lifecycle

One plan, one yes, then rewrite every task file and `{backlog}`:

```
Migration — 12 tasks

states    : in-progress → coding (1) · review → to-test (2) · validated → to-close (1)
            todo + grilled: false → draft (3) · todo + grilled: true → todo (5)
headings  : French → English in 9 files (## Critères d'acceptation → ## Acceptance criteria…)
sprints   : login-refacto → Login refacto · perf-hangs → Perf hangs
titles    : "Login Apple" → "Add Apple login" · "Tests turn red at random" → "Fix flaky CLI tests"
backlog   : sections Draft · Todo · Coding · To test · To close · Done · Canceled

ok? [y/n]
```

- **States**: `in-progress` → `coding`, `review` → `to-test`, `validated` → `to-close`, `todo` + `grilled: false` → `draft`, `todo` + `grilled: true` → `todo`. Drop the `grilled:` field everywhere.
- **Headings**: `## Contexte / Décisions` → `## Context / Decisions`, `## Critères d'acceptation` → `## Acceptance criteria`, `## Implémentation` → `## Implementation`, `## Vérification` → `## Verification`.
- **Sprints**: kebab label → human title (**wa-board → Sprint names**). Sprint branches keep their name — kebab of the new title is the same string.
- **Titles** breaking **wa-board → Titles and summaries** (no verb, narrative, metaphor) → proposed rewrite in the plan. Slugs and file names never move.
- **Backlog**: sections renamed and reordered, lines keep their order inside each state.
- Dirty tree → say so first. `git mv` never needed: file names don't change.

### GitHub layout migration — pre-0.13 `github` projects

Task content in issue body, size as `size:*` label, no hook (**wa-board → Task store → Legacy**). Board becomes mirror, task file becomes truth. One plan, one yes:

```
GitHub migration — LunabeeStudio/french-map · 7 open issues

status    : + Grilling option · old columns kept, cards stay put
size      : size:* labels → Size field (5), labels removed from issues
files     : #210 #212 #214 #215 → wa/<n>-<slug> + {tasks}/<n>-<slug>.md, pushed
bodies    : those 4 → summary + link to task file
drafts    : #216 #217 #218 stay issue-only, body = note
hook      : PR wa-setup/board-hooks · secret WA_PROJECT_TOKEN ✅
branches  : wa/212-add-apple-login exists → task file committed on it

ok? [y/n]
```

1. **Hook + secret first** — *GitHub scaffold* steps 2–4 if missing (`provision --project <n>` adds `Grilling`, `Size`, variables, keeps every existing option id).
2. **Size.** Each open issue with `size:<x>` label → `github-board set-field <n> size <x>`, then `gh issue edit <n> --remove-label size:<x>`. Label definitions left in repo — say so, user deletes if wanted.
3. **Grilled issues** (column `Todo` or later, body holds `## Acceptance criteria`), in board order:
   - Branch: existing `<branch.prefix><n>-*` → reuse it; else `gh issue develop <n> --name <branch.prefix><n>-<slug> --base <base>` (sprint branch when milestone set, else `branch.base`).
   - Task file `{tasks}/<n>-<slug>.md` on it: frontmatter `issue: <n>`, `status:` = current column (per **wa-board → States**) — `Coding` (no lock in old layout, hook never reads `coding`) → `to-test` when `## Implementation` filled, else `todo`, card moved to match, `wiki:` / `note:` from body header lines, `created:` = issue `createdAt`. Body sections copied as-is. Title, summary, size, sprint never in file.
   - Commit (configured author, never Claude), push. Hook (once live) places card from `status:` — until hook PR merges, card stays where it is, fine.
   - Issue body → `<summary>` + blank line + link to task file on branch (`https://github.com/<owner>/<repo>/blob/<branch>/{tasks}/<n>-<slug>.md`). Re-read body right before, `gh issue edit <n> --body-file`.
4. **Draft issues** (not grilled) → untouched: body = idea note, `/wa-task <n>` grills them later.
5. **Any step fails → stop**, report what landed per issue. Never rewrite an issue body before its task file is pushed — body is the only copy until then.
6. Dirty tree → say so first; migration switches branches. Return to starting branch at end.

### Import to GitHub — `files` → `github` on a project with tasks

Run *Lifecycle migration* first if needed, then extend the *GitHub scaffold* plan block:

```
milestones: Login refacto, Perf hangs
issues    : 9 open tasks → #210…#218, backlog order kept
branches  : 6 grilled tasks → wa/<n>-<slug> with task file, pushed
drafts    : 3 → issue only, body = note
archive   : 23 done/canceled tasks stay in {tasks}, never imported
removed   : 9 imported .md + BACKLOG.md from base branch (git history keeps them)
```

1. **Open tasks only** — `draft` to `to-close`. `done` / `canceled` stay as `.md`: an archive, not a backlog. Hundreds of created-then-closed issues = notification storm for nothing.
2. **In backlog order**, `github-board create --title … --summary … --size … [--sprint …]` (drafts: `--note <Context / note>`), then `github-board move <n> --bottom` to keep order. `blocked_by:` slugs → `github-board depend <n> --on <numbers>` once every issue exists.
3. **Grilled tasks** (`todo` and later): branch via `gh issue develop <n> --name <branch.prefix><n>-<slug> --base <base>`; existing local branch `wa/<slug>` → its commits rebased onto new branch, old one deleted locally (a pushed old branch keeps its remote name — say so). Task file moved to `{tasks}/<n>-<slug>.md` on it: `issue: <n>` added; `title`, `summary`, `size`, `sprint`, `blocked_by` removed (they live on the issue now). Commit, push — hook places card from `status:`.
4. **Remove** the imported files and `{backlog}` from base branch **after** every issue and branch exists. Any creation failed → stop, remove nothing, report what landed: half an import with the source deleted is lost work.
5. `github` → `files` is not supported. Asked → say so, recommend staying.

### 4. Report

What changed, one line each: config keys (before → after), files moved, modules added. Nothing changed → say that plainly rather than inventing a diff.

## Next step

End by suggesting: **`/wa-board`** to see backlog and pick first task, or `/wa-task <description>` to create one. Reconfigure run → **`/wa-board`** to check the backlog still reads right, above all after a path move.