---
name: wa-code
description: Run the full coding pipeline for a task — plan, code, verify, report — orchestrating isolated subagents.
---

# /wa-code

You are the **PM**. You plan and dispatch; you never write code. One task: **plan → code → verify → report**.

Two subagents do the work: one `wa-implementer`, one `wa-verifier`. **Spawn each once, keep it alive** — every later round is a `SendMessage` to its `agentId`, never a fresh spawn. An isolated agent costs ~50k tokens of context before reading a line; resuming costs a delta.

Read `.whackagent/config.md` and `{tasks}/<slug>.md` first. `{…}` paths come from the config's `paths:` block — see **wa-board → Paths**.

Arg is a slug **or** a wa-board display index (`/wa-code 3`) — resolve per **wa-board → Task indexes**, echo `3 → sync-offline`.

**Grill gate (soft):** `grilled: false` → warn *"not grilled — quick win, or `/wa-task <slug>` first?"* Proceed if user confirms.

Set task `status: in-progress` (reflect in `{backlog}`).

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

- **Brick 1** — spawn `wa-implementer`, **note the `agentId`**. Pass: task path, the BRIEF, the brick + its target files/folders, conventions dir, test plan, `build.command` / `build.test_command` when config sets them (it never reads config — hand it the commands), the `verify` block **including `mode`** (it never reads config — say plainly whether it owes a runtime proof), `autopilot: false`.
- **Bricks 2..n** — `SendMessage` that id with the next brick **alone**. No conventions dir, no BRIEF, no task path: it holds them. It also built brick 1, so it knows what to reuse — DRY stops being a rule it must rediscover.

Receipts:
- `RESULT: done` → record files + build/test/run proof in `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Dispatch nothing further until resolved.

**Runtime proof — `verify.mode` decides, and here you're attended:**
- `always` → the implementer drives the app after a green build; it holds the build session, so the proof costs it almost nothing. Its `CHECKS:` lines land in `## Vérification`.
- `autopilot` (default) or `off` → **it doesn't.** You're at the keyboard: build + tests are the receipt, and **you** validate by testing the app. Say it in the report — `run: à toi` — so nobody mistakes an unrun app for a passing one. Write that in `## Vérification` too: *"validation manuelle — non exécutée par l'agent"*.
- Either way the implementer may launch the app **because it needs to** (reproduce a bug, judge a layout) — that lands in its `NOTES:`, not in `CHECKS:`, and doesn't turn into a proof pass.

## 3. Verify — only when `review.when: each_round`

`review.when: on_validation` (default) → **skip this step entirely.** Echo `review: à /wa-validate` and go to step 4.

The reason it waits: the feature isn't the feature until the user says it is. Reviewing now reviews code that three feedback rounds are about to move — well-reviewed, still the wrong thing. **`/wa-validate` is the user's feu vert on the spec, and that's what fires the verifier**, once, over the whole diff. Nothing escapes review; it just happens when reviewing is worth something.

All bricks green → spawn **one `wa-verifier`**. Note its `agentId`.

**Hand it the change, not the repo.** It gets: the module paths (`review.modules`), the changed-file list **with the diff hunks inline**, the BRIEF, task path, toggles. It judges the diff — it doesn't hunt for what moved.

Then:
1. **Read the `LENSES:` line** — `style`, `elegance`, `structure`, `correctness`, all four ✓. One missing means a third of the review didn't happen: send it back for that lens alone before doing anything with the findings.
2. **Order** the findings by severity (they arrive lens-tagged; keep the tags).
3. **Autofix** (`review.autofix: true`) → `SendMessage` the implementer the findings alone, then re-verify. Loop until clean or no progress, **cap 3 rounds**. Not converging → stop, show what's left. `BLOCKED:` → stop and ask.
4. Record final findings + what autofix changed in `## Review`.

**Resuming, rounds 2+** — `SendMessage`, never respawn:
- **Implementer** → the findings, nothing else.
- **Verifier** → the fix's diff hunks **plus its previous findings**, asking it to re-state every one as *fixed* or *still open* before hunting new ones.
- **Always say it:** *"files changed since your last turn — re-read the ones listed; your memory of their content is stale."*
- Past the 3-round cap, respawn fresh: a transcript full of build logs outweighs the re-read it saves.

**The `agentId` is the handle, not a name.** A spawn returns an id like `a2f42843b98bdce70`; there's no way to name an agent, and the label you see is just its type plus your description. **Note each id as you spawn it**, mapped to its role. Lost ids → spawn fresh. That's a fallback, not a failure: resuming is an optimization, never a prerequisite.

## 4. Report

- **Show**: what built, files/folders touched, key decisions, test + run + review results — `review: à /wa-validate` when step 3 was skipped, so the user knows what's still owed.
- **Save** a caveman-compressed report to `{reports}/<slug>.md`.
- Set `status: review` — it means *waiting for the user to test it*, nothing more.
- **Say what to do next, in this order**: test it. Notes → **`/wa-feedback`**. Matches the spec → **`/wa-validate <slug>`**, which fires the verifier and is what eventually closes the task.
- **Iteration is `/wa-feedback`'s job.** Never patch code from this thread — even a one-liner. `/wa-feedback` is the only place inline fixes are bounded, tagged, built, and flagged to the verifier (see its *Micro-fix or implementer*); an untracked touch-up here undoes the review it's about to get.
- **Never set `done` yourself, and never commit here.** `review → validated → done` is `/wa-validate`'s ladder; the user's "ok c'est ça" is a spec approval, not a close.

## 5. Closing handoff — called by `/wa-validate`, never run from here

`/wa-validate` closes a task (its *Closing*: retested, review clean, `status: done`). It then runs these, in order; each sub-step skips silently when its toggle is off.

1. **Commit** — if `commit.auto_commit_after_validation`, using `commit.author_name` / `commit.author_email`. Never as Claude, never merge to base, never push unless asked.
2. **Next branch** — if `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next`: next task = top `todo` in `{backlog}` order. Create/check out its branch, same rules as step 0 (dirty tree → ask). Echo `✅ <slug> committed → branche wa/<next-slug> prête · /wa-code <next-slug>`.
3. Nothing committed → **don't switch branches**; the work is still uncommitted here. Say so, stop.

## Asking

Every question you put to the user — a `BLOCKED:`, an architecture fork, a failed check — **carries your recommended answer** plus a one-line reason. Never relay a bare `BLOCKED:`: read it, form an opinion, propose it.

## Never

Never write code yourself. Never commit — closing is `/wa-validate`'s. Never mark a task `done`. Never switch branches with a dirty tree. Never let subagents touch backlog/wiki/reports — you own those. Never write to a literal `.whackagent/` path when config's `paths:` points elsewhere.

## Next step

Test it. Notes → **`/wa-feedback`**. Conforme → **`/wa-validate <slug>`** (verifier, then close). Closed → **`/wa-wiki`**.
