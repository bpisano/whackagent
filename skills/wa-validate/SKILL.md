---
name: wa-validate
description: Runs the code review once you're happy with the feature. Doesn't close the task.
---

# /wa-validate

User says the feature matches the spec. Run one verifier pass over the whole diff, end at `to-close`. Closing stays `/wa-close`.

Read: voice, pr, components, tasks, git, store

## Steps

1. **Resolve the task** per **tasks → Ids**, echo it. No arg → most recent `to-test`.
   - `coding` → code not finished, say so, stop.
   - `to-close` → code moved since its review → review the delta. Untouched → nothing to do, `/wa-close <id>`.
   - `done` / `canceled` → nothing to do, stop.
2. **Be on the right branch.**
   - Task branch (`branch.per_task` or `/wa-autopilot` delivery) → work there. Not on it → name it, switch only on yes.
   - On the sprint test branch → **git → Sprint test branch → Leaving it**.
   - `board` → fetch + pull, then `claim <n> coding --keep-state` (**store → Locks**). Exit 3 or 4 → say it, stop.
3. **State what you take as validated** — `## Acceptance criteria` back, one block.
   - User knows one is unmet → they want `/wa-feedback`, say so, stop.
4. **Verify** — one `wa-verifier`, per **wa-code → Verify** (hunks, lenses, resume by agentId, fix loop).
   - Scope = cumulative diff: task branch → `branch.base..HEAD` + working tree. Else every file in `## Implementation` and each `## Feedback` round.
   - Stacked task → diff from the stack point (**git → Stacking**).
   - `inline`-tagged hunks → flag as written without convention pass, harder look.
   - `review.when: each_round` → still run, over the cumulative diff. This pass counts.
5. **Check the sweep.**
   - `LENSES:` short of four ✓ → send back for the missing lens first. A lens skipped here is skipped for good.
   - Order by severity, keep lens tags.
   - `review.autofix: true` → fix loop per **wa-code → Verify**, cap 3 rounds. Not converging → stop, keep what's left open.
   - Record all in `## Review`, round `validation`.
6. **Runtime.**
   - `verify.mode: always` + autofix touched code → implementer re-drives the app.
   - Else, code moved → say plainly it changed since the user's test, name files.
7. **Set state** `to-close` per **store**.
   - Findings still open → stay `to-test`: not closable.
   - Clean → screenshots per **pr → Screenshots**, whatever `verify.mode`: one `wa-screenshot`. `board` → uploaded in this round's PR edit. `files` → kept for `/wa-close`.
   - `board` → round end per **store → Rounds**: file `status:` + `## Review`, commit (**git → Commits**), push. Card follows (**store → Reconcile**).
   - `board`, aborted before any push → `release <n> coding` alone.
   - Sprint task + autofix changed code → rebuild the sprint test branch (**git → Sprint test branch**). Nothing changed → no rebuild.
8. **Report** — **components → Report**, Review as **components → Findings**. One of:
   - Clean, nothing changed → nothing to retest.
   - Clean, autofix changed code → list changes in user terms, retest.
   - Findings open → each with its pick: `fix` now / `accept` and close / spin off `→ /wa-task`. Say which you'd accept.
   - User picks `fix` → dispatch the implementer (resume by `agentId` if one ran) with those findings, re-verify, back to step 5.

## Never

- Never set `done`. That's `/wa-close`, after the retest.
- Never review without the user's yes on the spec.
- Never land: no merge into sprint or base, no PR opened or marked ready, no branch deleted. Sprint test branch rebuild is the one merge.
- Never commit or push in `files`. `board` → round end only.
- Never write code. Findings go to the implementer.
- Never hand off to `/wa-close` with findings open.
- `/wa-feedback` on a `to-close` task sends it back to `to-test`: never close on a review older than the last edit.

## Ask

- Every question → **components → Question**: branch to switch, finding to accept, fix to spin off.

## Next

- Clean, nothing changed → `→ next: /wa-close <id>`.
- Clean, code changed → retest, then `/wa-close <id>`.
- Findings open → `/wa-feedback <id>` or `/wa-task <idea>` per pick.
