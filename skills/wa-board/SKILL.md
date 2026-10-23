---
name: wa-board
description: Shows the backlog and the next step.
---

# /wa-board

Shows the backlog, points at one next move.

Read: voice, components, tasks, store

## Steps

1. **Read the arg.**
   - None → whole backlog.
   - Type (`bug`, `feature`, `improvement`, `refactor`) → only that type. Beats a sprint of the same name.
   - Sprint name → only its tasks, 🏁 line on top (**tasks → Sprints** to resolve).
2. **List** every task per **store**: title, summary, size, type, sprint, status, blockers, locks.
   - Legacy task → `→ next: /wa-update`, stop.
   - `board` + `reconcile.log` (**store → Reconcile**) → **Warning** `⚠️ board out of sync — <its line>` first.
3. **Show** a **Task list**.
   - `board` → one line after it for open tasks not on the board.
4. **Pick one next**, first match wins (sprint view → inside that sprint):
   1. `board` sprint complete, branch not merged, no PR → offer the sprint PR (**wa-close → Sprint landing**). Ask, never open it here.
   2. `to-close` → `/wa-close <id>` (retest found something → `/wa-feedback`)
   3. `to-test` → `/wa-feedback <id> <notes>`, or `/wa-validate <id>`
   4. `coding` → `/wa-code <id>` resumes
   5. top unblocked `todo` → `/wa-code <id>`
   6. top unlocked `draft` → `/wa-task <id>`
   7. empty backlog, no `{wiki}/pitch.md` → `/wa-pitch <pitch>`
   8. else → `/wa-task <idea>` (or `/wa-draft <idea>`)
   - Several small `todo` → also mention `/wa-autopilot`.

## Never

- Never suggest a blocked task.
- Never suggest reprioritizing. User asks → `/wa-task` with no arg.
- Never change a task, branch or board here.

## Next

- One **Next** line, from step 4.
