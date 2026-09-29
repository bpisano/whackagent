---
name: wa-board
description: Shows the backlog and the next step.
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

## Do

0. **Read arg.** None → whole backlog. Sprint name (`/wa-board "Login refacto"`, `/wa-board login-refacto`) → **filtered view**: only that sprint's tasks, plus progress line. Resolve per **Sprints** below; unknown name → say so, list known sprints, stop.
1. Read `.whackagent/config.md` (respect discussion language). Missing → tell user run `/wa-setup`, stop.
2. **List the backlog** per **Task store** — every task with its `title`, `summary`, `size`, `sprint`, `status`, in priority order. Legacy task spotted (see *Task store → Legacy*) → say `/wa-setup` migrates it, stop.
3. Render as **list**, one section per state (see Display format below), priority order within each. `github` backend → then one line for open repo issues not on the board (see *Task store → Outside issues*).
4. Suggest exactly **one** next action, by state (filtered run → scope suggestion to sprint):
   - `github`: sprint complete (every task `done`) and its sprint branch not merged, no open sprint PR → propose sprint PR per **wa-close → Sprint landing** (ask, never open it here).
   - something in `to-close` → reviewed, waiting user retest: `/wa-close <id>` to finish (or `/wa-feedback` if retest found something). Highest precedence — one step from done.
   - something in `to-test` → coded, waiting user test: `/wa-feedback <id> <notes>` if notes, else `/wa-validate <id>` to fire verifier. Beats starting new work.
   - something `coding` → resume it (`/wa-code <id>`)
   - top **unblocked** `todo` → `/wa-code <id>` (blocked task never suggested — see **Dependencies**). Backlog order maintained by `/wa-task` prioritization pass — never suggest reprioritizing as step (if user *asks* to reorder, that `/wa-task` with no arg).
   - no `todo`, top `draft` not locked → `/wa-task <id>` to grill it
   - nothing in todo or draft → `/wa-task <description>` to create one (`/wa-draft` to just note an idea)
   - batch of small `todo` tasks → mention `/wa-autopilot` as option

## States

One lifecycle, both backends. Each state says **what's left to do** — never what happened.

| state | means | next |
|---|---|---|
| `draft` | idea, not grilled | `/wa-task <id>` |
| `grilling` | **locked** — someone grilling it now | wait, or `/wa-task <id>` resumes (your lock) |
| `todo` | grilled, ready to code | `/wa-code <id>` |
| `coding` | agent coding it | `/wa-code <id>` resumes |
| `to-test` | coded, **you** test it | `/wa-feedback` or `/wa-validate` |
| `to-close` | spec OK + verifier passed, you retest | `/wa-close <id>` |
| `done` | closed | — |
| `canceled` | dropped, reason noted | — |

`/wa-draft` creates `draft`. `/wa-task` always grills: takes the `grilling` lock, ends at `todo`. "Review" names only the verifier's pass, never a state.

**Locks** (`grilling`, `coding`) — one grill, one coding round per task at a time. `github`: atomic claim (see **Task store → Locks**). `files`: one checkout, one agent — plain status, no lock to take.

## Display format

Canonical way tasks shown anywhere in flow (here, `/wa-task` prioritization pass, `/wa-autopilot` recap). **List, never table.** One section per non-empty state, tasks in priority order, two lines per task:

```
### Todo

1 · 🟢 **Add Apple login** · Login refacto
    Sign in with Apple on login screen
2 · 🟡 **Rework login form** · Login refacto
    One form, email + Apple, same errors

### Coding

3 · 🟡 **Export reports as CSV**
    Reports downloadable from dashboard

### Draft

4 · 🔴 **Sync offline changes**
    Offline queue + conflict handling

🟢 quick win · 🟡 medium · 🔴 large
🏁 Login refacto — 0/2 (2 todo)
```

Rules:

- **Line 1** = `<id> · <size> **<title>**`, then `` · <sprint>`` when task has one, then `` · ⛔ #12`` when blocked (open blockers, see **Dependencies**), then `` · 🔒 alice@mbp 2h`` when a lock is held (`github`: owner + age; `stale` → `🔒⏳`).
- **Line 2** = task `summary`, indented 4 spaces. Never dump task body.
- **Id** — per **Task ids**: display index `2 ·` for `files` (never `2.`: markdown renumbers it), issue number `#42 ·` for `github`.
- **Section order = lifecycle, left to right like the GitHub board**: Draft → Grilling → Todo → Coding → To test → To close → Done → Canceled. Display indexes number **continuously across sections**, top to bottom — never restart per section, so user cites one without ambiguity.
- **Size** maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **Sprint tag** only on tasks that have one. Filtered run (`/wa-board <sprint>`) drops it — every task is that sprint.
- Skip empty sections. Show only few recent under **Done**.
- Legend once below list.
- At least one sprint in play → one **progress line per sprint** under legend, done+canceled excluded from numerator only:
  `🏁 Login refacto — 2/5 (1 to test, 2 todo)`. Filtered run → that single line, above list.

## Voice

Canonical, every whackagent skill. Applies to **the whole conversation** — every message while a whackagent skill runs, not only reports — plus `{reports}`, task files and PRs.

- **Telegraphic.** Fragments OK. No articles filler, no pleasantries, no hedging, no re-explaining the flow. One idea per line.
- **Tech terms stay English, in every language.** Conversation in French (or any other language) → write franglais, on purpose. build, branch, merge, commit, review, worktree, simulator, entitlement, loading, fix, main thread, hang, puck, layout, render, state, callback… Never translate them literally: a calque (`fil principal`, `branche fusionnée`, `interrupteur`, `process fils`, `marqueurs des jobs`) is harder to read than the English word the dev says out loud. Target: `bouton Apple pas disabled pendant le loading`, `le main thread passe de 51 % à 10 %`.
- **Short common words.** `fix` not "proceed with the correction", `test it` not "please proceed to test".
- **Clarity beats brevity.** Fragment readable two ways → write the full sentence.
- **Task bodies are the exception** — `## Context / Decisions`, `## Acceptance criteria` in full simple sentences (franglais still OK): verifier, user and teammates reread them months later, fragments there get misread.
- **Skill text is English; output follows `discussion_language`.** Examples in these skills are English — render headings, labels and prose in the configured language (`Problem / Goal / Done / To test` → `Problème / Objectif / Fait / À tester` in fr), tech terms still English.
- **Task section headings are fixed, English**: `## Context / Decisions`, `## Acceptance criteria`, `## Implementation`, `## Review`, `## Verification`, `## Feedback`. Older French ones are migrated by `/wa-setup` (see *Task store → Legacy*).

### Titles and summaries

A title is read **cold** — in a GitHub issue list, a branch name, a PR — by someone who never saw the grill. Same spirit as `/wording`: fewest words, the ones the dev says out loud, nothing the UI already shows.

Title = **verb + thing**, imperative, ≤ 5 words. Reads like a ticket: you know at a glance if it's an add, a fix, a refacto.

- **Verb first.** `Add`, `Fix`, `Split`, `Rework`, `Replay`, `Remove`, `Migrate`… (fr: `Ajouter`, `Fix`, `Refacto`, `Supprimer`…). A task is an action — the verb says which.
- **Never a narrative sentence.** Subject-verb-object telling a story = failed title. `The dashboard asks the questions instead of the commands` → `Move prompts to dashboard`.
- **Never a metaphor or image.** `Tests turn red at random` means nothing to anyone → `Fix flaky CLI tests`.
- **Tech terms in English**, whatever the language — flaky, job, watermark, toggle, prompt, scope, seed, dashboard, child process.
- **No elegant rephrasing.** User says `rework UI` → write `Rework UI`, not `A shared style for screens`.
- **Never repeat the sprint.** Task in sprint `Login refacto` → `Add Apple login`, not `Login refacto: Apple button`. The sprint tag already says it.

Summary = **the goal, plain**, ≤ 8 words. What it gives once done. Not the mechanism, not the story, not the list of what disappears. Never repeats the title.

| ❌ | ✅ title | ✅ summary |
|---|---|---|
| After a purge, jobs don't replay | `Replay jobs after purge` | purge doesn't reset watermarks |
| Import all of France, or just one region | `Make import scope configurable` | DATA_SCOPE: region locally, France in prod |
| CLI tests turn red at random | `Fix flaky CLI tests` | 4 TUI tests fail in suite, pass alone |
| A shared style for CLI screens | `Rework CLI screens UI` | shared design system in tui/design/ |
| The dashboard asks the questions instead of the commands | `Move prompts to dashboard` | commands take options, dashboard asks |
| Login Apple | `Add Apple login` | Sign in with Apple on login screen |
| crash when i zoom (issue filed by a teammate) | `Fix crash on map zoom` | zoom past 18 no longer crashes |

### Sprint names

Sprint = **human title**, ≤ 3 words, names the body of work — same rules as a task title minus the verb (`Login refacto`, `Map architecture`, `Perf hangs`). Shown as-is on board, milestone and PR. Kebab-case exists only in its branch (`sprint/login-refacto`).

### PR wording

A PR is read by people who **don't know the task** — teammates, reviewers, you in six months. Tech allowed, but the surface stays simple enough for anyone on the team. Same rules as **Voice** (language = `discussion_language`, tech terms English).

**Title = area, 1–3 words.** What a teammate would call it in standup. The part of the app it touches + the kind of change. No metric, no number, no em-dash, no colon, no list of components, no narrative.

| ❌ | ✅ |
|---|---|
| `Guidance twice as light — main thread drops from 51% to 10% in nav` | `Performance` |
| `Composed map: MapHost + modules, unified camera, nav perf` | `Map architecture` |
| same perf work, only the map touched | `Map performance` |
| `Add Sign in with Apple button on login screen and entitlement` | `Add Apple login` |

Wider change → shorter, more generic word (`Performance`). Narrower → add the area (`Map performance`). **Task PR → task `title` as-is** (verb + thing: `Add Apple login`) — one precise action, the verb helps. **Sprint PR → area in 1–3 words** (`Login`, `Map architecture`) — it covers several actions, a verb would lie. Never list its tasks.

**Body = telegraphic, three blocks max:**

```
<one line: what changes for the app, plain words — the only place a key number goes>

## Changes
- <3–6 bullets, one change each, plain words; type/file name in backticks only when it helps a reviewer find it>

## To test
- [ ] <what a reviewer checks by hand, one line each>

Closes #42        ← github backend: one `Closes #n` per task the PR delivers
```

- **`github` backend → always link.** Task PR: `Closes #<n>` + `github-board link-pr <n> <pr>` (base ≠ default branch → `Closes` alone links nothing). Sprint PR: `Closes #<n>` for every task of the sprint, plus the sprint's milestone set on the PR. GitHub then shows the PR on each issue and closes them at merge into the default branch.
- **Write for someone landing cold.** No task slugs, no backlog/sprint jargon, no verifier rounds, no finding counts, no "process" section, no follow-up list.
- **Numbers: one line or a table ≤ 3 rows**, only when the PR is *about* numbers (perf). Never every counter you measured.
- **Why, not how.** `Home map paused during nav` beats the three mechanisms behind it. Details live in the code and the task file.
- **Short beats complete.** Body over ~20 lines → cut. Reviewer asks for more if they need it.

## Sprints

Sprint = **optional human title** on task (`sprint: Login refacto`), grouping big work split across several tasks. Canonical rules, every skill refers here. Naming → **Voice → Sprint names**.

- **No sprint file, no create command.** Sprint exists moment a task names it. `files`: nothing to declare. `github`: it **is** a milestone — created on first use (see **Task store**), never deleted by whackagent.
- **Truth is the task.** `files`: task `sprint:` field; `{backlog}` echoes it as `· <Sprint>` after link — two disagree → task file wins, fix backlog line. `github`: the issue's milestone.
- **Not a state.** Sprint cuts across states — has tasks in todo, to-test and done at once. Sections stay per state, always.
- **Contiguity.** Tasks of one sprint stay adjacent inside each section, in sprint own internal order. `/wa-task` prioritization pass maintains that — sprint moves as block.
- **Resolving a name**: exact title first, then case-insensitive / kebab-normalized match (`login-refacto` finds `Login refacto`). No match → say so and list known sprints (sprint with no live task is complete, not typo). Ambiguous → list candidates, stop.
- **Task id vs sprint**: task id wins over sprint of same name. Clash → say which one you took.

- **One branch, when `branch.per_task`.** `<branch.sprint_prefix><kebab(sprint)>` (default `sprint/login-refacto`), created from `branch.base` by whoever needs it first — `/wa-code` step 0 or `/wa-autopilot` wave. Tasks of sprint fork off it and `/wa-close` merges them back, so each task starts from sprint current state. `branch.sprint_prefix: ""` turns that off: tasks use `branch.base` like any other. Nothing merges into sprint branch before its task is reviewed and closed.
- **A sprint is complete, never `done`.** No sprint state exists. Complete when no task of it left in `draft`/`todo`/`coding`/`to-test`/`to-close` — `/wa-close` notices and offers to land sprint branch.

Commands taking sprint name: `/wa-board <sprint>` (filtered view), `/wa-autopilot <sprint>` (batch its todo tasks), `/wa-task` (assigns and inherits). `/wa-code`, `/wa-validate`, `/wa-feedback`, `/wa-close` stay **per task** — one task is their unit, and whole sprint unattended is what `/wa-autopilot` already does better.

## Task ids

How a task is named in commands, board, branches, worktrees and reports.

| | `files` | `github` |
|---|---|---|
| **input** | display index (`/wa-code 3`), ranges (`2-5`, `2,4`), or slug | issue number (`/wa-code 42`, `#42`), ranges, or slug |
| **board** | `3 ·` | `#42 ·` |
| **key** (branch, worktree, report) | `<slug>` → `wa/add-apple-login` | `<n>-<slug>` → `wa/42-add-apple-login` |

- **Slug** = kebab-case of title, set at creation, never moves after (`files`: file name). `github`: slug in key derived from title at branch creation, then fixed by the branch — later skills find it by prefix (`git branch --list '<branch.prefix><n>-*'`), so a renamed issue never loses its branch.
- **Display index** (`files` only) is display-only, derived from current backlog order, never written anywhere — shifts when order shifts. Resolve by re-deriving same numbering (rules above).
- **Issue number** (`github`) is stable: no display index there, nothing to re-derive.
- Echo resolved mapping (`3 → add-apple-login`, `#42 → Add Apple login`) before work, so user catches a stale or wrong id.
- Id out of range, unknown, or pointing at state that makes no sense for command → say so, stop, don't guess neighbour.
- Slug that looks like number → slug if a task matches, else id.

Everywhere skills write `<id>` they mean input form; `<key>` means the branch/report form.

## Dependencies

Task **blocked by** others = needs their code landed first. Canonical rules, every skill refers here.

- **Where**: `files` → `blocked_by: [add-apple-login, …]` (slugs) in task frontmatter. `github` → issue relationship *blocked by* — `github-board depend <n> --on <x>[,<y>]`, read back in `github-board get <n>` → `blocked_by: [{number, state}]`. Tracker metadata like size and sprint — known before any task file exists.
- **Who sets**: `/wa-task` and `/wa-draft` at creation (user names it, or it builds on another task), grill when it finds one, split → each child blocked by the sibling it builds on.
- **Open blocker** = not `done` (`github`: issue still open). `canceled` blocker → no longer blocks; say so once.
- **Effects**: `/wa-board` tags line `⛔ #12`, never suggests blocked task as next. `/wa-code` on blocked task → warn, recommend coding blocker first, go on only on yes. `/wa-autopilot` → blocked task waits for its blocker's wave; blocker outside batch and not landed → skip it. Prioritization pass → blocker always above what it blocks.
- **No stacking.** Dependent task starts from base once blocker landed — never from blocker's unmerged branch.

## Task store

Where tasks live — `tasks.backend` in config: **`files`** (default) or **`github`**. Every skill reads and writes tasks **only through the operations below**, never by assuming one backend.

**Task file is the truth, both backends.** Same template (`${CLAUDE_PLUGIN_ROOT}/templates/task.md`), same six sections (`## Context / Decisions`, `## Acceptance criteria`, `## Implementation`, `## Review`, `## Verification`, `## Feedback`). Difference: where the file sits, who holds the metadata.

| | `files` | `github` |
|---|---|---|
| **task file** | `{tasks}/<slug>.md`, in working tree | `{tasks}/<n>-<slug>.md` **on task branch** `<branch.prefix><n>-<slug>` — exists from end of grill |
| **title, summary, size, sprint, blockers** | frontmatter | issue title, first body line, Project `Size`, milestone, *blocked by* relationship — **never in file** |
| **state** | frontmatter `status:` + `{backlog}` section | Project `Status` column. Once branch exists, file `status:` drives it: **hook** reads pushed file, moves card |
| **priority** | `{backlog}` line order | Project card order |

### `github` — operations

Helper: `${CLAUDE_PLUGIN_ROOT}/scripts/github-board <verb>` (internal, Python 3 + `gh`, run from repo root). JSON on stdout. Exit 0 ok · 1 error · 2 usage · **3 lock taken** · **4 wrong state** — 3 and 4 normal outcomes, not failures.

| op | how |
|---|---|
| **list backlog** | `github-board list [--state s,…] [--sprint x] [--all] [--owners]` — priority order, done/canceled hidden unless `--all`; `--owners` resolves lock holders |
| **read task** | `github-board get <n>` (state, size, sprint, claims, `branch`, `blocked_by`) + task file: `git show origin/<branch>:{tasks}/<n>-<slug>.md` (or working tree when on that branch). No branch yet (`draft`) → issue body is the raw idea note |
| **create** | `github-board create --title … --summary … [--size] [--sprint] [--note <idea>]` → issue in `draft`, bottom of board. Summary = first body line, note below it |
| **lock** | `github-board claim <n> grilling\|coding` — see *Locks* |
| **write sections / status** | edit task file on task branch; lands on board at next push (hook) |
| **state not from file** | `claim` (Grilling, Coding), `release <n> <phase> --reset-to <state>` (abort), `cancel <n> --reason …` (Canceled + issue closed not planned). `set-state` = setup / repair only |
| **reorder** | `github-board move <n> --top\|--bottom\|--before m\|--after m` |
| **size / sprint** | `github-board set-field <n> size <quickwin\|medium\|large>` · `set-field <n> sprint "<Sprint>"` (milestone created on first use, `""` clears) |
| **blockers** | `github-board depend <n> --on <x>[,<y>]` |
| **PR link** | `github-board link-pr <n> <pr>` right after `gh pr create` — milestone + closing link |

**Hook** (`.github/workflows/whackagent-board.yml`, from `${CLAUDE_PLUGIN_ROOT}/templates/github-board.yml`) owns every other move:

| event | result |
|---|---|
| issue opened | `draft` |
| push to `wa/<n>-…` with `{tasks}/<n>-*.md` (`issue: <n>`, non-empty `## Acceptance criteria`) | column = file `status:` (`todo` · `to-test` · `to-close`), locks released |
| PR merged (any base) | `done`, issue closed, milestone closed when empty |
| PR closed unmerged | `todo` |

**Never set `todo`, `to-test`, `to-close`, `done` on the board yourself** — write `status:` in file, push; hook moves card. Code drives board. Hook slow → wait, don't patch.

### `github` — task branch and rounds

- **Branch** created at grill by `gh issue develop <n> --name <branch.prefix><n>-<slug> --base <base>` (base = sprint branch when task in sprint, else `branch.base`) — only GitHub-created branches link in issue **Development**. Never `git checkout -b` + push for it.
- **Every round ends with commit + push** on task branch — grill (`status: todo`), `/wa-code`, `/wa-feedback`, `/wa-validate`, `/wa-autopilot`. Commit author = `commit.author_name`/`author_email`, never Claude. That push releases the lock. **No push mid-round** — hook would end round early.
- **Draft PR** opened by first coding delivery: `gh pr create --draft --base <base> --head <branch>`, title/body per **Voice → PR wording**, then `link-pr`. Later rounds push to it. `/wa-close` marks it ready; user merges.
- **PR ready + new round** (`/wa-feedback`) → `gh pr ready --undo` first: nobody merges code that moves again.
- **Round end checks mergeable**: `gh pr view --json mergeable` → `CONFLICTING` → rebase task range on base, rebuild, `push --force-with-lease` (own task branch only), check again. Conflict needs a design call → stop, say which files.
- **Task ref for subagents.** Implementer and verifier never read config and never write the task. Hand them the task file path (worktree or checkout on task branch). Orchestrator records what they return.

### Locks (`github`)

- `claim <n> grilling` from `draft` · `claim <n> coding` from `todo`, `to-test`, `to-close`. Atomic: git ref `refs/wa-claims/<n>/<phase>`, N agents → one wins.
- **Exit 3 = taken** → name owner and age (`🔒 #42 grilling — alice@mbp since 2h`), stop. Never retry, never steal.
- **Exit 4 = wrong state** → say state, point to right command.
- Released by the push ending the round (hook), or `release <n> <phase> --reset-to <state>` on abort: grill abandoned → `--reset-to draft`; coding round aborted before any push → `--reset-to` the state it was claimed from.
- **No expiry** — grill is interactive, answer may come in two days. `github-board claims` flags `stale` (no push past `WA_STALE_AFTER_HOURS`); `/wa-board` shows it. `/wa-task release <n>` clears one — human-triggered only.

### `github` — other rules

- **Auth.** `gh` needs `project` scope. Missing → say `! gh auth refresh -h github.com -s project`, stop. Never fall back to `files` silently.
- **Closing.** `done` comes from the merge (hook). `canceled` → `github-board cancel <n> --reason "<why>"`.
- **Outside issues.** Every issue opened lands on board as `draft` (hook), `wa-ignore` label opts out. Board draft items (Project-only, no issue) → `/wa-board` lists them, suggests converting.
- **Comments = trail only.** Hook and claims post one line per move. whackagent never writes task content in comments or issue body — it lives in the file.
- **`{backlog}` unused.** `{tasks}` lives on task branches. `{reports}`, `{wiki}`, `{conventions}` stay in repo as in `files`.
- **Hook needs** secret `WA_PROJECT_TOKEN` (classic PAT, `project` + `repo`) and must be on default branch **and** on base branches (sprint branches forked after it carry it). Set up by `/wa-setup`.
- **Known lag.** Project item list trails writes by 1–3 min: `list` may miss brand-new task; `get`/`claim` read through the issue, always current.

### `files` — operations

| op | how |
|---|---|
| **list backlog** | `{backlog}` lines, order = priority, + each task file |
| **read task** | `{tasks}/<slug>.md` |
| **write sections** | edit file |
| **set state** | frontmatter `status:` + move backlog line to its section |
| **create** | file from template + backlog line |
| **reorder** | backlog line order |
| **sprint / size / blockers** | `sprint:` field + `· <Sprint>` suffix · `size:` · `blocked_by:` |

**Legacy** — task still carrying old states (`in-progress`, `review`, `validated`), a `grilled:` field, or French headings (`## Contexte / Décisions`, `## Critères d'acceptation`, `## Implémentation`, `## Vérification`) → project predates this lifecycle. `github` task whose content lives in the issue body (no task file on its branch, body holds `## Acceptance criteria`) or size as `size:*` label → pre-0.13 GitHub layout. Don't guess, don't alias: say `/wa-setup` migrates it (one plan, one yes), stop.

## Paths

Every whackagent skill writes `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` instead of literal folder. They resolve from `paths:` in `.whackagent/config.md`, read at step 1 — project may keep wiki in `docs/wiki/` so team that doesn't run whackagent still read it.

- **Key missing → the default** (`.whackagent/BACKLOG.md`, `.whackagent/tasks`, `.whackagent/wiki`, `.whackagent/reports`, `.whackagent/conventions`). Config written before `paths:` existed keep working untouched.
- **Relative resolves from repo root**, not cwd. Absolute paths allowed.
- **`.whackagent/config.md` is the one fixed path** — it carry the others.
- Path points at nothing → say which key and what it points at, suggest `/wa-setup`. Never fall back to `.whackagent/` behind user back, never create folder somewhere else: wiki silently written to default is wiki team never sees.

## Output

List, then one bold **→ next:** line. No re-explain whole flow each time. Wording per **Voice**.