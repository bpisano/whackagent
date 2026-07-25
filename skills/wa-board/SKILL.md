---
name: wa-board
description: Renders a dashboard and suggests the next action based on the .whackagent/BACKLOG.md.
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

## Do

1. Read `.whackagent/config.md` (respect discussion language). If `.whackagent/` missing, tell user run `/wa-setup`, stop.
2. Read `.whackagent/BACKLOG.md` + referenced task files (need each task `summary`, `size`, `grilled`).
3. Render backlog as **table**, one section per status (see Display format below), priority order within each.
4. Suggest exactly **one** next action, by state:
   - something in `review` → user hasn't validated it yet: `/wa-feedback <slug> <notes>` if they have notes, else validate it (→ `done`). Takes precedence over starting new work.
   - something `in-progress` → resume it (`/wa-code <slug>`)
   - top `todo` not grilled → `/wa-task <slug>` to clarify (note: quick wins skip straight to `/wa-code`)
   - top `todo` grilled → `/wa-code <slug>`. Backlog order is maintained by `/wa-task`'s prioritization pass — never suggest reprioritizing as a step (if user *asks* to reorder, that's `/wa-task` with no arg).
   - nothing in todo → `/wa-task <description>` to create one
   - batch of small grilled tasks → mention `/wa-autopilot` as option

## Display format

Canonical way tasks shown anywhere in flow (here + `/wa-task`'s prioritization pass). One table per non-empty status section, tasks priority order:

```
### In progress

| # | Taille | Tâche | Résumé | Grillée |
|:-:|:------:|-------|--------|:-------:|
| 1 | 🟡 | Export CSV | Export des rapports en CSV | ✅ |

### Todo

| # | Taille | Tâche | Résumé | Grillée |
|:-:|:------:|-------|--------|:-------:|
| 2 | 🟢 | Login Apple | Sign in with Apple sur l'écran de connexion | ✅ |
| 3 | 🔴 | Sync offline | File d'attente + résolution de conflits hors-ligne | ⚠️ |
```

Rules:

- **#** column = display index. Number **continuously across sections**, top to bottom in render order (In progress → Todo → Review → Done → Canceled). Never restart per section — index must be unique in the render so user can cite it without ambiguity.
- **Taille** column maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **Grillée** column maps `grilled`: ✅ true · ⚠️ false.
- **Résumé** = task `summary` (one line). Never dump full task body.
- **Tâche** = title. Keep rows scannable.
- Skip empty sections. Show only few recent under **Done**.
- Put size legend (🟢 quick win · 🟡 moyen · 🔴 gros) once below tables.

## Task indexes

Index is **display-only**, derived from current backlog order. Never written into `BACKLOG.md` or task files — order alone carry priority, so index shifts when order shifts.

Any skill taking a task can be given indexes instead of slugs: `/wa-code 3`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-task 3`. Resolve them by re-reading `BACKLOG.md` and re-deriving the same numbering (rules above), then:

- Echo resolved mapping (`2 → login-apple`, `3 → sync-offline`) before doing work, so user catch a stale index.
- Index out of range or pointing at a section that make no sense for the command → say so, stop, don't guess neighbour.
- Ambiguous input (slug that look like a number) → treat as slug if a task file match, else index.

## Output

Tables, then one bold **→ next:** line. No re-explain whole flow each time.