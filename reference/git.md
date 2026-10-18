# Git

Commits and branches, every skill.

## Commits

- **Author = this machine's git config**, read right before each commit (`git config user.name` / `user.email`).
  - Plain `git commit` / `git merge`. Never `--author`, `-c user.*`, `GIT_AUTHOR_*`, `GIT_COMMITTER_*`.
  - Never cached, never in `.whackagent/config.md`: the config is shared, the author is whoever runs the command.
  - Legacy `commit.author_*` in config → ignore; `/wa-update` deletes it.
- **Message** = `<prefix>: <task title, verb dropped>` (`fix: crash on map zoom`). Prefix from type (**tasks → Types**); no type → `feat:`. Round commits keep it.
- **Never Claude.** No `Co-Authored-By`, no "Generated with", no 🤖 — commits and PRs (**pr → Body**).
- Email unset → stop, ask `! git config --global user.email you@example.com`. Never invent one.

## Dirty tree

Before any checkout:
- attended → **Warning**: carry over, stash or stay? Never move uncommitted work silently.
  - building a test branch → recommend staying on the task branch
  - leaving a test branch → recommend carrying the edits over to the task branch
- autopilot → skip the step, say so in the report.

## Task branch

Only when `branch.per_task: true` (`github`: always).

- Name = `<branch.prefix><key>` → `wa/add-apple-login`, `wa/42-add-apple-login`.
- `github` → exists since the grill. Never create or rename it. Name from `github-board get <n>` → `branch` (else by prefix: `git branch -a --list '*<prefix><n>-*'`).
- Fork point = sprint branch when the task has a sprint and `branch.sprint_prefix` ≠ `""`, else `branch.base` (`current` = where you are).
- Exists → check out. Absent → create from fork point (fetch first if it tracks a remote).
- Attended rounds run in the main checkout: the user tests there.
- Echo: `branch: wa/42-add-apple-login (base: sprint/login-refacto)`.

## Sprint branch

`<branch.sprint_prefix><kebab(sprint)>` → `sprint/login-refacto`.

- Created from `branch.base` by whoever needs it first. Exists → check it's up to date.
- Takes only reviewed, closed tasks (`/wa-close` merges them back).
- `branch.sprint_prefix: ""` → off, tasks use `branch.base`.

## Sprint test branch

`<sprint branch>-test`. Local, throwaway: every delivered task of the sprint, so the user launches once.

- Never pushed, PR'd, forked from or committed on. Rebuilt from scratch each time.
- **Built** at the end of every round delivering a sprint task (`/wa-code`, `/wa-feedback`, `/wa-validate`), main checkout:
  ```
  git checkout -B <sprint branch>-test <base>    # github: origin/<sprint branch>
  git merge --no-ff --no-edit <task branch>      # each to-test / to-close task, board order
  ```
  - `github` → merge `origin/<task branch>`.
  - Then check it out, even for one task.
- `files` round left code uncommitted → nothing to merge: stay on task branch, say so, name the other delivered tasks waiting on their branches.
- Conflict → `git merge --abort`, skip that task, keep going, `⚠️ #45 not in — conflicts with #42 (<file>)`. Never resolve there.
- Dirty tree → no build (**Dirty tree**).
- Commits found on it (`git log --first-parent --no-merges <base>..<test>`) → don't rebuild. Attended: ask, recommend moving them with `/wa-feedback`.
- **Leaving it**: task command started there + clean tree → check out the task branch without asking.
- Deleted when the sprint lands.
- `/wa-autopilot` builds its own variant → **wa-autopilot**.

## Stacking

Only `/wa-autopilot` creates a stack; attended commands warn instead. Every command maintains an existing one (rebase, review scope, landing order).

Blocker delivered but not landed → the dependent starts **from the blocker's branch**. Never a question.

- `files` → fork off the blocker tip.
- `github` → in its worktree, `git rebase --onto origin/<blocker branch> <its base>`. Round-end push `--force-with-lease`. Draft PR `--base <blocker branch>`.
- Several blockers: chained → last one. Independent → first in board order, `git merge` the others. Conflict → skip, log.
- Nothing to stack on → skipped, `⛔ #12`.
- Record first line of `## Implementation`: `stacked on: <blocker branch> @ <sha>`.
- Review diff = from stack point, never from base.
- Blocker moves → next round rebases own commits onto its new tip, updates the record.
- **Land blocker first.** Then rebase onto the real base, `github`: `gh pr edit --base`, drop the record.
