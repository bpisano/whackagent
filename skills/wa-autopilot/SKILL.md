---
name: wa-autopilot
description: Auto mode — runs batch of tasks unattended, in parallel when they don't collide.
---

# /wa-autopilot

`/wa-code` unattended, over batch. Same PM role, same pipeline, one addition: **independent tasks run parallel, each in own git worktree.** Give batch, walk away, read report.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

## Scope

Given tasks, or every `todo` task if none (confirm list first if user present). Best on small well-scoped tasks — say so if one look large or is still `draft`.

**Args take task ids or sprint name**, mixed, any order: `/wa-autopilot 42`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-autopilot 3 add-apple-login`, `/wa-autopilot "Login refacto"`. Resolve per **wa-board → Task ids**. Always **echo resolved list** (`#42 → Add Apple login`). Bad id → stop, say which, no guess.

**Sprint name expands to its `todo` tasks**, backlog order — `draft` isn't ready, `coding`, `to-test`, `to-close` already moving or waiting on user: don't touch. Resolve per **wa-board → Sprints**; echo expansion (`Login refacto → #42 · #43 · #45 (3 todo, 2 already to test)`) so user see what left out. Sprint with no todo task → say so, stop. Sprint tasks usually touch same screen, so expect most land in **separate waves** — wave planner doing job, not failure.

## 1. Plan the batch — what can run at once

Do `/wa-code` step 1 (**Plan**) for **every** task in batch, up front, main thread. Now hold one BRIEF per task — that tell you if two tasks share clock.

**Two tasks independent when all hold:**
- `FILES` + `LAYOUT` sets don't intersect — no shared file, no shared target folder;
- neither's `REUSE` names something other creates;
- different features/modules (`BOUNDARIES` don't overlap).

Any doubt → **sequential**. Merge conflict at 3am cost more than wall-clock saved.

Group batch into **waves**: everything in wave runs parallel, waves run one after another. **Cap wave at 3** — beyond that, builds queue on machine anyway and report get unreadable.

Echo plan before start:

```
wave 1 (∥) : #42 Add Apple login · #47 Export reports as CSV
wave 2     : #51 Sync offline changes   (touches AuthStore, like #42)
```

## 2. Run a wave — one worktree per task

Each task get own checkout, so parallel implementers never see each other's edits.

1. **Create worktree**, always branching whatever `branch.per_task` says. Fork point per `/wa-code` step 0: `branch.base`, **or sprint branch** when task carry `sprint:` and `branch.sprint_prefix` non-empty — create `<branch.sprint_prefix><kebab(sprint)>` from `branch.base` once, before wave, then fork every task of that sprint off it.
   ```
   git worktree add ../.wa-worktrees/<key> -b <branch.prefix><key> <fork point>
   ```
   **Sprint branch is created in the main checkout, never inside a worktree**, and only once per sprint per run — two waves of the same sprint share it. Tasks of one sprint in the *same* wave still fork off the sprint branch as it stood at wave start: they run in parallel, so none see each other. That's the wave planner's job to have made safe.
2. **Spawn one `wa-implementer` per task in the wave, in a single message** so they actually run concurrently. Each gets the standard `/wa-code` step 2 payload **plus its worktree path**, and the instruction: *work only under `<worktree>`, absolute paths, never touch the main checkout or another worktree.*
3. **No verifier here** — `review.when: on_validation` holds, and unattended is exactly where it holds hardest: the user's review is **async**, so a task that gets reworked tomorrow morning would have been reviewed tonight for nothing. Autopilot delivers *code*, built and run; the verifier runs later, when the user runs **`/wa-validate <id>`** on the branch. `review.when: each_round` → then yes, one per task per `/wa-code` step 3 (diff hunks from that worktree only; verifiers are read-only, so they parallelize freely across tasks).
4. **Keep every agent alive** — `agentId` per role **per task**. Autopilot is where this pays most: a batch of 5 tasks × 3 rounds is 15 spawns if you forget, 5 if you don't.

**The runtime check is on by default here** — `verify.mode: autopilot` (the default) means the implementer drives the app it just built. Nobody is at the keyboard to catch a green build that doesn't work, so unattended is exactly where that proof is worth its cost. Only `verify.mode: off` skips it; `always` behaves the same as here. Non-runnable project (no app target, no device, no MCP server) → build + tests are the proof, say so in the report rather than claiming a check nobody ran.

**One device, one queue.** Builds run fine in parallel (separate worktrees, separate build dirs), but the **runtime check does not** — there's a single simulator. Serialize it: implementers in a wave build concurrently, then drive the app one at a time. Tell each implementer to hold its runtime check until you say go, or accept that a wave's runtime checks are sequential tail work.

## 3. Close each task

1. **Commit in its worktree**, on its branch, with the configured author name/email. **Never as Claude. Never merge to base. Never touch another branch.** The commit is the delivery, not a close: the code is unreviewed by the verifier and unseen by the user, sitting on a branch nobody merged.
2. **State `to-test`** + notes in `## Implementation` / `## Verification`, per **wa-board → Task store** — never `done`, never `to-close`. A task leaves autopilot waiting for the user to test it, exactly like one from `/wa-code`. **Never merge into the sprint branch here** — that's `/wa-close`, after the user's review; an unreviewed merge poisons the base of every later task in the sprint. **Don't** sync wiki/graph unattended — that's `/wa-wiki` after it closes.
3. **Remove the worktree** (`git worktree remove ../.wa-worktrees/<key>`) — the branch survives, that's what you review later. A blocked task keeps its worktree; say so in the report.

Skip the report-and-iterate phase entirely — nobody's there to iterate with. Save the report to `{reports}/<key>.md` (`{…}` from the config's `paths:` block, see **wa-board → Paths**) — **in the main checkout, never inside a worktree**: the worktree gets removed and the report with it.

## Blockers — skip and log, never ask, never guess

The "stop and ask" rule is inverted here: nobody is watching. A `BLOCKED:` from the implementer, a failed runtime check, or any ambiguity →

- set the task back to `todo` with a `blocked` note, write the open question into the task (`## Implementation`);
- **move to the next task.** Never guess scope, never invent a feature, never commit an unverified one as done.

A blocker in one task **does not** stall its wave — the others keep going.

## Final report

Print and save `{reports}/autopilot-<date>.md`:

```
# Autopilot · 2026-09-18 · 🏁 Login refacto 2/3

#42 · 🟢 **Add Apple login** — to test
#43 · 🟡 **Rework login form** — to test
#45 · 🟢 **Add password reset** — ⛔ blocked

---
## 🟢 #42 Add Apple login · branch wa/42-add-apple-login
<report card>

## 🟡 #43 Rework login form · branch wa/43-rework-login-form
<report card>

---
## ⛔ #45 Add password reset
Question: reset by email or magic link?
Reco: magic link, already in place for signup.

→ next: /wa-validate 42
```

Three parts, always this order:

1. **Recap** — every task of the batch, **wa-board list format** (line 1 only), suffix `— to test` or `— ⛔ blocked`. Sprint in play → progress line in title; several sprints → group recap by sprint.
2. **One card per delivered task** — **wa-code → Report card**, branch in header instead of sprint tag. Same skeleton as attended `/wa-code`.
3. **Blocked** — per task: open question + your recommended answer, one line each. Kept worktree → say so.

One branch per task still, never one per sprint: user reviews and merges task by task. Never write `review: clean` for a task the verifier never saw.

## Next step

Test the delivered branches. Notes on one → **`/wa-feedback <id> <notes>`** (checks it out, applies them through the same pipeline). Matches spec → **`/wa-validate <id>`** (verifier on the whole branch), then **`/wa-close <id>`** after your retest — it merges into the sprint branch or lands per `close.strategy`. Then **`/wa-wiki`**.