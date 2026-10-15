---
name: wa-autopilot
description: Codes several tasks unattended, in parallel when they don't overlap.
---

# /wa-autopilot

`/wa-code` unattended, over batch. Same PM role, same pipeline, one addition: **independent tasks run parallel, each in own git worktree.** Give batch, walk away, read report.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, grammar last, bullets over prose, tech terms stay English in every language (franglais, never literal translation).

## Scope

Given tasks, or every `todo` task if none (confirm list first if user present). Best on small well-scoped tasks — say so if one look large or is still `draft`.

**Args take task ids or sprint name**, mixed, any order:
- Examples: `/wa-autopilot 42`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-autopilot 3 add-apple-login`, `/wa-autopilot "Login refacto"`.
- Resolve per **wa-board → Task ids**.
- Always **echo resolved list** (`#42 → Add Apple login`).
- Bad id → stop, say which, no guess.

**Sprint name expands to its `todo` tasks**, backlog order.
- `draft` isn't ready → don't touch.
- `coding`, `to-test`, `to-close` already moving or waiting on user → don't touch.
- Resolve per **wa-board → Sprints**.
- Echo expansion (`Login refacto → #42 · #43 · #45 (3 todo, 2 already to test)`) so user see what left out.
- Sprint with no todo task → say so, stop.
- Sprint tasks usually touch same screen → expect most land in **separate waves**. Wave planner doing job, not failure.

**Only `todo`.** Autopilot never grills: `draft` needs `/wa-task` with user there. Drop it from batch, say so.

**Blocked tasks → stack**, per **wa-board → Dependencies → Stacking**. Parallel as much as possible, stacked when needed. **Rule, not a question — never ask, never wait for a yes.**
- Open blocker inside batch → blocker runs first, task goes in a later wave, branch stacked on blocker's.
- Open blocker outside batch, already delivered (`to-test` / `to-close`) → stack on its branch, any wave.
- Open blocker outside batch, not coded → nothing to stack on: task skipped, `⛔ waits #x`.
- Blocker ends this run blocked → its dependents skipped, `⛔ waits #x`. Never stack on code that didn't build.
- Echo with resolved list (`#44 ⇡ stacked on #42`, `#48 ⛔ waits #12`), so user sees plan before walking away.

## 1. Plan the batch — what can run at once

Do `/wa-code` step 1 (**Plan**) for **every** task in batch, up front, main thread. Now hold one BRIEF per task — that tell you if two tasks share clock.

**Two tasks independent when all hold:**
- `FILES` + `LAYOUT` sets don't intersect — no shared file, no shared target folder;
- neither's `REUSE` names something other creates;
- different features/modules (`BOUNDARIES` don't overlap).

Any doubt → **sequential**. Merge conflict at 3am cost more than wall-clock saved.

Group batch into **waves**:
- Everything in wave runs parallel, waves run one after another.
- **Cap wave at 3** — beyond that, builds queue on machine anyway and report get unreadable.

**Dependencies order waves, never shrink batch.**
- Task goes in first wave after its last blocker's wave, stacked on it.
- Two tasks stacked on same blocker → same wave when independent of each other.
- Earliest wave possible for everything: stack only where a blocker forces it.

Echo plan before start:

```
wave 1 (∥) : #42 Add Apple login · #47 Export reports as CSV
wave 2 (∥) : #44 Add Apple onboarding (⇡ stacked on #42) · #51 Sync offline changes (touches AuthStore, like #42)
```

## 2. Run a wave — one worktree per task

Each task get own checkout, so parallel implementers never see each other's edits.

0. **`github`: claim first**, per task, just before its wave — `github-board claim <n> coding` (**wa-board → Task store → Locks**).
   - Exit 3 → someone mid-round: skip, report owner (`🔒 #42 coding — alice@mbp 2h`).
   - Exit 4 → state moved since planning: skip, say state.
   - Never retry, never steal.
   - Lost claim doesn't stall wave.
1. **Create worktree.**
   - `github` → **from task branch**, which exists since grill (`github-board get <n>` → `branch`):
     - `git fetch origin <branch>` then `git worktree add ../.wa-worktrees/<key> <branch>`.
     - Base already set at grill (sprint branch or `branch.base`) — nothing to fork, no sprint branch to create.
     - Branch checked out elsewhere (main checkout, stale worktree) → git refuses: skip task, say where, release lock `--reset-to todo`.
   - `files` → new branch, always, whatever `branch.per_task` says:
     - Fork point per `/wa-code` step 0: `branch.base`, **or sprint branch** when task carry `sprint:` and `branch.sprint_prefix` non-empty.
     - Sprint branch → create `<branch.sprint_prefix><kebab(sprint)>` from `branch.base` once, before wave, then fork every task of that sprint off it.
     ```
     git worktree add ../.wa-worktrees/<key> -b <branch.prefix><key> <fork point>
     ```
   - **Stacked task** (blocker delivered, not landed) → **wa-board → Dependencies → Stacking**:
     - `files` → fork point = blocker branch tip, not base.
     - `github` → worktree from task branch as above, then `git rebase --onto origin/<blocker branch> <its base>` inside it, no push.
     - Blocker delivered this run → its branch tip is its round-end commit, worktree already removed.
     - Write `stacked on: <blocker branch> @ <sha>` in task `## Implementation`, tell implementer blocker code is there to reuse.
   - **Sprint branch is created in the main checkout, never inside a worktree**, and only once per sprint per run — two waves of the same sprint share it.
     - Tasks of one sprint in the *same* wave still fork off the sprint branch as it stood at wave start: they run in parallel, so none see each other.
     - Wave planner's job to have made that safe.
2. **Spawn one `wa-implementer` per task in the wave, in a single message** so they actually run concurrently.
   - Each gets the standard `/wa-code` step 2 payload **plus its worktree path**.
   - Plus the instruction: *work only under `<worktree>`, absolute paths, never touch the main checkout or another worktree.*
3. **No verifier here** — `review.when: on_validation` holds, and unattended is exactly where it holds hardest.
   - Why: user's review is **async**, so a task reworked tomorrow morning would have been reviewed tonight for nothing.
   - Autopilot delivers *code*, built and run.
   - Verifier runs later, when user runs **`/wa-validate <id>`** on the branch.
   - `review.when: each_round` → then yes, one per task per `/wa-code` step 3. Diff hunks from that worktree only. Verifiers are read-only, so they parallelize freely across tasks.
4. **Keep every agent alive** — `agentId` per role **per task**. Autopilot is where this pays most: a batch of 5 tasks × 3 rounds is 15 spawns if you forget, 5 if you don't.

**The runtime check is on by default here**:
- `verify.mode: autopilot` (the default) → implementer drives the app it just built.
- Why: nobody at keyboard to catch a green build that doesn't work, so unattended is exactly where that proof is worth its cost.
- Only `verify.mode: off` skips it; `always` behaves the same as here.
- Non-runnable project (no app target, no device, no MCP server) → build + tests are the proof. Say so in report rather than claiming a check nobody ran.

**One device, one queue.**
- Builds run fine in parallel (separate worktrees, separate build dirs).
- The **runtime check does not** — single simulator.
- Serialize it: implementers in a wave build concurrently, then drive the app one at a time.
- Tell each implementer to hold its runtime check until you say go, or accept that a wave's runtime checks are sequential tail work.

## 3. Close each task

1. **State `to-test`** + notes in `## Implementation` / `## Verification`, per **wa-board → Task store** — never `done`, never `to-close`.
2. **Commit in its worktree**, on its branch, author per **wa-board → Commits** — task file included.
   - **Never as Claude, never a co-author. Never merge to base. Never touch another branch.**
   - Commit is the delivery, not a close: code unreviewed by verifier, unseen by user, sitting on a branch nobody merged.
   - **`github` → round end** per **wa-board → Task store → task branch and rounds**:
     - Push (hook moves card to `To test`, drops lock).
     - First delivery → `gh pr create --draft --base <base> --head <branch>` (stacked task: `--base <blocker branch>`, push `--force-with-lease`; title/body per **wa-board → Voice → PR wording**) + `github-board link-pr <n> <pr>`.
     - Then `gh pr view --json mergeable` → `CONFLICTING` → rebase task range on base, rebuild, `push --force-with-lease`, check again.
     - Conflict needing a design call → leave it, log as blocker.
   - A task leaves autopilot waiting for the user to test it, exactly like one from `/wa-code`.
   - **Never merge into the sprint branch here** — that's `/wa-close`, after the user's review. Why: unreviewed merge poisons base of every later task in the sprint (`github`: and marks the task PR merged → `Done` untested).
   - Testing them together is the **test branch**, step 4.
   - **Don't** sync wiki/graph unattended — that's `/wa-wiki` after it closes.
3. **Remove the worktree** (`git worktree remove ../.wa-worktrees/<key>`) — the branch survives, that's what you review later. A blocked task keeps its worktree; say so in the report.

Skip the report-and-iterate phase entirely — nobody's there to iterate with.

Save the report to `{reports}/<key>.md` (`{…}` from the config's `paths:` block, see **wa-board → Paths**) — **in the main checkout, never inside a worktree**: worktree gets removed and report with it.

## 4. Test branch — mandatory, end of run

User comes back, launches project, **every feature coded this run is there**. Never N branches to check out for N features. Not optional, not skipped because tasks are standalone.

After last wave, worktrees removed, pick by what was delivered:

- **One task delivered** → check out its branch (sprint task: sprint test branch, per **wa-board → Sprint test branch**).
- **Every delivered task in one sprint** → sprint test branch, per **wa-board → Sprint test branch**: sprint + every task of sprint in `to-test` / `to-close` (this run's and earlier ones).
- **Anything else** (standalone tasks, several sprints, mix) → **run test branch** `<branch.prefix>autopilot-<YYYY-MM-DD>-test` (default `wa/autopilot-2026-10-15-test`):
  ```
  git checkout -B <run test branch> <branch.base>   # github: origin/<branch.base>, fetched
  git merge --no-ff --no-edit <task branch>         # every task delivered this run, board order, blocker before stacked
  ```
  - `github` → merge `origin/<task branch>` (round end pushed it).
  - Sprint task branch brings its sprint branch along — expected.
  - Same rules as sprint test branch: local, throwaway, never pushed, never PR'd, never a fork point, never committed on, rebuilt from scratch. Merge commits per **wa-board → Commits**.
  - Same name already there with commits made on it → don't rebuild, use `-2`, `-3`… suffix.
  - Older `autopilot-*-test` branches whose tasks are all `done` → delete them, say so.
- **Nothing delivered** (all blocked / skipped) → no branch, stay put, say so.

Unattended rules — never ask:
- **Two tasks conflict** → `git merge --abort`, skip that task, keep the rest, log `⚠️ #45 not in test branch — conflicts with #42 (<files>)`. Never resolve on throwaway branch.
- **Commits found on existing sprint test branch** → leave it untouched, fall back to run test branch instead.
- **Dirty main checkout** → never stash, never discard. Build branch anyway in temp worktree (`git worktree add ../.wa-worktrees/autopilot-test -B <branch> <base>`, merges there, remove worktree), don't check out, report `⚠️ built <branch>, not checked out — dirty tree (<files>) · git checkout <branch>`.
- Check `git branch --show-current` before final report — the line says where user actually is.

## Blockers — skip and log, never ask, never guess

The "stop and ask" rule is inverted here: nobody is watching. A `BLOCKED:` from the implementer, a failed runtime check, or any ambiguity →

- set the task back to `todo` with a `blocked` note, write the open question into the task (`## Implementation`);
  - `github`:
    - `status: todo` stays in file, commit question + push. The push releases lock — hook sees `todo`, card back to `Todo`.
    - Nothing worth pushing (failed before any edit) → `github-board release <n> coding --reset-to todo --reason "BLOCKED: <question>"`.
    - Never leave a lock held;
- **move to the next task.** Never guess scope, never invent a feature, never commit an unverified one as done.

A blocker in one task **does not** stall its wave — the others keep going.

## Final report

Print and save `{reports}/autopilot-<date>.md`:

```
# Autopilot · 2026-09-18 · 🏁 Login refacto 2/3

#42 · 🟢 **Add Apple login** — to test
#43 · 🟡 **Rework login form** — to test
#45 · 🟢 **Add password reset** — ⛔ blocked
#44 · 🟡 **Add Apple onboarding** · ⛔ #42 — to test · ⇡ stacked on #42
#48 · 🟡 **Add passkey login** · ⛔ #12 — skipped
#46 · 🟢 **Fix login errors** · 🔒 alice@mbp 2h — skipped

test branch: wa/autopilot-2026-09-18-test = #42 · #43 · #44 — you're on it

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

1. **Recap** — every task of the batch, **wa-board list format** (line 1 only, `⛔ #x` / `🔒 owner age` markers included), plus one suffix:
   - `— to test`, + `· ⇡ stacked on #x` when stacked (tells user to land `#x` first).
   - `— ⛔ blocked` (open question).
   - `— skipped` (blocker not coded or itself blocked, lock taken, state moved).

   Sprint in play → progress line in title. Several sprints → group recap by sprint.
   Then **test branch line** (step 4), always: name, what's in it, what's not and why, `you're on it` — or why not checked out / not built.
2. **One card per delivered task** — **wa-code → Report card**, branch in header instead of sprint tag (`github`: draft PR link too). Same skeleton as attended `/wa-code`.
3. **Blocked** — per task: open question + your recommended answer, one line each. Kept worktree → say so.

- One branch per task still: user reviews and lands task by task.
- Test branch (sprint or run) is only where they're tested together — never reviewed, never landed.
- Never write `review: clean` for a task the verifier never saw.

## Next step

Test — everything from the test branch you're on.

- Notes on one → **`/wa-feedback <id> <notes>`** (checks it out, applies them through the same pipeline).
- Matches spec → **`/wa-validate <id>`** (verifier on the whole branch), then **`/wa-close <id>`** after your retest.
- That close syncs the wiki and lands (`files`: sprint merge or `close.strategy`; `github`: draft PR marked ready, you merge).
- `/wa-close` alone also works — it runs the validate pass itself.