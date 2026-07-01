---
name: wa-prio
description: Prioritize the backlog — decide what matters now and in what order.
---

# /wa-prio

Wear product-owner hat. Decide what matters now, what order.

## Do

1. Read `.whackagent/config.md`, `BACKLOG.md`, `todo` task files.
2. Each todo task, challenge with **YAGNI**: _need this now?_ Three outcomes:
   - **keep** — stays in todo.
   - **defer** — keep but push down order.
   - **cancel** — set `status: canceled`, move under Canceled, note why.
3. **Split** when task too big for one coherent feature: create child task files (`<slug>-<part>.md`), link to parent via `note:`/`wiki:`, mark parent `canceled` or keep as umbrella — your call, tell user.
4. **Re-estimate size** when picture changed (a `large` 🔴 task that got split may now be `medium`/`quickwin`). Update each task's `size`.
5. **Reorder.** Order in **Todo** section = priority (top = next). No numeric labels. Reflect new order in `BACKLOG.md`.
6. Show user before/after using **wa-board table format** (Taille 🟢🟡🔴 / Tâche / Résumé / Grillée), plus rationale for any cancel/split.

## Stop and ask

Priority call depends on product intent you lack? Ask — don't assume.

## Next step

Suggest: **`/wa-code <top-slug>`** to start highest task (or `/wa-task` to clarify first if `grilled: false`).