# Tasks

The model every skill shares: config, paths, states, ids, sprints, types, blockers. Where tasks live → `store-<tasks.backend>.md`.

## Config and paths

- Read `.whackagent/config.md` first. Missing → `→ next: /wa-setup`, stop.
- `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` resolve from its `paths:` block.
  - Key missing → `.whackagent/<BACKLOG.md|tasks|wiki|reports|conventions>`.
  - Relative → from repo root. Absolute allowed.
  - Points at nothing → name key + target, suggest `/wa-setup`. Never fall back to `.whackagent/`, never create the folder elsewhere.
- Other key missing → its default in `${CLAUDE_PLUGIN_ROOT}/templates/config.md`. Never off by absence.
- Task file template: `${CLAUDE_PLUGIN_ROOT}/templates/task.md`.

## States

Each state says what's left to do.

| state | means | next |
|---|---|---|
| `draft` | idea, not grilled | `/wa-task` |
| `grilling` | locked, being grilled | wait, or `/wa-task` resumes your lock |
| `todo` | ready to code | `/wa-code` |
| `coding` | code being written | `/wa-code` resumes |
| `to-test` | coded, user tests | `/wa-feedback` or `/wa-validate` |
| `to-close` | reviewed, user retests | `/wa-close` |
| `done` | closed | — |
| `canceled` | dropped, reason noted | — |

- `/wa-task` always grills: lock `grilling`, ends `todo`.
- `coding` = code being written, nothing else. Set by `/wa-code`, `/wa-feedback`.
- Review rounds (`/wa-validate`, `/wa-close`) lock without moving the state.
- "Review" = the verifier's pass, never a state.
- Locks: `github` → atomic claim (**store-github → Locks**). `files` → plain status.

## Ids

| | `files` | `github` |
|---|---|---|
| input | display index `3`, slug | issue number `42`, `#42`, slug |
| shown | `3 ·` | `#42 ·` |
| key (branch, worktree, report) | `<slug>` | `<n>-<slug>` |

- Lists and ranges work: `2,4,5`, `2-5`.
- Slug = kebab-case title, set at creation, never moves.
- Display index = position in current backlog order, never stored. Re-derive to resolve.
- Echo before work: `3 → add-apple-login`, `#42 → Add Apple login`.
- Unknown id, or state that makes no sense for the command → say so, stop. Never guess a neighbour.
- Numeric slug → slug if a task matches, else id. Task id beats sprint of same name; clash → say which you took.

## Sprints

Optional `sprint:` on a task. Groups one body of work. Naming → **voice → Titles**.

- No sprint file, no command. Exists once a task names it (`github`: a milestone).
- Not a state. Sections stay per state; a sprint's tasks stay adjacent inside each.
- Resolve an arg: exact, then case-insensitive / kebab match. None → list known sprints (no live task = complete, not a typo). Ambiguous → list, stop.
- Assign to a task: reuse a live name verbatim (`sprint:` values / open milestones). No match → new sprint.
- **Complete** when no task left in `draft`…`to-close`. Never `done`. `/wa-close` then offers to land it.
- Sprint args: `/wa-board`, `/wa-autopilot`, `/wa-task`. Other commands stay per task. `/wa-board` also takes a type.
- Branches → **git → Sprint branch**.

## Types

One per task. Test: user sees a difference? No → `refactor`. Yes: worked before? No → `bug`. Yes → `improvement`. Didn't exist → `feature`.

| type | title verb | commit |
|---|---|---|
| `feature` | `Add` | `feat:` |
| `improvement` | `Improve`, `Speed up`, `Change` | `feat:` (`perf:` if measured) |
| `bug` | `Fix` | `fix:` |
| `refactor` | `Split`, `Move`, `Upgrade`, `Remove` (no user change) | `refactor:` (`chore:` deps, CI) |

- Set by `/wa-draft` from the title verb (unclear → none), required before `todo` (`/wa-task`). `/wa-pitch` split → `feature`.
- Title verb contradicts type → fix the title, not the type.
- `files` → `type:`. `github` → label (**store-github → Helper**).

## Blockers

Task blocked by another = needs its code landed first.

- `files` → `blocked_by: [slug, …]`. `github` → issue *blocked by* link.
- Set by `/wa-task`, `/wa-draft`, the grill, a split (child blocked by the sibling it builds on).
- **Open** = blocker not `done`. `canceled` blocker → no longer blocks, say so once.
- Effects:
  - board → `⛔ #12`, never suggested as next
  - `/wa-code` → **Warning**, recommend blocker first, go on only on yes
  - `/wa-autopilot` → stacks it (**git → Stacking**)
  - prioritization → blocker always above
