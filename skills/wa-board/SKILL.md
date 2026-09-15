---
name: wa-board
description: Renders a dashboard and suggests the next action based on the project's whackagent backlog.
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

## Do

0. **Read arg.** None → whole backlog. Sprint name (`/wa-board login-refacto`) → **filtered view**: only that sprint tasks, plus progress line. Resolve per **Sprints** below; unknown name → say so, list known sprints, stop.
1. Read `.whackagent/config.md` (respect discussion language). Missing → tell user run `/wa-setup`, stop.
2. Read `{backlog}` + referenced task files (need each task `summary`, `size`, `grilled`, `sprint`).
3. Render backlog as **table**, one section per status (see Display format below), priority order within each.
4. Suggest exactly **one** next action, by state (filtered run → scope suggestion to sprint):
   - something in `validated` → reviewed, wait user retest: `/wa-close <slug>` to finish (or `/wa-feedback` if retest found something). Highest precedence — one step from done.
   - something in `review` → coded, wait user test: `/wa-feedback <slug> <notes>` if notes, else `/wa-validate <slug>` to fire verifier. Beats starting new work.
   - something `in-progress` → resume it (`/wa-code <slug>`)
   - top `todo` not grilled → `/wa-task <slug>` to clarify (note: quick wins skip straight to `/wa-code`)
   - top `todo` grilled → `/wa-code <slug>`. Backlog order maintained by `/wa-task` prioritization pass — never suggest reprioritizing as step (if user *asks* to reorder, that `/wa-task` with no arg).
   - nothing in todo → `/wa-task <description>` to create one
   - batch of small grilled tasks → mention `/wa-autopilot` as option

## Display format

Canonical way tasks shown anywhere in flow (here + `/wa-task` prioritization pass). One table per non-empty status section, tasks priority order:

```
### In progress

| # | Taille | Tâche | Sprint | Résumé | Grillée |
|:-:|:------:|-------|--------|--------|:-------:|
| 1 | 🟡 | Export CSV | — | Export des rapports en CSV | ✅ |

### Todo

| # | Taille | Tâche | Sprint | Résumé | Grillée |
|:-:|:------:|-------|--------|--------|:-------:|
| 2 | 🟢 | Login Apple | login-refacto | Sign in with Apple sur l'écran de connexion | ✅ |
| 3 | 🟡 | Login layout | login-refacto | Refonte du formulaire de connexion | ✅ |
| 4 | 🔴 | Sync offline | — | File d'attente + résolution de conflits hors-ligne | ⚠️ |

🟢 quick win · 🟡 moyen · 🔴 gros
🏁 login-refacto — 0/2 (2 todo)
```

Sprint column here because two tasks have one. No sprint anywhere → same tables without it, exactly as before.

Rules:

- **#** column = display index. Number **continuously across sections**, top to bottom in render order (In progress → Todo → Review → Validated → Done → Canceled). **Review** = coded, wait your test. **Validated** = you said it match spec, verifier passed, wait your retest to close. Never restart per section — index must be unique in render so user cite it without ambiguity.
- **Taille** column maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **Grillée** column maps `grilled`: ✅ true · ⚠️ false.
- **Sprint** column = task `sprint`, `—` when empty. All-or-nothing across whole render, never per section: **drop it entirely when no task in render has sprint**, keep it in every table otherwise. Filtered run (`/wa-board <sprint>`) drops it too — every row is that sprint.
- **Résumé** = task `summary` (one line). Never dump full task body.
- **Tâche** = title. Keep rows scannable.
- Skip empty sections. Show only few recent under **Done**.
- Put size legend (🟢 quick win · 🟡 moyen · 🔴 gros) once below tables.
- At least one sprint in play → one **progress line per sprint** under legend, done+canceled excluded from numerator only:
  `🏁 login-refacto — 2/5 (1 en review, 2 todo)`. Filtered run → that single line, above tables.

## Paths

Every whackagent skill writes `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` instead of literal folder. They resolve from `paths:` in `.whackagent/config.md`, read at step 1 — project may keep wiki in `docs/wiki/` so team that doesn't run whackagent still read it.

- **Key missing → the default** (`.whackagent/BACKLOG.md`, `.whackagent/tasks`, `.whackagent/wiki`, `.whackagent/reports`, `.whackagent/conventions`). Config written before `paths:` existed keep working untouched.
- **Relative resolves from repo root**, not cwd. Absolute paths allowed.
- **`.whackagent/config.md` is the one fixed path** — it carry the others.
- Path points at nothing → say which key and what it points at, suggest `/wa-setup`. Never fall back to `.whackagent/` behind user back, never create folder somewhere else: wiki silently written to default is wiki team never sees.

## Sprints

Sprint = **optional kebab-case label** on task (`sprint: login-refacto`), grouping big work split across several tasks. Canonical rules, every skill refers here.

- **No sprint file, no create command.** Sprint exists moment task names it, stops existing when its last task closes. Nothing to declare, nothing to clean up.
- **Truth is task file `sprint:` field.** `{backlog}` echoes it as `· <sprint>` after link; two disagree → task file wins, fix backlog line.
- **Not a status section.** Sprint cuts across statuses — sprint has tasks in todo, review and done at once. Sections stay per status, always.
- **Contiguity.** Tasks of one sprint stay adjacent inside each status section, in sprint own internal order. `/wa-task` prioritization pass maintains that — sprint moves as block.
- **Resolving a name**: match `sprint:` values across all task files, exact first, then unique case-insensitive / kebab-normalized match. No match → say so and list known sprints (sprint with no live task is closed, not typo). Ambiguous → list candidates, stop.
- **Slug vs sprint**: task slug wins over sprint of same name. Name clash → say which one you took.

- **One branch, when `branch.per_task`.** `<branch.sprint_prefix><sprint>` (default `sprint/login-refacto`), created from `branch.base` by whoever needs it first — `/wa-code` step 0 or `/wa-autopilot` wave. Tasks of sprint fork off it and `/wa-close` merges them back, so each task starts from sprint current state. `branch.sprint_prefix: ""` turns that off: tasks use `branch.base` like any other. Nothing merges into sprint branch before its task reviewed and closed.
- **A sprint is complete, never `done`.** No sprint status exists. Complete when no task of it left in `todo`/`in-progress`/`review`/`validated` — `/wa-close` notices and offers to land sprint branch.

Commands taking sprint name: `/wa-board <sprint>` (filtered view), `/wa-autopilot <sprint>` (batch its todo tasks), `/wa-task` (assigns and inherits). `/wa-code`, `/wa-validate`, `/wa-feedback`, `/wa-close` stay **per task** — one task is their unit, and whole sprint unattended is what `/wa-autopilot` already does better.

## Task indexes

Index is **display-only**, derived from current backlog order. Never written into `{backlog}` or task files — order alone carry priority, so index shifts when order shifts.

Any skill taking task can take indexes instead of slugs: `/wa-code 3`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-task 3`. Resolve by re-reading `{backlog}` and re-deriving same numbering (rules above), then:

- Echo resolved mapping (`2 → login-apple`, `3 → sync-offline`) before work, so user catch stale index.
- Index out of range or pointing at section that make no sense for command → say so, stop, don't guess neighbour.
- Ambiguous input (slug that look like number) → treat as slug if task file match, else index.

## Output

Tables, then one bold **→ next:** line. No re-explain whole flow each time.