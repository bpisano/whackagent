---
name: wa-close
description: Finishes a task: reviews it if needed, updates the wiki, commits, lands the branch.
---

# /wa-close

**Task finished.** You tested it, does what you asked. `/wa-close` make sure verifier saw it, wiki knows it, then put branch where belong.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Where sit: `/wa-task` → `/wa-code` → *you test, `/wa-feedback`* → (`/wa-validate` → *you retest*) → **`/wa-close`**.

`/wa-validate` = **review** door — judge code, set `to-close`. `/wa-close` = **landing** door — end task, move branch. Task not reviewed yet → `/wa-close` run review first, same pass; then wiki; then landing. Nothing lands unreviewed, wiki never lags a closed task.

## Do

1. **Resolve task.** Task id, per **wa-board → Task ids**; echo what resolved. No arg → most recent `to-close`, else most recent `to-test`. Read `.whackagent/config.md` + the task per **wa-board → Task store** — `{…}` paths per **wa-board → Paths**.
   - `to-close` → reviewed. Step 2.
   - `to-test` → **never reviewed.** Say so in one line (`#42 not reviewed yet → review first`), run *Review* below, then continue.
   - `draft` / `grilling` / `todo` / `coding` → not coded. Stop.
   - `done` / `canceled` → already closed. Say what branch did, stop.
   - `github` → `github-board claim <n> coding --keep-state` first (from `to-test` / `to-close`) — review round per **wa-board → Task store → Locks**: lock taken, card stays where it is through review and through `ok?` when one is asked. Exit 3 → name owner, stop. Exit 4 → say state, stop.
   - **Stacked task** (`stacked on:` line in `## Implementation`, left by `/wa-autopilot`) → **wa-board → Dependencies → Stacking**. Blocker not landed → stop: `#44 stacked on #42 — /wa-close 42 first`. Blocker landed → rebase task own commits onto real base before review, `github`: `gh pr edit <pr> --base <base>`.
   - **Be on task branch.** On sprint test branch with clean tree → check out task branch without asking (**wa-board → Sprint test branch → Leaving it**). Never close from test branch: its merges aren't the task.
2. **Check nothing moved** since review round — `git diff` against state `## Review` recorded. Code changed → say what, re-review the delta inline (*Review*, scope = delta). Review only worth tree it read.
3. **Wiki** — *Wiki* below. Before commit, so pages ship with code.
4. **Say where it lands** — *Landing lines* below, before touching git. **No confirmation**: print, keep going. Only exception: code changed since user's test → ask `ok?`, wait.
5. **Commit** — `files`: when `commit.auto_commit_after_validation`. `github`: always (round ends with push). `commit.author_name` / `commit.author_email`, **never as Claude**. Already clean → skip, say so.
   - Nothing committed and tree dirty → **stop before any branch move.** Uncommitted work plus merge = how work disappear.
6. **Land branch** — *Landing* below. `github` → *GitHub landing*. `files`: task in sprint → merge into sprint branch, else → `close.strategy`.
7. **Clean up** — `files` only, *Cleanup* below. Worktree then branch, that order, `close.delete_branch` decide.
8. **State `done`** — `files` only, per **Task store** (line moves under **Done**, keeps `· <Sprint>` suffix). `github`: never — hook sets `done` at merge.
9. **Sprint complete?** Last task of sprint just closed (`github`: merged) → *Sprint landing*.
10. **Next branch** — `files` only, when `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next`: next task = top unblocked `todo` in backlog order, branch created/checked out per `/wa-code` step 0 (its sprint decide base — dirty tree → ask). Echo `✅ add-apple-login closed → branch wa/fix-login-errors ready · /wa-code 2`.
11. **Report** — one line: `✅` + what landed where, PR URL when there is one. Same formatting as *Landing lines*. Nothing about review, wiki, commit, cleanup unless one of them failed or stopped.

## Review

Task at `to-test`, or code moved since `to-close`. **Same pass as `/wa-validate` steps 2–6** — branch check, acceptance criteria listed back, one `wa-verifier` over cumulative diff (or delta), four lenses, autofix loop cap 3, recorded in `## Review` under `validation` round. Set `to-close` in task.

Three outcomes:

- **Clean, autofix changed nothing** → code tested *is* code reviewed. Continue, say nothing.
- **Clean, autofix changed code** → continue to step 4, landing lines carry `⚠️ code changed since your test` + what changed in user terms, and ask `ok?`. Their yes = "I retested". Never bury this line.
- **Findings still open** → stop, as `/wa-validate` step 8: severity-ordered, recommendation per item (fix now / accept and close / spin off `/wa-task`). Nothing lands. Task back to `to-test` (not reviewed clean, not closable), same as `/wa-validate`. `github` → commit + push the review round (task file `status: to-test`) so board follows, lock released.

## Wiki

`/wa-wiki` update mode, **scoped to this task**: its diff (`branch.base`/sprint branch..HEAD + tree), its `wiki:` field, `## Implementation`, report. Every time — no flag, pass idempotent: already synced → finds nothing. Pages written in working tree, **not committed here** — step 5 commits them with code. Nothing to change → say nothing. Can't tell which page a change belongs to → ask, recommend one.

## Landing lines

Only the essential: branch → where it goes, plus PR title when a PR is involved. Printed before touching git, then keep going.

Merge (sprint branch, or `strategy: merge`):

````markdown
`wa/add-apple-login` → `sprint/login-refacto`
````

PR (`github`, or `strategy: pr`):

````markdown
`wa/42-add-apple-login` → `sprint/login-refacto`
PR #57 · **Add Apple login**
````

Code changed since user's test — the one case that waits for a yes:

````markdown
`wa/42-add-apple-login` → `sprint/login-refacto`
PR #57 · **Add Apple login**
⚠️ code changed since your test: Apple button disabled while loading

ok? [y/n]
````

Rules:

- **Plain text, never a fenced block.** Backticks on branch names only, PR title bold, everything else unstyled. Fences above show the markdown to emit, not a block to print.
- **No confirmation by default** — merge, push, PR, PR ready all run on the command itself. `ok?` only with the `⚠️` line (autofix or delta review changed code user never tested). User say no → stop. Task stay `to-close` (review recorded, wiki pages left in tree, say so), nothing else touched. `github` → `github-board release <n> coding` (card never moved).
- **Nothing else.** No review, wiki, commit, branch-delete, worktree, sprint-progress lines. They happen silently; one extra plain line only when a step failed or stopped.
- **PR line** = number when PR exists (`github`: draft opened by `/wa-code`), none when it's about to be created (`PR · **Add Apple login**`). Title = final one, per **wa-board → PR wording**. Body never shown.
- **`strategy: nothing`** / `branch.per_task: false` → nothing lands: one line, `wa/add-apple-login` kept, no merge.

## GitHub landing

`tasks.backend: github`. Task branch + draft PR exist since `/wa-code`. `close.strategy` and `close.delete_branch` ignored.

1. **Status** — task file `status: to-close` (Review set it). Commit review round, wiki pages, autofix — one commit, configured author.
2. **Rebase if needed** — base = sprint branch when task in sprint, else `branch.base`. `gh pr view --json mergeable,baseRefName` + `git fetch`. Behind or `CONFLICTING` → rebase task range onto `origin/<base>`, rebuild. Conflict → stop, leave rebase in progress, name files, say task stays `to-close`. Never guess resolution.

Any step failing before the push (rebase conflict, commit error, push rejected) → lock still held: say so, `github-board release <n> coding --reason "<what failed>"` once user decides to leave it, never silently.
3. **Push** — `git push`; after rebase only → `--force-with-lease`, own task branch only. Push ends round: hook releases coding lock.
4. **PR ready** — refresh title and body per **wa-board → PR wording** (`Closes #<n>` last), `gh pr edit`, then `gh pr ready`. No PR found (task coded before 0.13) → `gh pr create --base <base>` non-draft + `github-board link-pr <n> <pr>`.
5. **Stop.** User merges on GitHub (CI, review, protected branch — team gesture). Hook sets `done`, closes issue, closes empty milestone. Never `gh pr merge`, never delete branch (PR needs it), never close issue, never set `done`.

Worktree left by `/wa-autopilot` → remove after push (clean only; dirty → stop and ask).

## Landing

`files` backend.

**Task in sprint** (`sprint:` set, `branch.sprint_prefix` non-empty):

1. Sprint branch = `<branch.sprint_prefix><kebab(sprint)>` (default `sprint/login-refacto`). Absent → create from `branch.base`; happen when task coded before sprints existed.
2. Merge task branch into it. **Not rebase, not squash** — sprint branch is working branch, history yours to rewrite later if want.
3. **Conflict → stop, leave merge in progress**, name files, say task stay `to-close` until resolved. Never `--abort` behind their back, never guess resolution: conflict between two tasks of one sprint = real design question.
4. Task branch landed → `delete_branch: auto` delete it.

**Standalone task** (no sprint, or `sprint_prefix` empty) → `close.strategy`:

- **`nothing`** (default) — stop after commit. Branch stay exactly where it is. Say plainly (`branch wa/add-apple-login kept — PR is yours`) so nobody wait on PR that not coming.
- **`pr`** — push branch, then `gh pr create --base <close.target>`. Title and body per **wa-board → PR wording**: title = task `title`, body = `summary` as the one-liner, **Changes** from what `## Implementation` changed for the app, **To test** from `## Acceptance criteria` rewritten as short checks. Print URL. `gh` missing or unauthenticated → say so, fall back to `nothing`, leave branch pushed. **Never delete branch with open PR**, whatever `delete_branch` say.
- **`merge`** — merge into `close.target` locally, **no push**. Target checked out elsewhere or dirty → say so, stop. Conflict → same rule as sprint merge: leave it, name files.

**`branch.per_task: false`** — task coded on whatever branch you were on. Nothing to land, nothing to delete: commit, mark done, say so. Skip *Landing* and *Cleanup* whole.

## Cleanup

`files` backend. Order matter — worktree holding branch block deleting it.

1. **Worktree** — `../.wa-worktrees/<key>` (autopilot leftover) → `git worktree remove`. Dirty → **stop and ask**; uncommitted work in worktree still work.
2. **Branch** — `close.delete_branch`:
   - `auto` (default) → delete only when code live somewhere else: merged into sprint branch, or merged into `close.target`. `pr` and `nothing` keep branch.
   - `always` → delete. **Unmerged → ask first**, say what would be lost.
   - `never` → keep, say so.
3. **Local only.** Never delete remote branch, never `push --delete`, unless asked in that message.

## Sprint landing

Last task of sprint reach `done` — no task of that sprint left in `draft`, `grilling`, `todo`, `coding`, `to-test` or `to-close`. `github`: task PRs target sprint branch, so sprint completes when last one **merges** — `/wa-close` of last task can't see it yet: say `🏁 Login refacto — last task, sprint PR once #57 merged`, and next `/wa-close` or `/wa-board` that finds sprint complete proposes it.

1. Say it: `🏁 Login refacto — 5/5, last task closed.`
2. **Propose** applying `close.strategy` to sprint branch, onto `close.target` — same three behaviours as standalone task, recommendation first:
   ```
   → Recommended: PR sprint/login-refacto → main   (close.strategy: pr)
     Otherwise: keep the branch, you ship it yourself.
   ```
3. **Only on yes.** No is a normal answer — the branch stays, the sprint stays complete, nothing is lost. Never skip this yes because the task landed without one: sprint branch leaving for `close.target` is a separate decision.
   Sprint PR → title and body per **wa-board → PR wording**: title = sprint's theme in 1–3 words (`Performance`, `Map architecture`), body sums up the sprint for someone who never saw its tasks — never one bullet per task, never task slugs. `github` → PR always (not `close.strategy`), onto `branch.base`, sprint milestone set on the PR (`gh pr create --milestone "<Sprint>"`); tasks already closed by their own merges.
4. Sprint branch merged or PR'd → `delete_branch` applies to it the same way it applies to a task branch.
5. **Sprint test branch** (`<sprint branch>-test`) → delete it, whatever the answer at step 3: no delivered task left to test. Checked out → switch to sprint branch first. Local only, was never pushed.

A sprint is never `done` as a thing — there's no sprint status to set. It's complete when its tasks are, and this step is the only place that notices.

## Interaction with the rest

- **`/wa-validate`** sets `to-close` and stops there. Optional now: `/wa-close` on a `to-test` task runs same review itself. Run it apart when you want to retest reviewed code before landing.
- **`/wa-feedback` on a `to-close` task** → state back to `to-test`, needs `/wa-validate` again before it can be closed.
- **`/wa-autopilot`** leaves tasks at `to-test` on their own branches, worktrees already removed (except blocked ones). Each goes `/wa-close` (review included).
- **Sprint test branch** — where user tested: sprint + every delivered task, local only (**wa-board → Sprint test branch**). `/wa-close` never lands it, never merges from it; task lands from its own branch. Stale after a close → next delivery rebuilds it.
- **`/wa-wiki`** runs inside `/wa-close`, scoped to the task. Standalone `/wa-wiki` = sync outside any task.

## Never

- Never land a task the verifier never saw — `to-test` → *Review* first, open findings → stop.
- Never land code without its wiki pass.
- Never touch git before the landing lines are printed. Never land code changed since user's test without their yes.
- `github`: never merge the PR, never set `done`, never close the issue — the merge and the hook do.
- Never force-push, never rewrite a shared branch, never touch a branch that isn't this task's or its sprint's.
- Never delete a branch whose work isn't somewhere else.
- Never commit as Claude.
- Never write to a literal `.whackagent/` path when the config's `paths:` points elsewhere.

## Asking

Every question carries your recommended answer plus a one-line reason — conflict resolution, unmerged branch, missing `gh`. Never a bare question.

## Next step

**`/wa-board`** for what's next. `github` → merge the PR on GitHub; board follows.