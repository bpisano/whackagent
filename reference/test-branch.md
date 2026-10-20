## Test branch

Throwaway **local** branch = base + every delivered, not-landed task of that base merged in. User launches once, tests them all, instead of switching N branches. Canonical, every skill refers here.

- **`branch.test_branch: true`** + `branch.per_task: true` (forced under GitHub). Key missing or `false` → nothing here applies: flow unchanged, byte for byte. `per_task` off → ignored silently.
- **Base** = branch tasks fork from and land on. Sprint task → its sprint branch (**reference/sprints.md**); standalone → trunk (`branch.base`; track task: its trunk, **reference/tracks.md**). `branch.base: current` → standalone tasks share no known base (each forked from wherever user stood) → no test branch for them, say once `test branch: needs a named branch.base`; sprint and track tasks unaffected. One test branch per base. Stacked ticket (PR base = blocker branch) counts on base under bottom of its stack.
- **Name** `wa-test/<base, / → ->` (`wa-test/sprint-login-refacto`, `wa-test/develop`). Prefix outside `branch.prefix` and `branch.sprint_prefix`: no skill, pane or hook reads it as task or sprint. Never pushed, so hooks never see it.
- **Qualifies** = task of that base in sub-phase `review` or `validated` (local `status:`; GitHub: PR open, task file `phase:` on `origin/<branch>`) **and** its branch holds commits past base (`git rev-list --count <base>..<branch>` > 0).
  - Local attended round leaves code uncommitted (only `/wa-close` commits) → not in: `<slug> not in — uncommitted, test it on its branch`.
  - Task worktree holding edits past its last commit → branch merged as committed: `⚠️ <slug>: uncommitted edits not in`.
- **Built only when ≥ 2 tasks qualify.** 1 or 0 → task branch is what to test (old behavior); test branch left from earlier for that base → delete it (+ its worktree).
- **Build** — cheap git only: no build, no test, no run (launching it = user's test). Fresh from base each time, in its build checkout (*Where*), backlog order (GitHub: board order), blocker before stacked:
  ```
  git checkout -B wa-test/<key> <base>          # github: origin/<base>, fetched
  git merge --no-ff --no-edit <task branch>     # each qualifying task; github: origin/<task branch>
  ```
  - Conflict → `git merge --abort`, skip task, keep going: `⚠️ skipped <slug>: conflicts with <slug already in> (<file>)`. **Never resolve there.**
  - Up to date (base tip and every qualifying tip already in it, `git merge-base --is-ancestor`; nothing extra in) → keep it, no rebuild.
  - Merge commits = plain `git merge`, machine's git identity: they never leave the machine.
- **Where**
  - `branch.worktree: true` → own worktree `{worktrees}/wa-test-<key>` (**reference/worktrees.md**: outside repo). Listed → rebuild there (`git -C <wt> checkout -B …`); absent → `git worktree add -B wa-test/<key> <wt> <base>`, then merges in it. Main checkout never moves. User tests there.
  - Else → **ref only**: temp worktree `{worktrees}/wa-test-<key>` (`git worktree add -B wa-test/<key> <wt> <base>`), merges there, `git worktree remove`. Main checkout never moves while building. Already checked out in main checkout (user testing it) → rebuilt in place, clean tree only (else *Never rebuilt over user work*).
  - **Checkout** — only at end of attended `/wa-code`, `/wa-feedback`, `/wa-validate`, only when built this run (≥ 2 qualify), main checkout clean: `git checkout wa-test/<key>`, last git step. Run then ends off coded branch (GitHub too) → 📍 line names both (*Where line*). Dirty → stays ref: `⚠️ built wa-test/<key>, not checked out — dirty tree · git checkout wa-test/<key>`.
  - `/wa-autopilot`, `/wa-close` → ref (or its worktree) only, never checked out: user's checkout stays put (`/wa-close` *Next branch* owns it).
- **Never rebuilt over user work.** Test checkout dirty, or commits on it beyond its merges (`git log --first-parent --no-merges <base>..wa-test/<key>` non-empty) → leave it, say so, recommend moving them onto task branch with `/wa-feedback`. Never stash, reset or discard.
- **Who rebuilds** — base of the task just handled, end of run: `/wa-code` (delivery), `/wa-feedback` (round end), `/wa-validate` (after its round), `/wa-autopilot` (end, one per base touched), `/wa-close` (after landing: rebuild; < 2 left or base landed → delete). Never in hook paths, never from board or pane.
- **Leaving it** — task command started on test branch: clean → check out task branch, no ask. Dirty → edits made while testing: ask *"carry these edits to `<task branch>`? (recommended: yes — they're feedback, and the test branch is rebuilt from scratch)"*. Never apply feedback, validate, close, fork or commit on test branch.
- **Delete** = `git worktree remove` (dirty → ask *"remove anyway? (recommended: no — carry the edits to their task branch with `/wa-feedback` first: removing loses them)"*) or, checked out in main checkout, switch to base first; then `git branch -D` (merges never land, `-d` refuses). Commits of user's on it → name them, ask *"delete with these commits? (recommended: no — move them onto their task branch with `/wa-feedback` first: delete drops them for good)"*.
- **Never** pushed, PR'd, landed, forked from, reviewed (verifier judges task diffs only), shot for PR screenshots. Task branch stays the unit.
- **Where line** (**wa-code → Report card**), test branch built:
  - worktree: `📍 test in ../<repo>-worktrees/wa-test-sprint-login-refacto — wa-test/sprint-login-refacto = sprint + login-apple · login-layout`
  - checked out (attended run): `📍 you're on wa-test/develop = develop + login-apple · export-csv · coded branch is wa/export-csv`
  - ref only: `📍 test: git checkout wa-test/develop = develop + login-apple · export-csv`
  - then each `⚠️` line above (skipped, not in, not checked out).
