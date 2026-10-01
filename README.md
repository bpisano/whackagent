# whackagent

A Claude Code plugin for your development flow: tasks, code, review, wiki.

## Installation

```bash
/plugin marketplace add bpisano/whackagent
/plugin install whackagent@whackagent
```

## Quick start

```bash
/wa-setup
```

Answer a few questions. Then describe a task:

```bash
/wa-task Add the Sign in with Apple button on the login screen
```

`/wa-task` reads your code and asks questions (grill-me) until the task is clear. Then code it:

```bash
/wa-code 1
```

Test the app. Send notes with `/wa-feedback`, or close the task:

```bash
/wa-close
```

`/wa-close` reviews the code, updates the wiki, commits, and lands the branch.

Each command ends with the next one to run.

## Commands

| Command | What it does |
| --- | --- |
| `/wa-setup` | Configures the project. Run again to change settings. |
| `/wa-board [sprint]` | Shows the backlog and the next step. |
| `/wa-draft <idea>` | Notes an idea as a task, without questions. |
| `/wa-task <idea\|task>` | Clarifies a task with you, then reorders the backlog. |
| `/wa-task` | Reorders the backlog. |
| `/wa-code <task>` | Plans, codes, tests and reports on a task. |
| `/wa-feedback [task] <notes>` | Applies your notes on what was built. |
| `/wa-validate [task]` | Runs the code review, once you're happy with the feature. |
| `/wa-close [task]` | Reviews if needed, updates the wiki, commits, lands the branch. |
| `/wa-autopilot [tasks\|sprint]` | Codes several tasks unattended, in parallel when possible. |
| `/wa-review [scope] [--fix]` | Reviews any code, outside a task. |
| `/wa-wiki [question]` | Answers from the wiki. No argument: syncs it. |

A task is its backlog number (`/wa-code 3`) or its issue number with GitHub (`/wa-code 42`). Lists and ranges work: `2,4,5`, `2-5`.

## Task lifecycle

| State | Next |
| --- | --- |
| `draft` — idea | `/wa-task` |
| `grilling` — being clarified | wait, or resume with `/wa-task` |
| `todo` — ready to code | `/wa-code` |
| `coding` — agent at work | — |
| `to-test` — your turn to test | `/wa-feedback` or `/wa-close` |
| `to-close` — reviewed, retest | `/wa-close` |
| `done` / `canceled` | — |

`/wa-close` on a `to-test` task runs the review first. `/wa-validate` is there when you want the review without closing.

## Where tasks live

Asked at `/wa-setup` (`tasks.backend`).

### `files` (default)

One `.md` per task in `.whackagent/tasks/`, ordered in `BACKLOG.md`. Nothing to set up.

### `github`

The task file stays the source of truth. A GitHub Project shows it to the team.

- **One issue per task.** The issue holds the title, summary, size, sprint (milestone) and blockers.
- **The spec lives on the task branch.** `/wa-task 42` creates `wa/42-add-apple-login` and commits `.whackagent/tasks/42-add-apple-login.md` there.
- **The board follows the files.** A GitHub Action reads the task file on every push and moves the card. A merged PR moves it to Done and closes the issue.
- **One person per task.** Grilling and coding take a lock. Someone else trying gets `🔒 #42 grilling — alice@mbp since 2h`. A review locks the task too, but the card stays in To test.
- **One draft PR per task.** Every round pushes to it. `/wa-close` marks it ready. You merge.

Setup needs `gh` with the `project` scope and a token for the Action (`WA_PROJECT_TOKEN`). `/wa-setup` walks you through both.

## Dependencies

A task can be blocked by others. The board shows `⛔ #12`, `/wa-code` warns before starting, and `/wa-autopilot` waits for the blocker to land. With GitHub, they're the issue's native *blocked by* links.

## Sprints

A sprint groups the tasks of one bigger piece of work:

```yaml
sprint: Login refacto
```

No sprint file, no create command. A sprint exists as soon as a task names it (a milestone with GitHub).

- `/wa-board login-refacto` shows only that sprint, with its progress: `🏁 Login refacto — 2/5`.
- Tasks branch off `sprint/login-refacto` and merge back into it. Task 3 starts from tasks 1 and 2.
- After each delivery, and at the end of `/wa-autopilot`, you land on `sprint/login-refacto-test`: the sprint plus every task waiting for your test. Run the project there to test them all. It's local and rebuilt each time, nothing changes on GitHub.
- When the last task closes, `/wa-close` offers to ship the sprint branch.

## Settings worth knowing

In `.whackagent/config.md`:

- **`verify.mode`** — who tests the running app. `autopilot` (default): the agent, only in `/wa-autopilot`. `always`, `off`.
- **`branch.per_task`** — one branch per task (always on with GitHub).
- **`close.strategy`** (`files` only) — what `/wa-close` does with the branch: `nothing` (default), `pr`, `merge`.
- **`review.when`** — review once at the end (default), or after every round.
- **`paths`** — move the wiki, tasks or backlog, e.g. to `docs/` so the team can read them.

## Files

```
.whackagent/
  config.md          # settings
  conventions/       # your code rules, editable
  BACKLOG.md         # task order (files backend)
  tasks/<slug>.md    # one file per task
  wiki/              # project knowledge, [[wikilinks]]
  reports/           # one report per delivered task
```

## Conventions

One file per rule set, copied into your project and yours to edit. `/wa-setup` copies only what fits: Swift (style, elegance, architecture, SwiftUI, testing), TypeScript, or generic. The reviewer reads exactly those.

## Requires

- **grill-me** — used by `/wa-task`
- **caveman** — compresses the config and wiki to save tokens (`compress_wiki`)

## Credits

GitHub board, locks and dependencies adapted from [@rlatapy-luna's fork](https://github.com/rlatapy-luna/whackagent).
