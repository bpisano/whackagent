## Sprints

Sprint = **optional kebab-case label** on task (`sprint: login-refacto`), grouping big work split across several tasks. Canonical rules, every skill refers here.

- **No sprint file, no create command.** Sprint exists moment task names it, stops existing when its last task closes. Nothing to declare, nothing to clean up.
- **Truth is task file `sprint:` field.** `{backlog}` echoes it as `· <sprint>` after link; two disagree → task file wins, fix backlog line.
- **Not a status section.** Sprint cuts across statuses — sprint has tasks in todo, review and done at once. Sections stay per status, always.
- **Contiguity.** Tasks of one sprint stay adjacent inside each status section, in sprint own internal order. `/wa-task` prioritization pass maintains that — sprint moves as block.
- **Resolving a name**: match `sprint:` values across all task files, exact first, then unique case-insensitive / kebab-normalized match. No match → say so and list known sprints (sprint with no live task is closed, not typo). Ambiguous → list candidates, stop.
- **Slug vs sprint**: task slug wins over sprint of same name. Name clash → say which one you took.

- **One branch, when `branch.per_task`.** `<branch.sprint_prefix><sprint>` (default `sprint/login-refacto`), created from `branch.base` (track task: its trunk, **reference/tracks.md**) by whoever needs it first — `/wa-code` step 0 or `/wa-autopilot` wave. Tasks of sprint fork off it and `/wa-close` merges them back (`close.strategy: pr` → ready PR onto it instead, human merges), so each task starts from sprint current state. `branch.sprint_prefix: ""` turns that off: tasks use `branch.base` like any other. Nothing merges into sprint branch before its task reviewed and closed. **GitHub**: sprint branch missing on `origin` → create from trunk and push it before first `gh issue develop --base` / `gh pr create --base` on it — attended: one confirmed outward step; `/wa-autopilot`: allowed, logged in report.
- **Sprint branch lands by merge commit, never squash.** Squash flattens every ticket of sprint into one commit, and target never holds sprint branch's commits — per-ticket history lost, later sync or rebase replays all of it. Sprint PR body says **merge commit, never squash**. User asks you to merge it → `gh pr merge <pr> --merge` (never `--squash` / `--rebase`); `close.strategy: merge` → `git merge --no-ff`. Ticket PRs into sprint branch keep project's way (*Squash merge*, **reference/provider-github.md**).
- **A sprint is complete, never `done`.** No sprint status exists. Complete when no task of it left in `todo`/`in-progress`/`review`/`validated` — `/wa-close` notices and offers to land sprint branch; missed then (no, closed elsewhere, GitHub parent still open) → `/wa-close <sprint>` lands it later.

Commands taking sprint name: `/wa-board <sprint>` (filtered view), `/wa-autopilot <sprint>` (batch its todo tasks), `/wa-task` (assigns and inherits), `/wa-close <sprint>` (land complete sprint, **wa-close → Sprint arg**). `/wa-grill`, `/wa-code`, `/wa-validate`, `/wa-feedback` stay **per task** — one task is their unit, and whole sprint unattended is what `/wa-autopilot` already does better.
