---
name: wa-close
description: Close validated task — commit, land branch, clean up. GitHub: merges ready PR on your yes. `/wa-close <sprint>` lands sprint.
---

# /wa-close

**Task finished.** You retested reviewed code, still does what you asked. `/wa-close` write that down, put branch where belong.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `paths.md` `session-name.md` `commits.md` · arg is display index → + `display.md` · `branch.worktree: true` → + `worktrees.md` · task or arg has sprint → + `sprints.md` · `close.strategy: pr` or GitHub → + `pull-requests.md` · `backlog.provider: github` → + `provider-github.md` · `branch.tracks` non-empty → + `tracks.md`.

Wording (screen + reports): **reference/voice.md** — telegraphic, tech terms stay English.

Where sit: `/wa-task` → `/wa-grill` → `/wa-code` → *you test, `/wa-feedback`* → `/wa-validate` (verifier) → *you retest* → **`/wa-close`**.

`/wa-validate` = **review** door — judge code, set `validated`. `/wa-close` = **landing** door — end task, move branch. Two commands, two questions. Second one touch git in ways you want see coming.

## Do

1. **Resolve task.** Slug or display index, per **reference/display.md → Task indexes**; echo what resolved. No arg → most recent `validated`. Name session per **reference/session-name.md**. Arg names sprint, no task (**reference/sprints.md**, *Resolving a name*; GitHub: open `wa-sprint` parent, kebab title) → *Sprint arg* below instead. Read `.whackagent/config.md` + `{tasks}/<slug>.md` — `{…}` paths per **reference/paths.md**.
   - `status: validated` → normal path, continue.
   - `status: review` → **never reviewed.** Say so, send to `/wa-validate <slug>`, stop. Closing here close unreviewed code.
   - `status: in-progress` → not coded. Stop.
   - `status: done` / `canceled` → already closed. Say what branch did, stop.
2. **Check nothing moved** since review round — `git diff` against state `## Review` recorded. Code changed → say what, send back to `/wa-validate` for delta. Review only worth tree it read.
2b. **Sync wiki — always, before plan.** Run **`/wa-wiki`** update mode scoped to this task (its diff + task file, `wiki:` pages it flagged), on task branch. Wiki pages edited → listed in plan block, committed **with task** in step 4 (one commit, one PR — wiki never lands separately or later). Nothing to update → say `wiki: nothing to sync`. Wiki edits don't count as "code moved" for step 2: docs, not reviewed code.
3. **Show landing plan, get yes.** One block, before touching git — see *Plan block*. Only confirmation command ask; everything after run without more prompting.
4. **Commit** — when `commit.auto_commit_after_validation`. Author + message per **reference/commits.md**. Already clean → skip, say so.
   - Nothing committed and tree dirty → **stop before any branch move.** Uncommitted work plus merge = how work disappear.
   - `branch.worktree: true` → commit in task worktree: code + wiki. Local task file + `{backlog}` stay main-checkout bookkeeping, not in task commit (**reference/worktrees.md**).
5. **Land branch** — *Landing* below. Task in sprint → into sprint branch (`close.strategy: pr` → PR onto it, else merge). Else → `close.strategy`.
6. **Clean up** — *Cleanup* below. Worktree then branch, that order, `close.delete_branch` decide.
7. **`status: done`**, reflect in `{backlog}` (move line under **Done**, keep `· <sprint>` suffix).
8. **Sprint complete?** Last task of sprint just closed → *Sprint landing*.
9. **Next branch** — when `branch.per_task` **and** `commit.auto_commit_after_validation` **and** `branch.checkout_next`: next task = top `todo` in `{backlog}` order, branch created/checked out per `/wa-code` step 0 (its sprint decide base — dirty tree → ask). Echo `✅ <slug> closed → branch wa/<next-slug> ready`, next line `/wa-code <next-slug>` (**reference/voice.md → Next line**). Worktree mode → its worktree created instead, echo `→ worktree ../<repo>-worktrees/<next-slug> ready`.
10. **Report** — after-state, four lines max: what landed where, what deleted, sprint progress, next command.

## GitHub provider

`backlog.provider: github` (rules **reference/provider-github.md**). Ticket PR already carries everything — `/wa-validate` synced wiki, rebased, marked it ready. `/wa-close` = **merge it for you**, on your yes. Merging on GitHub yourself is just as good: hook sets `done` either way. Replaces steps 2–9:

0. **Hooks version gate** (**reference/provider-github.md**, *Hooks version gate*) before claim.
1. **Resolve** `#12` / `12` / index. PR = issue's linked PRs (`gh issue view <n> --json closedByPullRequestsReferences`), fallback `gh pr list --head <branch> --state all --json number,state,isDraft,url`. `phase:` in task file plays `status:` in step 1.
   - No PR → not delivered: `/wa-code <n>`, stop.
   - Merged → hook already set `done`: say so, run step 7 cleanup only.
   - **Draft** → not validated: `/wa-validate <n>` marks it ready (no re-review when `phase: validated` and code untouched), stop.
   - **Ready, `phase: review`** → findings never cleared: `/wa-validate <n>`, stop.
   - **Ready, no task file / `phase` empty** → another work loop's PR (**BOARD.md → Working a ticket** allows it): merge on yes after step 2 checks, no rebase offered — `CONFLICTING` → stop, say so (PR owner rebases).
   - **Ready** → continue.
2. **Mergeable?** `gh pr view <pr> --json mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,baseRefName,body` (retry while `UNKNOWN`):
   - Base = another ticket's open branch (stacked, parent not landed) → stop: parent merges first (`/wa-close <parent>`), GitHub then retargets and rebases this one (**reference/provider-github.md**, *Stacked PRs*) — start from `origin/<branch>`.
   - Checks failing → name them, stop: `/wa-feedback <n>`. Pending → plan says it waits (`gh pr checks <pr> --watch`).
   - `reviewDecision` `REVIEW_REQUIRED` / `CHANGES_REQUESTED` → GitHub refuses: name who's requested, stop. Never `--admin`.
   - `CONFLICTING` → plan adds rebase: ticket range onto PR base (step 4).
   - Criteria left `- [ ]` in PR body → named in plan: merging ships them unproven.
3. **Plan block + yes**, every time — *Plan block*, GitHub example. Nothing touched before yes.
4. **Claim** `wa-backlog claim <n> coding` from `review`: no other round pushes while you merge (exit 3 → someone mid-round, say who, stop). Rebase planned → `git rebase --onto origin/<base> $start^` (ticket range, **reference/provider-github.md**; plain `git rebase <base>` replays squashed parents), mechanical conflicts yourself, logic → stop and ask with recommended resolution; build + tests, red → release `--reset-to review`, back to `/wa-feedback`; `push --force-with-lease`. Push ends round: hook drops claim → wait for it (`wa-backlog get <n>` shows `review`, no claim), re-claim `coding`, re-run step 2 checks (pending → `gh pr checks <pr> --watch`), then merge.
5. **Merge** — `wa-backlog merge <pr>` (async merge: only way GitHub merges stacked PR, fine for any; waits for result; ticket carrying `lands: <track>` → `--method merge`, **reference/tracks.md**). Exit 4 → PR below in stack still open or PR not ready: say so. Remote branch goes with `delete_branch_on_merge` (provision sets it; off → say so, leave it — deleting by hand closes PRs stacked on it). Refused → claim still held → `release <n> coding --reset-to review --reason "merge refused: <why>"`; say why, stop.
6. **Board** — hook sets `done`, drops claim, closes issue. Confirm `wa-backlog get <n>` shows `done` (re-read once after ~30 s). Never set state yourself.
7. **Cleanup** — worktree removed when clean (dirty → stop and ask), local branch `git branch -D` (squash leaves it unmerged to git; PR merged = code on base), `git fetch --prune`. `close.delete_branch: never` → keep local branch, say so. Never `push --delete`.
8. **Sprint** — ticket was its sprint's last open sub-issue → *Sprint landing*: sprint PR onto `close.target` (track sprint: its trunk) per **reference/pull-requests.md** (`{title}` = sprint name), body names sprint parent (`Sprint #<parent>`). Offer merging it (`--merge`, never squash, second yes) only when step 2 checks already pass; else say it merges once reviewed — on GitHub, or `/wa-close <sprint>` later. Merge → hook closes parent.
9. **Next** (`branch.checkout_next`) → next ticket only through **claim**: `/wa-code` without arg picks top unclaimed `grilled`. Never check out ticket branch you don't hold.

Local provider with `close.strategy: pr` keeps *PR landing* below: PR left ready, never merged.

## Plan block

Say what you about to do to git **before** doing it, in their terms. Landing outward-facing, half irreversible:

```
Closing login-apple

wiki      : [[auth]] updated, [[login-apple]] created (/wa-wiki)
commit    : 2 uncommitted files + 2 wiki pages → commit (Jane Doe)
sprint    : merge wa/login-apple → sprint/login-refacto
branch    : wa/login-apple deleted (merged)
worktree  : ../<repo>-worktrees/login-apple removed
after     : 🏁 login-refacto — 3/5

ok? [y/n]
```

GitHub provider:

```
Closing #12 login-apple

pr        : #42 ready · checks ✅ · approved · base sprint/login-refacto
merge     : squash #42 → sprint/login-refacto (hook sets done, closes #12)
unproven  : "works offline" left - [ ] in PR body
branch    : wa/12-login-apple — remote deleted on merge, local deleted
worktree  : ../<repo>-worktrees/12-login-apple removed
after     : 🏁 login-refacto — 4/5

ok? [y/n]
```

`close.strategy: pr` (local provider), same task:

```
push      : wa/login-apple → origin
pr        : draft #42 → ready for review, body refreshed, reviewers @team · base sprint/login-refacto
merge     : none — PR merged on GitHub by a human
branch    : wa/login-apple kept (PR open)
```

Rules:

- **Always shown, always confirmed.** `strategy: nothing` and no commit → two lines and a yes, still worth it.
- **`strategy: pr` = loud case.** PR visible to other people second it opens, ready PR pings reviewers. Name base branch, title you use, that it push, and what happens to PR: draft → ready, opened ready, or ready one refreshed. Never open or mark ready on implied yes carried from earlier close.
- Anything you skip (no commit, no worktree, branch kept) → say it skipped, not omit line. Silence read as "it happened".
- User say no → stop at step 3. Task stay `validated`, nothing touched.

## Landing

**Task in sprint** (`sprint:` set, `branch.sprint_prefix` non-empty):

1. Sprint branch = `<branch.sprint_prefix><sprint>` (default `sprint/login-refacto`). Absent → create from `branch.base` (track task: its trunk); happen when task coded before sprints existed.
   - **`close.strategy: pr` → no merge.** *PR landing* below, base = sprint branch. Sprint branch missing on remote → push it first (plan block says so). Steps 2–4 skipped: task code reaches sprint branch when human merges PR.
2. Merge task branch into it. **Not rebase, not squash** — sprint branch is working branch, history yours to rewrite later if want.
3. **Conflict → stop, leave merge in progress**, name files, say task stay `validated` until resolved. Never `--abort` behind their back, never guess resolution: conflict between two tasks of one sprint = real design question.
4. Task branch landed → `delete_branch: auto` delete it.

**Standalone task** (no sprint, or `sprint_prefix` empty) → `close.strategy`. Track task (**reference/tracks.md**): `close.target` below reads its trunk.

- **`nothing`** (default) — stop after commit. Branch stay exactly where it is. Say plainly (`branch wa/login-apple kept — PR is yours`) so nobody wait on PR that not coming.
- **`pr`** — *PR landing* below, base = `close.target`.
- **`merge`** — merge into `close.target` locally, **no push**. Target checked out elsewhere or dirty → say so, stop. Conflict → same rule as sprint merge: leave it, name files.

**PR landing** — `close.strategy: pr`, task or sprint. End state: **PR open, ready for review, never merged.**

1. **Push** `git push -u origin <branch>`. Rejected (remote moved) → stop, say so: never force.
2. **Find PR** — `gh pr list --head <branch> --state open --json number,isDraft,baseRefName,url`.
   - **Draft** (opened by hand, or earlier round) → refresh body (**reference/pull-requests.md**, *Refresh*), base differs → `gh pr edit <pr> --base <base>`, then `gh pr ready <pr>` + `pr.reviewers` requested. Draft = your test, ready = review.
   - **Ready already** → refresh body only, base fixed same way.
   - **None** → `gh pr create --base <base> --head <branch>`, **not** `--draft`: title, body, labels, assignees, reviewers at creation per **reference/pull-requests.md**.
3. Status line in whackagent block: `Ready — validated. Review, then merge.` Print URL.
4. **Never merge it** — no `gh pr merge`, no local merge of that branch into base. Merge = human's, on GitHub.
5. `gh` missing or unauthenticated → say so, fall back to `nothing`, leave branch pushed. **Never delete branch with open PR**, whatever `delete_branch` say.

**`branch.worktree: true`** — merges run in a worktree, never switch main checkout. Target (sprint branch or `close.target`) checked out nowhere → task worktree, clean after commit: `git switch <target>`, merge task branch there. Target checked out in main checkout → merge there, only when clean; dirty → say so, stop. Conflict → merge left in progress **in that checkout**, name its path; cleanup skips worktree holding it.

**Task carrying `lands: <track>`** (**reference/tracks.md**, *Landing*) → PR body says **merge commit, never squash** (squash flattens whole trunk history); `merge` strategy uses `--no-ff`. Local, landed → offer removing track from `branch.tracks`, on yes. GitHub → `/wa-board` offers it once PR merged.

**`branch.per_task: false`** — task coded on whatever branch you were on. Nothing to land, nothing to delete: commit, mark done, say so. Skip *Landing* and *Cleanup* whole.

## Cleanup

Order matter — worktree holding branch block deleting it.

1. **Worktree** — `{worktrees}/<slug>` (autopilot leftover, or `branch.worktree`) → `git worktree remove`. Dirty → **stop and ask**; uncommitted work in worktree still work.
2. **Branch** — `close.delete_branch`:
   - `auto` (default) → delete only when code live somewhere else: merged into sprint branch, or merged into `close.target`. `pr` (task or sprint) and `nothing` keep branch.
   - `always` → delete. **Unmerged → ask first**, say what would be lost.
   - `never` → keep, say so.
3. **Local only.** Never delete remote branch, never `push --delete`, unless asked in that message.

## Sprint arg — land complete sprint

`/wa-close <sprint>` — sprint whose tasks all closed but never landed: no at last task's close, tasks closed elsewhere, GitHub parent left open.

1. **Complete?** Task left `todo` / `in-progress` / `review` / `validated` (GitHub: open sub-issue on board) → list what left, stop. None `done`, all canceled → nothing to ship: GitHub → offer closing parent as not planned (`gh issue close <parent> --reason "not planned"`, confirm first); local → say so, stop.
2. **Anything to land?** Fetch. `close.strategy: pr` → task PRs still open onto sprint branch (`gh pr list --base <sprint branch> --state open`) → list them, say sprint PR waits until they merge, stop. Sprint branch `<branch.sprint_prefix><sprint>` holds commits not in `close.target` (track sprint: its trunk) — `git rev-list --count <target>..<sprint branch>` > 0 → *Sprint landing* steps 2–4 below (GitHub: sprint PR body `Sprint #<parent>`; merge → hook closes parent). Branch absent, empty or already in target → nothing to land.
3. **Nothing to land** → GitHub: close parent — `gh issue close <parent> --comment "🏁 sprint landed — every sub-issue closed, nothing left on the sprint branch"`. Outward: confirm first. Local: say complete, nothing to do.
4. **Report** one line: `🏁 <sprint> — <done>/<total> · <PR #n opened | parent #n closed | already landed>`.

Never touches a task: their states stay theirs.

## Sprint landing

Last task of sprint reach `done` — no task of that sprint left in `todo`, `in-progress`, `review` or `validated`:

1. Say it: `🏁 login-refacto — 5/5, last task closed.`
   - `close.strategy: pr` → task PRs still open onto sprint branch (`gh pr list --base <sprint branch> --state open`) → sprint branch not whole yet: list them, say `/wa-close <sprint>` once they merge, stop here.
2. **Propose** applying `close.strategy` to sprint branch, onto `close.target` (track sprint: its trunk) — same three behaviours as standalone task, recommendation first:
   ```
   → Recommended: PR sprint/login-refacto → main   (close.strategy: pr)
     Otherwise: keep the branch, you ship it yourself.
   ```
   Lands by **merge commit, never squash** (**reference/sprints.md**): PR body says so, `merge` strategy uses `--no-ff`. GitHub provider → offer merging sprint PR (`gh pr merge <pr> --merge`), own yes, only when GitHub step 2 checks already pass; local `pr` strategy → only when user asks.
3. **Only on yes.** No is a normal answer — the branch stays, the sprint stays complete, nothing is lost. Never fold this into the task's own confirmation at step 3: two different things landing, two yeses.
4. Sprint branch merged or PR'd → `delete_branch` applies to it the same way it applies to a task branch.

A sprint is never `done` as a thing — there's no sprint status to set. It's complete when its tasks are, and this step is the only place that notices.

## Interaction with the rest

- **`/wa-validate`** sets `validated` and stops there. It never commits, never touches a branch, never sets `done`. GitHub provider: its round pushes and marks ticket PR ready — `/wa-close` only merges.
- **`/wa-feedback` on a `validated` task** → status back to `review`, needs `/wa-validate` again before it can be closed.
- **`/wa-autopilot`** leaves tasks `validated` (verifier clean, wiki synced) on their own branches, worktrees already removed (except blocked ones). GitHub provider: PR already ready — merge on GitHub, or `/wa-close <n>` merges it. Local: straight to `/wa-close` after your test. Findings left open → `review`, `/wa-feedback` or `/wa-validate` first.
- **`/wa-wiki`** runs **inside** `/wa-close` (step 2b), never after: wiki lands in same commit/PR as code it describes. Standalone `/wa-wiki` stays for syncs outside a task (query mode, catch-up).

## Never

- Never close a task the verifier never saw (`review` → `/wa-validate` first).
- Never merge, push, open a PR, mark one ready or delete a branch without the confirmed plan block.
- Never merge a PR the confirmed plan block didn't name. Never `--admin`, never bypass branch protection. Local `close.strategy: pr` → PR never merged, branch never merged locally (sprint PR only when user asks).
- Never plain force-push, never rewrite a shared branch, never touch a branch that isn't this task's or its sprint's. Only exception: `--force-with-lease` on this ticket's own branch after ticket-range rebase (*GitHub provider* step 4).
- Never delete a branch whose work isn't somewhere else.
- Never commit as Claude.
- Never write to a literal `.whackagent/` path when the config's `paths:` points elsewhere.

## Asking

Every question carries your recommended answer plus a one-line reason — conflict resolution, unmerged branch, missing `gh`. Never a bare question.

## Next step

`/wa-board` for what's next — wiki already synced by step 2b.