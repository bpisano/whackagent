---
name: wa-validate
description: Your green light on coded feature — "this is what I asked for". Runs verifier over whole diff (style, elegance, structure, correctness) and records verdict. Does NOT close task — /wa-close does.
---

# /wa-validate

**Your green light on spec, not code.** You tested feature, does what spec says. That statement unlock verification pass: verifier judge *how* written, over whole diff, once.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Does **not** set task `done`, never touch git. You probably retest after review touch things — closing separate deliberate step: **`/wa-close`**.

Where it sit: `/wa-task` → `/wa-code` → *you test, `/wa-feedback`, you test again* → **`/wa-validate`** → verifier → *you retest* → **`/wa-close`**.

## Why it's a command and not a step

Review every round burn one verifier per note, review code about to change anyway. Review before you said "yes, that's feature" review wrong feature well. So review wait for exactly one signal — yours — then run once, over everything.

## Do

1. **Resolve task.** Task id, per **wa-board → Task ids**; echo what you resolved. No arg → most recent `to-test`. Read `.whackagent/config.md` + the task per **wa-board → Task store** — `{…}` paths from config's `paths:` block, see **wa-board → Paths**.
   - `status: coding` → code not finished. Say so, don't review half-task.
   - `status: to-close` → already reviewed. Code moved since → re-review delta; untouched → nothing to do, closing is **`/wa-close <id>`**.
   - `status: done` / `canceled` → nothing to do.
2. **Be on right branch.** `branch.per_task` or `/wa-autopilot` delivery → work live on `<branch.prefix><key>`. Not here → say which branch, switch **only after user confirms** (their tree may be dirty).
3. **State what you take as validated** — the `## Acceptance criteria`, listed back in one block. Criterion they know unmet means they wanted `/wa-feedback`, not this: say so and stop rather than review feature still being finished.
4. **Dispatch verifier** — point of command. One `wa-verifier`, per `/wa-code` step 3 in full.
   - **Scope = cumulative diff**: `branch.base..HEAD` plus working tree when task has own branch, else every file in `## Implementation` and each `## Feedback` round. Hunks inline, `inline`-tagged ones **flagged as written without convention pass** — those get harder look.
   - Resume run's verifier by `agentId` when id still live (hunks + anti-stale warning); fresh spawn otherwise.
5. **Check sweep → autofix.** `LENSES:` short of four ✓ → send back for missing lens first; this pass close task, lens skipped here skipped for good. Then order by severity, keep lens tags. `review.autofix: true` → dispatch implementer, re-verify, loop until clean or no progress, **cap 3 rounds**. Not converging → stop, show what left. Record everything in `## Review` under `validation` round.
6. **Runtime.** `verify.mode: always` and autofix touched code → implementer re-drive app. Any other mode → **say plainly code moved since user tested it** and name files, so nobody treat stale test as proof.
7. **Set state `to-close`** per **Task store**. Never `done` here — that's user's second look, not yours.
8. **Report + hand back**, one of three:
   - **Clean, autofix changed nothing** → code they tested *is* code reviewed. Nothing to retest: *"`/wa-close <id>` whenever you want."*
   - **Clean, autofix changed code** → list what changed, in their terms. *"Retest, then `/wa-close <id>`."*
   - **Findings still open** → show severity-ordered, with recommendation per item (fix now / accept and close / spin off `/wa-task`). Don't hand off to `/wa-close` with findings open — say which ones you'd accept.

## Interaction with the rest

- **`/wa-feedback` on `to-close` task** → code moved after its review: state go back to `to-test`, task need `/wa-validate` again. Never close on review predating last edit.
- **`review.when: each_round`** → rounds already reviewed; this pass still run, over cumulative diff, and it's one that counts. Short: most findings already fixed.
- **`/wa-autopilot`** deliver tasks at `to-test`, uncommitted-by-you and unreviewed by verifier — that's deal, your review async. Each one need own `/wa-validate`.

## Never

- Never mark task `done` — that's `/wa-close`, after user retests reviewed code.
- Never review task user hasn't validated: without their yes, you review feature still moving.
- Never commit, merge, push, open PR or delete branch — **git belong to `/wa-close`**.
- Never write code yourself — findings go to implementer, same as `/wa-code`.

## Asking

Every question carry recommended answer + one-line reason — finding worth accepting, branch worth switching, fix worth spinning off. Never bare question.

## Next step

Retest what review changed, then **`/wa-close <id>`** — it commit, land branch (merge into sprint, PR, or nothing per `close.strategy`) and mark task `done`. Closed → **`/wa-wiki`**.