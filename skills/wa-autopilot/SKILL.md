---
name: wa-autopilot
description: Auto mode — runs a batch of tasks unattended, in parallel when they don't collide.
---

# /wa-autopilot

`/wa-code` unattended, over a batch. Same PM role, same pipeline, one addition: **independent tasks run in parallel, each in its own git worktree.** Give it a batch, walk away, read the report.

## Scope

Given tasks, or every `todo` task if none (confirm the list first if the user is present). Best on small, well-scoped tasks — say so if one looks large or is `grilled: false`.

**Args take slugs or display indexes**, mixed, any order: `/wa-autopilot login-apple`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-autopilot 3 sync-offline`. Indexes are the `#` from the wa-board table — resolve per **wa-board → Task indexes**. Always **echo the resolved list** (`2 → login-apple`). Bad index → stop, say which, don't guess.

## 1. Plan the batch — what can run at once

Do `/wa-code` step 1 (**Plan**) for **every** task in the batch, up front, in the main thread. You now hold one BRIEF per task — which is exactly what tells you whether two tasks can share the clock.

**Two tasks are independent when all of these hold:**
- their `FILES` + `LAYOUT` sets don't intersect — no shared file, no shared target folder;
- neither's `REUSE` names something the other creates;
- they sit in different features/modules (`BOUNDARIES` don't overlap).

Any doubt → **sequential**. A merge conflict at 3am costs more than the wall-clock you saved.

Group the batch into **waves**: everything in a wave runs in parallel, waves run one after another. **Cap a wave at 3** — beyond that, builds queue on the machine anyway and the report gets unreadable.

Echo the plan before starting:

```
vague 1 (∥) : login-apple · export-csv
vague 2      : sync-offline   (touche AuthStore, comme login-apple)
```

## 2. Run a wave — one worktree per task

Each task gets its own checkout, so parallel implementers never see each other's edits.

1. **Create the worktree**, from `branch.base`, always branching whatever `branch.per_task` says:
   ```
   git worktree add ../.wa-worktrees/<slug> -b <branch.prefix><slug> <branch.base>
   ```
2. **Spawn one `wa-implementer` per task in the wave, in a single message** so they actually run concurrently. Each gets the standard `/wa-code` step 2 payload **plus its worktree path**, and the instruction: *work only under `<worktree>`, absolute paths, never touch the main checkout or another worktree.*
3. **Verify each task** per `/wa-code` step 3 — two `wa-verifier`, diff hunks from that worktree only. Verifiers are read-only, so they parallelize freely across tasks. **`review.when` doesn't apply here**: nobody validates, there are no feedback rounds, so the close of the task *is* the validation point — every task gets its one fan-out before its commit, whatever the setting says.
4. **Keep every agent alive** — `agentId` per role **per task**. Autopilot is where this pays most: a batch of 5 tasks × 3 rounds is 45 spawns if you forget, 15 if you don't.

**One device, one queue.** Builds run fine in parallel (separate worktrees, separate build dirs), but the **runtime check does not** — there's a single simulator. Serialize it: implementers in a wave build concurrently, then drive the app one at a time. Tell each implementer to hold its runtime check until you say go, or accept that a wave's runtime checks are sequential tail work.

## 3. Close each task

1. **Commit in its worktree**, on its branch, with the configured author name/email. **Never as Claude. Never merge to base. Never touch another branch.**
2. Update the task's status + notes. **Don't** sync wiki/graph unattended — that's `/wa-wiki` after you validate.
3. **Remove the worktree** (`git worktree remove ../.wa-worktrees/<slug>`) — the branch survives, that's what you review later. A blocked task keeps its worktree; say so in the report.

Skip the report-and-iterate phase entirely — nobody's there to iterate with. Save the report to `.whackagent/reports/<slug>.md`.

## Blockers — skip and log, never ask, never guess

The "stop and ask" rule is inverted here: nobody is watching. A `BLOCKED:` from the implementer, a failed runtime check, or any ambiguity →

- set the task `status: todo` with a `blocked` note, write the open question into the task file;
- **move to the next task.** Never guess scope, never invent a feature, never commit an unverified one as done.

A blocker in one task **does not** stall its wave — the others keep going.

## Final report

Print and save `.whackagent/reports/autopilot-<date>.md`:

```
# Autopilot run

## Delivered
- <slug> — branch wa/<slug> — <commits> — review: clean · run: pass

## Blocked
- <slug> — <the open question> — needs your input
```

Obvious at a glance: what's ready to merge, what needs you.

## Next step

Review the delivered branches. Notes on one → **`/wa-feedback <slug> <notes>`** (checks it out, applies them through the same reviewed pipeline). Then **`/wa-wiki`** per validated feature.
