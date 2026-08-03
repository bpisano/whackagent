---
name: wa-board
description: Renders a dashboard and suggests the next action based on the project's whackagent backlog.
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

## Do

1. Read `.whackagent/config.md` (respect discussion language). Missing → tell user run `/wa-setup`, stop.
2. Read `{backlog}` + referenced task files (need each task `summary`, `size`, `grilled`).
3. Render backlog as **table**, one section per status (see Display format below), priority order within each.
4. Suggest exactly **one** next action, by state:
   - something in `validated` → reviewed, wait user retest: `/wa-validate <slug>` again to close (or `/wa-feedback` if retest found something). Highest precedence — one step from done.
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

- **#** column = display index. Number **continuously across sections**, top to bottom in render order (In progress → Todo → Review → Validated → Done → Canceled). **Review** = coded, wait your test. **Validated** = you said it match spec, verifier passed, wait your retest to close. Never restart per section — index must be unique in render so user cite it without ambiguity.
- **Taille** column maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **Grillée** column maps `grilled`: ✅ true · ⚠️ false.
- **Résumé** = task `summary` (one line). Never dump full task body.
- **Tâche** = title. Keep rows scannable.
- Skip empty sections. Show only few recent under **Done**.
- Put size legend (🟢 quick win · 🟡 moyen · 🔴 gros) once below tables.

## Paths

Every whackagent skill writes `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` instead of literal folder. They resolve from `paths:` in `.whackagent/config.md`, read at step 1 — project may keep wiki in `docs/wiki/` so team that doesn't run whackagent still read it.

- **Key missing → the default** (`.whackagent/BACKLOG.md`, `.whackagent/tasks`, `.whackagent/wiki`, `.whackagent/reports`, `.whackagent/conventions`). Config written before `paths:` existed keep working untouched.
- **Relative resolves from repo root**, not cwd. Absolute paths allowed.
- **`.whackagent/config.md` is the one fixed path** — it carry the others.
- Path points at nothing → say which key and what it points at, suggest `/wa-setup`. Never fall back to `.whackagent/` behind user back, never create folder somewhere else: wiki silently written to default is wiki team never sees.

## Task indexes

Index is **display-only**, derived from current backlog order. Never written into `{backlog}` or task files — order alone carry priority, so index shifts when order shifts.

Any skill taking a task can take indexes instead of slugs: `/wa-code 3`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-task 3`. Resolve by re-reading `{backlog}` and re-deriving same numbering (rules above), then:

- Echo resolved mapping (`2 → login-apple`, `3 → sync-offline`) before work, so user catch stale index.
- Index out of range or pointing at section that make no sense for command → say so, stop, don't guess neighbour.
- Ambiguous input (slug that look like number) → treat as slug if task file match, else index.

## Output

Tables, then one bold **→ next:** line. No re-explain whole flow each time.