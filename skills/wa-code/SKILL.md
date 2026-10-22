---
name: wa-code
description: Plans, codes, tests and reports on a task, with isolated subagents.
---

# /wa-code

PM: plans and dispatches, never writes code. One task: plan → code → verify → report.

Read: voice, pr, components, tasks, git, store

## Steps

1. **Resolve** the arg per **tasks → Ids**, read the task per **store**.
   - `draft` / `grilling` → not grilled, `→ next: /wa-task <id>`, stop.
   - `done` / `canceled` → nothing to code, stop.
   - Open blocker → **Warning** `⛔ blocked by #12 …`, recommend `/wa-code 12` first. Go on only on explicit yes.
2. **Take it.**
   - `files` → state `coding`.
   - `github` → `claim <n> coding` (**store-github → Locks**). File `status:` stays until round end.
3. **Branch** per **git → Task branch** (fork point, `github` name, echo) and **git → Sprint branch** (create or check up to date). Main checkout, never a worktree. Dirty tree → **git → Dirty tree**.
   - `github` → pull after checkout.
   - Sprint branch just created → say so.
4. **Plan** → **Brief**.
5. **Code** — one `wa-implementer` for the whole task, bricks one at a time (parallel builds collide).
   - Brick 1 → spawn, note `agentId`. Pass task ref, BRIEF, brick + target files, `{conventions}`, test plan, `build.command` / `build.test_command` when set, `verify` block with `mode` stated plainly, `autopilot: false`. It never reads config.
   - Bricks 2..n → `SendMessage` the brick alone.
   - `RESULT: done` → files + build/test/run proof in `## Implementation`.
   - `RESULT: blocked` → ask its question (**Ask**). Dispatch nothing until answered.
6. **Runtime proof** — `verify.mode`:
   - `always` → implementer drives the app after green build. `CHECKS:` → `## Verification`.
   - `autopilot` (default) / `off` → none. Status line `run: yours`. `## Verification`: `manual validation — not run by agent`.
   - App launched because it needed to (repro, layout) → `NOTES:`, never proof.
7. **Verify** — only `review.when: each_round` → **Verify**.
   - `on_validation` (default) → skip, echo `review: → /wa-validate`.
8. **Deliver** — state `to-test`.
   - `github` → round end per **store-github → Rounds**: file `status: to-test` + sections, commit (**git → Commits**), push, draft PR + `link-pr` on first delivery, mergeable check.
   - Aborted before any push → `release <n> coding --reset-to <state claimed from>` (+ `--unassign me` from `todo`), say why.
9. **End on the coded branch** — before any report.
   - Sprint task → build the **git → Sprint test branch**, check it out.
   - Else → task branch; moved off it → check it back out.
   - `branch.per_task: false` → stay.
   - Dirty tree blocks the build or switch → never stash or discard. Say what's dirty → **components → Branch line** (`not built` / `couldn't switch`).
10. **Report** — run `git branch --show-current` first, never assume: the **Branch line** shows what it returns.
   - Show a **Report** (`github`: + PR URL). Save it to `{reports}/<key>.md` + full file/folder list, key decisions, findings.

## Brief

One exploration pass, here, for every subagent.

- Read the task + `## Context / Decisions`.
- Targeted Grep/Glob: related code, callers, layer boundaries, what already does part of the job.
- Write the BRIEF, passed verbatim:

```
BRIEF
FILES: <path (N lines) — role>                     ← line count on every entry
       <path (2400 lines, READ RANGES ONLY: l.1958-2035) — role>
REUSE: <what exists, must be reused>
BOUNDARIES: <layers/modules, dependency direction>
LAYOUT: <files/folders to create, per architecture module>
GAPS: <unresolved — the only thing subagents explore>
```

- Subagents can't read whole files past ~400 lines → name the ranges.
- Split into bricks.
- Fix file/folder layout up front: by feature, nested, never flat.
- Sketch tests: units, edge cases, YAGNI.

## Verify

All bricks green → one `wa-verifier`, note `agentId`.

1. **Hand it the change, not the repo**: `review.modules` paths, changed files with diff hunks inline, BRIEF, task ref, toggles.
2. **Check `LENSES:`** — `style`, `elegance`, `structure`, `correctness` all ✓. One missing → send it back for that lens alone, before using findings.
3. **Order** by severity, keep lens tags.
4. **Autofix** (`review.autofix: true`) → `SendMessage` the implementer the findings alone, re-verify.
   - Loop until clean or no progress, cap 3 rounds.
   - Not converging → stop, show what's left as **Findings**.
   - `BLOCKED:` → **Ask**.
5. **Record** final findings + autofix changes in `## Review`.

Resume, rounds 2+ — `SendMessage`, never respawn:
- Implementer → findings only.
- Verifier → fix hunks + its previous findings. Re-state each `fixed` / `still open` before new ones.
- Always add: `files changed since your last turn — re-read the ones listed; your memory of them is stale.`
- Past the 3-round cap → respawn fresh.
- `agentId` = handle (`a2f42843b98bdce70`), not a name. Note each one with its role. Lost → spawn fresh.

## Never

- Never write code, not even a one-liner. Iteration → `/wa-feedback`.
- Never respawn an implementer or verifier you can resume (**Verify** → Resume).
- Never commit (`files`). `github` → round-end commit + push only, never mid-round.
- Never mark the PR ready, merge, or land. That's `/wa-close`.
- Never set `done`. "ok that's it" = spec approval, not close.
- Never merge into a sprint branch or base. Never push the test branch.
- Never code a task whose lock you lost.
- Never end anywhere but the coded branch or its sprint test branch.
- Never let subagents touch backlog, wiki or reports.

## Ask

- `BLOCKED:`, architecture fork, failed check → **Question**. Never relay a bare `BLOCKED:`.

## Next

- `→ next: test it, then /wa-feedback 42 or /wa-validate 42`.
