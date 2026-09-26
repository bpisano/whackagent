---
name: wa-close
description: Close validated task — record done, commit, land branch (sprint merge, PR, or nothing per config), clean branch and worktree. Last step of task lifecycle.
---

# /wa-close

**Task finished.** You retested reviewed code, still does what you asked. `/wa-close` write that down, put branch where belong.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Where sit: `/wa-task` → `/wa-code` → *you test, `/wa-feedback`* → `/wa-validate` (verifier) → *you retest* → **`/wa-close`**.

`/wa-validate` = **review** door — judge code, set `to-close`. `/wa-close` = **landing** door — end task, move branch. Two commands, two questions. Second one touch git in ways you want see coming.

## Do

1. **Resolve task.** Task id, per **wa-board → Task ids**; echo what resolved. No arg → most recent `to-close`. Read `.whackagent/config.md` + the task per **wa-board → Task store** — `{…}` paths per **wa-board → Paths**.
   - `to-close` → normal path, continue.
   - `to-test` → **never reviewed.** Say so, send to `/wa-validate <id>`, stop. Closing here close unreviewed code.
   - `draft` / `todo` / `coding` → not coded. Stop.
   - `done` / `canceled` → already closed. Say what branch did, stop.
2. **Check nothing moved** since review round — `git diff` against state `## Review` recorded. Code changed → say what, send back to `/wa-validate` for delta. Review only worth tree it read.
3. **Show landing plan, get yes.** One block, before touching git — see *Plan block*. Only confirmation command ask; everything after run without more prompting.
4. **Commit** — when `commit.auto_commit_after_validation`. `commit.author_name` / `commit.author_email`, **never as Claude**. Already clean → skip, say so.
   - Nothing committed and tree dirty → **stop before any branch move.** Uncommitted work plus merge = how work disappear.
5. **Land branch** — *Landing* below. Task in sprint → merge into sprint branch. Else → `close.strategy`.
6. **Clean up** — *Cleanup* below. Worktree then branch, that order, `close.delete_branch` decide.
7. **State `done`** per **Task store** (`files`: line moves under **Done**, keeps `· <Sprint>` suffix; `github`: Status Done — issue closes at PR merge, or now when `close.strategy: merge`).
8. **Sprint complete?** Last task of sprint just closed → *Sprint landing*.
9. **Next branch** — when `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next`: next task = top `todo` in backlog order, branch created/checked out per `/wa-code` step 0 (its sprint decide base — dirty tree → ask). Echo `✅ #42 closed → branch wa/44-fix-login-errors ready · /wa-code 44`.
10. **Report** — after-state, four lines max: what landed where, what deleted, sprint progress, next command.

## Plan block

Say what you about to do to git **before** doing it, in their terms. Landing outward-facing, half irreversible:

```
Closing #42 Add Apple login

commit    : 2 uncommitted files → commit (Benjamin Pisano)
sprint    : merge wa/42-add-apple-login → sprint/login-refacto
branch    : wa/42-add-apple-login deleted (merged)
worktree  : ../.wa-worktrees/42-add-apple-login removed
issue     : #42 → Done, stays open until sprint PR merges
after     : 🏁 Login refacto — 3/5

ok? [y/n]
```

Rules:

- **Always shown, always confirmed.** `strategy: nothing` and no commit → two lines and a yes, still worth it.
- **`strategy: pr` = loud case.** PR visible to other people second it opens. Name target branch, that it push, and show **exact title and body** you'll use (**wa-board → PR wording**) — user can edit them before yes. Never open one on implied yes carried from earlier close.
- Anything you skip (no commit, no worktree, branch kept) → say it skipped, not omit line. Silence read as "it happened".
- User say no → stop at step 3. Task stay `to-close`, nothing touched.

## Landing

**Task in sprint** (`sprint:` set, `branch.sprint_prefix` non-empty):

1. Sprint branch = `<branch.sprint_prefix><kebab(sprint)>` (default `sprint/login-refacto`). Absent → create from `branch.base`; happen when task coded before sprints existed.
2. Merge task branch into it. **Not rebase, not squash** — sprint branch is working branch, history yours to rewrite later if want.
3. **Conflict → stop, leave merge in progress**, name files, say task stay `to-close` until resolved. Never `--abort` behind their back, never guess resolution: conflict between two tasks of one sprint = real design question.
4. Task branch landed → `delete_branch: auto` delete it.

**Standalone task** (no sprint, or `sprint_prefix` empty) → `close.strategy`:

- **`nothing`** (default) — stop after commit. Branch stay exactly where it is. Say plainly (`branch wa/42-add-apple-login kept — PR is yours`; `github` → add `put Closes #42 in it`) so nobody wait on PR that not coming.
- **`pr`** — push branch, then `gh pr create --base <close.target>`. Title and body per **wa-board → PR wording**: title = task `title`, body = `summary` as the one-liner, **Changes** from what `## Implementation` changed for the app, **To test** from `## Acceptance criteria` rewritten as short checks, `github` → `Closes #<n>` last. Print URL. `gh` missing or unauthenticated → say so, fall back to `nothing`, leave branch pushed. **Never delete branch with open PR**, whatever `delete_branch` say.
- **`merge`** — merge into `close.target` locally, **no push**. `github` → close the issue yourself (no PR will): `gh issue close <n> --reason completed`. Target checked out elsewhere or dirty → say so, stop. Conflict → same rule as sprint merge: leave it, name files.

**`branch.per_task: false`** — task coded on whatever branch you were on. Nothing to land, nothing to delete: commit, mark done, say so. Skip *Landing* and *Cleanup* whole.

## Cleanup

Order matter — worktree holding branch block deleting it.

1. **Worktree** — `../.wa-worktrees/<key>` (autopilot leftover) → `git worktree remove`. Dirty → **stop and ask**; uncommitted work in worktree still work.
2. **Branch** — `close.delete_branch`:
   - `auto` (default) → delete only when code live somewhere else: merged into sprint branch, or merged into `close.target`. `pr` and `nothing` keep branch.
   - `always` → delete. **Unmerged → ask first**, say what would be lost.
   - `never` → keep, say so.
3. **Local only.** Never delete remote branch, never `push --delete`, unless asked in that message.

## Sprint landing

Last task of sprint reach `done` — no task of that sprint left in `draft`, `todo`, `coding`, `to-test` or `to-close`:

1. Say it: `🏁 Login refacto — 5/5, last task closed.`
2. **Propose** applying `close.strategy` to sprint branch, onto `close.target` — same three behaviours as standalone task, recommendation first:
   ```
   → Recommended: PR sprint/login-refacto → main   (close.strategy: pr)
     Otherwise: keep the branch, you ship it yourself.
   ```
3. **Only on yes.** No is a normal answer — the branch stays, the sprint stays complete, nothing is lost. Never fold this into the task's own confirmation at step 3: two different things landing, two yeses.
   Sprint PR → title and body per **wa-board → PR wording**: title = sprint's theme in 1–3 words (`Performance`, `Map architecture`), body sums up the sprint for someone who never saw its tasks — never one bullet per task, never task slugs. `github` → `Closes #<n>` for every task of the sprint + sprint milestone set on the PR (`gh pr create --milestone "<Sprint>"`).
4. Sprint branch merged or PR'd → `delete_branch` applies to it the same way it applies to a task branch.

A sprint is never `done` as a thing — there's no sprint status to set. It's complete when its tasks are, and this step is the only place that notices.

## Interaction with the rest

- **`/wa-validate`** sets `to-close` and stops there. It never commits, never touches a branch, never sets `done`.
- **`/wa-feedback` on a `to-close` task** → state back to `to-test`, needs `/wa-validate` again before it can be closed.
- **`/wa-autopilot`** leaves tasks at `to-test` on their own branches, worktrees already removed (except blocked ones). Each still goes `/wa-validate` → `/wa-close`.
- **`/wa-wiki`** is the step after, once the task is closed.

## Never

- Never close a task the verifier never saw (`to-test` → `/wa-validate` first).
- Never merge, push, open a PR or delete a branch without the confirmed plan block.
- Never force-push, never rewrite a shared branch, never touch a branch that isn't this task's or its sprint's.
- Never delete a branch whose work isn't somewhere else.
- Never commit as Claude.
- Never write to a literal `.whackagent/` path when the config's `paths:` points elsewhere.

## Asking

Every question carries your recommended answer plus a one-line reason — conflict resolution, unmerged branch, missing `gh`. Never a bare question.

## Next step

**`/wa-wiki`** to sync what this task taught the project, then `/wa-board` for what's next.