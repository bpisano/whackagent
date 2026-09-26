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
| `/wa-board` | Dashboard: backlog list, suggests the next action |
| `/wa-board <sprint>` | Same, filtered to one sprint, with its progress |
| `/wa-task <desc\|task>` | Creates a task + spec, grills it (grill-me, includes architecture), then re-prioritizes the backlog |
| `/wa-task` | No argument: prioritization pass only — reorders, YAGNI, can split |
| `/wa-code <task>` | Full pipeline: understand → code + test → review → verify → report |
| `/wa-feedback [task] <notes>` | Applies your notes on what was built — micro-fix inline, bigger changes through the isolated pipeline |
| `/wa-validate [task]` | Your green light: "this is the feature I asked for" → runs the verifier on the whole diff. Doesn't close, doesn't touch git |
| `/wa-close [task]` | Ends the task: commit, land the branch (sprint merge, PR, or nothing — `close.strategy`), delete branch + worktree, `done` |
| `/wa-autopilot [tasks\|sprint]` | Applies wa-code on 1..n tasks autonomously, one branch per task, independent ones in parallel |
| `/wa-review [scope]` | Standalone review, 4 lenses (diff / path / project) — audit, optional `--fix` |
| `/wa-wiki` | Updates the wiki |
| `/wa-wiki <feature>` | Looks up info in the wiki, then the code |

Each step suggests the next one. You never have to figure out what to run.

### Task states

One lifecycle, named by what's left to do:

| state | means | next |
|---|---|---|
| `draft` | idea, not grilled | `/wa-task` |
| `todo` | grilled, ready to code | `/wa-code` |
| `coding` | agent coding it | `/wa-code` resumes |
| `to-test` | coded, **you** test it | `/wa-feedback` or `/wa-validate` |
| `to-close` | spec OK + verifier passed, you retest | `/wa-close` |
| `done` / `canceled` | closed | — |

"Review" only ever means the verifier's pass — never a state.

### Where tasks live — files or GitHub

`tasks.backend`, asked at `/wa-setup` when the repo has a GitHub remote:

- **`files`** (default) — one `.md` per task, order in `BACKLOG.md`. Nothing to wire up.
- **`github`** — one **issue** per task, the whole task in its body. A **GitHub Project** board holds the state (Status column) and the priority (card order). Sprints are **milestones**. PRs carry `Closes #42`, so an issue closes when its code merges. The whole team sees one backlog. Issues a teammate files by hand stay off the board until `/wa-task 57` adopts them.

Switching an existing project to `github` imports its open tasks as issues, in backlog order, after one plan and one yes.

### Referring to tasks

Anywhere a task is expected, pass its id — single, list, or range:

```
/wa-code 3            # files: row number from /wa-board
/wa-code 42           # github: issue number
/wa-autopilot 2,4,5
/wa-autopilot 2-5
```

With `files`, the row number is display-only: it comes from the current backlog order, so it changes when the backlog is reordered. With `github`, the issue number never moves. Either way the command echoes what it resolved (`#42 → Add Apple login`) before doing any work.

### Task titles

Read cold — in an issue list, a branch, a PR — by someone who never saw the grill. So: **verb + thing**, ≤ 5 words, tech terms in English whatever the language. `Add Apple login`, `Fix flaky CLI tests` — never `Login Apple`, never `Tests turn red at random`.

### Sprints

A big piece of work rarely fits in one task. Refactoring the login screen is four or five of them, and you want to see them as one thing. That's a **sprint**: an optional title on a task — a milestone with the `github` backend.

```yaml
sprint: Login refacto
```

There is no sprint file and no command to create one. A sprint exists the moment a task names it. Its branch is the kebab-case of its title (`sprint/login-refacto`). Most tasks never get one — it's there for the big ones.

Where it shows up:

- **`/wa-board`** tags each task with its sprint and prints progress per sprint: `🏁 Login refacto — 2/5 (1 to test, 2 todo)`. `/wa-board login-refacto` narrows the whole board to that sprint.
- **`/wa-task`** sets it: when you name one, or when the grill splits a `large` task — the children are born into the same sprint, which is the case sprints exist for. It never invents one silently; it proposes in one line.
- **Prioritization** keeps a sprint's tasks contiguous in the backlog. The sprint moves as a block, and you order tasks inside it (dependencies first). Pulling one out of the block is allowed, and it says why.
- **`/wa-autopilot login-refacto`** batches the sprint's `todo` tasks — leaving alone the ones already moving or waiting on you, and echoing what it skipped.

- **`/wa-close`** merges the task branch into the sprint branch, and notices when the sprint's last task closes — then it offers to land the sprint branch itself.

Sprints deliberately aren't a state and aren't a backlog section: a sprint cuts across states (some tasks done, some to test, some untouched), and state sections are what tells you what to do next. There's no sprint state to set either — a sprint is complete when its tasks are. `/wa-code`, `/wa-feedback`, `/wa-validate` and `/wa-close` stay per task — one task at a time is how you review and merge.

## Typical flow

Bootstrap once, then loop: describe → code → you test → you validate → verifier → closed. Prioritization isn't a step you run — it happens on its own every time a task is added.

**0. Setup (once per project)**

```
/wa-setup
```

Detects language + project kind, asks where tasks live (files or GitHub), scaffolds `.whackagent/`.

**1. Describe a task — `/wa-task`**

```
/wa-task Sign in with Apple on the login screen
```

Grills the idea (grill-me) until it's clear, plans the architecture, and writes the task (`.whackagent/tasks/add-apple-login.md`, or a GitHub issue) with a spec + a size (🟢 quickwin / 🟡 medium / 🔴 large).

Then it prioritizes on its own — there's no separate command for it: a product-owner pass slots the new task where it belongs, applies YAGNI, and flags anything too big to split (asking first). You end up looking at a fresh, ordered board — top of the list is what to code next:

```
### Todo

1 · 🟢 **Add Apple login**
    Sign in with Apple on login screen
2 · 🟡 **Cache feed offline** · Feed offline
    Feed readable without network

### Draft

3 · 🔴 **Add Stripe checkout**
    Stripe checkout + receipts

🟢 quick win · 🟡 medium · 🔴 large
```

**2. Code it — `/wa-code <task>`**

```
/wa-code 1
```

A single command runs the whole coding cycle, orchestrating isolated subagents:

1. **Plan**: read the task, search the existing code to avoid rewriting, write a **BRIEF** (existing files + their sizes, what to reuse, layer boundaries, target layout) handed to every subagent so nobody re-explores the same ground, break it into bricks, plan the tests.
2. **Code**: one `wa-implementer` for the whole task, fed brick by brick (sequential) — it writes the feature *and* the tests and proves the build. Keeping the same agent across bricks means the conventions and the BRIEF are read once, and brick 2 already knows what brick 1 built.

   **Who tests the app is a setting** (`verify.mode`). Default `autopilot`: unattended runs get driven by the agent — taps, screenshots, acceptance criteria checked on screen, because nobody else is there — while an attended `/wa-code` stops at build + tests and **you** validate by using the app. `always` drives it every time; `off` never. Whatever the mode, the implementer may still launch the app when it can't write the feature without seeing it run (reproduce a bug, judge a layout) — that's implementation, and it says so rather than passing it off as proof.
3. **Report**: same card every time — **Problem**, **Goal**, **Done**, **To test** (checklist of what the agent didn't prove + regression zones), then a build · tests · run · review status line. Saved in `.whackagent/reports/add-apple-login.md`, task moved to `to-test` — meaning *waiting for you to test it*. `/wa-autopilot` and `/wa-feedback` use the same card.

**3. Test it, iterate — `/wa-feedback`**, then **4. give the green light — `/wa-validate`**

The order matters, and it's the whole point of the flow: **code → you test → you validate → the verifier runs.** A review that happens before you've said "yes, that's the feature" reviews code three feedback rounds are about to move.

`/wa-validate <task>` is that green light. It says *"this matches my spec"* — nothing more. It does **not** close the task:

1. It dispatches one `wa-verifier`, which sweeps four lenses over the diff — **style**, **elegance**, **structure** (layers, boundaries, file tree) and **correctness** (real bugs, plus whether the diff meets the acceptance criteria) — and reports which ones ran. It's handed the diff hunks, so it judges the change instead of hunting for it, then autofix loops until clean. One agent rather than one per lens is a measured call: an isolated agent costs ~50k tokens of context before it reads a line, and every lens judges the same diff against the same rulebook — paying that twice bought nothing but duplicate findings to dedupe. And every round resumes the *same* agent rather than spawning a new one — it already holds its modules and the code, so round 2 costs a diff instead of a full re-read.

2. The scope is the **whole diff** — the code plus every feedback round, in one pass. Sending three notes costs three fixes, not three reviews.
3. Findings are severity-ordered, autofixed in a loop, and written to the task's `## Review`. The task moves to `to-close`, **not** `done` — the autofix just changed code you'd tested, so you get to retest.
4. `/wa-validate` never touches git and never closes anything. Retest, then **`/wa-close`** — next section.

`review.when: each_round` restores a review after `/wa-code` and after every `/wa-feedback` if you'd rather catch drift early — `/wa-validate` still runs the final pass. **No task closes unreviewed either way: `/wa-close` refuses a task the verifier never saw.**

Iterating before that green light is `/wa-feedback`:

```
/wa-feedback the button should be secondary, and the error toast is too aggressive
```

Feedback is where quality usually leaks: the change looks small, so it gets patched inline — outside the conventions, outside the review, and nothing gets re-run. This command refuses to work that way, without making a one-liner cost an agent either. Each note is **routed by size**: a **micro-fix** (≤2 files, ≤~20 lines, no new file/type, no layer or public-API change) is applied straight away — convention module read first, build + tests re-run, hunks tagged so the verifier looks at them harder. Anything bigger goes back through `wa-implementer`, which re-reads every convention module before touching a line. Both paths get the runtime check when `verify.mode` puts it on the agent, and both end up in front of the verifier at `/wa-validate` — inline hunks flagged as written without a convention pass, so they get the harder look.

It also triages what you said: a **defect** gets fixed, an **adjustment** updates the acceptance criteria too, a **new feature** in disguise is sent back to `/wa-task` instead of being silently built — and a **rule** ("always do X") is offered up for your conventions file, so it stops being forgotten on the next task.

**5. Close it — `/wa-close <task>`**

```
/wa-close 1
```

Retested and still good? This ends the task and puts the branch where it belongs. It's a separate command from `/wa-validate` because it answers a different question — not *"is this code good"* but *"where does this work land"* — and half of what it does to git can't be undone.

So it always shows the plan first and waits for a yes:

```
Closing Add Apple login

commit    : 2 uncommitted files → commit (Benjamin Pisano)
sprint    : merge wa/add-apple-login → sprint/login-refacto
branch    : wa/add-apple-login deleted (merged)
worktree  : ../.wa-worktrees/add-apple-login removed
after     : 🏁 Login refacto — 3/5

ok? [y/n]
```

Where the work lands depends on one thing: whether the task is in a sprint.

- **In a sprint** → merged into the sprint branch. Always, no config involved.
- **Standalone** → `close.strategy` in your config, asked at `/wa-setup`:

```yaml
close:
  strategy: nothing   # nothing | pr | merge
  target: main        # where pr/merge lands
  delete_branch: auto # auto = only once the code lives elsewhere
```

`nothing` is the default and stops after the commit — the branch stays, you open the PR yourself. `pr` pushes and runs `gh pr create` onto `target`, and asks every single time, because a PR is visible to other people the moment it opens. PR titles name the area in 1–3 words (`Performance`, `Map architecture`) and bodies stay telegraphic — one line, a few changes, what to test — written for someone who never saw the task. `merge` merges locally without pushing.

A branch is only deleted once its code exists somewhere else: merged into its sprint branch, or merged into `target`. `pr` and `nothing` keep it — a PR needs its branch, and so do you. A leftover autopilot worktree gets removed with it, and if it's dirty the command stops and asks.

When the **last task of a sprint** closes, the sprint branch becomes the thing to deliver, so the same `close.strategy` is offered for it — proposed, never done silently:

```
🏁 Login refacto — 5/5, last task closed.
→ Recommended: PR sprint/login-refacto → main   (close.strategy: pr)
  Otherwise: keep the branch, you ship it yourself.
```

**6. Keep knowledge fresh — `/wa-wiki`**

```
/wa-wiki
```

Updates the wiki after a feature lands. Never commits before your validation.

> Prefer autonomy? `/wa-autopilot` runs the `/wa-code` cycle across the top backlog tasks on its own, one branch per task — and tasks whose files don't overlap run **at the same time**, each implementer in its own git worktree. It delivers **code**: built, run on the simulator, committed on its branch, task left at `review`. The verifier doesn't run there — your review is asynchronous, so it waits for your `/wa-validate` on each branch, exactly like an attended run.

> **Branch per task.** Set `branch.per_task: true` (asked at `/wa-setup`) and `/wa-code` codes on `wa/add-apple-login` (`wa/42-add-apple-login` with GitHub) instead of your current branch. Combine it with `commit.auto_commit_after_validation` and `/wa-close` commits the task, then checks out the next task's branch for you — chain tasks without touching git.
>
> **Branch per sprint.** A task carrying a `sprint:` doesn't fork off `branch.base` — it forks off `sprint/<kebab-case sprint title>`, created from the base the first time a task of that sprint is coded (by `/wa-code` or by an `/wa-autopilot` wave). `/wa-close` merges each task back into it. That's the point: the third task of a login refacto starts from the first two instead of rediscovering them as a merge conflict. Nothing lands on a sprint branch before its task is reviewed and closed, so the base of the sprint stays code you approved. `branch.sprint_prefix: ""` turns it off.

## File tree created in your project

```
.whackagent/
  config.md            # language, coding language, project_kind, review timing + modules, paths, commit + branch + close policy
  conventions/         # copied convention modules (only the useful ones), editable per project
  BACKLOG.md           # task index (order = priority) — files backend only
  tasks/<slug>.md      # one task = one file (frontmatter + body) — files backend only
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
title: Add Apple login      # verb + thing, ≤ 5 words — read cold in an issue list
summary: Sign in with Apple on the login screen   # the goal, ≤ 8 words, for the board
size: quickwin             # quickwin 🟢 | medium 🟡 | large 🔴
sprint: Login refacto       # optional — groups the tasks of one bigger piece of work
status: todo                # draft | todo | coding | to-test | to-close | done | canceled
wiki: [[auth]], [[onboarding]]
note:                       # trigger / free context (optional)
---

## Context / Decisions
## Implementation
## Review
```

With `tasks.backend: github` the same task is an issue: `title` → issue title, `size` → `size:*` label, `sprint` → milestone, `status` → board Status column, and the rest — summary, `wiki`, `note`, the six sections — is the issue body.

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
- **caveman**: config and wiki compression at setup and on each `/wa-wiki` (`compress_wiki: true`, saves re-reading tokens)
