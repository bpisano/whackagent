## Blockers

Task blocked by another = needs blocker's code landed first. Canonical, every skill.

- **Where** — local: task frontmatter `blocked_by: [<slug>, …]` (inline list), written by `depend` (**providers/local.md**). GitHub: issue *blocked by* relationship — `wa-backlog depend` writes, `get` → `blocked_by` reads (**BOARD.md → Dependencies**).
- **Missing or empty → not blocked.** Task file without `blocked_by:` behaves as before.
- **Set by** `/wa-task` (task builds on another), `/wa-grill` (dependency settled), split (child blocked by sibling it builds on). Always through `depend`, idempotent: slug already listed → nothing.
- **Open** = blocker not `done` (GitHub: blocker `state: open`). `canceled` blocker → blocks nothing, say once (`login-apple canceled → sync-offline unblocked`). Unknown slug (no task file) → say once, blocks nothing.
- **Old free text** `note: Depends on <x>` (before `blocked_by:`) → hint only: `/wa-code` names it in warning, nothing else acts on it. `/wa-setup` reconfigure converts it (migration `0001-blocked-by`).
- **Effects** (open blocker only):
  - board (`/wa-board`, pane, recaps) → ` ⛔ <blocker>` on line 1 (**reference/display.md → Display format**), never suggested as next action. GitHub board: `list` carries no blockers → no ⛔ there; pane task tab shows them.
  - `/wa-code` → warn before work, recommend blocker first, go on only on yes.
  - prioritization (`/wa-task`) → blocker always above blocked.
  - `/wa-autopilot` → local: blocked task stays out of batch until blocker `done`. GitHub: stacking rules, unchanged (**wa-autopilot → 1. Plan the batch**).
