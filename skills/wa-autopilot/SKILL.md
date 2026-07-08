---
name: wa-autopilot
description: Auto mode. Good for quick wins and small tasks.
---

# /wa-autopilot

Unattended task cruncher. Give batch, walk away, read report later.

## Scope

Run given slugs, or all `todo` tasks if none given (confirm list first if user present). Best for small, well-scoped tasks — say so if task looks large or `grilled: false`.

## Per-task loop (sequential)

Each task, own branch:

1. **Branch.** Create `<branch_prefix><slug>` (default `wa/<slug>`) from current base branch. Never work on or merge into base branch.
2. **Run `/wa-code` pipeline** with `autopilot: true` — understand → code + test → review (5-category fan-out + autofix loop) → verify (if `verify.enabled`). **Skip report-iteration phase** (nobody to iterate with): no on-screen Q&A, save report to `.whackagent/reports/<slug>.md`. Verifier screenshots go in the report; a `RESULT: fail` or `blocked` from verify freezes the task (see Blockers) — never commit an unverified feature as done.
3. **Commit — branch only.** Commit work to `<branch>` using configured author name/email. **Never as Claude. Never merge to base. Never touch other branches.**
4. **Update task** status + notes. Do **not** sync wiki/graph unattended — that `/wa-wiki` after you validate.

## Blockers — skip and log, never ask, never guess

"Stop and ask" rule inverted here: nobody watching. Task hits `BLOCKED:` (from implementer) or any ambiguity:

- Set task `status: todo` (or `blocked` note), write open question into task file.
- **Move to next task.** No guess scope. No invent features.

## Final report

Batch done, print and save `.whackagent/reports/autopilot-<date>.md`:

```
# Autopilot run

## Delivered
- <slug> — branch wa/<slug> — <commits> — review: clean

## Blocked
- <slug> — <the open question> — needs your input
```

Make obvious at glance what ready to validate/merge, what needs you.

## Next step

Suggest review delivered branches, then **`/wa-wiki`** to sync wiki + graph per validated feature.