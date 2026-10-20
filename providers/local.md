# Local provider

Default (`backlog.provider: local`, or key missing). Backlog = files in repo: `{backlog}` index (order = priority) + `{tasks}/<slug>.md` (frontmatter carry state). One agent, one checkout — no locks, no hooks. Behavior = what the skills describe when no provider named; this file only maps it onto **providers/CONTRACT.md**.

## States

Local keeps its own finer statuses in task frontmatter `status:`. Mapping onto contract states:

| Contract | Local |
|---|---|
| `todo` | `status: todo`, `grilled: false` |
| `grilling` | — (transient, lives in `/wa-grill` session only) |
| `grilled` | `status: todo`, `grilled: true` |
| `coding` | `status: in-progress` |
| `review` | `status: review` / `validated` |
| `done` | `status: done` |

Same split as GitHub: `coding` = agent works now, `review` = human on turn. Local `status: review` (coded, test it) and `validated` (verifier ran, retest then `/wa-close`) play GitHub's task file `phase:` inside contract `review` — table in **CONTRACT.md** → *Who's on turn*.

`done` under `close.strategy: pr` = PR opened ready, **not merged** — no hook sees merge. `/wa-release` readiness checks those PRs (**wa-release** step 2).

## Verbs

| Verb | Local implementation |
|---|---|
| `list` | read `{backlog}` sections in order, frontmatter of each linked task. `--milestone` filters on `milestone:` |
| `get` | read `{tasks}/<slug>.md` |
| `create` | write `{tasks}/<slug>.md` from `templates/task.md`, append line under **Todo** in `{backlog}`. `milestone:` = `--milestone`, else highest entry of `backlog.milestones` that isn't key of `branch.tracks` (CONTRACT → *Milestones*), else empty |
| `claim` | no-op — single agent. Set `status: in-progress` when coding starts |
| `release` | no-op |
| `set-state` | edit frontmatter `status:` (+ move line to matching `{backlog}` section) |
| `move` | reorder lines inside `{backlog}` section |
| `set-field` | edit frontmatter `size:` / `sprint:` / `milestone:` |
| `close-milestone` | remove entry from `backlog.milestones` (tasks keep `milestone:`) |
| `milestones` | config `backlog.milestones` (open) highest first, then `milestone:` values not in that list whose tasks aren't all `done`/`canceled` (closed); counts from task files, `done` = `status: done`/`canceled` |
| `split` | no root entity: parent `status: canceled` (line under **Canceled**), `sprint: <kebab title>`, `note: split → sprint <name>`. Already has `sprint:` → exit 4 |
| `comment` | no-op |
| `depend` | add slugs to task frontmatter `blocked_by: [<slug>, …]` (inline list, no duplicate). `get` reads it back as blockers, open = blocker not `done`/`canceled` (**reference/blockers.md**). Old `note:` `Depends on …` text = hint only |
| `claims` | always empty |
| `branch` | `<branch.prefix><slug>` when `branch.per_task`, else current branch |

Ticket ids are slugs here, not numbers; `/wa-board` display indexes resolve to slugs.
