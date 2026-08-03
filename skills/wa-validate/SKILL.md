---
name: wa-validate
description: Your green light on a coded feature — "this is what I asked for". Runs the verifier over the whole diff (style, elegance, structure, correctness) and records the verdict. Does NOT close the task; you still get to retest.
---

# /wa-validate

**Your feu vert on the spec, not on the code.** You tested the feature, it does what your cahier des charges says. That statement is what unlocks the verification pass: the verifier now judges *how* it was written, over the whole diff, once.

It does **not** set the task `done`. You'll probably retest after the review touches things — closing is a separate, deliberate step (see *Closing*).

Where it sits: `/wa-task` → `/wa-code` → *you test, `/wa-feedback`, you test again* → **`/wa-validate`** → verifier → *you retest* → closed.

## Why it's a command and not a step

Reviewing after every round burns a verifier per note and reviews code that's about to change anyway. Reviewing before you've said "yes, that's the feature" reviews the wrong feature well. So the review waits for exactly one signal — yours — and then runs once, over everything.

## Do

1. **Resolve the task.** Slug or display index, per **wa-board → Task indexes**; echo what you resolved. No arg → the most recent `review`. Read `.whackagent/config.md` + the task file at `{tasks}/<slug>.md` — `{…}` paths come from the config's `paths:` block, see **wa-board → Paths**.
   - `status: in-progress` → the code isn't finished. Say so, don't review a half-task.
   - `status: validated` → this is a **closing** run, jump to *Closing*.
   - `status: done` / `canceled` → nothing to do.
2. **Be on the right branch.** `branch.per_task` or an `/wa-autopilot` delivery → the work lives on `<branch.prefix><slug>`. Not here → say which branch, switch **only after the user confirms** (their tree may be dirty).
3. **State what you're taking as validated** — the `## Critères d'acceptation`, listed back in one block. A criterion they know is unmet means they wanted `/wa-feedback`, not this: say so and stop rather than reviewing a feature that isn't finished being one.
4. **Dispatch the verifier** — the point of the command. One `wa-verifier`, per `/wa-code` step 3 in full.
   - **Scope = the cumulative diff**: `branch.base..HEAD` plus the working tree when the task has its own branch, else every file in `## Implémentation` and each `## Feedback` round. Hunks inline, `inline`-tagged ones **flagged as written without a convention pass** — those get the harder look.
   - Resume the run's verifier by `agentId` when the id is still live (hunks + anti-stale warning); fresh spawn otherwise.
5. **Check the sweep → autofix.** `LENSES:` short of four ✓ → send it back for the missing lens first; this is the pass that closes the task, a lens skipped here is skipped for good. Then order by severity, keeping the lens tags. `review.autofix: true` → dispatch the implementer, re-verify, loop until clean or no progress, **cap 3 rounds**. Not converging → stop and show what's left. Record everything in `## Review` under a `validation` round.
6. **Runtime.** `verify.mode: always` and autofix touched code → the implementer re-drives the app. Any other mode → **say plainly that the code moved since the user tested it** and name the files, so nobody treats a stale test as proof.
7. **Set `status: validated`** (reflect in `{backlog}`). Never `done` here — that's the user's second look, not yours.
8. **Report + hand back**, one of three:
   - **Clean, autofix changed nothing** → the code they tested *is* the code that got reviewed. Nothing to retest: recommend closing now, and close on their yes (*Closing*).
   - **Clean, autofix changed code** → list what changed, in their terms. *"Retest, then `/wa-validate <slug>` again to close."*
   - **Findings still open** → show them severity-ordered, with your recommendation per item (fix now / accept and close / spin off a `/wa-task`). Don't close, don't commit.

## Closing

A second `/wa-validate` on a `validated` task means *"retested, still good"*.

1. **Check nothing moved** since the review round — `git diff` against the state `## Review` recorded. Code changed → run the verifier again on the delta first; a review is only worth the tree it read.
2. `status: done`, reflect in `{backlog}`.
3. Run **`/wa-code` § Closing handoff** — commit when `commit.auto_commit_after_validation`, then the next task's branch when `branch.per_task` + `branch.checkout_next`. Same rules: never as Claude, never merge to base, never push unless asked, never switch branches with a dirty tree.

## Interaction with the rest

- **`/wa-feedback` on a `validated` task** → the code moved after its review: status goes back to `review`, and the task needs `/wa-validate` again. Never close on the strength of a review that predates the last edit.
- **`review.when: each_round`** → the rounds were already reviewed; this pass still runs, over the cumulative diff, and it's the one that counts. It'll be short: most findings are already fixed.
- **`/wa-autopilot`** delivers tasks at `review`, uncommitted-by-you and unreviewed by the verifier — that's the deal, your review is async. Each one needs its own `/wa-validate`.

## Never

- Never mark a task `done` from the first run — the user hasn't retested the reviewed code yet.
- Never review a task the user hasn't validated: without their yes, you're reviewing a feature that's still moving.
- Never commit before *Closing*.
- Never write code yourself — findings go to the implementer, same as `/wa-code`.

## Asking

Every question carries your recommended answer and a one-line reason — a finding worth accepting, a branch worth switching, a fix worth spinning off. Never a bare question.

## Next step

Closed → **`/wa-wiki`** to sync the wiki, then `/wa-board` for what's next.
