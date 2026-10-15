---
name: wa-board
description: Renders a dashboard and suggests the next action based on the project's whackagent backlog.
model: haiku
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

## Do

0. **Read arg.** None → whole backlog. Sprint name (`/wa-board login-refacto`) or milestone title (`/wa-board 0.3.0`) → **filtered view**: only its tasks, plus its progress line. Resolve per **Sprints** / **Milestones** below; unknown name → say so, list known sprints and milestones, stop.
1. Read `.whackagent/config.md` (respect discussion language). Missing → tell user run `/wa-setup`, stop.
2. Read `{backlog}` + referenced task files (need each task `summary`, `size`, `grilled`, `sprint`, `milestone`) + provider `milestones` verb. **GitHub provider** → `wa-backlog list` (+ `--sprint` / `--milestone` when filtered), `wa-backlog milestones` and `wa-backlog claims` instead; see *GitHub board* below.
3. Render backlog as **list**, one section per status (see Display format below), priority order within each.
4. Suggest exactly **one** next action, by state (filtered run → scope suggestion to sprint or milestone):
   - something in `validated` → reviewed, wait user retest: `/wa-close <slug>` to finish (or `/wa-feedback` if retest found something). Highest precedence — one step from done.
   - something in `review` → coded, wait user test: `/wa-feedback <slug> <notes>` if notes, else `/wa-validate <slug>` to fire verifier. Beats starting new work.
   - something `in-progress` → resume it (`/wa-code <slug>`)
   - top `todo` not grilled → `/wa-grill <slug>` to clarify (note: quick wins skip straight to `/wa-code`)
   - top `todo` grilled → `/wa-code <slug>`. Backlog order maintained by `/wa-task` prioritization pass — never suggest reprioritizing as step (if user *asks* to reorder, that `/wa-task` with no arg).
   - nothing in todo → `/wa-task <description>` to create one
   - batch of small grilled tasks → mention `/wa-autopilot` as option

## GitHub board

Same list format, sections by contract state, render order: **📥 Todo → 🔥 Grilling → 📐 Grilled → 🔨 Coding → 👀 Review → 🎉 Done → 🚫 Canceled** (heading = emoji + name). Canceled = issue closed as not planned (`not_planned: true` in `list --all`, whatever its column) — never under Done. Line 1 = `<#> · <size> **<title>** · #<n>`, plus sprint tag, plus `🔒 <agent>` when claimed (agent = worktree basename, short), `👤 @<login>` when `reserved` (assigned to another account). `⚠` = `todo` (not grilled). Extra blocks under legend when present:

- `⏳ stale claims` — `claims` rows with `stale: true`: `#12 coding · <agent> · 2d, no push` → suggest `/wa-task release 12`.
- `📝 drafts` — Project draft items: not tickets, convert to issue on GitHub.

**Review section splits draft vs ready** — `gh pr list --json number,headRefName,isDraft`: draft → `🧪 draft #<pr>` (your test), ready → `🔀 ready #<pr>` (your test, then merge — GitHub or `/wa-close`).

Next action (GitHub, table **providers/CONTRACT.md** → *Who's on turn*; `list` rows in `review` carry `phase`), first match wins: `review` + ready → test, then merge on GitHub or `/wa-close <#>` (merges on your yes) · `review` + draft → `/wa-feedback <#> <notes>` or `/wa-validate <#>` (marks it ready) · unclaimed `grilled` on top → `/wa-code <#>` · else top `todo` → `/wa-grill <#>` · several unclaimed `grilled` → mention `/wa-autopilot` as option. Never suggest ticket someone else holds — claimed by other agent, or `reserved`.

## Display format

Canonical way tasks shown anywhere in flow (here, `/wa-task` prioritization pass, `/wa-autopilot` recap). **List, never table.** One section per non-empty status, tasks priority order, two lines per task:

```
### 📥 Todo

1 · 🟢 **Login Apple** · `login-refacto`
    Sign in with Apple on login screen
2 · 🟡 **Login layout** · `login-refacto`
    Login form redesign
3 · 🔴 **Sync offline** ⚠
    Offline queue + conflicts

### 🔨 In progress

4 · 🟡 **Export CSV**
    Export reports as CSV

🟢 quick win · 🟡 medium · 🔴 large · ⚠ not grilled
🏁 login-refacto — 0/2 (2 todo)
🎯 0.3.0 — 0/3 (3 todo) ← new tasks
🎯 0.2.0 — 0/1 (1 in progress)
```

Rules:

- **Section heading** = state emoji + name: 📥 Todo · 🔨 In progress · 👀 Review · 👍 Validated · 🎉 Done · 🚫 Canceled. Same emoji wherever state named (pane, recaps).
- **Line 1** = `<#> · <size> **<title>**`, then `` · `<sprint>` `` when task has one, then ` ⚠` when `grilled: false`.
- **Line 2** = task `summary`, indented 4 spaces. Never dump task body.
- **#** = display index, written `2 ·` — never `2.`: markdown list syntax gets renumbered by renderer. Number **continuously across sections**, top to bottom in render order (Todo → In progress → Review → Validated → Done → Canceled — lifecycle order). **Review** = coded, wait your test. **Validated** = you said it match spec, verifier passed, wait your retest to close. Never restart per section — index must be unique in render so user cite it without ambiguity.
- **Size** maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **⚠** only on non-grilled tasks. Grilled = nothing — no ✅ on every line.
- **Sprint tag** only on tasks that have one. Filtered run (`/wa-board <sprint>`) drops it — every task is that sprint.
- Skip empty sections. Show only few recent under **Done**.
- Legend once below list; `⚠ not grilled` only when a ⚠ is on screen.
- At least one sprint in play → one **progress line per sprint** under legend, done+canceled excluded from numerator only:
  `🏁 login-refacto — 2/5 (1 in review, 2 todo)`. Filtered run → that single line, above list.
- One **milestone line** per milestone from `milestones` holding live tasks, highest first, same counting, below sprint lines. Highest open one marked `← new tasks`:
  `🎯 0.3.0 — 0/3 (3 todo) ← new tasks`. No tag on task lines — milestone is scope, not identity. Filtered run → that single line, above list.
- **Track milestone** (key of `branch.tracks`, **Tracks** below) → same line, never `← new tasks`, plus drift when trunk lags base: `🎯 server — 2/6 (2 in review, 4 todo) · 30 behind develop` (`git rev-list --count <track branch>..<branch.base>`, fetched). Drift > 0 → mention sync as option (**Tracks**, *Sync*), never as the one next action.

## Voice

Canonical, every whackagent skill. Applies to **screen output and `{reports}`**.

- **Telegraphic.** Fragments OK. No articles filler, no pleasantries, no hedging, no re-explaining the flow. One idea per line.
- **Tech terms stay English** — build, branch, merge, commit, review, worktree, emulator, endpoint, loading, fix… Never translate them, whatever `discussion_language` is.
- **Short common words.** `fix` not `apply a correction`, `test it` not `proceed to testing`.
- **Clarity beats brevity.** Fragment readable two ways → write the full sentence.
- **Task files are the exception** — `## Context / Decisions`, `## Acceptance criteria` in full simple sentences: verifier and user reread them months later, fragments there get misread.
- Screen headings and labels follow `discussion_language`. Task file section headings stay English always — skills look them up by name.

### Next line

Run ending on suggested command → **last line** starts with `→`: `→ next:` (label per `discussion_language`, arrow always) + recommended command **in backticks, complete**: real slug or `#`, never `<slug>` (`` → next: test it, then `/wa-validate 216` ``). Recommended command = **first** backticked one on line; alternatives after, backticked too (`` (or `/wa-feedback 216 <notes>`) ``). Text only user can write stays `<placeholder>`, at end. Backlog pane offers that first command as prompt suggestion (Tab takes it) — order and backticks matter.

### Titles and summaries

Title = **label**, not sentence. Names the thing + what is done to it. ≤ 5 words. Must read like a dev wrote it in a ticket.

- **Never a narrative sentence.** Subject-verb-object that tells a story = failed title. `The dashboard asks the questions instead of the commands` → `Prompts in dashboard`.
- **Never a metaphor or image.** `Tests turn red at random` means nothing to anyone → `Fix flaky CLI tests`.
- **Tech terms stay tech terms**, here too — flaky, job, watermark, toggle, prompt, scope, seed, dashboard, child process. Paraphrasing or translating them produces gibberish.
- **No elegant rewording.** User says `rework UI` → write `Rework UI`, not `A shared style for the screens`.

Summary = **the goal, plainly**, ≤ 8 words. What it gives once done. Not the mechanism, not the story, not the list of what disappears.

| ❌ | ✅ title | ✅ summary |
|---|---|---|
| After a purge, jobs don't replay | `Replay jobs after purge` | purge doesn't reset watermarks |
| Import the whole country, or just a region | `Configurable import scope` | DATA_SCOPE: region locally, country in prod |
| CLI tests turn red at random | `Fix flaky CLI tests` | 4 TUI tests fail in suite, pass isolated |
| A shared style for the CLI screens | `Rework CLI screens UI` | shared design system in tui/design/ |
| The dashboard asks the questions instead of the commands | `Prompts in dashboard` | commands take options, dashboard asks |
| Dashboard navigation follows the command tree | `Dashboard nav by group` | one tab = one group, no more MENU_* |
| The Data screen reads the backend job list | `Data screen reads GET /admin/jobs` | no more job catalog duplicated in CLI |

## Backlog provider

Canonical, every skill. `backlog.provider` in config (missing → `local`) decides where tickets live. Contract: `${CLAUDE_PLUGIN_ROOT}/providers/CONTRACT.md` — skills speak its verbs and six states, never tracker terms.

- **`local`** — `{backlog}` + task file frontmatter, as every skill describes by default. Mapping: `providers/local.md`.
- **`github`** — `${CLAUDE_PLUGIN_ROOT}/providers/github/wa-backlog <verb>` for **every** backlog read or write, run from repo root. Details: `providers/github/README.md`. **Board rules = project's `BOARD.md`** (source `${CLAUDE_PLUGIN_ROOT}/templates/BOARD.md` while project has none): read once per run, it wins — other devs' agents follow same file, whatever their loop. Bullets below = whackagent's way of meeting it, plus whackagent-only parts (task file, `phase:`, PR body block, screenshots, worktrees). Then:
  - **No `{backlog}` file, no local mirror.** Board = the Project. Never write order, state, size, sprint, title into any file.
  - **Ticket id = issue number.** Display `#12`. Task file `{tasks}/<n>-<slug>.md` lives **on ticket branch** `<branch.prefix><n>-<slug>`, not on base — frontmatter `issue: <n>`, `phase:`, `wiki:`, `note:`, `created:`. No `title`/`summary`/`status`/`size`/`sprint`/`grilled` there.
  - **States = contract states** (`todo`, `grilling`, `grilled`, `coding`, `review`, `done`). Agent writes only through `claim` / `release`. `grilled`, `review`, `done` come from hooks — never set them, never "help" a lagging hook. Hook late → wait/re-read, or tell user.
  - **Claim, reservation** — **BOARD.md → Working a ticket**: claim before touching; exit 3 → name owner (`@<login>` when `assigned: true`), never retry or steal, pick next or stop; exit 4 → say state, stop. **Unclaimed**, in every skill, = no claim **and** not `reserved`. Never unassign anyone; `release` gives back only assignment its claim made.
  - **Spec in issue body** (another agent or human grilled it, **BOARD.md → Working a ticket**, *3a*) → ticket `grilled`, no branch, no task file. First whackagent round: branch via `gh issue develop <n> --name <branch.prefix><n>-<slug> --base <fork point>` (worktree per **Worktrees**), first commit = task file built from issue body (`## Context / Decisions`, `## Acceptance criteria` copied, source line `spec: issue #<n> body`, frontmatter per GitHub shape), message `task: spec #<n> <slug>` — ticket range start.
  - **Coding sub-phase** (`in-progress` → `review` → `validated`) = task file `phase:` on ticket branch, where local writes `status:`. `phase: review` ≠ board `review`: first = coded, verifier not run; second = PR open, humans on turn. `list` / `get` read it back (`phase`). Who acts per combination: **providers/CONTRACT.md** → *Who's on turn*.
  - **Agent round — `coding` is transient.** Board `coding` = an agent works *now*, never "waiting for user". Every round that touches ticket branch (`/wa-code`, `/wa-autopilot`, `/wa-feedback`, `/wa-validate`, `/wa-close`): `claim <n> coding` (from `grilled` or `review`) → work → commit (task file `phase:` + notes included) → **push**. First delivery opens **draft PR**; later rounds push to it. Hook sees `opened`/`synchronize`, sets `review`, drops claim. **Then check `gh pr view <pr> --json mergeable`** (retry while `UNKNOWN`): `CONFLICTING` = GitHub runs no `pull_request` workflow, push moved nothing, ticket stuck in `coding` → rebase ticket range onto PR base (`git rebase --onto origin/<base> $start^`), mechanical conflicts yourself (logic → stop and ask), rebuild + tests, `push --force-with-lease`, check again. Ticket PR has PRs above it in GitHub stack → cascade them before round ends (*Stacked PRs*). Round ends with nothing to push → `release <n> coding --reset-to review` (PR open) or `--reset-to grilled` (no PR). Exit 3 on claim → someone mid-round: say who, stop.
  - **Draft PR** — `gh pr create --draft --base <fork point> --head <branch>`, title, body, labels, assignees per **wa-board → Pull requests**; status line `Draft — verifier not run yet. Test, then /wa-feedback · /wa-validate.` Base = branch ticket forked from (sprint branch, else `close.target`; track task: its trunk, **Tracks**). Body carries `Closes #<n>` — hook adds **Development** link from it (or from branch name), any base: never link by hand, never set PR milestone (ticket carries it). `wa-backlog link-pr <n> <pr>` = repair only. Stacked ticket → **`wa-backlog stack`** next (*Stacked PRs*). Draft already open → push + **refresh body**. Draft = human tests; ready (`/wa-validate` clean → `gh pr ready`) = human merges — on GitHub, or `/wa-close` on their yes. Both `review`.
  - **PR body refresh** — every round that pushes to open PR (`/wa-feedback`, `/wa-validate`, `/wa-close` rebase, later `/wa-code` / `/wa-autopilot` rounds) **refreshes body** from task file after push (`gh pr edit <pr> --body-file <file>`) per **wa-board → Pull requests**, *Refresh*. Status line for PR state: draft `Draft — <what still owed>. Test, then /wa-feedback · /wa-validate.`; ready: validated line.
  - **Stacked PRs** — **BOARD.md → Dependencies**. Only on **related** blocker: shares ticket's sprint, or its track (milestone in `branch.tracks`). Unrelated blocker → never stack: ticket on its own base, own PR, body `Blocked by #<x>: merge order is yours.` `stack` checks it (exit 4). **GitHub stack**, not just chained bases: draft PR base = blocker's branch, then **`wa-backlog stack <pr> --on <blocker pr>`** → creates stack or puts PR on top of blocker's (stack map in merge box, merge order enforced, rules + CI from stack base). Stacks linear: blocker not top (sibling already on it) or PR in another stack → exit 4, PR stays chained on blocker branch, say so. `wa-backlog stack <pr>` reads stack: base + PRs bottom → top, `ticket` each.
    - **Merge one at a time, bottom first.** `gh pr merge` refuses any stacked PR → **`wa-backlog merge <pr>`** (async merge API; any ticket PR, stacked or not). Open PRs below → exit 4: they merge first. GitHub merge box can land a PR with every one below at once — human's call, never agent's. After a merge GitHub retargets PRs above to stack base and rebases them itself.
    - **Keep stack linear.** GitHub refuses stack whose branch doesn't descend from PR below — even when `mergeable` says `MERGEABLE`. Round pushing branch with PRs above it in stack → **cascade**, upward: each upper ticket `claim <m> coding` (exit 3 → skip, name `#<m> needs rebase on #<n>`), `git rebase --onto origin/<branch below> $start^` (its ticket range), mechanical conflicts yourself (logic → stop and ask), build + tests, `push --force-with-lease` — hook sets `review`, drops claim. Attended run: cascade named in plan block, confirmed.
    - **Stale local copy.** Lower PR landed → GitHub force-pushed branches above. Round on stacked ticket starts from `origin/<branch>` (fetch first; local holds nothing unpushed — every round ends with push).
    - **Chained, not stacked** (exit 4 above, or PR from before stacks): retarget only on merge-time branch delete — `delete_branch_on_merge` (set by `provision`). Branch deleted later by hand or API (`push --delete`, `gh api -X DELETE …/git/refs/heads/…`) **closes** every PR based on it → first `gh pr edit <pr> --base <new base>` each (rebase its ticket range there, check `mergeable`), only then delete.
  - **Screenshots** — PR whose diff changes UI (screen, component, theme, image resource) → **`wa-backlog screenshots <pr> <files>`** with implementer's `SCREENSHOTS:` (final state of code pushed, one per platform proved, light/dark when theme involved). Upload = `gh image` (extension `drogers0/gh-image`, GitHub user-attachments) — **never push images to any branch**; PR body gets `## Screenshots` table. Extension missing → say so, no screenshots, never a branch fallback. `gh image` fails (no upload token — org repo, SAML SSO) and browser automation available (e.g. claude-in-chrome) → **browser fallback**: open PR in new tab, `file_upload` images into "Add a comment" file input, read `https://github.com/user-attachments/assets/…` links from `textarea#new_comment_field` (not hidden description editor), clear that textarea — **never post comment** — close tab, then `wa-backlog screenshots <pr> <caption>=<url> …` (same captions as file stems) so verb still writes section. No browser → say so, no screenshots. Later round with UI change → same verb, same names, section replaced. No UI in diff → none. No screenshot possible (device down) → say so in body, never old ones passed as current.
  - **Hooks version gate** — every round that pushes code, at its start, before claim: `git show origin/<base>:.github/workflows/whackagent-board.yml` → first line `template version: <v>`. `v ≥ 16` with `uses:` line → rules above. Older (v14–15 run frozen `hooks-v1`: no Development link off default branch), no `uses:` line (full copy) or file missing → say `hooks v<v> on <base> — /wa-setup backlog to upgrade`, stop, nothing claimed.
  - **Forced config:** `branch.per_task: true`; `branch.base` = named branch equal to `close.target` — one fork point, BOARD.md `<base>`. Config says otherwise → provider wins, say so once. `close.strategy` ignored for tickets: `/wa-validate` marks PR ready, `/wa-close` merges it on yes.
  - **Sprint** — **BOARD.md → Sprints** (parent issue `wa-sprint`, tickets = sub-issues, sprint branch). `set-field <n> sprint <name>` creates parent on first use, reopens a closed one of same name; `""` detaches. Parent `get`/`claim` → exit 4. Ticket under non-sprint parent → exit 4: say so, never detach human's hierarchy. Hooks close parent when sprint lands (sprint branch PR merged; no sprint branch → last sub-issue landed). Progress from `list --sprint`. Split ticket → `split <n>` makes it root of own sprint, children its sub-issues (**wa-grill → GitHub provider**).
  - **Milestone = GitHub milestone** — highest = version order of titles (`providers/CONTRACT.md` → *Milestones*). Humans create them on GitHub. Rules: **Milestones**.
  - `list` lags new tickets 1–3 min (GitHub indexing); `get`/`claim` always current.
  - **Squash merge** — **BOARD.md → Merge style**: base never contains ticket's original commits, so `git merge-base` and plain rebase lie once any parent or stacked ticket landed. **Ticket range** = ticket's own commits, from its first task commit on (grill, or spec copied from issue body): `start=$(git log --format=%H -E --grep="^task: (grill|spec) #<n> " <branch> | tail -1)`, range `$start^..<branch>`. Diff = `git diff $start^ <branch>`; rebase = `git rebase --onto <base> $start^`. Works squash or not — use it always, never `<base>..HEAD` / `<base>...HEAD`.

## Pull requests

Canonical, every PR whackagent open or refresh: ticket draft (`/wa-code`, `/wa-autopilot`), ticket marked ready (`/wa-validate`, `/wa-autopilot`), `/wa-close` PR (local `close.strategy: pr` — task onto sprint branch or target, existing draft marked ready —, sprint PR), body refresh (`/wa-feedback`, `/wa-validate`, `/wa-close`). Release PR not: release doc own it. Settings = `pr:` block in config. **Key missing → old behavior**: no template, title `{title}`, assignee `@me`, no labels, reviewers or doc. Defaults below = what `/wa-setup` writes.

- **Project rules first** — `pr.doc` set (`path` or `path#Heading`) → read once per run, follow it: changelog line, size limit, base naming. Rules win over defaults below, never over flow rules (draft until verifier clean, merge only on user's yes). Rule needing judgment nobody proved → do it, name it in report.
- **Title** — `pr.title`, default `{title}`. Placeholders: `{title}` task/ticket title (sprint PR: sprint name), `{n}` issue number (GitHub only), `{slug}`.
- **Template** — `pr.template`: `auto` → first found of `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `docs/pull_request_template.md`, root `pull_request_template.md`; folder `.github/PULL_REQUEST_TEMPLATE/` with several → pick one matching change (feature, bugfix…), say which. `<path>` → that file. `none` / nothing found → no template.
  - **Fill, don't replace.** Keep its headings and order, fill each section from task file (`## Context / Decisions` → description, *Test steps* below → testing, …). Nothing to say → `n/a`, never drop heading. Template HTML comments = guidance for you: follow, then remove.
  - **Template checkboxes** — tick only what a round proved (build, tests, tools, runtime check) or diff shows (changelog line added). Rest `- [ ]` + one-line reason. Never tick to look complete.
- **whackagent block** — always, after template content (whole body when no template), between `<!-- whackagent -->` and `<!-- /whackagent -->`: summary reflecting **current** `## Context / Decisions`, `Closes #<n>` (GitHub), **current** `## Acceptance criteria` checklist (`- [x]` only for criteria some round proved in `## Verification`, `- [ ]` + one-line reason otherwise), *Test steps* (below), status line for PR state. **Template carries board sections** (`<!-- board-contract` marker, **BOARD.md → Pull requests**) → those three go there instead (`## Ticket` = `Closes #<n>`, `## Acceptance criteria` = checklist, `## Status` = status line), block keeps summary + test steps — never twice. Non-ticket PR (sprint, sync, track landing, release) → `## Ticket` = `Sprint #<parent>` (sprint PR) or `n/a`, never `Closes`. `## Screenshots` sits after block, owned by `wa-backlog screenshots`.
- **Test steps** — every task/ticket PR (not sprint, sync, track, release) carries `### How to test`: numbered steps reviewer follows cold, no chat, no task file. **Template has testing section** (`Testing`, `How to test`, `QA`…) → steps go there, not in block — never twice.
  1. **Setup** — run command, prerequisites not obvious (account, flag, seed data, env var, device/OS).
  2. **Path** — launch to feature, real names read from code (navigation graph, routes, menu entries, UI labels as shown): `Home → Settings → Account`, URL, `POST /login` + payload, CLI command.
  3. **Actions** — one action per step, `→ expected result`. Cover every criterion of report card **To test** plus regression zones; edge cases (cancel, empty, error, offline) criteria name. Step proved at runtime → `✅ verified by agent`.
  - Entry point unknown from code → `entry point unknown: <what's missing>`, never invented path. Refresh rewrites steps when round changed behavior or path.
- **Run report** (GitHub provider) — `{reports}/<slug>.md` exists (main checkout) → its current content after whackagent block, as `<!-- wa-report -->` + `<details><summary>📋 Run report</summary>` … `</details>` + `<!-- /wa-report -->`. No report → no section. Report never committed: body = only way it reach GitHub; hook posts section on ticket when PR merges.
- **Refresh** — read body first. Rewrite whackagent block whole. Template sections: edit only where round changed what they say (behavior, how to test), minimal; text human added stays. Screenshots section carried verbatim. Run report rewritten whole from file. Body without block (PR opened before this rule) → rebuild once: template filled + block. Body describing superseded behavior = lying PR: reviewer merges on it.
- **Labels** — creation only (`--label`). **Every PR gets ≥1 label picked from repo's own** (`gh label list --json name,description --limit 200`), on top of `pr.labels`: best fit for change — kind (bug / fix, feature / enhancement, docs, refactor, chore…) by name + description, then area/module label when repo has them. Never whackagent's own issue labels (`wa-sprint`, `wa-ignore`). Several fit → kind first, at most 3 picked. Nothing fits well → closest general one (`enhancement`, `feature`…), never none. Name picks in report. `pr.labels` entry absent from repo → skip it, say so. **Never create labels** (repo owner's call): repo has no label at all → open without, say so.
- **Assignees** — **`@me` always** (PR self-assigned, whatever config), plus `pr.assignees` at creation. Repairs PR missing it on any refresh: `gh pr edit <pr> --add-assignee @me`.
- **Reviewers** — `pr.reviewers` (users, `org/team`) requested when PR goes ready (`gh pr ready`, then `gh pr edit --add-reviewer`), never on draft: draft = your test, nobody else pinged. PR opened ready (local `close.strategy: pr`, autopilot validated) → at creation. Empty → none requested; CODEOWNERS still apply.

## Paths

Every whackagent skill writes `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` `{worktrees}` instead of literal folder. They resolve from `paths:` in `.whackagent/config.md`, read at step 1 — project may keep wiki in `docs/wiki/` so team that doesn't run whackagent still read it.

- **Key missing → the default** (`.whackagent/BACKLOG.md`, `.whackagent/tasks`, `.whackagent/wiki`, `.whackagent/reports`, `.whackagent/conventions`, `../<repo>-worktrees`). Config written before `paths:` existed keep working untouched.
- **Relative resolves from repo root**, not cwd. Absolute paths resolve, but never user-specific ones (`/Users/<name>`, `/home/<name>`, `~`) — config versioned, shared.
- **`.whackagent/config.md` is the one fixed path** — it carry the others.
- Path points at nothing → say which key and what it points at, suggest `/wa-setup`. Never fall back to `.whackagent/` behind user back, never create folder somewhere else: wiki silently written to default is wiki team never sees.

## Worktrees

`branch.worktree: true` (with `branch.per_task`, forced under GitHub) → each task codes in **own git worktree**, never in main checkout. Main checkout never switch branch: several tasks open side by side, each own build dir. Canonical, every skill.

- **Where** = `{worktrees}/<branch minus branch.prefix>` (`../<repo>-worktrees/login-apple`, GitHub `../<repo>-worktrees/12-login-apple`). `{worktrees}` resolves from **main checkout root** (parent of `git rev-parse --path-format=absolute --git-common-dir`), never from a worktree; `<repo>` = that root's folder name — one folder per repo, slugs of sibling repos never collide. **Must land outside main checkout and every other worktree** — inside → refuse, suggest `/wa-setup branch`: nested checkout gets indexed, grepped, globbed by builds. `/wa-autopilot` uses same folder.
- **Create** — `git worktree list` shows one for branch → reuse. `mkdir -p {worktrees}` first. Branch exists → `git worktree add <path> <branch>`. Absent → `git worktree add <path> -b <branch> <fork point>`. Sprint branch absent → `git branch <sprint> <trunk>` (`branch.base`, or track branch — **Tracks**), ref only, no checkout. Fetch first when branch tracks remote.
- **Dirty main checkout doesn't block** — nothing checked out there. Dirty worktree = task work in flight: never stash, reset or remove it.
- **What lives where** — worktree: code, wiki edits, GitHub task file (spec on ticket branch). Main checkout: `{backlog}`, `{reports}`, local task file `{tasks}/<slug>.md` — board reads one place, report survives worktree removal. Their copies inside worktree = stale, never edit, never commit.
- **Subagents** get worktree path + *work only under `<worktree>`, absolute paths, never touch main checkout or another worktree.* Builds, tests, `git diff` run there (`git -C <worktree>`).
- **User tests from worktree** — report card names it: `test in ../<repo>-worktrees/login-apple` (IDE, simulator, dev server open there).

## Sprints

Sprint = **optional kebab-case label** on task (`sprint: login-refacto`), grouping big work split across several tasks. Canonical rules, every skill refers here.

- **No sprint file, no create command.** Sprint exists moment task names it, stops existing when its last task closes. Nothing to declare, nothing to clean up.
- **Truth is task file `sprint:` field.** `{backlog}` echoes it as `· <sprint>` after link; two disagree → task file wins, fix backlog line.
- **Not a status section.** Sprint cuts across statuses — sprint has tasks in todo, review and done at once. Sections stay per status, always.
- **Contiguity.** Tasks of one sprint stay adjacent inside each status section, in sprint own internal order. `/wa-task` prioritization pass maintains that — sprint moves as block.
- **Resolving a name**: match `sprint:` values across all task files, exact first, then unique case-insensitive / kebab-normalized match. No match → say so and list known sprints (sprint with no live task is closed, not typo). Ambiguous → list candidates, stop.
- **Slug vs sprint**: task slug wins over sprint of same name. Name clash → say which one you took.

- **One branch, when `branch.per_task`.** `<branch.sprint_prefix><sprint>` (default `sprint/login-refacto`), created from `branch.base` (track task: its trunk, **Tracks**) by whoever needs it first — `/wa-code` step 0 or `/wa-autopilot` wave. Tasks of sprint fork off it and `/wa-close` merges them back (`close.strategy: pr` → ready PR onto it instead, human merges), so each task starts from sprint current state. `branch.sprint_prefix: ""` turns that off: tasks use `branch.base` like any other. Nothing merges into sprint branch before its task reviewed and closed. **GitHub**: sprint branch missing on `origin` → create from trunk and push it before first `gh issue develop --base` / `gh pr create --base` on it — attended: one confirmed outward step; `/wa-autopilot`: allowed, logged in report.
- **Sprint branch lands by merge commit, never squash.** Squash flattens every ticket of sprint into one commit, and target never holds sprint branch's commits — per-ticket history lost, later sync or rebase replays all of it. Sprint PR body says **merge commit, never squash**. User asks you to merge it → `gh pr merge <pr> --merge` (never `--squash` / `--rebase`); `close.strategy: merge` → `git merge --no-ff`. Ticket PRs into sprint branch keep project's way (*Squash merge*, **Backlog provider**).
- **A sprint is complete, never `done`.** No sprint status exists. Complete when no task of it left in `todo`/`in-progress`/`review`/`validated` — `/wa-close` notices and offers to land sprint branch; missed then (no, closed elsewhere, GitHub parent still open) → `/wa-close <sprint>` lands it later.

Commands taking sprint name: `/wa-board <sprint>` (filtered view), `/wa-autopilot <sprint>` (batch its todo tasks), `/wa-task` (assigns and inherits), `/wa-close <sprint>` (land complete sprint, **wa-close → Sprint arg**). `/wa-grill`, `/wa-code`, `/wa-validate`, `/wa-feedback` stay **per task** — one task is their unit, and whole sprint unattended is what `/wa-autopilot` already does better.

## Milestones

Milestone = **release scope** (iteration, version): what ships together. Not sprint — sprint groups one feature's tasks and owns a branch; milestone groups whatever ships in one release, owns nothing. Task carries both, either, or none. Canonical rules, every skill refers here; provider side in `providers/CONTRACT.md` → *Milestones*.

- **Humans own the list.** Local: `backlog.milestones` in config, oldest first. GitHub: repo milestones. Agent never adds or renames one — user asks → tell them where (config line / GitHub). Closes one only through `/wa-release`, flow finished, on yes.
- **New task joins highest open milestone** (version order of titles: `0.3.0` over `0.2.1`, whatever opened last) — provider does it on `create`, skill passes nothing. Why: current and past milestones are committed scope; new idea never grows them silently. Echo where it landed: `→ milestone 0.3.0`. **Track milestones never picked** (**Tracks** below): new work lands on base.
- **Override only on user's word** — they name one (`create --milestone 0.2.0`, or `set-field <id> milestone 0.2.0` later), or they say none (`--milestone ""`). Unknown title → provider exit 2: list `milestones`, ask.
- **Split child inherits parent's milestone** (`--milestone <parent's>`): split replaces parent inside its scope, adds no new scope.
- **Truth**: local = task file `milestone:`; GitHub = issue milestone. Never echoed in `{backlog}`.
- **No milestone open** → tasks get none, nothing shown. Feature costs nothing until user opens one.
- **Resolving a name** (`/wa-board <name>`, `/wa-autopilot <name>`): task slug first, then sprint, then milestone title (exact, then unique case-insensitive). Clash → say which one you took.
- **Not a status, never `done`, no branch.** Shipping a milestone = `/wa-release <milestone>`, following project's documented release flow. Exception: track milestone owns its trunk and never ships as release (**Tracks**).

## Tracks

Track = **long-shot feature living beside base** on own long-lived trunk (server experiment on `develop_synchro` beside `develop`). Not sprint: sprint lives through its tasks and lands when complete; track lives with zero tasks open, may never land, needs own syncs. Canonical rules, every skill refers here.

- **Declared in config, humans own list.** `branch.tracks: {<milestone title>: <branch>}` (`{server: develop_synchro}`). Agent never adds or removes entry itself — offers edit on user's word (landing, abandon). Branch must exist; milestone of same title must exist (GitHub: repo milestone; local: entry of `backlog.milestones`). GitHub: keys mirrored to repo variable `WA_TRACKS` (`provision --track`) — config edited → `/wa-setup backlog` re-provisions.
- **Empty or missing `branch.tracks` → nothing here applies.** Every rule below fires only for task whose milestone is a track. Every other task: flow unchanged, byte for byte.
- **Needs `branch.per_task: true`** (forced under GitHub). Off → tracks ignored, say once: `branch.tracks needs branch.per_task`.
- **Membership = milestone.** Task in track milestone lives on track. One milestone per task, so one trunk per task. Sprint tasks and split children inherit parent's milestone, so whole sprint stays on one trunk.
- **Trunk** of task = track branch when task milestone is track, else `branch.base` (fork) and `close.target` (landing). **Every rule naming `branch.base` as fork point or `close.target` / PR base as landing reads task trunk instead**: ticket branch, sprint branch (created from trunk, lands on trunk), draft PR base, `/wa-close` rebase and PR, `/wa-validate` diff scope. Track task fork and land on same branch.
- **Joining a track = user's yes only.** Never default on `create` (**Milestones**). `/wa-task` or `/wa-grill` spots scope belonging to track (paths, modules, APIs only track has) → **suggests** with reason: `→ milestone server? (touches oneSafe6_server/, sync API)`. Yes → `set-field <id> milestone <track>`. User naming track directly skips question.
- **Moving between trunks** (track ↔ base, or track ↔ track) — move between two non-track milestones changes nothing here.
  - No ticket branch yet → `set-field` alone.
  - Branch exists (GitHub: from `grilling` on) → **move**: worktree clean, else refuse. GitHub: agent round (**Backlog provider**) — `claim <n> coding` first (exit 3 → refuse), push ends it. `git rebase --onto <new trunk> <fork commit> <branch>` (GitHub: ticket range, `$start^`, **Backlog provider**). Conflicts → `wa-implementer` resolves (orchestrator never writes code): conflicting files + both trunks' intent + task spec, then build + tests. Show resolved diff, then `push --force-with-lease` (outward → confirm every time), PR open → `gh pr edit <pr> --base <new trunk>`. **`set-field milestone` last**, after git side succeeded — tracker never says track while code sits elsewhere.
  - **Any move resets validation**: `validated` → `review` (GitHub: task file `phase: review`, ready PR → `gh pr ready --undo`). Same diff on other codebase = unverified; `/wa-validate` runs again before `/wa-close`.
  - Milestone changed behind agent's back (tracker UI) → PR base or fork commit ≠ trunk: say so at next round, offer move. Never code on mismatched trunk.
- **Sync** — trunk lags base (`git rev-list --count <track>..<branch.base>` > 0). **Merge, never rebase**: trunk shared and pushed, others fork from it.
  - **Agent offers, user decides.** `/wa-board` shows drift (**Display format**). `/wa-code` step 0 forking track task off stale trunk → asks `sync server first? (30 behind develop, task forks from stale base)`. Never syncs silently, never in `/wa-autopilot`.
  - On yes: branch `wa-sync/<track>-<yyyy-mm-dd>` from track branch (prefix outside `branch.prefix`, so hooks never read it as ticket), `git merge <branch.base>`. Conflicts → `wa-implementer` as for move, with **back-port list**: task files under `{tasks}` added on base since last sync (`git diff --name-only --diff-filter=A <merge-base> <branch.base> -- {tasks}`) carrying `ported-from:` → each = duplicate of track code, keep track version (superset). Build + tests, then push + PR `wa-sync/… → <track>` per **Pull requests** (`{title}` = `sync <track> with <base>`), confirmed. Never squash sync PR: say so in body — squash loses merge, next sync re-fights same conflicts.
- **Back-port** = part of track shipped early on base, minus track-only parts. Plain task on base (non-track milestone), `ported-from: #<pr>` in task file, `## Context / Decisions` naming what gets stripped. No cherry-pick: port rewrites, not copies.
- **Landing** (long-shot wins) = own task on milestone it ships in, `lands: <track>` in task file. Grilled like any (flag or not, migrations, what stays dark). Coding: final sync first, then `git merge <track branch>` into ticket branch (conflicts → implementer), PR onto base. Body says **merge commit, never squash**. Never in `/wa-autopilot`. Landed (task file carrying `lands: <track>` on `branch.base`: PR merged) → `/wa-board` shows `server · landed by #612 — drop from branch.tracks?`; config edit on yes. Milestone closed by human (GitHub) or by removing its `backlog.milestones` entry (local) — its tasks keep it as history.
- **Abandon** (long-shot loses) → user's word only. Open track tasks → `canceled` (GitHub: issue closed `not planned`), config entry removed on yes. **Branch kept**, never deleted: history is theirs.
- **Never release.** `/wa-release <track>` refuses: track ships through landing task, inside a release milestone.

## Task indexes

Index is **display-only**, derived from current backlog order. Never written into `{backlog}` or task files — order alone carry priority, so index shifts when order shifts.

Any skill taking task can take indexes instead of slugs: `/wa-code 3`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-grill 3`. Resolve by re-reading `{backlog}` and re-deriving same numbering (rules above), then:

- Echo resolved mapping (`2 → login-apple`, `3 → sync-offline`) before work, so user catch stale index.
- Index out of range or pointing at section that make no sense for command → say so, stop, don't guess neighbour.
- Ambiguous input (slug that look like number) → treat as slug if task file match, else index.

## Session name

Task commands (`/wa-grill`, `/wa-code`, `/wa-feedback`, `/wa-validate`, `/wa-close`, `/wa-autopilot`) name session after task worked on. Once task(s) resolved, before work: tool `mcp__whackagent__name_session` listed → call it once, `tasks` = every task of run, backlog order: `id` = `#12` (GitHub) or slug (local), `title` = task title (short, per **Titles and summaries**). Pane renames session `<project> · #12 Login Apple`. Sprint arg → its tickets. Tool absent (option off, host without pane) → skip silently. Never mention it in report.

## Output

List, then one bold **→ next:** line per **Next line**. No re-explain whole flow each time. Wording per **Voice**.