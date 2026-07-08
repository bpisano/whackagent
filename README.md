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
| `/wa-setup` | Config + scaffolding (`.whackagent/`), runs graphify (once) |
| `/wa-board` | Dashboard: backlog table, suggests the next action |
| `/wa-task <desc>` | Creates a task + spec, grills it (grill-me, includes architecture) |
| `/wa-prio` | Product owner: orders the backlog, YAGNI, can split |
| `/wa-code <slug>` | Full pipeline: understand → code + test → review → verify → report + iterate |
| `/wa-autopilot [slug]` | Applies wa-code on 1..n tasks autonomously, one branch per task |
| `/wa-review [scope]` | Standalone 5-category review (diff / path / project) — audit, optional `--fix` |
| `/wa-wiki` | Updates the wiki + graphify |
| `/wa-wiki <feature>` | Looks up info in the wiki / the graph |

Each step suggests the next one. You never have to figure out what to run.

## Typical flow

Bootstrap once, then loop through describe → prioritize → code.

**0. Setup (once per project)**

```
/wa-setup
```

Detects language + project kind, scaffolds `.whackagent/`, runs graphify to index the code.

**1. Describe a task — `/wa-task`**

```
/wa-task Sign in with Apple on the login screen
```

Grills the idea (grill-me) until it's clear, plans the architecture, and writes `.whackagent/tasks/login-apple.md` with a spec + a size (🟢 quickwin / 🟡 medium / 🔴 large).

**2. Prioritize — `/wa-prio`**

```
/wa-prio
```

Product-owner pass over the backlog: orders tasks by what matters now, applies YAGNI, splits anything too big. Result is `.whackagent/BACKLOG.md` — top of the list is what to code next.

```
1. 🟢 login-apple      Sign in with Apple on the login screen
2. 🟡 offline-cache    Cache the feed for offline reads
3. 🔴 payments         Stripe checkout + receipts
```

**3. Code it — `/wa-code <slug>`**

```
/wa-code login-apple
```

A single command runs the whole coding cycle, orchestrating isolated subagents:

1. **Understand**: read the task, search the existing code (graphify) to avoid rewriting, break it down into small modules, plan the tests.
2. **Code + test**: `wa-implementer` (sequential) writes the feature *and* the tests, then runs build/tests to prove it works.
3. **Review**: 5 `wa-reviewer` in parallel, one per lens (**style · elegance · architecture · file tree · correctness**), each loading only its own module → focused, nothing forgotten. Aggregates → autofix in a loop until clean.
4. **Report + iterate**: on-screen summary to iterate with you, report saved in `.whackagent/reports/login-apple.md`. On validation: task moved to `done`.

**4. Keep knowledge fresh — `/wa-wiki`**

```
/wa-wiki
```

Updates the wiki + the graph after a feature lands. Never commits before your validation.

> Prefer autonomy? `/wa-autopilot` runs the `/wa-code` cycle across the top backlog tasks on its own, one branch per task.

## File tree created in your project

```
.whackagent/
  config.md            # language, coding language, project_kind, review categories, commit permission
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
- **graphify**: code index queried by the skills (created at setup, refreshed on `/wa-wiki`)
