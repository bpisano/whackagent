# Changelog

All notable changes to whackagent are listed here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Test branch: with branches per task, two or more coded tasks waiting for your test on the same sprint branch or trunk are merged into a local, throwaway `wa-test/<base>` branch (its own worktree in worktree mode), rebuilt after each round, so you test them in one launch. Never pushed or landed; a conflicting task is left out and named. New config key `branch.test_branch`, on in new setups, off when missing.
- Every report card ends with a 📍 line saying where to test: the branch you're on, the task worktree, or the test branch.
- GitHub provider: new `pr.screenshots` setting. `validation` (the new default written by `/wa-setup`) shoots the screens a ticket touched once, at a clean `/wa-validate`, before the PR goes ready: a new screen as is, a changed screen as a Before | After pair built from the ticket's fork point. A later validation re-shoots only the screens whose code moved. `each_round` keeps the old behavior (final-state shots after every coding round), and is what a config without the key gets; `off` takes none.
- GitHub provider: `wa-backlog screenshots` uploads with `gh pr edit --attach` when `gh` is 2.102 or later, so the `gh image` extension is no longer needed there. It still falls back to `gh image`, then to the browser. It lays out `<caption>.before` / `<caption>.after` pairs as a table, records the shot commit with `--sha`, keeps images not re-shot with `--keep`, and prints the current section when given no file.
- Project glossary: `/wa-setup` creates `glossary.md` in your wiki (Concepts and Screens, with the words to avoid). Tasks, grills, code, review and PR test steps use its terms, and new terms are proposed for your yes. Existing projects get it offered on the next `/wa-setup`; without the file nothing changes.
- Swift: with Xcode 27+, `/wa-setup` can export Apple's SwiftUI guidance from your Xcode into `conventions/apple/` (new `swift/apple.md` module). Agents open only the page for the API they touch. You choose to commit or gitignore the folder; `/wa-setup` refreshes it after an Xcode update.
- Optional task `type:` (`feature`, `improvement`, `bug`, `refactor`), set by `/wa-task` and refined by `/wa-grill`. It picks the Conventional Commits prefix when your repo uses them, the kind label for the PR among your repo's labels, and the title verb (`Fix …` for a bug). Tasks without it behave as before. Under the GitHub provider it lives in the task file on the ticket branch; nothing new on the issue or board.
- `/wa-setup` on a project already set up now runs migrations: it detects older task formats, shows a plan and applies each one on your yes (`/wa-setup migrate` for migrations alone). First two: `note: Depends on …` becomes `blocked_by:`, and an optional `type:` backfill for open tasks. Migrations never touch the GitHub board, `BOARD.md` or the hooks, and never commit.
- The pane's task tab shows the task type and, for local tasks too, open blockers.

### Changed

- Each command now loads only the shared rules it needs instead of the whole rule set: the rules moved from `/wa-board` into one file per topic under `reference/`, and the GitHub provider rules load only in GitHub projects. Runs read less, rules unchanged. Commit rules (author, message, trailers) are gathered in one place: whackagent adds no trailer of its own and stops when no git identity is set rather than inventing one.
- Shorter command descriptions in the `/` menu.
- GitHub provider: a new board (created without a template) gets exactly the six state columns in lifecycle order, without GitHub's default `In Progress`. On a template copy or an adopted board, `/wa-setup` names the columns no state maps to and offers `wa-backlog provision --prune-status`, which drops only the empty ones and keeps every card's Status.
- GitHub provider: after each push, the agent checks that the hooks moved the card out of `coding`. When they didn't, it tells you whether the board workflow run failed, is still queued or never started, with the run link, and leaves the state to the hooks.
- PR bodies now carry a `Changes` list: one user-visible change per line, starting with Add, Change (before → after), Fix, Remove or Improve, rewritten on every refresh. It goes into the template's own changes section when it has one. Sprint and track landing PRs list one line per landed ticket.
- `/wa-code` warns before coding a task whose blocker hasn't landed and recommends the blocker first. Under the GitHub provider it no longer codes a ticket from the base while a blocker in its sprint or track is open, as `BOARD.md` asks.
- Local provider: dependencies are now structured. `/wa-task` and `/wa-grill` record them as `blocked_by: [<slug>, …]` in the task file instead of a free-text `Depends on …` note. A blocked task shows `⛔ <blocker>` on the board and in the pane, is never suggested next, stays below its blocker when prioritized, and `/wa-autopilot` leaves it out until the blocker is done.

## [1.4.0] - 2026-10-15

### Added

- PR bodies now carry numbered manual test steps under `How to test`: setup, the navigation path from launch to the feature (screens, URL, endpoint or command, named as in the code), then each action with its expected result. They go into the template's own testing section when it has one.

## [1.3.0] - 2026-10-15

### Added

- GitHub provider: `/wa-setup backlog` can start the board from a GitHub Project template. `wa-backlog templates` lists the owner's templates, and `wa-backlog provision --title <name> --template [<owner>/]<number>` copies one (views, fields, Project workflows) before wiring it like any new board. Setup recommends the template when the owner has one.

## [1.2.0] - 2026-10-15

### Changed

- GitHub provider: only tickets of the same sprint or track stack. A ticket blocked by one from another sprint or track (or none) works from its own base with its own PR, whose body says `Blocked by #<x>: merge order is yours`; `wa-backlog stack` refuses such a pair. Board contract 2.2: `BOARD.md` says the same, `/wa-setup backlog` offers the refresh PR.

## [1.1.0] - 2026-10-14

### Added

- GitHub provider: `wa-backlog merge <pr>` merges one ticket PR through GitHub's async merge API, the only one that accepts a stacked PR. It refuses while a PR below it in the stack is still open, never bypasses repository rules, and waits for GitHub's result.

### Changed

- GitHub provider: stacked tickets now form a real [GitHub stack](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs) instead of PRs merely chained by base branch. `/wa-autopilot` links each dependent PR on top of its blocker with the new `wa-backlog stack` verb, and a round that pushes to a lower ticket rebases the tickets above so the stack stays mergeable. The hooks mark a ticket merged mid-stack `done` on the stack's base.
- GitHub provider: `/wa-close` merges with `wa-backlog merge` instead of `gh pr merge`, which GitHub refuses for stacked PRs.
- Board contract 2.1: `BOARD.md` tells every agent to merge with the board CLI's `merge`, to put a stacked PR in its blocker's GitHub stack, and to rebase the tickets above after pushing a lower one (claiming each first). `/wa-setup backlog` offers the refresh PR, which also updates the CLI copy in `.github/board/`.

## [1.0.0] - 2026-10-09

### Added

- GitHub provider: a `BOARD.md` board contract, so devs using other agents or work loops (Codex, Cursor, other skills, plain git) share the board safely. `/wa-setup backlog` installs it in one PR with a copy of the board CLI (`.github/board/wa-backlog`), pointer blocks in `AGENTS.md`, `CLAUDE.md` and the Copilot and Cursor instruction files, `## Ticket`, `## Acceptance criteria` and `## Status` sections appended to the PR template, and the project's whackagent config. A human decides every merge: on GitHub, or by asking their agent to merge that PR (ready, no check failing, reviews in, never an admin override).
- GitHub provider: a spec written in the issue body (non-empty `## Acceptance criteria`, by someone who can push to the repo) moves the ticket to `grilled`. Criteria written by anyone else are reported and wait for a maintainer's edit. `/wa-code` and `/wa-autopilot` pick such a ticket up: they create its linked branch and copy the spec into the task file.
- GitHub provider: the hooks find a PR's ticket through the issue it links, the one `Closes #n` in its body, or its `wa/<n>-…` branch, and add the Development link themselves, whatever the base branch.
- GitHub provider: a report-only board check runs once a day on weekdays (06:17 UTC), or by hand (`gh workflow run whackagent-board.yml`). It comments on tickets whose card disagrees with the repository (lock without claim, claim with nothing new for `WA_STALE_AFTER_HOURS`, review without PR, merged or closed as completed but not done, …), and on PRs pushed without a claim or linking several tickets. It never moves cards.
- GitHub provider: `/wa-close` on a ticket merges its ready PR for you, on your yes every time: squash (a merge commit for a track landing), only when no check is failing, required reviews are in and the base has landed, never with an admin override. When that was the sprint's last ticket, it opens the sprint PR and offers merging it once it can merge. The backlog pane offers it as **merge** on ready PRs.
- GitHub provider: `/wa-grill` can re-grill a `grilled` ticket, on your yes. `claim grilling` now also starts from `grilled`, and a re-grill and a `/wa-code` claiming the same ticket at once never both win.
- GitHub provider: `/wa-setup` flags GitHub's built-in Project workflow "Pull request linked to issue", which moves cards out of the board's states, and asks you to switch it off. While it stays on, the hooks take a card back when a `coding` claim is held, and for about 30 seconds after a PR opens.
- `wa-backlog list` and `get` report the task file's `phase` for tickets in review, so `/wa-board` and the backlog pane know whose turn it is. `wa-backlog` warns when the project's `BOARD.md` carries another contract version than the script.
- `WORKFLOW.md`: a one-page cheat sheet of the workflow, with diagrams.

### Changed

- **Breaking:** the board hooks move to the `hooks-v2` tag with caller template version 16 (new triggers: issue edited, PR edited, schedule, `workflow_dispatch`). Agent rounds stop with an upgrade message on projects whose caller is older than version 16, because `hooks-v1` never links PRs to their tickets. Run `/wa-setup backlog` to take the v2 PR. `hooks-v1` stays frozen for callers not yet upgraded.
- **Breaking:** GitHub provider: a clean `/wa-validate` now gets the ticket PR ready to merge: it syncs the wiki, rebases when the base moved, marks the PR ready and requests `pr.reviewers`. When autofix changed code since your test, the PR stays a draft until you retest and run `/wa-validate` again. `/wa-close` no longer marks PRs ready.
- `/wa-validate` sets `validated` only on a clean verdict, or when you accept the remaining findings; findings left open keep the task in `review`.
- GitHub provider: under the GitHub provider, `branch.base` is the same branch as `close.target`, so every agent forks from and lands on one base. A sprint branch missing on GitHub is pushed before its first ticket uses it.
- GitHub provider: `/wa-setup` sets the board token secret before opening the board PR, says plainly what a `repo`-scoped token can reach, and offers to move imported issues that already carry acceptance criteria to `grilled`. Its reconfigure mode flags a board workflow or `BOARD.md` older than the plugin's.
- `/wa-autopilot` on a validated draft PR now refreshes and marks it ready. It never changes the repository's `delete_branch_on_merge` setting on its own any more.
- PRs whackagent opens are always assigned to you; `pr.assignees` only adds people.
- Local provider: `status: review` and `validated` now count as the contract's `review` state (a human is on turn), and only `in-progress` counts as `coding`, the same split as the GitHub provider. The provider contract gains a *Who's on turn* table.
- The `wa-verifier` subagent always runs on Opus. It used to follow the main conversation's model, so `/wa-validate`, `/wa-review` and `/wa-feedback` could review on a weaker model than `/wa-code` did, or than the Sonnet implementer it judges.
- `/wa-feedback` runs on Opus, like `/wa-code`: it triages your notes and writes micro-fixes itself, in the main thread.
- `wa-backlog claim` answers `0` when you already hold that claim, so a retry after a failed run no longer reports the ticket as taken by yourself.

### Removed

- **Breaking:** support for board workflows older than caller template version 16, including the partial support for versions below 6.
- Agents no longer run `wa-backlog link-pr` after opening a PR (it stays as a repair command), and PRs no longer get the ticket's milestone: the linked issue carries it.
- Config keys `code_language`, `ui_strings_language`, `autopilot.on_blocker` and `yagni`: no command ever read them. `/wa-setup` reconfigure stops offering them; leaving them in your config does nothing.

### Fixed

- GitHub provider: a PR closing another repository's issue (`Closes acme/lib#12`) no longer moves or closes this repository's issue with the same number.
- GitHub provider: closing a superseded PR no longer sends its ticket back to `grilled` and drops another round's claim while a coding claim or another open PR keeps the ticket going.
- GitHub provider: releasing a stale claim (`/wa-task release`) resets the ticket to `review` when its PR is open, and a re-grill's claim back to `grilled`.
- GitHub provider: every agent round releases its claim when it ends without a push (`/wa-validate`, `/wa-feedback`, `/wa-autopilot`), and `/wa-close` re-claims after a rebase before it merges.
- `wa-backlog` no longer crashes or leaves a lock behind when GitHub errors in the middle of a claim, refuses to claim issues labeled `wa-ignore`, and stops before resetting a card when it couldn't delete the claim.
- `/wa-release` on the local provider with `close.strategy: pr` no longer counts tasks whose PR is still open as landed.
- `/wa-close` no longer contradicts itself on force pushes: `--force-with-lease` on the task's own branch after the ticket-range rebase is allowed, a plain force push never is.

## [0.42.0] - 2026-10-08

### Added

- Task commands (`/wa-grill`, `/wa-code`, `/wa-feedback`, `/wa-validate`, `/wa-close`, `/wa-autopilot`) rename the Claude Code session after the task they work on: project, ticket number and short title, such as `shop · #12 Login Apple`. Turn it off with **Name session after its task** (`rename_session`) in the plugin's settings in `/config`.

## [0.41.0] - 2026-10-07

### Changed

- **Breaking:** `/wa-close` with `close.strategy: pr` now leaves the task's PR ready for review and never merges it. A draft PR already open for the branch is marked ready (body refreshed, `pr.reviewers` requested); with no PR, one is opened ready. Sprint tasks get a PR onto their sprint branch instead of a local merge, and the sprint PR waits until those task PRs are merged.

## [0.40.0] - 2026-10-07

### Added

- GitHub provider: `wa-backlog comment <n> --body-file <file>` (`-` reads stdin) posts multi-line comments such as the bricks list.
- GitHub provider: `wa-backlog screenshots` accepts `<caption>=<url>` for images already uploaded, and agents fall back to uploading through the browser when `gh image` can't get an upload token (org repos with SAML SSO). Images are still never pushed to a branch.

### Fixed

- `/wa-grill` with worktrees on the GitHub provider: the ticket branch is created with `gh issue develop --checkout --worktree`, since `--worktree` alone fails with `--worktree requires --checkout`.

## [0.39.0] - 2026-10-07

### Added

- The command a skill recommends on its last `→ next:` line (`/wa-validate 216`) is offered as the prompt suggestion: Tab puts it in the prompt, ready to edit or send. Every skill writes that command complete and in backticks, recommended one first.

### Fixed

- GitHub board hooks: merging a PR whose body says `Closes #n` no longer fails the board run with `422 Validation Failed` when GitHub closes the issue at the same moment as the hook. The ticket still moves to Done and gets its 🎉 comment and run report.

## [0.38.0] - 2026-10-07

### Changed

- Backlog pane, GitHub provider: the pane calls GitHub only when it opens and on `↻ refresh`, no more polling every 30 seconds or after `wa-backlog` / `gh` commands, so it no longer eats the API rate limit.
- Backlog pane no longer opens on its own at session start: run `/wa-pane`, or turn on **Open backlog pane at start** (`auto_open`) in `/config` to get it back.

## [0.37.0] - 2026-10-07

### Changed

- Backlog pane: milestone tabs run from the lowest version up, with **All** last, and the board opens on the lowest milestone instead of **All**.

## [0.36.0] - 2026-10-06

### Changed

- A sprint branch lands with a merge commit, never squashed: the sprint PR body says so, an agent asked to merge it runs `gh pr merge --merge`, and `close.strategy: merge` uses `--no-ff`.

## [0.35.0] - 2026-10-06

### Added

- `/wa-close <sprint>` lands a complete sprint later: the sprint PR when its branch still holds unlanded work, else (GitHub) closes the sprint parent issue after asking. Not complete → says what's left.
- Backlog pane: a **🏁 Sprints** section at the top of the board, one row per sprint (GitHub: every open `wa-sprint` parent, with its `#n` and milestone) with its progress, a `▸ N tickets` toggle that unfolds its tickets under it, and a `close` button (`/wa-close <sprint>`) once all its tickets are closed. It replaces the 🏁 progress lines under the board.
- Backlog pane: `+N more` under 🎉 Done or 🚫 Canceled lists every task of that section; `show less` folds it back to the three most recent.

### Fixed

- Backlog pane: a milestone ready to ship no longer also shows its progress line.
- Backlog pane: a GitHub milestone is ready to ship once every ticket on the board is landed; its sprint parent issues (`wa-sprint`) and `wa-ignore` issues no longer hide the `release` button.

## [0.34.0] - 2026-10-06

### Added

- Backlog pane: an open milestone whose tasks are all landed (at least one done, none left, not a track) shows `· ready to ship` with a `release` button that types `/wa-release <milestone>`.

## [0.33.0] - 2026-10-06

### Changed

- Every PR whackagent opens (ticket draft, `/wa-close` PR, sprint PR) carries at least one label picked from the repo's existing labels (best fit for the change: bug, feature, docs, area), on top of `pr.labels`. Labels are never created.

## [0.32.0] - 2026-10-06

### Added

- GitHub provider: `wa-backlog list` rows carry `not_planned` (issue closed as not planned).

### Changed

- Backlog pane: a task's buttons sit on their own line under its summary, aligned left.

### Fixed

- GitHub provider: an issue closed as not planned shows under 🚫 Canceled in `/wa-board` and the backlog pane instead of 🎉 Done (the pane shows 🚫 Canceled on milestone tabs only, not on **All**), takes no action buttons and no longer counts as done in sprint and milestone progress.

## [0.31.1] - 2026-10-06

### Added

- Backlog pane: a `feedback` button on GitHub tickets in review whose PR is ready, as on drafts.

## [0.31.0] - 2026-10-06

### Added

- Backlog pane: a ticket's PR opens from its board row and its tasks in flight tab: in the terminal its tag is a button that opens it in the browser (`gh pr view --web`, any terminal), in the desktop app and VS Code a link.

## [0.30.0] - 2026-10-06

### Added

- Backlog pane: one emoji per state (📥 todo · 🔥 grilling · 📐 grilled · 🔨 in progress / coding · 👀 review · 👍 validated · 🎉 done · 🚫 canceled) on the board's sections, the tasks in flight tabs and the task details. `/wa-board` section headings carry the same emoji.

## [0.29.1] - 2026-10-06

### Fixed

- Backlog pane: the board toggle could be cut off at the end of the header line in a narrow docked pane. It is now a `[ hide board ]` / `[ show board ]` button first in the header (hotkey `b`), and the header wraps.

## [0.29.0] - 2026-10-06

### Added

- Backlog pane: a `▾ board` toggle in the header hides the board (an open-task count stays) to keep only the tasks in flight; `▸ board` shows it again.

## [0.28.0] - 2026-10-06

### Added

- Backlog pane: an `autopilot` button on every task not done, next to its other moves.
- Backlog pane: **Tasks in flight** below the board, one tab per task being worked on right now (local: in progress; GitHub: your tickets in grilling or coding), even from the main checkout. Each tab shows the task's workflow data: state and phase, PR and open blockers (GitHub), worktree, sprint siblings, acceptance criteria marked from verification, bricks, last review round, verification notes and feedback rounds, with its action buttons.

### Changed

- `/wa-autopilot` takes a task you name in any state and runs only what's left: grills a `todo` one unattended (GitHub too, outside AFK mode), resumes `in-progress`, validates `review`, refreshes `validated` (rebase + checks, never closes), keeps a ready PR mergeable, and skips claimed or done tasks. Sprint, milestone and no-argument batches still take only `todo` / `grilled`.

### Removed

- Backlog pane: the `next:` button is gone; pick the move from each task's own buttons.

### Fixed

- Backlog pane: in a worktree, the local backlog and task files are read from the main checkout instead of the worktree's stale copies.
- Backlog pane: Done and Canceled show the three most recent tasks, not the three oldest.

## [0.27.0] - 2026-10-06

### Added

- Live backlog pane beside the conversation: the `/wa-board` list per state, with milestone tabs, per-task action buttons (`grill`, `code`, `feedback`, `validate`, `close`) and a `next:` button that type the command into the prompt. Works for the local and GitHub providers and refreshes on its own. Opens at session start in a whackagent project (turn off with the `auto_open` plugin option), or anytime with `/wa-pane`.

### Changed

- `/wa-board` lists sections in lifecycle order, earliest first: Todo → In progress → Review → Validated → Done → Canceled (GitHub provider: Todo → Grilling → Grilled → Coding → Review → Done). Task numbers follow the new order. The suggested next action is unchanged.

### Fixed

- `/wa-setup` no longer writes user-specific values into the versioned config: `commit.author_name` / `author_email` stay empty (each committer's own git identity) and paths stay relative (`paths.worktrees` is `../<repo>-worktrees` even when setup runs from a worktree). Reconfigure flags existing home-dir paths and personal identities and offers the fix.

## [0.26.0] - 2026-10-05

### Added

- Tracks: a long-shot feature can live on its own long-lived trunk beside your base branch (`branch.tracks: {server: develop_synchro}`, keyed by milestone title). Tasks in that milestone fork from and land on the track branch, new tasks never join it unless you say so, `/wa-board` shows how far the track lags and `/wa-code` offers a sync PR, back-ports carry `ported-from:`, and a `lands:` task merges the track back. Moving a coded task between trunks rebases it and resets its validation. GitHub provider: `wa-backlog provision --track` stores the list in the new `WA_TRACKS` repo variable; re-run `/wa-setup backlog` after adding a track. Projects without `branch.tracks` see no change.

## [0.25.0] - 2026-10-05

### Added

- GitHub provider: PR bodies now carry the task's run report in a collapsed section, and when the PR merges the hook posts that report on the ticket. Tasks without a report post nothing extra. Ships through the `hooks-v1` tag.

## [0.24.2] - 2026-10-05

### Changed

- The verifier now flags duplicated or re-implemented logic under its `structure` lens, for every language, and searches the codebase for existing code the diff rewrites instead of relying only on the plan's reuse list.

## [0.24.1] - 2026-10-02

### Changed

- GitHub provider: feedback round comments on the ticket and PR now hold a line permalink to the round in the task file, which GitHub shows as an embedded snippet, instead of a copy of the text. The task file stays the source of truth.

## [0.24.0] - 2026-10-02

### Added

- GitHub provider: each `/wa-feedback` round is posted as a comment on the ticket and on its PR (your notes, triage, what changed, verdicts), from the task file's new `### Round <n>` block in `## Feedback`. Ships through the `hooks-v1` tag. Hooks template version 15 grants `pull-requests: write` so the PR comment comes from github-actions; older callers post it with `WA_PROJECT_TOKEN`. Run `/wa-setup backlog` to upgrade.

## [0.23.0] - 2026-10-02

### Changed

- GitHub board hooks are now a reusable workflow in the whackagent repo: projects keep a small caller (hooks template version 14) and get hook fixes with every whackagent release, without a PR. Run `/wa-setup backlog` once to replace the old full copy.

## [0.22.0] - 2026-10-02

### Changed

- `/wa-grill` searches for existing libraries and SDKs before settling on a hand-rolled integration, parser or protocol client, and records the survey in `## Context / Decisions`.
- A grill split on GitHub keeps the split ticket: it becomes the sprint's parent issue (new `split` verb), keeping its number, history and milestone, and the child tickets become its sub-issues. It used to be closed and replaced by a new sprint issue. Sprint names are now the kebab-case of the parent issue title, so a parent can keep a readable title. Hooks template version 13: run `/wa-setup backlog` to upgrade.

## [0.21.0] - 2026-10-01

### Changed

- New tasks join the open milestone with the highest title in version order (digit runs compared as numbers, so `0.10.0` > `0.9.0`), creation order breaking ties, instead of the most recently created one. A late patch milestone (`0.2.1` opened after `0.3.0`) stays current scope. Same rule for the local and GitHub providers; `milestones` lists highest first; `/wa-release` suggests the lowest open one.

## [0.20.0] - 2026-10-01

### Added

- `pr:` config block shapes every PR whackagent opens (ticket draft, `/wa-close` PR, sprint PR): repo PR template filled from the task file, title, labels, assignees, reviewers and a rules doc. whackagent's part of the body sits in a marked block that refreshes rewrite alone, so human edits stay. Reviewers are requested when the PR goes ready, never on a draft.
- `/wa-setup` detects lint tools applied through Gradle plugins (detekt, ktlint, spotless, company wrappers included) in build files or the version catalog.

### Changed

- Reports are gitignored, never versioned. `/wa-setup` adds `{reports}` to `.gitignore` at scaffold; reconfigure offers it and offers to untrack reports already committed.

### Fixed

- `/wa-validate` appends a validation round to the task report (tool and verifier findings, autofix changes, final status), so the report no longer shows unreviewed code.

## [0.19.1] - 2026-10-01

### Fixed

- GitHub board hooks run on `actions/github-script` v9 (hooks template version 12).

## [0.19.0] - 2026-10-01

### Added

- `tools:` config key declares project commands (detekt, SwiftLint, ESLint, ruff…) with a `when` stage. At `code`, the implementer runs them after build and tests, and failures in touched files count as a red build. At `validation`, `/wa-validate` runs them before the verifier and feeds failures into the autofix loop as `tool:<name>` findings. Failures in untouched files are reported as pre-existing, never fixed. `/wa-setup` detects tool configs and proposes entries.
- `GITHUB.md`: walkthrough of the GitHub provider across the whole workflow.
- GitHub provider: after decomposition, `/wa-code` posts the bricks as one ticket comment.

### Changed

- `/wa-board` runs on Haiku; `/wa-code` and `/wa-autopilot` run on Opus.
- GitHub provider: a winning claim assigns the current account, and an issue assigned to another account is reserved (`claim` exits 3 naming the assignee). `release` removes the assignment only when the claim made it. `list`/`get` expose `assignees` and `reserved`; new `whoami` verb.

## [0.18.0] - 2026-09-30

### Changed

- GitHub provider: a sprint is a parent issue labeled `wa-sprint` with its tickets as sub-issues, so GitHub shows sprint progress natively. The parent stays off the board and can't be claimed. Hooks (template version 11) skip it on open and close it when the sprint lands. New repo variable `WA_SPRINT_PREFIX`, set by `provision`.

## [0.17.0] - 2026-09-30

### Added

- Milestones as release scope, for both backlogs (local: `backlog.milestones` in config; GitHub: repo milestones). New contract verbs: `milestones`, `list`/`create --milestone`, `set-field milestone`, `close-milestone`. New tasks join the newest open milestone.
- `/wa-release <milestone>`: checks the milestone's tasks landed, then follows the project's documented release flow (`release.doc`, found in Markdown, or written with the user first), confirming every outward step.

### Changed

- GitHub provider: the sprint moves to a `sprint:<name>` label, and the hooks no longer close milestones (template version 10).

## [0.16.0] - 2026-09-29

### Changed

- `wa-implementer` runs on Sonnet.

## [0.15.1] - 2026-09-29

### Fixed

- `/wa-task` never starts `/wa-grill`: it creates the task, then suggests `/wa-grill <#>`. An existing task passed to `/wa-task` is no longer forwarded to `/wa-grill`.
- GitHub provider: `/wa-feedback`, `/wa-validate`, `/wa-close` and later `/wa-code` rounds rewrite the PR description from the task file after pushing (current decisions, acceptance criteria checklist, status line). The Screenshots section is kept.
- README flow and plugin descriptions show the grill step.

## [0.15.0] - 2026-09-28

### Changed

- **Breaking:** `/wa-task` is split in two. `/wa-task` creates, cuts and places tasks: an idea becomes one task, a spec is cut into a few feature-sized tasks carrying their spec excerpt, no argument runs the prioritization pass. `/wa-grill` grills one existing task, writes its acceptance criteria and owns the GitHub grilling claim, branch and spec push.

### Removed

- `/wa-spec`: folded into `/wa-task`.

## [0.14.2] - 2026-09-28

### Changed

- `/wa-spec-to-tasks` renamed to `/wa-spec`. `/wa-task` given a spec document (file, URL or pasted doc) follows the `/wa-spec` rules.

## [0.14.1] - 2026-09-28

### Changed

- Plugin author set to Rémi Latapy, with the original author credited in the README and an MIT `LICENSE` carrying both copyrights.

## [0.14.0] - 2026-09-28

### Added

- `/wa-spec-to-tasks`: cuts a large spec at feature seams into a few tasks sharing one sprint, each carrying its spec excerpt. A focused spec becomes one task, whose grill starts from the excerpt.

## [0.13.0] - 2026-09-28

### Added

- Optional git worktree per task, at `{worktrees}/<slug>` (`paths.worktrees`, default `../<repo>-worktrees`, refused inside the repo). The main checkout never switches branch. Rules live in `wa-board → Worktrees`.
- GitHub provider: the grilled board comment links the spec file (hooks template version 9).

## [0.12.0] - 2026-09-26

### Added

- Pluggable backlog provider layer. `local` stays the default; `github` moves the backlog onto a GitHub Project so several agents in different worktrees share one board.
  - `providers/CONTRACT.md`: provider-neutral verbs, six states (`todo`, `grilling`, `grilled`, `coding`, `review`, `done`) and exit codes.
  - `providers/github/wa-backlog` (Python 3 stdlib + `gh`): atomic claims through `refs/wa-claims/<issue>/<phase>`, board listing in priority order, create/move/size/sprint, dependencies (`depend`, `blocked_by`), `link-pr`, PR screenshots through the `gh-image` extension, stale-claim detection and `provision`.
  - `providers/github/whackagent-board.yml`: hooks workflow that moves `grilled`, `review` and `done` from repository events.
  - GitHub sections in every skill, and `backlog.provider` config key. `/wa-setup` asks for the provider first, provisions the board and migrates a local backlog.
- `/wa-autopilot` on GitHub: draft PR delivery, stacking on an unlanded blocker, conflicting PRs rebased at round end, `/wa-validate` run before delivery (a validated ticket ships as a ready PR carrying the wiki update), and an AFK mode that runs the whole backlog with chain siblings coded in parallel.
- `WORKFLOW.md`: the ticket state machine, with Mermaid graphs.
- Kotlin convention pack (`conventions/kotlin/`: style, elegance, architecture global/app/package, compose, testing).
- `CLAUDE.md` for contributors.

### Changed

- Platform-neutral pipeline. Build uses whatever tool the repo uses (XcodeBuildMCP, `./gradlew`, SwiftPM, package scripts, cargo, go, dotnet, mvn, make). The runtime check picks its driver from `verify.platform` (`ios`, `android`, `web`, `desktop`, `server`, `cli`, `none`, or a list). `/wa-setup` detects Kotlin/Gradle, project kinds and UI toolkit, and supports two packs in a polyglot repo. Config defaults are neutral.
- Every prompt is English. `discussion_language` defaults to `en`, and task file headings stay English whatever the chat language.
- Marketplace points at the `rlatapy-luna/whackagent` fork.

### Fixed

- Commit author defaults to the repo's git identity instead of a hardcoded name.
- `wa-implementer` never prints credentials during runtime checks.

## [0.11.1] - 2026-09-21

### Fixed

- Task titles read as short labels, not narrative sentences, and summaries state the goal. The prioritization pass rewrites broken titles too.

## [0.11.0] - 2026-09-18

### Added

- Unified report card (`wa-code → Report card`), reused by `/wa-autopilot` and `/wa-feedback`.
- Voice rules (`wa-board → Voice`), referenced from every skill.

### Changed

- Tasks render as a two-line list (index, size, title, sprint tag, summary) instead of tables.

## [0.10.0] - 2026-09-15

### Added

- Sprints: an optional `sprint:` label grouping the tasks a big piece of work splits into. `/wa-board` filters by sprint; `/wa-autopilot` batches a sprint's todo tasks. Tasks of a sprint fork off `sprint/<sprint>`.
- `/wa-close`: commits, lands the branch (sprint merge, or `close.strategy`: `nothing`, `pr` or `merge`) and ends the task, always showing the git plan first.

### Changed

- `/wa-validate` no longer closes tasks or touches git.
- Skills, agents and templates are caveman-compressed.

## [0.9.0] - 2026-08-03

### Added

- `paths:` config block for backlog, tasks, wiki, reports and conventions, so a team can keep them in a folder it already shares.
- `/wa-validate`.
- `/wa-setup` on a configured project reconfigures: it diffs the config against the template, edits in place and moves files when a path changes.

### Changed

- One verifier sweeps four lenses (style, elegance, structure, correctness) and reports the lenses it covered.

## [0.8.0] - 2026-07-28

### Added

- `review.when`: `on_validation` (new default) runs the review once, over the cumulative diff, when the user validates; `each_round` keeps the previous behavior.
- `review.inline_micro_fixes`: `/wa-feedback` applies a micro-fix itself (≤2 files, ≤~20 lines, no new file or API change); anything bigger still goes to `wa-implementer`.

### Changed

- Pipeline collapsed to two subagents. `wa-reviewer` is deleted; `wa-verifier` becomes the read-only reviewer. `wa-implementer` drives the app it just built for the runtime check.
- `/wa-code` acts as a PM: plan, dispatch, never write code.
- `/wa-autopilot` runs independent tasks in parallel waves, one git worktree each.

### Removed

- `review.gate` and `review.conventions_model`.

## [0.7.0] - 2026-07-26

### Added

- `build.command` / `build.test_command`: the project's own build wrapper wins over the plugin default.
- `review.conventions_model` to run the checklist reviewer on a smaller model.

### Changed

- Review categories go from five to three: `conventions`, `structure`, `correctness`.
- Hard read budget for the implementer and reviewers, and line counts in the brief.
- Agents are resumed by the `agentId` returned at spawn.

## [0.6.0] - 2026-07-26

### Added

- `review.gate: auto` drops review lenses a round's diff cannot trigger.
- `branch.*` config block for per-task branches.

### Changed

- Rounds resume the same subagents with only the delta, and one implementer serves a whole task brick by brick.
- The understand phase emits a neighborhood brief handed to every subagent.

### Removed

- graphify exploration.

## [0.5.0] - 2026-07-25

### Changed

- Every grill question carries a recommended answer and a one-line reason.

## [0.4.0] - 2026-07-25

### Added

- `#` index on board rows, accepted by every skill that takes a task (`/wa-code 3`, `/wa-autopilot 2-5`).
- `/wa-feedback`: applies notes on a coded task through the same isolated pipeline as `/wa-code`.
- `/wa-setup` writes `.xcodebuildmcp/config.yaml` with incremental builds for Xcode projects.

### Changed

- `/wa-task` re-prioritizes the backlog after every new task; a bare `/wa-task` runs the pass alone.

### Removed

- `/wa-prio`: folded into `/wa-task`.

## [0.3.0] - 2026-07-08

### Added

- `wa-verifier` runtime check: installs the built app on a simulator, emulator or device through mobile-mcp, drives the UI against the acceptance criteria and captures screenshots.
- `verify` config block and acceptance criteria in the task template.

## [0.2.0] - 2026-07-01

### Changed

- Reworked README and skills; new Swift `architecture-global.md` module (YAGNI, SOLID, DRY, DI).

## [0.1.0] - 2026-07-01

### Added

- Initial release: `/wa-setup`, `/wa-task`, `/wa-prio`, `/wa-code`, `/wa-review`, `/wa-board`, `/wa-wiki`, `/wa-autopilot`, the `wa-implementer` and `wa-reviewer` subagents, Swift and TypeScript convention modules, and project templates.
