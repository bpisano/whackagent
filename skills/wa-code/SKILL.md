---
name: wa-code
description: Run the full coding pipeline for a task — understand, code + test, review, report — orchestrating isolated subagents.
---

# /wa-code

Full coding pipeline, one task: **understand → code + test → review → verify → report + iterate**. You orchestrate from main thread; heavy work go to isolated subagents (`wa-implementer`, `wa-reviewer`, `wa-verifier`) — keep main context clean. `wa-autopilot` run same pipeline unattended.

Read `.whackagent/config.md` and task file `.whackagent/tasks/<slug>.md` first.

Arg is a slug **or** a display index from the wa-board table (`/wa-code 3`) — resolve per **wa-board → Task indexes**, echo `3 → sync-offline` before starting.

**Grill gate (soft):** if `grilled: false`, warn *"This task wasn't grilled — quick win, or run `/wa-task <slug>` first?"* Proceed if user confirm quick win.

Set task `status: in-progress` (reflect in `BACKLOG.md`).

## 0. Branch (only if `branch.per_task: true`)

Skip whole step when `branch.per_task: false` — code lands on the current branch, as before.

1. Branch name = `<branch.prefix><slug>` (default `wa/<slug>`). Legacy configs: fall back to `autopilot.branch_prefix` if `branch.prefix` absent.
2. Already on it → nothing to do. Exists but not checked out (resumed task) → check out, don't recreate.
3. Doesn't exist → create from `branch.base` (`current` = branch you're on now; else the named branch, fetched/updated first if it tracks a remote).
4. **Dirty working tree → stop and ask** before any checkout: carry the changes over, stash them, or stay put? Never move a user's uncommitted work silently.
5. Echo one line: `branche: wa/<slug> (base: main)`.

## 1. Understand

- Read task + architecture decisions from its `## Contexte / Décisions`.
- **Find the existing — one exploration pass, here, once.** Targeted Grep/Glob over the task neighborhood: related code, callers and usages, layer boundaries, what already does part of the job. Goal: don't re-code what exists (DRY), understand the surroundings before decomposing.
- **Write the neighborhood brief.** This is what makes the pass pay off — every subagent below gets it **verbatim** instead of re-deriving the same map:

  ```
  BRIEF
  FILES: <path (N lines) — what it does>          ← size on every entry, no exception
         <path (2 400 lines, READ RANGES ONLY: l.1958-2035, l.1512-1544) — what it does>
  REUSE: <what already exists and must be reused, not rewritten>
  BOUNDARIES: <layers/modules involved, dependency direction>
  LAYOUT: <target files/folders to create, per the architecture module>
  GAPS: <what you could not resolve — the only thing subagents explore themselves>
  ```

  Subagents explore only what `GAPS` names, or what their own findings force. Re-deriving the map costs the same pass 6 times over.

  **The line count is not decoration.** Subagents run a hard read budget (no whole-file `Read` above ~400 lines); the `FILES` sizes are what let them respect it without opening a file to find out how big it is. Over the threshold, name the line ranges that matter — that turns an 11k-token read into a 500-token one, and it demonstrably works: an implementer handed `MapLibreView.swift (159 KB — do NOT read it whole; jump to the line ranges)` read only the ranges.
- **Decompose** feature into small modules/bricks. Decide **file/folder layout up front** per the architecture modules (group by feature, proper nesting — never flat).
- **Plan tests.** Sketch what to test (units, edge cases) before coding. YAGNI: only what task needs.

## 2. Code + test

**One implementer for the whole task**, bricks fed to it one at a time (sequential — builds must not collide).

- **Brick 1** — spawn **wa-implementer**, and **note the `agentId` it returns**. Pass: task path, the **BRIEF**, brick (with target files/folders), conventions **dir**, test plan, `build.command` + `build.test_command` when config sets them (the implementer doesn't read config — hand it the commands), `autopilot: false`.
- **Bricks 2..n** — `SendMessage` that id with the next brick **alone**. No conventions dir, no brief, no task re-read: it holds them. Respawning per brick re-reads every convention module and re-explores the tree each time, for nothing.
- Bonus, not just tokens: the same agent built brick 1, so it *knows* what to reuse in brick 2. DRY stops being a rule it must rediscover.
- Same fallbacks as *Resuming agents* below — id lost → fresh spawn with full inputs.

Implementer code feature **and its tests**, then run build and/or tests to prove work. Handle each receipt:
- `RESULT: done` → record files + build/test proof in task's `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask user** the `BLOCKED:` question. Don't dispatch further bricks until resolved.

## 3. Review

When all bricks coded + green, run multi-category review:

1. **Fan out, in parallel** — one **wa-reviewer** per category retained by the gate below (default: all three — `conventions`, `structure`, `correctness`). Pass each its `category`, its module path(s) only (from `review.categories`), changed files **plus the diff hunks**, the **BRIEF**, task path, toggles. **Record the `agentId` each spawn returns** — that's the handle for every later round (see *Resuming agents*). Each loads only its own modules → focused, forgets nothing.
   - **Model per category.** Spawn `conventions` with `model: <review.conventions_model>` (default `sonnet`; `inherit` or absent → don't pass the parameter at all). `structure` and `correctness` always inherit the session model — never pass `model` for those. Rationale: `conventions` matches code against an explicit checklist, the other two have to judge. A resumed agent keeps whatever model it was spawned with, so this is decided once, at round 1.
2. **Aggregate** findings into one severity-ordered list, tagged by category; dedupe.
3. **Autofix** (if `review.autofix: true`): dispatch **wa-implementer** once in **fix mode** with aggregated findings + conventions dir (fix only what findings name, re-read style, add no comments), then **re-review** (back to step 1). Loop until clean or no progress. Cap 3 rounds; if not converging, stop and show remaining findings. A `BLOCKED:` from autofix → stop and ask.
4. Record final per-category findings + what autofix changed in task's `## Review`.

### Gating the fan-out (`review.gate`)

Every reviewer is an isolated agent, and an isolated agent costs **~50k tokens of context before it reads a line** — measured, not guessed. That floor, not the diff, is what a reviewer costs. So: three categories rather than one per rule set, and on a round whose diff *structurally cannot* move a category, don't spawn it at all. `review.gate: always` → all three every round. `review.gate: auto` → the rule below, **recomputed on every round** (a fix round's diff is usually tiny even when round 1's was big).

**Always run, never gated:** `conventions`, `correctness`. Any changed line can carry a style slip, a non-idiomatic construct, or a bug.

**Gated:**
- **`structure`** — runs unless the round's diff is **all of**: no file added/deleted/moved/renamed (git status `A`/`D`/`R`, untracked included) · no new type, protocol, class or module declared · touches ≤ 2 files · ≤ 60 changed lines · stays inside a single layer/feature directory. Any one of those false → it runs. Doubt → it runs.

**Escalation valve — the gate is a default, not a verdict.** Re-open `structure` the moment the round contradicts its premise: an autofix that ends up creating or moving a file, or a `conventions`/`correctness` finding that smells like a boundary or responsibility problem. Cheaper to add one reviewer late than to ship a layering break.

**Say what you skipped.** One line per round: `review: 2/3 (skipped structure — 1 file, 12 lines, no new type)`. A silent skip reads as "reviewed clean by every lens" when it wasn't.

**The verdict is never partial.** When the loop ends on a gated round, run the categories it skipped once — against the final state of the code — before recording `## Review` and telling the user it's clean. Gating saves intermediate rounds; it never buys a cheaper conclusion.

**Catch-up resumes, it doesn't respawn.** If the skipped category already ran earlier in this task, `SendMessage` that agent with the rounds it missed — a fresh agent would pay the ~50k floor again to re-learn what this one already knows. Spawn fresh only if the gate skipped it every single round.

### Resuming agents between rounds

Round 1 spawns. **Rounds 2+ resume the same agents** (`SendMessage`) instead of spawning fresh ones — they still hold the conventions, the BRIEF, and the code they just saw, so a round costs a delta instead of a full re-read.

**The handle is the `agentId`, not a name.** A spawn returns an id like `a2f42843b98bdce70`; that's what `SendMessage` targets. There is no way to name an agent at spawn — the label you see (`whackagent:wa-implementer · Implement X`) is the agent type plus your `description`, and several agents of one type share it. So **keep a note of each id as you spawn it**, mapped to its role (`implementer`, `conventions`, `structure`, `correctness`, `verifier`) for this task. Lose the ids → spawn fresh. That's a fallback, not a failure: resuming is an optimization, never a prerequisite, and the flow is identical either way.

- **Implementer** — `SendMessage` its id with the aggregated findings alone. No conventions dir, no task re-read: it has them.
- **Reviewers** — `SendMessage` each id with (a) the fix's diff hunks only and (b) its own previous findings, asking it to re-state each as *fixed* or *still open* before looking for new ones.
- **Verifier** — same pattern, see §3.5 step 3.
- **Anti-stale, always say it:** "files changed since your last turn — re-read the ones listed; your memory of their content is stale."
- **Which categories run at all** is the gate's call, above — resume only the ones the gate retained this round.
- **Cap resume at the 3-round autofix cap.** Past that a transcript (build logs especially) outweighs the re-read it saves — respawn fresh.

## 3.5 Verify (runtime)

Static review says the code reads right; verify says it **works when used**. Run only when `verify.enabled: true` and the task has a runnable UI surface (skip pure-logic/lib tasks — nothing to drive).

1. Dispatch **wa-verifier** once, **noting its `agentId`**. Pass: task path (for acceptance criteria), the implementer's `ARTIFACT:` (binary path + bundle id/package), `verify.platform` + `verify.target`, `autopilot` flag.
2. Verifier installs the built binary via **mobile-mcp**, drives the task's acceptance criteria with real inputs (tap/type/swipe), screenshots each checkpoint. Handle receipt:
   - `RESULT: pass` → record checks + screenshot paths in task's `## Verification`, continue.
   - `RESULT: fail` → treat like a critical finding: feed the failed checks back through the review autofix loop (Review step 3) if `review.autofix`, else **stop and show** the user what broke. Re-verify after a fix.
   - `RESULT: blocked` (mobile-mcp absent, no device, won't install) → **stop and ask** the user; don't silently mark verified.
3. **Re-verify resumes the same verifier** by its id (same rules as *Resuming agents*): send the fresh `ARTIFACT:` + what the fix changed, nothing else — device stays booted, checklist stays derived. Tell it if the acceptance criteria moved.
4. Never claim a task works without the verifier's evidence when verify is enabled.

## 4. Report + hand off to feedback

- **Show** on-screen summary: what built, files/folders touched, key decisions, test + review results.
- **Save** caveman-compressed report to `.whackagent/reports/<slug>.md` (what / files / decisions / tests / review verdict / task link).
- Set task `status: review`. Invite user to look and send notes — **`/wa-feedback`**.
- **Iteration is `/wa-feedback`'s job, not yours.** User comes back with changes → invoke the **wa-feedback** skill and follow it. Do **not** patch code from this thread: conventions live in the subagents' context, not here, and an unreviewed touch-up undoes the review you just ran.
- On user **validation**: set task `status: done`, reflect in `BACKLOG.md`, then run **Validation handoff** below.

## 5. Validation handoff (commit + next branch)

Runs only on user validation, in order. Each sub-step is conditional — skip silently when its toggle is off.

1. **Commit** — if `commit.auto_commit_after_validation: true`, commit the task's work using `commit.author_name` / `commit.author_email`. Never as Claude, never merge to base, never push unless the user asks.
2. **Hop to next task** — if `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next: true`:
   - Next task = top `todo` in `BACKLOG.md` order (same order `/wa-board` renders). None → say backlog empty, stay put, done.
   - Create/check out `<branch.prefix><next-slug>` from `branch.base`, same rules as step 0 — including the dirty-tree stop-and-ask (nothing should be dirty right after a commit; if it is, ask).
   - Echo: `✅ <slug> committed → branche wa/<next-slug> prête · /wa-code <next-slug>`.
3. Nothing committed (toggle off) → **don't switch branches**: the work is still uncommitted on this one. Say so and stop there.

## Asking

Any question you put to the user — a `BLOCKED:` from a subagent, an architecture fork, a verify failure needing a call — **always carries your recommended answer** plus the one-line reason. Never relay a bare `BLOCKED:` question: read it, form an opinion, propose it. Same rule as `/wa-task`'s grill.

## Never

Never commit before validation — commit only in step 5, and only if `commit.auto_commit_after_validation`. Never switch branches with a dirty tree or uncommitted task work. Never let subagents touch backlog/wiki/reports — you own those here. Never hand-edit code after the review phase — that's `/wa-feedback`.

## Next step

Notes on what got built → **`/wa-feedback`**. After validation, suggest **`/wa-wiki`** to update the wiki for what changed.