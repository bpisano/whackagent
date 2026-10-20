## Worktrees

`branch.worktree: true` (with `branch.per_task`, forced under GitHub) → each task codes in **own git worktree**, never in main checkout. Main checkout never switch branch: several tasks open side by side, each own build dir. Canonical, every skill.

- **Where** = `{worktrees}/<branch minus branch.prefix>` (`../<repo>-worktrees/login-apple`, GitHub `../<repo>-worktrees/12-login-apple`). `{worktrees}` resolves from **main checkout root** (parent of `git rev-parse --path-format=absolute --git-common-dir`), never from a worktree; `<repo>` = that root's folder name — one folder per repo, slugs of sibling repos never collide. **Must land outside main checkout and every other worktree** — inside → refuse, suggest `/wa-setup branch`: nested checkout gets indexed, grepped, globbed by builds. `/wa-autopilot` uses same folder.
- **Create** — `git worktree list` shows one for branch → reuse. `mkdir -p {worktrees}` first. Branch exists → `git worktree add <path> <branch>`. Absent → `git worktree add <path> -b <branch> <fork point>`. Sprint branch absent → `git branch <sprint> <trunk>` (`branch.base`, or track branch — **reference/tracks.md**), ref only, no checkout. Fetch first when branch tracks remote.
- **Dirty main checkout doesn't block** — nothing checked out there. Dirty worktree = task work in flight: never stash, reset or remove it.
- **What lives where** — worktree: code, wiki edits, GitHub task file (spec on ticket branch). Main checkout: `{backlog}`, `{reports}`, local task file `{tasks}/<slug>.md` — board reads one place, report survives worktree removal. Their copies inside worktree = stale, never edit, never commit.
- **Subagents** get worktree path + *work only under `<worktree>`, absolute paths, never touch main checkout or another worktree.* Builds, tests, `git diff` run there (`git -C <worktree>`).
- **User tests from worktree** — report card names it: `test in ../<repo>-worktrees/login-apple` (IDE, simulator, dev server open there).
