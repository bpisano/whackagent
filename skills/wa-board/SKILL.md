---
name: wa-board
description: Renders a dashboard and suggests the next action based on the project's whackagent backlog.
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

## Do

0. **Read arg.** None → whole backlog. Sprint name (`/wa-board "Login refacto"`, `/wa-board login-refacto`) → **filtered view**: only that sprint's tasks, plus progress line. Resolve per **Sprints** below; unknown name → say so, list known sprints, stop.
1. Read `.whackagent/config.md` (respect discussion language). Missing → tell user run `/wa-setup`, stop.
2. **List the backlog** per **Task store** — every task with its `title`, `summary`, `size`, `sprint`, `status`, in priority order. Legacy task spotted (see *Task store → Legacy*) → say `/wa-setup` migrates it, stop.
3. Render as **list**, one section per state (see Display format below), priority order within each. `github` backend → then one line for open repo issues not on the board (see *Task store → Outside issues*).
4. Suggest exactly **one** next action, by state (filtered run → scope suggestion to sprint):
   - something in `to-close` → reviewed, waiting user retest: `/wa-close <id>` to finish (or `/wa-feedback` if retest found something). Highest precedence — one step from done.
   - something in `to-test` → coded, waiting user test: `/wa-feedback <id> <notes>` if notes, else `/wa-validate <id>` to fire verifier. Beats starting new work.
   - something `coding` → resume it (`/wa-code <id>`)
   - top `todo` → `/wa-code <id>`. Backlog order maintained by `/wa-task` prioritization pass — never suggest reprioritizing as step (if user *asks* to reorder, that `/wa-task` with no arg).
   - no `todo`, top `draft` → `/wa-task <id>` to grill it
   - nothing in todo or draft → `/wa-task <description>` to create one
   - batch of small `todo` tasks → mention `/wa-autopilot` as option

## States

One lifecycle, both backends. Each state says **what's left to do** — never what happened.

| state | means | next |
|---|---|---|
| `draft` | idea, not grilled | `/wa-task <id>` |
| `todo` | grilled, ready to code | `/wa-code <id>` |
| `coding` | agent coding it | `/wa-code <id>` resumes |
| `to-test` | coded, **you** test it | `/wa-feedback` or `/wa-validate` |
| `to-close` | spec OK + verifier passed, you retest | `/wa-close <id>` |
| `done` | closed | — |
| `canceled` | dropped, reason noted | — |

Quick win flagged trivial skips the grill → born `todo`. "Review" names only the verifier's pass, never a state.

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

- **Line 1** = `<id> · <size> **<title>**`, then `` · <sprint>`` when task has one.
- **Line 2** = task `summary`, indented 4 spaces. Never dump task body.
- **Id** — per **Task ids**: display index `2 ·` for `files` (never `2.`: markdown renumbers it), issue number `#42 ·` for `github`.
- **Section order = lifecycle, left to right like the GitHub board**: Draft → Todo → Coding → To test → To close → Done → Canceled. Display indexes number **continuously across sections**, top to bottom — never restart per section, so user cites one without ambiguity.
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

- **`github` backend → always link.** Task PR: `Closes #<n>`. Sprint PR: `Closes #<n>` for every task of the sprint, plus the sprint's milestone set on the PR. GitHub then shows the PR on each issue and closes them at merge into the default branch.
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

## Task store

Where tasks live — `tasks.backend` in config: **`files`** (default) or **`github`**. Every skill reads and writes tasks **only through the operations below**, never by assuming one backend.

**A task is the same content in both**: `title`, `summary`, `size`, `sprint`, `status`, `wiki`, `note`, and the six sections (`## Context / Decisions`, `## Acceptance criteria`, `## Implementation`, `## Review`, `## Verification`, `## Feedback`). Template: `${CLAUDE_PLUGIN_ROOT}/templates/task.md`.

| op | `files` | `github` |
|---|---|---|
| **list backlog** | `{backlog}` lines, order = priority, + each task file | `gh project item-list <number> --owner <owner> --format json` — item order = priority, Status field = state |
| **read task** | `{tasks}/<slug>.md` | `gh issue view <n> --json title,body,labels,milestone,createdAt` + its project Status |
| **write sections** | edit file | **re-read body right before**, edit, `gh issue edit <n> --body-file <tmp>` — never from a stale copy: a teammate may have edited it |
| **set state** | frontmatter `status:` + move backlog line to its section | project item Status (`gh project item-edit --id <item> --field-id <status> --project-id <project> --single-select-option-id <option>`) |
| **create** | file from template + backlog line | `gh issue create` (title, body, `size:*` label, milestone) → `gh project item-add` → set Status → position |
| **reorder** | backlog line order | GraphQL `updateProjectV2ItemPosition` (`afterId` = item above) |
| **sprint** | `sprint:` field + `· <Sprint>` suffix | milestone — `gh issue edit <n> --milestone "<Sprint>"`; missing → `gh api repos/<owner>/<repo>/milestones -f title="<Sprint>"` first |
| **size** | `size:` field | label `size:quickwin` / `size:medium` / `size:large` (one at a time) |

**`github` body** = task file minus frontmatter. Fields with no GitHub home go on top, omitted when empty; `created` = issue `createdAt`:

```
<summary>

wiki: [[auth]], [[login-flow]]
note: <free-form>

## Context / Decisions
…
## Feedback
…
```

**`github` specifics:**

- **Ids once per run.** Project id, Status field id and its option ids via `gh project view` / `gh project field-list <number> --owner <owner> --format json` — look up once, reuse.
- **Auth.** `gh` needs the `project` scope. Missing → say `gh auth refresh -s project`, stop. Never fall back to `files` silently.
- **Closing.** `done` → Status Done only; the issue closes itself when the PR carrying `Closes #<n>` merges (see **Voice → PR wording**). Exception: no PR will ever carry it (`close.strategy: merge`) → `gh issue close <n> --reason completed`. `canceled` → Status Canceled + `gh issue close <n> --reason "not planned"`, reason as a comment.
- **Outside issues.** Open repo issues not on the board — `gh issue list --state open --json number,title,projectItems`, keep those with no item in this project. `/wa-board` shows one line (`📥 3 issues off board (#57, #60, #61) → /wa-task 57 to adopt one`); **never adds them itself**. Board item with no Status (added by hand) → shown as `draft`.
- **Task ref for subagents.** Implementer and verifier never read config and never write the task. Hand them a **task ref**: `files` → the task file path; `github` → `issue #<n>, read with: gh issue view <n> --json title,body -q '.title + "\n\n" + .body'`. Orchestrator records what they return.
- **No comments.** whackagent never posts issue comments, except the cancel reason. Everything lives in the body.
- **`{backlog}` and `{tasks}` unused.** `{reports}`, `{wiki}`, `{conventions}` stay in the repo as in `files`.

**Legacy** — task still carrying old states (`in-progress`, `review`, `validated`), a `grilled:` field, or French headings (`## Contexte / Décisions`, `## Critères d'acceptation`, `## Implémentation`, `## Vérification`) → project predates this lifecycle. Don't guess, don't alias: say `/wa-setup` migrates it (one plan, one yes), stop.

## Paths

Every whackagent skill writes `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` instead of literal folder. They resolve from `paths:` in `.whackagent/config.md`, read at step 1 — project may keep wiki in `docs/wiki/` so team that doesn't run whackagent still read it.

- **Key missing → the default** (`.whackagent/BACKLOG.md`, `.whackagent/tasks`, `.whackagent/wiki`, `.whackagent/reports`, `.whackagent/conventions`). Config written before `paths:` existed keep working untouched.
- **Relative resolves from repo root**, not cwd. Absolute paths allowed.
- **`.whackagent/config.md` is the one fixed path** — it carry the others.
- Path points at nothing → say which key and what it points at, suggest `/wa-setup`. Never fall back to `.whackagent/` behind user back, never create folder somewhere else: wiki silently written to default is wiki team never sees.

## Output

List, then one bold **→ next:** line. No re-explain whole flow each time. Wording per **Voice**.