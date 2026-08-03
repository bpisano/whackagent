---
name: wa-validate
description: Your green light on coded feature — "this is what I asked for". Runs verifier over whole diff (style, elegance, structure, correctness) and records verdict. Does NOT close task; you still retest.
---

# /wa-validate

**Your feu vert on spec, not on code.** You tested feature, it does what your cahier des charges says. That statement unlock verification pass: verifier now judge *how* it written, over whole diff, once.

Does **not** set task `done`. You probably retest after review touch things — closing is separate deliberate step (see *Closing*).

Where it sit: `/wa-task` → `/wa-code` → *you test, `/wa-feedback`, you test again* → **`/wa-validate`** → verifier → *you retest* → closed.

## Why it's a command and not a step

Review after every round burn one verifier per note and review code about to change anyway. Review before you said "yes, that's the feature" review wrong feature well. So review wait for exactly one signal — yours — then run once, over everything.

## Do

1. **Resolve task.** Slug or display index, per **wa-board → Task indexes**; echo what you resolved. No arg → most recent `review`. Read `.whackagent/config.md` + task file at `{tasks}/<slug>.md` — `{…}` paths come from config's `paths:` block, see **wa-board → Paths**.
   - `status: in-progress` → code not finished. Say so, don't review half-task.
   - `status: validated` → this is **closing** run, jump to *Closing*.
   - `status: done` / `canceled` → nothing to do.
2. **Be on right branch.** `branch.per_task` or `/wa-autopilot` delivery → work live on `<branch.prefix><slug>`. Not here → say which branch, switch **only after user confirms** (their tree may be dirty).
3. **State what you take as validated** — the `## Critères d'acceptation`, listed back in one block. Criterion they know unmet means they wanted `/wa-feedback`, not this: say so and stop rather than review feature not finished being one.
4. **Dispatch verifier** — point of command. One `wa-verifier`, per `/wa-code` step 3 in full.
   - **Scope = cumulative diff**: `branch.base..HEAD` plus working tree when task has own branch, else every file in `## Implémentation` and each `## Feedback` round. Hunks inline, `inline`-tagged ones **flagged as written without convention pass** — those get harder look.
   - Resume run's verifier by `agentId` when id still live (hunks + anti-stale warning); fresh spawn otherwise.
5. **Check sweep → autofix.** `LENSES:` short of four ✓ → send back for missing lens first; this pass close the task, lens skipped here skipped for good. Then order by severity, keep lens tags. `review.autofix: true` → dispatch implementer, re-verify, loop until clean or no progress, **cap 3 rounds**. Not converging → stop and show what left. Record everything in `## Review` under `validation` round.
6. **Runtime.** `verify.mode: always` and autofix touched code → implementer re-drive app. Any other mode → **say plainly code moved since user tested it** and name files, so nobody treat stale test as proof.
7. **Set `status: validated`** (reflect in `{backlog}`). Never `done` here — that's user's second look, not yours.
8. **Report + hand back**, one of three:
   - **Clean, autofix changed nothing** → code they tested *is* code that got reviewed. Nothing to retest: recommend closing now, close on their yes (*Closing*).
   - **Clean, autofix changed code** → list what changed, in their terms. *"Retest, then `/wa-validate <slug>` again to close."*
   - **Findings still open** → show severity-ordered, with your recommendation per item (fix now / accept and close / spin off `/wa-task`). Don't close, don't commit.

## Closing

Second `/wa-validate` on `validated` task means *"retested, still good"*.

1. **Check nothing moved** since review round — `git diff` against state `## Review` recorded. Code changed → run verifier again on delta first; review only worth the tree it read.
2. `status: done`, reflect in `{backlog}`.
3. Run **`/wa-code` § Closing handoff** — commit when `commit.auto_commit_after_validation`, then next task's branch when `branch.per_task` + `branch.checkout_next`. Same rules: never as Claude, never merge to base, never push unless asked, never switch branches with dirty tree.

## Interaction with the rest

- **`/wa-feedback` on `validated` task** → code moved after its review: status go back to `review`, task need `/wa-validate` again. Never close on review that predate last edit.
- **`review.when: each_round`** → rounds already reviewed; this pass still run, over cumulative diff, and it's the one that counts. Short: most findings already fixed.
- **`/wa-autopilot`** deliver tasks at `review`, uncommitted-by-you and unreviewed by verifier — that's the deal, your review async. Each one need own `/wa-validate`.

## Never

- Never mark task `done` from first run — user hasn't retested reviewed code yet.
- Never review task user hasn't validated: without their yes, you review feature still moving.
- Never commit before *Closing*.
- Never write code yourself — findings go to implementer, same as `/wa-code`.

## Asking

Every question carry your recommended answer and one-line reason — finding worth accepting, branch worth switching, fix worth spinning off. Never bare question.

## Next step

Closed → **`/wa-wiki`** to sync wiki, then `/wa-board` for what next.