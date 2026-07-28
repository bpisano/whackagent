# whackagent

A Claude Code plugin for your entire development flow.

## Features

- **codebase knowledge**: project knowledge base — a wiki the skills read before searching the code.
- **task management**: create, prioritize, and track tasks.
- **code pipeline**: implement a task, verify it, and prove it runs — for app targets, the implementer drives the app it just built on a simulator/device (taps + screenshots) to confirm the task actually works. Build stays your project's own command when it has one (`build.command`), else XcodeBuildMCP (iOS) / gradle (Android). iOS drives through XcodeBuildMCP too; Android and physical devices need [mobile-mcp](https://github.com/mobile-next/mobile-mcp).

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
| `/wa-feedback [task] <notes>` | Applies your notes on what was built — micro-fix inline, bigger changes through the isolated pipeline; re-verified and reviewed before any commit |
| `/wa-autopilot [tasks]` | Applies wa-code on 1..n tasks autonomously, one branch per task, independent ones in parallel |
| `/wa-review [scope]` | Standalone 2-lens review (diff / path / project) — audit, optional `--fix` |
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

Bootstrap once, then loop through describe → code. Prioritization isn't a step you run — it happens on its own every time a task is added.

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
2. **Code**: one `wa-implementer` for the whole task, fed brick by brick (sequential) — it writes the feature *and* the tests, proves the build, then **drives the app on a simulator** to prove the feature actually works, screenshots included. It already holds the build session, so runtime proof costs almost nothing. Keeping the same agent across bricks means the conventions and the BRIEF are read once, and brick 2 already knows what brick 1 built.
3. **Verify**: two `wa-verifier` in parallel — **conventions** (how it's written *and* where it lives: style, idiomatic Swift, layers, boundaries, file tree) and **correctness** (real bugs, plus whether the diff meets the acceptance criteria). Each loads only its own modules → focused, nothing forgotten. They're handed the diff hunks, so they judge the change instead of hunting for it. Aggregate → autofix in a loop until clean. Two agents rather than one per rule set is a measured call: an isolated agent costs ~50k tokens of context before it reads a line, so rule sets that belong together share one. And every round resumes the *same* agents rather than spawning new ones — they already hold their modules and the code, so round 2 costs a diff instead of a full re-read.

   **When this runs is yours to pick** (`review.when`, asked at `/wa-setup`). Default `on_validation`: the fan-out fires **once, when you validate the task**, over the whole diff — code plus every feedback round — so sending three notes costs three fixes, not three reviews. `each_round` keeps the old behavior (a review after the code, and after each `/wa-feedback`). Either way the review lands **before any commit**: deferring is a schedule, not a skip, and blocking findings stop the commit until you say what to do with them.
4. **Report**: on-screen summary, report saved in `.whackagent/reports/login-apple.md`, task moved to `review` for you to look at.

**3. Send your notes — `/wa-feedback`**

```
/wa-feedback the button should be secondary, and the error toast is too aggressive
```

Feedback is where quality usually leaks: the change looks small, so it gets patched inline — outside the conventions, outside the review, and nothing gets re-run. This command refuses to work that way, without making a one-liner cost an agent either. Each note is **routed by size**: a **micro-fix** (≤2 files, ≤~20 lines, no new file/type, no layer or public-API change) is applied straight away — convention module read first, build + tests re-run, hunks tagged so the reviewers look at them harder. Anything bigger goes back through `wa-implementer`, which re-reads every convention module before touching a line. Both paths then hit the runtime verification and the review fan-out — right away or in the single pass at validation, per `review.when`. Nothing is committed unreviewed, whichever route it took.

It also triages what you said: a **defect** gets fixed, an **adjustment** updates the acceptance criteria too, a **new feature** in disguise is sent back to `/wa-task` instead of being silently built — and a **rule** ("always do X") is offered up for your conventions file, so it stops being forgotten on the next task.

**4. Keep knowledge fresh — `/wa-wiki`**

```
/wa-wiki
```

Updates the wiki after a feature lands. Never commits before your validation.

> Prefer autonomy? `/wa-autopilot` runs the `/wa-code` cycle across the top backlog tasks on its own, one branch per task — and tasks whose files don't overlap run **at the same time**, each implementer in its own git worktree.

> **Branch per task.** Set `branch.per_task: true` (asked at `/wa-setup`) and `/wa-code` codes on `wa/<slug>` instead of your current branch. Combine it with `commit.auto_commit_after_validation` and validating a task commits it, then checks out the next task's branch for you — chain tasks without touching git.

## File tree created in your project

```
.whackagent/
  config.md            # language, coding language, project_kind, review timing + categories, commit + branch policy
  conventions/         # copied convention modules (only the useful ones), editable per project
  BACKLOG.md           # task index (order = priority)
  tasks/<slug>.md      # one task = one file (frontmatter + body)
  wiki/index.md        # wiki summary
  wiki/<page>.md       # domain pages, [[wikilink]] links (Obsidian-compatible)
  reports/<slug>.md    # reports of delivered features
```

## Task

```markdown
---
title: Login Apple          # short, explicit — the feature at a glance
summary: Sign in with Apple on the login screen   # one line, for the board
size: quickwin             # quickwin 🟢 | medium 🟡 | large 🔴
status: todo                # todo | in-progress | review | done | canceled
grilled: false             # true once it went through /wa-task (grill-me)
wiki: [[auth]], [[onboarding]]
note:                       # trigger / free context (optional)
---

## Context / Decisions
## Implementation
## Review
```

## Conventions

Conventions are **modular**, split by review category, and **self-contained** (no dependency on another plugin). Swift:

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

Each review category loads **only its own module** → focused context, nothing forgotten.

## Skill dependencies

- **grill-me**: task clarification in `/wa-task`
- **caveman**: report compression (report phase of `/wa-code`) + config and wiki compression at setup and on each `/wa-wiki` (`compress_wiki: true`, saves re-reading tokens)
