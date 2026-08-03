# whackagent

A Claude Code plugin for your entire development flow.

## Features

- **codebase knowledge**: project knowledge base — a wiki the skills read before searching the code.
- **task management**: create, prioritize, and track tasks.
- **code pipeline**: implement a task, review it, and prove it runs — for app targets, the implementer can drive the app it just built on a simulator/device (taps + screenshots) to confirm the task actually works. On by default where it matters most, unattended runs (`verify.mode`); attended, you test it yourself. Build stays your project's own command when it has one (`build.command`), else XcodeBuildMCP (iOS) / gradle (Android). iOS drives through XcodeBuildMCP too; Android and physical devices need [mobile-mcp](https://github.com/mobile-next/mobile-mcp).

## Installation

Add the marketplace, then install the plugin:

```bash
/plugin marketplace add bpisano/whackagent
/plugin install whackagent@whackagent
```

## Commands

| Command | Description |
| --- | --- |
| `/wa-setup` | Config + scaffolding (`.whackagent/`) |
| `/wa-board` | Dashboard: backlog table, suggests the next action |
| `/wa-task <desc\|task>` | Creates a task + spec, grills it (grill-me, includes architecture), then re-prioritizes the backlog |
| `/wa-task` | No argument: prioritization pass only — reorders, YAGNI, can split |
| `/wa-code <task>` | Full pipeline: understand → code + test → review → verify → report |
| `/wa-feedback [task] <notes>` | Applies your notes on what was built — micro-fix inline, bigger changes through the isolated pipeline |
| `/wa-validate [task]` | Your feu vert: "this is the feature I asked for" → runs the verifier on the whole diff. Run it again after retesting to close the task |
| `/wa-autopilot [tasks]` | Applies wa-code on 1..n tasks autonomously, one branch per task, independent ones in parallel |
| `/wa-review [scope]` | Standalone review, 4 lenses (diff / path / project) — audit, optional `--fix` |
| `/wa-wiki` | Updates the wiki |
| `/wa-wiki <feature>` | Looks up info in the wiki, then the code |

Each step suggests the next one. You never have to figure out what to run.

### Referring to tasks

`/wa-board` numbers every row (`#` column), continuously across sections. Anywhere a task is expected you can pass that number instead of the slug — single, list, or range:

```
/wa-code 3
/wa-autopilot 2,4,5
/wa-autopilot 2-5
/wa-task 3
```

The number is display-only: it comes from the current backlog order, so it changes whenever the backlog is reordered (which happens on its own each time a task is added). The command always echoes what it resolved (`3 → sync-offline`) before doing any work, so a stale number can't silently run the wrong task.

## Typical flow

Bootstrap once, then loop: describe → code → you test → you validate → verifier → closed. Prioritization isn't a step you run — it happens on its own every time a task is added.

**0. Setup (once per project)**

```
/wa-setup
```

Detects language + project kind, scaffolds `.whackagent/`.

**1. Describe a task — `/wa-task`**

```
/wa-task Sign in with Apple on the login screen
```

Grills the idea (grill-me) until it's clear, plans the architecture, and writes `.whackagent/tasks/login-apple.md` with a spec + a size (🟢 quickwin / 🟡 medium / 🔴 large).

Then it prioritizes on its own — there's no separate command for it: a product-owner pass slots the new task where it belongs, applies YAGNI, and flags anything too big to split (asking first). You end up looking at a fresh, ordered board — top of the list is what to code next:

```
| # | Taille | Tâche          | Résumé                                | Grillée |
|:-:|:------:|----------------|---------------------------------------|:-------:|
| 1 | 🟢     | Login Apple    | Sign in with Apple on the login screen | ✅      |
| 2 | 🟡     | Offline cache  | Cache the feed for offline reads       | ✅      |
| 3 | 🔴     | Payments       | Stripe checkout + receipts             | ⚠️      |
```

**2. Code it — `/wa-code <task>`**

```
/wa-code 1
```

A single command runs the whole coding cycle, orchestrating isolated subagents:

1. **Plan**: read the task, search the existing code to avoid rewriting, write a **BRIEF** (existing files + their sizes, what to reuse, layer boundaries, target layout) handed to every subagent so nobody re-explores the same ground, break it into bricks, plan the tests.
2. **Code**: one `wa-implementer` for the whole task, fed brick by brick (sequential) — it writes the feature *and* the tests and proves the build. Keeping the same agent across bricks means the conventions and the BRIEF are read once, and brick 2 already knows what brick 1 built.

   **Who tests the app is a setting** (`verify.mode`). Default `autopilot`: unattended runs get driven by the agent — taps, screenshots, acceptance criteria checked on screen, because nobody else is there — while an attended `/wa-code` stops at build + tests and **you** validate by using the app. `always` drives it every time; `off` never. Whatever the mode, the implementer may still launch the app when it can't write the feature without seeing it run (reproduce a bug, judge a layout) — that's implementation, and it says so rather than passing it off as proof.
3. **Report**: on-screen summary, report saved in `.whackagent/reports/login-apple.md`, task moved to `review` — meaning *waiting for you to test it*.

**3. Test it, iterate — `/wa-feedback`**, then **4. give the green light — `/wa-validate`**

The order matters, and it's the whole point of the flow: **code → you test → you validate → the verifier runs.** A review that happens before you've said "yes, that's the feature" reviews code three feedback rounds are about to move.

`/wa-validate <task>` is that green light. It says *"this matches my cahier des charges"* — nothing more. It does **not** close the task:

1. It dispatches one `wa-verifier`, which sweeps four lenses over the diff — **style**, **elegance**, **structure** (layers, boundaries, file tree) and **correctness** (real bugs, plus whether the diff meets the acceptance criteria) — and reports which ones ran. It's handed the diff hunks, so it judges the change instead of hunting for it, then autofix loops until clean. One agent rather than one per lens is a measured call: an isolated agent costs ~50k tokens of context before it reads a line, and every lens judges the same diff against the same rulebook — paying that twice bought nothing but duplicate findings to dedupe. And every round resumes the *same* agent rather than spawning a new one — it already holds its modules and the code, so round 2 costs a diff instead of a full re-read.

2. The scope is the **whole diff** — the code plus every feedback round, in one pass. Sending three notes costs three fixes, not three reviews.
3. Findings are severity-ordered, autofixed in a loop, and written to the task's `## Review`. The task moves to `validated`, **not** `done` — the autofix just changed code you'd tested, so you get to retest.
4. `/wa-validate` again, once you've retested → the task closes: `done`, commit if `commit.auto_commit_after_validation`, and the next task's branch checked out if you asked for that.

`review.when: each_round` restores a review after `/wa-code` and after every `/wa-feedback` if you'd rather catch drift early — `/wa-validate` still runs the final pass. **No task closes unreviewed either way: `/wa-validate` is the only door.**

Iterating before that green light is `/wa-feedback`:

```
/wa-feedback the button should be secondary, and the error toast is too aggressive
```

Feedback is where quality usually leaks: the change looks small, so it gets patched inline — outside the conventions, outside the review, and nothing gets re-run. This command refuses to work that way, without making a one-liner cost an agent either. Each note is **routed by size**: a **micro-fix** (≤2 files, ≤~20 lines, no new file/type, no layer or public-API change) is applied straight away — convention module read first, build + tests re-run, hunks tagged so the verifier looks at them harder. Anything bigger goes back through `wa-implementer`, which re-reads every convention module before touching a line. Both paths get the runtime check when `verify.mode` puts it on the agent, and both end up in front of the verifier at `/wa-validate` — inline hunks flagged as written without a convention pass, so they get the harder look.

It also triages what you said: a **defect** gets fixed, an **adjustment** updates the acceptance criteria too, a **new feature** in disguise is sent back to `/wa-task` instead of being silently built — and a **rule** ("always do X") is offered up for your conventions file, so it stops being forgotten on the next task.

**5. Keep knowledge fresh — `/wa-wiki`**

```
/wa-wiki
```

Updates the wiki after a feature lands. Never commits before your validation.

> Prefer autonomy? `/wa-autopilot` runs the `/wa-code` cycle across the top backlog tasks on its own, one branch per task — and tasks whose files don't overlap run **at the same time**, each implementer in its own git worktree. It delivers **code**: built, run on the simulator, committed on its branch, task left at `review`. The verifier doesn't run there — your review is asynchronous, so it waits for your `/wa-validate` on each branch, exactly like an attended run.

> **Branch per task.** Set `branch.per_task: true` (asked at `/wa-setup`) and `/wa-code` codes on `wa/<slug>` instead of your current branch. Combine it with `commit.auto_commit_after_validation` and validating a task commits it, then checks out the next task's branch for you — chain tasks without touching git.

## File tree created in your project

```
.whackagent/
  config.md            # language, coding language, project_kind, review timing + modules, paths, commit + branch policy
  conventions/         # copied convention modules (only the useful ones), editable per project
  BACKLOG.md           # task index (order = priority)
  tasks/<slug>.md      # one task = one file (frontmatter + body)
  wiki/index.md        # wiki summary
  wiki/<page>.md       # domain pages, [[wikilink]] links (Obsidian-compatible)
  reports/<slug>.md    # reports of delivered features
```

That's the default layout. Every one of those paths is configurable — `paths:` in `config.md`, asked at `/wa-setup`:

```yaml
paths:
  backlog: docs/BACKLOG.md
  tasks: docs/tasks
  wiki: docs/wiki          # committed and browsable on GitHub, for teammates who don't run whackagent
  reports: .whackagent/reports
  conventions: .whackagent/conventions
```

Relative resolves from the repo root, absolute works too (a wiki in a sibling repo). Only `.whackagent/config.md` is fixed — it's the file that carries the paths. Omit a key and it takes the default above, so a config written before `paths:` existed keeps working. Moving a path after setup means moving the files yourself; nothing back-fills. A shared wiki is also a good reason to set `compress_wiki: false` — caveman compression saves the agents tokens and costs your teammates readability.

## Task

```markdown
---
title: Login Apple          # short, explicit — the feature at a glance
summary: Sign in with Apple on the login screen   # one line, for the board
size: quickwin             # quickwin 🟢 | medium 🟡 | large 🔴
status: todo                # todo | in-progress | review | validated | done | canceled
                            # review = coded, waiting for your test · validated = spec approved,
                            # verifier passed, waiting for your retest
grilled: false             # true once it went through /wa-task (grill-me)
wiki: [[auth]], [[onboarding]]
note:                       # trigger / free context (optional)
---

## Context / Decisions
## Implementation
## Review
```

## Conventions

Conventions are **modular**, one file per rule set, and **self-contained** (no dependency on another plugin). Swift:

```
conventions/swift/
  style.md             # one-type-per-file, explicit types, member order, comments/doc, format
  elegance.md          # code speaks for itself, idiomatic Swift (resultBuilder & co, not C in Swift), concurrency (no Combine)
  architecture-global.md   # YAGNI · SOLID · DRY, composition/DI, testability — every Swift project
  architecture-app.md  # iOS tree: Coordinator → ViewModel → Store → View, group-by-feature
  architecture-package.md  # non-iOS Swift tree (package/CLI/server): looser but defined rules
  swiftui.md           # SwiftUI rules — copied ONLY if the project uses SwiftUI
  testing.md           # Swift Testing + mocks
```

`/wa-setup` detects the language, the **kind** (app vs package) and SwiftUI usage, then copies **only the useful modules** into `.whackagent/conventions/` (e.g. no `swiftui.md` in a package without SwiftUI). You edit these copies to adapt per project (e.g. drop public doc). TypeScript and generic have a single file.

The copied list lands in `review.modules` — the verifier reads exactly that, and nothing else in the tree.

## Skill dependencies

- **grill-me**: task clarification in `/wa-task`
- **caveman**: report compression (report phase of `/wa-code`) + config and wiki compression at setup and on each `/wa-wiki` (`compress_wiki: true`, saves re-reading tokens)
