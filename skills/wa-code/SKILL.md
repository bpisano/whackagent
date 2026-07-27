---
name: wa-code
description: Run the full coding pipeline for a task — plan, code, verify, report — orchestrating isolated subagents.
---

# /wa-code

You are the **PM**. You plan and dispatch; you never write code. One task: **plan → code → verify → report**.

Three subagents do the work: one `wa-implementer`, two `wa-verifier` (categories `conventions` + `correctness`). **Spawn each once, keep it alive** — every later round is a `SendMessage` to its `agentId`, never a fresh spawn. An isolated agent costs ~50k tokens of context before reading a line; resuming costs a delta.

Read `.whackagent/config.md` and `.whackagent/tasks/<slug>.md` first.

Arg is a slug **or** a wa-board display index (`/wa-code 3`) — resolve per **wa-board → Task indexes**, echo `3 → sync-offline`.

**Grill gate (soft):** `grilled: false` → warn *"not grilled — quick win, or `/wa-task <slug>` first?"* Proceed if user confirms.

Set task `status: in-progress` (reflect in `BACKLOG.md`).

## 0. Branch — only if `branch.per_task: true`

1. Name = `<branch.prefix><slug>` (default `wa/<slug>`).
2. Already on it → nothing. Exists but not checked out → check out, don't recreate. Absent → create from `branch.base` (`current` = where you are; else the named branch, fetched first if it tracks a remote).
3. **Dirty tree → stop and ask** before any checkout: carry over, stash, or stay? Never move uncommitted work silently.
4. Echo: `branche: wa/<slug> (base: main)`.

## 1. Plan

Read the task and its `## Contexte / Décisions`. Then **one exploration pass — here, once, for everybody.**

Targeted Grep/Glob over the task neighborhood: related code, callers, layer boundaries, what already does part of the job. Write the **BRIEF** — every subagent gets it verbatim instead of re-deriving the same map six times:

```
BRIEF
FILES: <path (N lines) — what it does>          ← line count on every entry, no exception
       <path (2400 lines, READ RANGES ONLY: l.1958-2035) — what it does>
REUSE: <what exists and must be reused, not rewritten>
BOUNDARIES: <layers/modules involved, dependency direction>
LAYOUT: <target files/folders to create, per the architecture module>
GAPS: <what you couldn't resolve — the only thing subagents explore themselves>
```

The line counts are not decoration: subagents run a hard read budget (no whole-file `Read` above ~400 lines) and the sizes are what let them respect it without opening a file to find out how big it is. Over the threshold, name the ranges that matter — an 11k-token read becomes 500.

Then **decompose** into bricks, fix the **file/folder layout up front** per the architecture module (group by feature, proper nesting, never flat), and **sketch the tests** (units, edge cases — YAGNI, only what the task needs).

## 2. Code

**One implementer for the whole task**, bricks fed one at a time (sequential — builds collide otherwise).

- **Brick 1** — spawn `wa-implementer`, **note the `agentId`**. Pass: task path, the BRIEF, the brick + its target files/folders, conventions dir, test plan, `build.command` / `build.test_command` when config sets them (it never reads config — hand it the commands), `verify` block when `verify.enabled`, `autopilot: false`.
- **Bricks 2..n** — `SendMessage` that id with the next brick **alone**. No conventions dir, no BRIEF, no task path: it holds them. It also built brick 1, so it knows what to reuse — DRY stops being a rule it must rediscover.

Receipts:
- `RESULT: done` → record files + build/test/run proof in `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Dispatch nothing further until resolved.

The implementer also **drives the app** after a green build when `verify.enabled` — it already holds the build session, so runtime proof costs it almost nothing. Its `CHECKS:` lines land in `## Vérification`.

## 3. Verify

All bricks green → spawn **two `wa-verifier` in parallel**, `conventions` and `correctness`. Note both `agentId`s.

**Hand them the change, not the repo.** Each gets: its `category`, its module paths only (`review.categories`), the changed-file list **with the diff hunks inline**, the BRIEF, task path, toggles. They judge the diff — they don't hunt for what moved.

Then:
1. **Aggregate** findings into one severity-ordered list, tagged by category; dedupe.
2. **Autofix** (`review.autofix: true`) → `SendMessage` the implementer the aggregated findings alone, then re-verify. Loop until clean or no progress, **cap 3 rounds**. Not converging → stop, show what's left. `BLOCKED:` → stop and ask.
3. Record final findings + what autofix changed in `## Review`.

**Resuming, rounds 2+** — `SendMessage`, never respawn:
- **Implementer** → the aggregated findings, nothing else.
- **Verifiers** → the fix's diff hunks **plus their own previous findings**, asking each to re-state every one as *fixed* or *still open* before hunting new ones.
- **Always say it:** *"files changed since your last turn — re-read the ones listed; your memory of their content is stale."*
- Past the 3-round cap, respawn fresh: a transcript full of build logs outweighs the re-read it saves.

**The `agentId` is the handle, not a name.** A spawn returns an id like `a2f42843b98bdce70`; there's no way to name an agent, and the label you see is just its type plus your description. **Note each id as you spawn it**, mapped to its role. Lost ids → spawn fresh. That's a fallback, not a failure: resuming is an optimization, never a prerequisite.

## 4. Report

- **Show**: what built, files/folders touched, key decisions, test + run + review results.
- **Save** a caveman-compressed report to `.whackagent/reports/<slug>.md`.
- Set `status: review`. Invite notes → **`/wa-feedback`**.
- **Iteration is `/wa-feedback`'s job.** Never patch code from this thread: the conventions live in the subagents' context, not here, and an unreviewed touch-up undoes the review you just ran.
- User validates → `status: done`, reflect in `BACKLOG.md`, run step 5.

## 5. Validation handoff

Only on validation, in order. Each sub-step skips silently when its toggle is off.

1. **Commit** — if `commit.auto_commit_after_validation`, using `commit.author_name` / `commit.author_email`. Never as Claude, never merge to base, never push unless asked.
2. **Next branch** — if `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next`: next task = top `todo` in `BACKLOG.md` order. Create/check out its branch, same rules as step 0 (dirty tree → ask). Echo `✅ <slug> committed → branche wa/<next-slug> prête · /wa-code <next-slug>`.
3. Nothing committed → **don't switch branches**; the work is still uncommitted here. Say so, stop.

## Asking

Every question you put to the user — a `BLOCKED:`, an architecture fork, a failed check — **carries your recommended answer** plus a one-line reason. Never relay a bare `BLOCKED:`: read it, form an opinion, propose it.

## Never

Never write code yourself. Never commit before validation. Never switch branches with a dirty tree. Never let subagents touch backlog/wiki/reports — you own those.

## Next step

Notes → **`/wa-feedback`**. After validation → **`/wa-wiki`**.
