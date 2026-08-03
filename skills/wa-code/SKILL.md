---
name: wa-code
description: Run the full coding pipeline for a task — plan, code, verify, report — orchestrating isolated subagents.
---

# /wa-code

You **PM**. Plan and dispatch, never write code. One task: **plan → code → verify → report**.

Two subagents do work: one `wa-implementer`, one `wa-verifier`. **Spawn each once, keep alive** — every later round is `SendMessage` to its `agentId`, never fresh spawn. Isolated agent costs ~50k tokens context before reading line; resuming costs delta.

Read `.whackagent/config.md` and `{tasks}/<slug>.md` first. `{…}` paths come from config's `paths:` block — see **wa-board → Paths**.

Arg is slug **or** wa-board display index (`/wa-code 3`) — resolve per **wa-board → Task indexes**, echo `3 → sync-offline`.

**Grill gate (soft):** `grilled: false` → warn *"not grilled — quick win, or `/wa-task <slug>` first?"* Proceed if user confirms.

Set task `status: in-progress` (reflect in `{backlog}`).

## 0. Branch — only if `branch.per_task: true`

1. Name = `<branch.prefix><slug>` (default `wa/<slug>`).
2. Already on it → nothing. Exists but not checked out → check out, don't recreate. Absent → create from `branch.base` (`current` = where you are; else named branch, fetched first if it tracks remote).
3. **Dirty tree → stop and ask** before any checkout: carry over, stash, or stay? Never move uncommitted work silently.
4. Echo: `branche: wa/<slug> (base: main)`.

## 1. Plan

Read task and its `## Contexte / Décisions`. Then **one exploration pass — here, once, for everybody.**

Targeted Grep/Glob over task neighborhood: related code, callers, layer boundaries, what already does part of job. Write **BRIEF** — every subagent gets it verbatim instead of re-deriving same map six times:

```
BRIEF
FILES: <path (N lines) — what it does>          ← line count on every entry, no exception
       <path (2400 lines, READ RANGES ONLY: l.1958-2035) — what it does>
REUSE: <what exists and must be reused, not rewritten>
BOUNDARIES: <layers/modules involved, dependency direction>
LAYOUT: <target files/folders to create, per the architecture module>
GAPS: <what you couldn't resolve — the only thing subagents explore themselves>
```

Line counts not decoration: subagents run hard read budget (no whole-file `Read` above ~400 lines) and sizes let them respect it without opening file to find out how big. Over threshold, name ranges that matter — 11k-token read becomes 500.

Then **decompose** into bricks, fix **file/folder layout up front** per architecture module (group by feature, proper nesting, never flat), and **sketch tests** (units, edge cases — YAGNI, only what task needs).

## 2. Code

**One implementer for whole task**, bricks fed one at a time (sequential — builds collide otherwise).

- **Brick 1** — spawn `wa-implementer`, **note `agentId`**. Pass: task path, BRIEF, brick + its target files/folders, conventions dir, test plan, `build.command` / `build.test_command` when config sets them (it never reads config — hand it commands), `verify` block **including `mode`** (it never reads config — say plainly whether it owes runtime proof), `autopilot: false`.
- **Bricks 2..n** — `SendMessage` that id with next brick **alone**. No conventions dir, no BRIEF, no task path: it holds them. It also built brick 1, so knows what to reuse — DRY stops being rule it must rediscover.

Receipts:
- `RESULT: done` → record files + build/test/run proof in `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Dispatch nothing further until resolved.

**Runtime proof — `verify.mode` decides, and here you attended:**
- `always` → implementer drives app after green build; holds build session, so proof costs it almost nothing. Its `CHECKS:` lines land in `## Vérification`.
- `autopilot` (default) or `off` → **it doesn't.** You at keyboard: build + tests are receipt, and **you** validate by testing app. Say it in report — `run: à toi` — so nobody mistakes unrun app for passing one. Write that in `## Vérification` too: *"validation manuelle — non exécutée par l'agent"*.
- Either way implementer may launch app **because it needs to** (reproduce bug, judge layout) — lands in its `NOTES:`, not `CHECKS:`, and doesn't turn into proof pass.

## 3. Verify — only when `review.when: each_round`

`review.when: on_validation` (default) → **skip this step entirely.** Echo `review: à /wa-validate` and go to step 4.

Why it waits: feature not feature until user says so. Reviewing now reviews code three feedback rounds about to move — well-reviewed, still wrong thing. **`/wa-validate` is user's feu vert on spec, and that fires verifier**, once, over whole diff. Nothing escapes review; just happens when reviewing worth something.

All bricks green → spawn **one `wa-verifier`**. Note its `agentId`.

**Hand it change, not repo.** It gets: module paths (`review.modules`), changed-file list **with diff hunks inline**, BRIEF, task path, toggles. It judges diff — doesn't hunt for what moved.

Then:
1. **Read `LENSES:` line** — `style`, `elegance`, `structure`, `correctness`, all four ✓. One missing means third of review didn't happen: send back for that lens alone before doing anything with findings.
2. **Order** findings by severity (arrive lens-tagged; keep tags).
3. **Autofix** (`review.autofix: true`) → `SendMessage` implementer the findings alone, then re-verify. Loop until clean or no progress, **cap 3 rounds**. Not converging → stop, show what's left. `BLOCKED:` → stop and ask.
4. Record final findings + what autofix changed in `## Review`.

**Resuming, rounds 2+** — `SendMessage`, never respawn:
- **Implementer** → findings, nothing else.
- **Verifier** → fix's diff hunks **plus its previous findings**, asking it to re-state every one as *fixed* or *still open* before hunting new ones.
- **Always say it:** *"files changed since your last turn — re-read the ones listed; your memory of their content is stale."*
- Past 3-round cap, respawn fresh: transcript full of build logs outweighs re-read it saves.

**`agentId` is handle, not name.** Spawn returns id like `a2f42843b98bdce70`; no way to name agent, label you see is just its type plus your description. **Note each id as you spawn it**, mapped to role. Lost ids → spawn fresh. That fallback, not failure: resuming is optimization, never prerequisite.

## 4. Report

- **Show**: what built, files/folders touched, key decisions, test + run + review results — `review: à /wa-validate` when step 3 skipped, so user knows what still owed.
- **Save** caveman-compressed report to `{reports}/<slug>.md`.
- Set `status: review` — means *waiting for user to test it*, nothing more.
- **Say what to do next, in this order**: test it. Notes → **`/wa-feedback`**. Matches spec → **`/wa-validate <slug>`**, which fires verifier and eventually closes task.
- **Iteration is `/wa-feedback`'s job.** Never patch code from this thread — even one-liner. `/wa-feedback` is only place inline fixes are bounded, tagged, built, flagged to verifier (see its *Micro-fix or implementer*); untracked touch-up here undoes review it about to get.
- **Never set `done` yourself, never commit here.** `review → validated → done` is `/wa-validate`'s ladder; user's "ok c'est ça" is spec approval, not close.

## 5. Closing handoff — called by `/wa-validate`, never run from here

`/wa-validate` closes task (its *Closing*: retested, review clean, `status: done`). Then runs these, in order; each sub-step skips silently when its toggle off.

1. **Commit** — if `commit.auto_commit_after_validation`, using `commit.author_name` / `commit.author_email`. Never as Claude, never merge to base, never push unless asked.
2. **Next branch** — if `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next`: next task = top `todo` in `{backlog}` order. Create/check out its branch, same rules as step 0 (dirty tree → ask). Echo `✅ <slug> committed → branche wa/<next-slug> prête · /wa-code <next-slug>`.
3. Nothing committed → **don't switch branches**; work still uncommitted here. Say so, stop.

## Asking

Every question you put to user — `BLOCKED:`, architecture fork, failed check — **carries your recommended answer** plus one-line reason. Never relay bare `BLOCKED:`: read it, form opinion, propose it.

## Never

Never write code yourself. Never commit — closing is `/wa-validate`'s. Never mark task `done`. Never switch branches with dirty tree. Never let subagents touch backlog/wiki/reports — you own those. Never write to literal `.whackagent/` path when config's `paths:` points elsewhere.

## Next step

Test it. Notes → **`/wa-feedback`**. Conforme → **`/wa-validate <slug>`** (verifier, then close). Closed → **`/wa-wiki`**.