---
name: wa-close
description: Finishes a task: reviews it if needed, updates the wiki, commits, lands the branch.
---

# /wa-close

Lands a tested task: review if missing, wiki, commit, branch.

Read: voice, pr, components, tasks, git, store

## Steps

1. **Resolve** the task (**tasks → Ids**). No arg → most recent `to-close`, else most recent `to-test`.
   - `to-test` → **Warning**: not reviewed yet, review first (step 2).
   - `draft` / `grilling` / `todo` / `coding` → not coded, stop.
   - `done` / `canceled` → say what branch did, stop.
   - `github` → `claim <n> coding --keep-state` (**store-github → Locks**).
   - Stacked (`stacked on:` in `## Implementation`) → maintain it per **git → Stacking**:
     - blocker not landed → **Warning** `⛔`, **Next** `/wa-close <blocker>`, stop
     - blocker landed → rebase own commits onto real base before review; `github`: `gh pr edit <pr> --base <base>`
   - **Be on the task branch** — as **wa-validate** step 2:
     - not on it → name it, switch only on yes (**git → Dirty tree**)
     - sprint test branch → **git → Sprint test branch → Leaving it**
2. **Review** `to-test` → *Review*.
3. **Check nothing moved** — `git diff` against the state `## Review` recorded. Changed → say what, *Review* with scope = delta.
4. **Wiki** → *Wiki*, before commit.
5. **Print** a **Landing** before touching git, then go on: no yes needed.
   - Code changed since the user's test → **Warning** + `ok?`, wait.
     - No → stop. Task stays `to-close`, review recorded, wiki pages left in tree, say so. `github` → `release <n> coding`.
   - PR line: number once it exists, `PR · **Add Apple login**` when about to be created. Title → **pr**. Body never shown.
6. **Commit** — `files`: when `commit.auto_commit_after_validation`; `github`: always. Author → **git → Commits**.
   - Clean tree → skip.
   - Nothing committed + dirty tree → stop before any branch move.
7. **Land** — `github` → *GitHub landing*. `files` → *Land*.
8. **Clean up** — `files` only → *Cleanup*.
9. **Set `done`** — `files` only, per **store** (backlog line keeps `· <Sprint>`). `github`: never, the hook does.
10. **Sprint complete?** Last task of a sprint closed (`github`: merged) → *Sprint landing*.
11. **Next branch** — `files`, when `branch.per_task` + `commit.auto_commit_after_validation` + `branch.checkout_next`:
    - top unblocked `todo` → its branch per **git → Task branch** (**git → Dirty tree**)
    - show its **Branch line**, **Next** `/wa-code <n>`
12. **Report** — the **Landing** again, PR URL when one exists. Failed step → its extra line only.

## Review

Run **wa-validate** steps 3–7 in full, scope = cumulative diff (or delta):
- 3: criteria back. User knows one is unmet → `/wa-feedback`, stop.
- 4–5: one verifier, four lenses, autofix cap 3, `## Review` round `validation`.
- 6: `verify.mode: always` + autofix touched code → implementer re-drives the app.
- 7: `to-close`.

Outcomes:
- Clean, autofix changed nothing → silent.
- Clean, autofix changed code → step 5 warns, in user terms. Yes = retested. Never bury it.
- Findings open → **Findings** with picks. Nothing lands, task back to `to-test`.
  - `github` → commit + push the round, task file `status: to-test` (moves the card), lock released.

## Wiki

`/wa-wiki` update mode, every time, scoped to this task:
- diff (`branch.base` or sprint branch `..HEAD` + tree), `wiki:` field, `## Implementation`, report
- pages left in tree, committed at step 6
- nothing to change → silent
- unsure which page → **Question**

## GitHub landing

Branch + draft PR exist since `/wa-code`. `close.strategy`, `close.delete_branch` ignored.

1. **Commit** — `status: to-close` + review round + wiki + autofix, one commit.
2. **Rebase if needed** — base = sprint branch if in sprint, else `branch.base`.
   - `git fetch` + `gh pr view --json mergeable,baseRefName`.
   - Behind or `CONFLICTING` → rebase task range onto `origin/<base>`, rebuild.
   - Conflict → stop, leave rebase in progress, name files, task stays `to-close`.
3. **Push** — `--force-with-lease` only after a rebase, own branch only. Push releases the lock.
   - Autopilot worktree → remove after push. Dirty → stop, ask.
4. **PR ready** — refresh title + body (**pr**), `gh pr edit`, `gh pr ready`.
   - No PR (pre-0.13) → `gh pr create --base <base>` non-draft + `link-pr <n> <pr>`.
5. **Stop.** User merges on GitHub; the hook does the rest.

Failure before the push → lock still held: say so. User leaves it → `release <n> coding --reason "<what failed>"`.

## Land

`files`.

- **In sprint** (`sprint:` set, `branch.sprint_prefix` ≠ `""`) → merge into sprint branch (**git → Sprint branch**). Absent → create from `branch.base`.
  - Merge, never rebase or squash.
  - Conflict → stop, leave merge in progress, name files, task stays `to-close`.
- **Standalone** → `close.strategy`:
  - `nothing` (default) → stop after commit. **Landing** extra line: branch kept, PR is yours.
  - `pr` → push, `gh pr create --base <close.target>`, title + body per **pr** (To test from `## Acceptance criteria`). Print URL.
    - `gh` missing or unauthenticated → say so, fall back to `nothing`, branch stays pushed.
  - `merge` → merge into `close.target` locally, no push.
    - Target checked out elsewhere or dirty → say so, stop.
    - Conflict → as sprint merge.
- **`branch.per_task: false`** → nothing to land: commit, set `done`, say so. Skip *Cleanup*.

## Cleanup

1. **Worktree** first: `../.wa-worktrees/<key>` → `git worktree remove`. Dirty → stop, ask.
2. **Branch** per `close.delete_branch`:
   - `auto` (default) → delete only once merged into sprint branch or `close.target`. `pr`, `nothing` keep it.
   - `always` → delete. Unmerged → ask first, say what would be lost.
   - `never` → keep, say so.

## Sprint landing

Sprint complete per **tasks → Sprints**.

- `github` → completes when the last task PR merges. This close can't see it: 🏁 line (**components → Task list**) + sprint PR once the task PR merges. Next `/wa-close` or `/wa-board` that finds it complete proposes it.

Then:

1. Show its 🏁 line (**components → Task list**).
2. **Question**: apply `close.strategy` to the sprint branch onto `close.target`; alt = keep the branch, user ships it.
   - `github` → always a PR onto `branch.base`, `--milestone "<Sprint>"`.
   - Sprint PR title + body → **pr** (sums up the sprint).
3. **Only on yes.** No → branch stays, nothing lost.
4. Sprint branch merged or PR'd → `close.delete_branch` applies as for a task branch.
5. Delete the sprint test branch, whatever the answer. Checked out → switch to sprint branch first.

## Never

- Never land a task the verifier never saw, or with open findings.
- Never close from the sprint test branch, never merge from it.
- `github`: never `gh pr merge`, never set `done`, never close the issue, never delete the branch.
- Never guess a conflict resolution, never `--abort` it behind the user's back.
- Never force-push except own task branch after a rebase. Never rewrite a shared branch.
- Never touch another task's or sprint's branch.
- Never delete a branch whose work isn't elsewhere, or one with an open PR.
- Never delete a remote branch or `push --delete` unless asked in that message.

## Ask

- Conflict, unmerged branch, missing `gh`, dirty worktree → **Question**.

## Next

- `files` → `→ next: /wa-board`.
- `github` → `→ next: merge the PR on GitHub`.
