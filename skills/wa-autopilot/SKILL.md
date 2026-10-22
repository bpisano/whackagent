---
name: wa-autopilot
description: Codes several tasks unattended, in parallel when they don't overlap.
---

# /wa-autopilot

`/wa-code` unattended, over a batch. Independent tasks run in parallel, one git worktree each. Ends on a test branch with every feature.

Read: voice, pr, components, tasks, git, store

## Steps

1. **Resolve the batch** (**tasks → Ids**, **tasks → Sprints**).
   - Ids, ranges, lists, sprint names, mixed, any order.
   - No arg → every `todo` task. User present → confirm the list first.
   - Sprint → its `todo` tasks, backlog order. Echo what's left out and why (`Login refacto → #42 · #43 (2 todo, 2 already to test)`). No `todo` → say so, stop.
   - `draft` → drop, point to `/wa-task`. Other states → drop, say so.
2. **Place blockers** — stack, per **git → Stacking**:
   - Blocker in batch → it runs first; dependent in a later wave, stacked on it.
   - Blocker outside batch, `to-test` / `to-close` → stack on its branch, any wave.
   - Blocker outside batch, not coded → skipped, `⛔ #x`.
   - Blocker ends this run blocked → its dependents skipped.
   - Echo with the resolved list: `#44 ⇡ #42`, `#48 ⛔ #12`.
3. **Plan the waves.**
   - Run `/wa-code`'s Plan for **every** task up front, main thread. One BRIEF per task.
   - Independent = all hold:
     - `FILES` + `LAYOUT` disjoint: no shared file, no shared target folder.
     - Neither's `REUSE` names what the other creates.
     - `BOUNDARIES` don't overlap.
   - Any doubt → sequential.
   - Wave = runs in parallel. Waves run in order. Max 3 per wave.
   - Dependent → first wave after its last blocker's. Same-blocker dependents share a wave when independent. Earliest wave possible otherwise.
   - Echo the waves as **Plan** batch lines, then start. No `ok?`.
4. **Set up each task**, just before its wave:
   - `board` → `claim <n> coding` (**store → Locks**). Exit 3 → skipped, `🔒` owner. Exit 4 → skipped, say state. A lost claim never stalls the wave.
   - Worktree at `../.wa-worktrees/<key>`:
     - `board` → task branch from `get <n>`: `git fetch origin <branch>`, `git worktree add ../.wa-worktrees/<key> <branch>`. Base already set.
       - Branch checked out elsewhere → skipped, say where, `release <n> coding --reset-to todo --unassign me`.
     - `files` → always a new branch, whatever `branch.per_task`: `git worktree add ../.wa-worktrees/<key> -b <branch.prefix><key> <fork point>` (**git → Task branch**).
       - Sprint branch missing → create it once per run, in the main checkout, before the wave. Later waves reuse it.
       - Same-wave sprint tasks fork off it as at wave start.
   - Stacked → **git → Stacking**. Blocker coded this run → its round-end commit, worktree already gone.
5. **Spawn the wave** — one `wa-implementer` per task, **in a single message**.
   - Payload = `/wa-code` step 5 payload with `autopilot: true`, + worktree path.
   - Plus: _work only under `<worktree>`, absolute paths, never the main checkout or another worktree._
   - Stacked → say the blocker's code is there to reuse.
6. **Check.**
   - `review.when: on_validation` → no verifier. `/wa-validate` runs it later.
   - `review.when: each_round` → one verifier per task (**wa-code → Verify**), hunks from that worktree only. In parallel.
   - Keep `agentId` per role **per task**. Resume, never respawn.
   - Runtime check: `verify.mode: autopilot` (default) or `always` → implementer drives the app. `off` → skipped.
   - One device: builds run in parallel, runtime checks one at a time. Tell implementers to hold theirs until you say go.
   - Non-runnable project → build + tests are the proof. Say so.
7. **Deliver each task.**
   - State `to-test`, notes in `## Implementation` / `## Verification` (**store**).
   - Commit in its worktree, on its branch, task file included (**git → Commits**).
   - `board` → round end (**store → Rounds**). Stacked: PR `--base <blocker branch>`. Conflict needing a design call → blocker (step 8).
   - Remove the worktree. Branch stays.
   - Save the task's **Report** to `{reports}/<key>.md`, in the main checkout.
   - No report-and-iterate phase.
8. **Blocked** — `BLOCKED:`, failed runtime check, any ambiguity:
   - Task back to `todo`, `blocked` note, open question in `## Implementation`.
   - `board` → commit + push: the push frees the lock, card → `Todo`. Nothing to push → `release <n> coding --reset-to todo --unassign me --reason "BLOCKED: <question>"`.
   - Keep its worktree. Move on: the wave keeps going.
9. **Build the test branch** → **Test branch**.
10. **Report** — **Batch report**, printed and saved to `{reports}/autopilot-<date>.md`.
    - `git branch --show-current` first: the **Branch line** says where the user is.
    - Stacked → `⇡ #x`: land `#x` first.
    - Report per delivered task: its **Branch line** is the batch-report variant.
    - Blocked: kept worktree → say so.

## Test branch

Mandatory. User launches once, every feature coded this run is there. After the last wave:

- Nothing delivered → no branch, stay put, say so.
- One task → its branch. Sprint task → its sprint test branch.
- All delivered tasks in one sprint → sprint test branch (**git → Sprint test branch**).
  - Commits found on it → leave it, build the run test branch.
- Else → **run test branch** `<branch.prefix>autopilot-<YYYY-MM-DD>-test`:
  ```
  git checkout -B <run test branch> <branch.base>   # board: origin/<branch.base>, fetched
  git merge --no-ff --no-edit <task branch>         # board: origin/<task branch>
  ```

  - Every task delivered this run, board order, blocker before stacked.
  - Sprint task branch brings its sprint branch along: expected.
  - Same rules as **git → Sprint test branch**: local, throwaway, conflicts skipped.
  - Same name with commits on it → don't rebuild, add `-2`, `-3`…
  - Older `autopilot-*-test` with all tasks `done` → delete, say so.
- Dirty main checkout → build in `git worktree add ../.wa-worktrees/autopilot-test -B <branch> <base>`, merge there, remove it. Don't check out. **Warning** `⚠️ built <branch>, not checked out — dirty tree (<files>) · git checkout <branch>`.

## Never

- Never ask, never wait for a yes. Skip and log.
- Never grill. `draft` stays out.
- Never guess scope, invent a feature, or deliver unverified work as done.
- Never stack on code that didn't build.
- Never retry or steal a lock. Never leave one held.
- Never set `done` or `to-close`.
- Never merge into base or the sprint branch: `/wa-close` does.
- Never touch another task's branch.
- Never stash or discard. Never resolve a conflict on a test branch.
- Never sync wiki or graph.
- Never save a report inside a worktree.
- Never `review: clean` for a task the verifier never saw.
- Test branch: never reviewed, never landed. One branch per task stays the unit.

## Next

- Test everything on the test branch.
- Notes on one → `/wa-feedback <id> <notes>`.
- Matches spec → `/wa-validate <id>`, retest, `/wa-close <id>`. `/wa-close` alone runs validate too.
