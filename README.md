# whackagent

A Claude Code plugin for your entire development flow.

## Features

- **codebase knowledge**: project knowledge base, graphified for fast search and context.
- **task management**: create, prioritize, and track tasks.
- **code pipeline**: implement a task, review it, and verify it runs — for app targets, `/wa-code` can drive the built app on a simulator/device (taps + screenshots via [mobile-mcp](https://github.com/mobile-next/mobile-mcp), iOS & Android) to confirm the task actually works. Build stays XcodeBuildMCP (iOS) / gradle (Android); mobile-mcp only drives the built binary.

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
| `/wa-feedback [task] <notes>` | Applies your notes on what was built — same isolated pipeline, so conventions are re-read and the change is re-reviewed and re-verified |
| `/wa-autopilot [tasks]` | Applies wa-code on 1..n tasks autonomously, one branch per task |
| `/wa-review [scope]` | Standalone 5-category review (diff / path / project) — audit, optional `--fix` |
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

1. **Understand**: read the task, search the existing code to avoid rewriting, write a **neighborhood brief** (existing files, what to reuse, layer boundaries, target layout) handed to every subagent so nobody re-explores the same ground, break it down into small modules, plan the tests.
2. **Code + test**: one `wa-implementer` for the whole task, fed brick by brick (sequential) — it writes the feature *and* the tests, then runs build/tests to prove it works. Keeping the same agent across bricks means the conventions and the brief are read once, and brick 2 already knows what brick 1 built.
3. **Review**: up to 5 `wa-reviewer` in parallel, one per lens (**style · elegance · architecture · file tree · correctness**), each loading only its own module → focused, nothing forgotten. Aggregates → autofix in a loop until clean. Two things keep the loop cheap without thinning it: every round resumes the *same* agents rather than spawning new ones (they already hold their module and the code, so round 2 costs a diff instead of a full re-read), and `review.gate: auto` drops the lenses a round's diff structurally can't trigger — no file moved, no file-tree review. The verdict you're shown is always the full five.
4. **Report**: on-screen summary, report saved in `.whackagent/reports/login-apple.md`, task moved to `review` for you to look at.

**3. Send your notes — `/wa-feedback`**

```
/wa-feedback the button should be secondary, and the error toast is too aggressive
```

Feedback is where quality usually leaks: the change looks small, so it gets patched inline — outside the conventions, outside the review, and nothing gets re-run. This command refuses to work that way. Every note, however small, goes back through `wa-implementer` (which re-reads every convention module first), then through the full review fan-out and the runtime verification again.

It also triages what you said: a **defect** gets fixed, an **adjustment** updates the acceptance criteria too, a **new feature** in disguise is sent back to `/wa-task` instead of being silently built — and a **rule** ("always do X") is offered up for your conventions file, so it stops being forgotten on the next task.

**4. Keep knowledge fresh — `/wa-wiki`**

```
/wa-wiki
```

Updates the wiki + the graph after a feature lands. Never commits before your validation.

> Prefer autonomy? `/wa-autopilot` runs the `/wa-code` cycle across the top backlog tasks on its own, one branch per task.

> **Branch per task.** Set `branch.per_task: true` (asked at `/wa-setup`) and `/wa-code` codes on `wa/<slug>` instead of your current branch. Combine it with `commit.auto_commit_after_validation` and validating a task commits it, then checks out the next task's branch for you — chain tasks without touching git.

## File tree created in your project

```
.whackagent/
  config.md            # language, coding language, project_kind, review categories, commit + branch policy
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
