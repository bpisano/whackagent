---
name: wa-board
description: Renders a dashboard and suggests the next action based on the .whackagent/BACKLOG.md.
---

# /wa-board

Dashboard. Lift lid on backlog, point at next move.

## Do

1. Read `.whackagent/config.md` (respect discussion language). If `.whackagent/` missing, tell user run `/wa-setup` and stop.
2. Read `.whackagent/BACKLOG.md` and referenced task files (need each task `summary`, `size`, `grilled`).
3. Render backlog as **table**, one section per status (see Display format below), priority order within each.
4. Suggest exactly **one** next action, by state:
   - something `in-progress` → resume it (`/wa-code <slug>`)
   - top `todo` not grilled → `/wa-task <slug>` to clarify (note: quick wins skip straight to `/wa-code`)
   - top `todo` grilled → `/wa-prio` if order stale, else `/wa-code <slug>`
   - nothing in todo → `/wa-task <description>` to create one
   - batch of small grilled tasks → mention `/wa-autopilot` as option

## Display format

Canonical way tasks shown anywhere in flow (here and `/wa-prio`). One table per non-empty status section, tasks in priority order:

```
### Todo

| Taille | Tâche | Résumé | Grillée |
|:------:|-------|--------|:-------:|
| 🟢 | Login Apple | Sign in with Apple sur l'écran de connexion | ✅ |
| 🔴 | Sync offline | File d'attente + résolution de conflits hors-ligne | ⚠️ |
```

Rules:

- **Taille** column maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **Grillée** column maps `grilled`: ✅ true · ⚠️ false.
- **Résumé** = task `summary` (one line). Never dump full task body.
- **Tâche** = title. Keep rows scannable.
- Skip empty sections. Show only few recent under **Done**.
- Put size legend (🟢 quick win · 🟡 moyen · 🔴 gros) once below tables.

## Output

Tables, then one bold **→ next:** line. Don't re-explain whole flow each time.