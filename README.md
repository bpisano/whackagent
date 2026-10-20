# whackagent

A Claude Code plugin for your entire development flow.

## Features

- **codebase knowledge**: project knowledge base — a wiki the skills read before searching the code.
- **task management**: create tasks from an idea or cut a whole spec into a few, grill each until it's clear, prioritize and track them.
- **code pipeline**: implement a task, review it, and prove it runs — the implementer exercises what it just built to confirm the task actually works. On by default where it matters most, unattended runs (`verify.mode`); attended, you test it yourself.
- **any stack**: iOS, Android, KMP, web, desktop, server, CLI, library. Build uses your project's own command when it has one (`build.command`), else the build tool it finds (XcodeBuildMCP, `./gradlew`, package scripts, cargo, go, dotnet, …). Your own lint and static-analysis tools (detekt, SwiftLint, ESLint, ruff, …) run where you declare them in `tools:`, see [Project tools](#project-tools). The runtime check picks its driver from `verify.platform`:

| Platform | Driver |
| --- | --- |
| iOS | XcodeBuildMCP (simulator), [mobile-mcp](https://github.com/mobile-next/mobile-mcp) (device) |
| Android | mobile-mcp (emulator or device) |
| Web | browser automation MCP (Playwright, Claude in Chrome) |
| Desktop | desktop / computer-use MCP when configured |
| Server | starts it, hits endpoints with `curl`, reads the logs |
| CLI | runs the binary, checks output and exit code |

## Installation

Add the marketplace, then install the plugin:

```bash
/plugin marketplace add rlatapy-luna/whackagent
/plugin install whackagent@whackagent
```

## Commands

| Command | Description |
| --- | --- |
| `/wa-setup` | Config + scaffolding (`.whackagent/`) |
| `/wa-board` | Dashboard: backlog list, suggests the next action (runs on Haiku) |
| `/wa-board <sprint\|milestone>` | Same, filtered to one sprint or milestone, with its progress |
| `/wa-pane` | Opens the live backlog pane (see below) |
| `/wa-task <idea\|spec>` | Creates the task, then re-prioritizes the backlog and suggests `/wa-grill` (never starts it); a large spec is cut into a few feature-sized tasks (one sprint), each carrying its spec excerpt |
| `/wa-task` | No argument: prioritization pass only — reorders, YAGNI, can split |
| `/wa-grill [task]` | Grills one task until it's clear (grill-me, includes architecture), writes its acceptance criteria |
| `/wa-code <task>` | Full pipeline: understand → code + test → review → verify → report |
| `/wa-feedback [task] <notes>` | Applies your notes on what was built — micro-fix inline, bigger changes through the isolated pipeline |
| `/wa-validate [task]` | Your green light: "this is the feature I asked for" → runs the verifier on the whole diff. Doesn't close; touches git only under the GitHub provider, where a clean verdict marks the ticket PR ready |
| `/wa-close [task]` | Ends the task: commit, land the branch (sprint merge, PR ready for review, or nothing — `close.strategy`), delete branch + worktree, `done`. GitHub provider: merges the ready ticket PR on your yes |
| `/wa-close <sprint>` | Lands a complete sprint later: sprint PR when its branch holds unlanded work, else closes the GitHub sprint parent (asks first) |
| `/wa-release [milestone]` | Ships a milestone: checks its tasks landed, then walks you through the project's own documented release flow, confirming every outward step (finds the doc, or interviews you and writes it first) |
| `/wa-autopilot [tasks\|sprint\|milestone]` | Applies wa-code on 1..n tasks autonomously, one branch per task, independent ones in parallel. A task you name runs from whatever state it's in (grills, codes, validates or refreshes what's left; never closes) |
| `/wa-review [scope]` | Standalone review, 4 lenses (diff / path / project) — audit, optional `--fix` |
| `/wa-wiki` | Updates the wiki |
| `/wa-wiki <feature>` | Looks up info in the wiki, then the code |

Each step suggests the next one. You never have to figure out what to run.

### Backlog pane

In a project with `.whackagent/config.md`, a live pane beside the conversation shows the backlog in the `/wa-board` format: one section per state, sprint and milestone progress, and one tab per milestone to filter the board, lowest version first, then **All**. The board opens on the lowest milestone. Each task carries buttons for the moves its state allows (`grill`, `code`, `feedback`, `validate`, `close`, and `merge` on a ready ticket PR under the GitHub provider), plus `autopilot` on every task not done; pressing one types the command into the prompt, it never runs it. The pane refreshes as task files change (local provider). Under the GitHub provider it calls GitHub only when it opens and on `↻ refresh`, to spare the API rate limit; task files of tasks in flight still reload as they change.

🎉 Done and 🚫 Canceled show their three most recent tasks; `+N more` lists them all and `show less` folds them back. **🏁 Sprints**, at the top of the board, lists each sprint (GitHub: every open `wa-sprint` parent, with its `#n` and milestone) with its progress; `▸ N tickets` unfolds its tickets under it, and once all of them are closed it shows `· complete` with a `close` button that fills `/wa-close <sprint>`. On a milestone tab it keeps the sprints of that milestone. A milestone still open whose tasks are all landed (at least one done, none left) shows `🎯 0.4.0 — 5/5 · ready to ship` with a `release` button that fills `/wa-release 0.4.0`; tracks never get one. Under the GitHub provider, an issue closed as not planned shows under 🚫 Canceled, never under 🎉 Done. The pane lists canceled tasks only on a milestone tab, not on **All**. Each state has its emoji on the board's sections, the task tabs and the task details: 📥 todo · 🔥 grilling · 📐 grilled · 🔨 in progress / coding · 👀 review · 👍 validated · 🎉 done · 🚫 canceled.

`[ hide board ]`, first in the pane header (hotkey `b` while the pane has the keyboard), folds the board away down to an open-task count, and `[ show board ]` brings it back, for the session; tasks in flight stay. Below the board, **Tasks in flight** has one tab per task being worked on right now, wherever your terminal is (main checkout on `main`, or a worktree): local tasks in progress; under the GitHub provider, your tickets (assigned to you) in `grilling` or `coding`. The one checked out where the session runs comes first, marked 📍. A tab shows its state and phase, PR (in the terminal a button that opens it in your browser with `gh pr view --web`, so it works in any terminal; a link in the desktop app and VS Code) and open blockers (GitHub), worktree, sprint with each sibling's state, acceptance criteria marked ✅ / ❌ from `## Verification`, bricks, the last review round, verification notes and feedback rounds, with the task's action buttons. Task files are read from the worktree when there is one, else from the ticket branch (`git show`, no fetch).

When a command ends on its `→ next:` line, the command it recommends (`/wa-validate 216`) is offered as the prompt's suggestion: press Tab to take it, edit, Enter. This works with the pane closed. `/wa-pane` opens it. To open it on its own at session start (when the terminal is at least 144 columns wide), turn on **Open backlog pane at start** (`auto_open`) in the plugin's settings in `/config`. The pane is built on Claude Code's function hooks, an early-access API: on a Claude Code build that can't load it, the skills keep working without it.

Task commands (`/wa-grill`, `/wa-code`, `/wa-feedback`, `/wa-validate`, `/wa-close`, `/wa-autopilot`) rename the session after the task they work on, once they have resolved it: the project, the ticket number under the GitHub provider, and the task's short title, such as `shop · #12 Login Apple` (local: `shop · Login Apple`). Two tasks keep both titles; three or more (an autopilot batch) keep only the numbers. The rename goes through the same function hooks, so it works whether the pane is open or not. Turn it off with **Name session after its task** (`rename_session`) in the plugin's settings in `/config`.

### Referring to tasks

`/wa-board` numbers every row (`#` column), continuously across sections. Anywhere a task is expected you can pass that number instead of the slug — single, list, or range:

```
/wa-code 3
/wa-autopilot 2,4,5
/wa-autopilot 2-5
/wa-grill 3
```

The number is display-only: it comes from the current backlog order, so it changes whenever the backlog is reordered (which happens on its own each time a task is added). The command always echoes what it resolved (`3 → sync-offline`) before doing any work, so a stale number can't silently run the wrong task.

### Sprints

A big piece of work rarely fits in one task. Refactoring the login screen is four or five of them, and you want to see them as one thing. That's a **sprint**: an optional label on a task.

```yaml
sprint: login-refacto
```

There is no sprint file and no command to create one. A sprint exists the moment a task names it, and stops existing when its last task closes. Most tasks never get one — it's there for the big ones.

Where it shows up:

- **`/wa-board`** grows a `Sprint` column (only when at least one task has a sprint) and prints progress per sprint: `🏁 login-refacto — 2/5 (1 in review, 2 todo)`. `/wa-board login-refacto` narrows the whole board to that sprint.
- **`/wa-task`** sets it: when you name one, or when the grill splits a `large` task — the children are born into the same sprint, which is the case sprints exist for. On GitHub the split ticket itself becomes the sprint: it keeps its number, history and milestone, and the children become its sub-issues. It never invents one silently; it proposes in one line.
- **Prioritization** keeps a sprint's tasks contiguous in the backlog. The sprint moves as a block, and you order tasks inside it (dependencies first). Pulling one out of the block is allowed, and it says why.
- **`/wa-autopilot login-refacto`** batches the sprint's `todo` tasks — leaving alone the ones already in review or validated, and echoing what it skipped.

- **`/wa-close`** merges the task branch into the sprint branch (with `close.strategy: pr`, it opens a ready-for-review PR onto it instead), and notices when the sprint's last task closes — then it offers to land the sprint branch itself. The sprint branch lands with a merge commit, never squashed, so each ticket's history survives on the target.

Sprints deliberately aren't a status and aren't a backlog section: a sprint cuts across statuses (some tasks done, some in review, some untouched), and status sections are what tells you what to do next. There's no sprint status to set either — a sprint is complete when its tasks are. `/wa-code`, `/wa-feedback`, `/wa-validate` and `/wa-close` stay per task — one task at a time is how you review and merge.

### Milestones

A milestone is a **release scope**: what ships together (`0.3.0`, `sprint 14`). It is not a sprint. A sprint groups the tasks of one feature and gets its own branch; a milestone groups whatever ships in one release and owns nothing. A task can carry both, either, or neither.

```yaml
milestone: 0.3.0
```

You own the list. With the local backlog it's `backlog.milestones` in the config, oldest first; with the GitHub backlog it's the repo's milestones. Agents never create or rename one; `/wa-release` closes it once the release is done, and only on your yes.

**Every new task joins the highest open milestone**, by version order of the titles (`0.3.0` beats `0.2.1`, even when `0.2.1` was opened later; digit runs compare as numbers, so `0.10.0` beats `0.9.0`). The current and past milestones are committed scope, so a new idea never grows them without you saying so. Name another one when you create the task (or later) to override it, or say "no milestone". A task split by the grill keeps its parent's milestone, since it replaces the parent inside the same scope. With no milestone open, tasks get none and nothing changes.

`/wa-board` prints one progress line per milestone, highest first, and marks where new tasks go: `🎯 0.3.0 — 0/3 (3 todo) ← new tasks`. `/wa-board 0.3.0` and `/wa-autopilot 0.3.0` take a milestone like they take a sprint.

### Tracks

A track is a **long-shot feature that lives beside your base branch** on its own long-lived trunk, like a server experiment on `develop_synchro` next to `develop`. It may land one day or never. Without tracks configured, nothing in this section applies and the flow is unchanged.

```yaml
branch:
  tracks:
    server: develop_synchro   # milestone title: branch
```

- **Membership is a milestone.** A task in the `server` milestone forks from `develop_synchro` and opens its PR there, sprint branches included. Every other task forks from `branch.base` as usual.
- **New tasks never join a track by default.** The default milestone skips tracks. When an idea clearly belongs to one, `/wa-task` or `/wa-grill` suggests the track with a reason, and only your yes moves it there.
- **Moving a task that already has a branch** rebases its commits onto the other trunk, resolves conflicts through the implementer, shows you the diff, force-pushes after you confirm and retargets the PR. A move always resets validation, since the same diff now runs on a different codebase.
- **Syncing.** `/wa-board` shows how far the track lags (`🎯 server — 2/6 (2 in review, 4 todo) · 30 behind develop`), and `/wa-code` offers a sync before forking off a stale trunk. A sync merges the base into the track through a `wa-sync/<track>-<date>` PR, never a rebase, and it only runs on your yes.
- **Back-ports.** Shipping part of the track early on the base is a plain task with `ported-from: #<pr>` in its task file. The next sync knows that code is a duplicate and keeps the track version.
- **Landing.** When the long-shot wins, you create a task with `lands: <track>` on the release milestone it ships in. It is grilled like any task, then does a final sync and merges the track into its branch for one PR onto the base, to be merged with a merge commit. After it lands, whackagent offers to remove the track from the config.
- **Abandoning.** On your word, the track's open tasks are canceled and the config entry goes. The branch is kept.
- `/wa-release` refuses a track milestone, and `/wa-autopilot` never moves, syncs or lands a track.

### Releasing

`/wa-release 0.3.0` ships a milestone. With no argument it lists the open milestones and suggests the lowest one, since that's the scope that ships next.

1. **Readiness.** Every task of the milestone must have landed. Unfinished tasks are listed, and you choose: move them to the next milestone, finish them first, or ship anyway. A task merged into a sprint branch that never reached the target branch blocks the release.
2. **Your release flow, not a generic one.** whackagent doesn't know how your app ships (store, registry, deploy, tag, or nothing), so it never guesses. It reads the flow from `release.doc` in the config. If that's empty, it searches your markdown (`RELEASING.md`, the wiki, a *Release* section in `CLAUDE.md`, `CONTRIBUTING.md` or `README.md`) and asks you to confirm what it found. If there's nothing, it offers to interview you and write `{wiki}/release.md` first, suggesting answers from what the repo shows (CI files, fastlane, version files) without assuming them.
3. **Step by step.** It shows the whole plan, then runs the steps in the doc's order. Local steps (version bump, release notes drafted from the milestone's tasks, builds, tests) run after one yes. Every outward step (commit, tag, push, merge, publish, upload) shows its exact command and waits for its own yes. Steps the doc gives to a person (store console, signing) come with instructions, and it waits for you to say done.
4. **Close.** Progress goes to `{reports}/release-<milestone>.md`, so an interrupted release resumes where it stopped. At the end it offers to close the milestone and to fix the doc wherever the real run differed from it.

### Project tools

Lint, static analysis and format checks are your project's, not the plugin's. Declare them in the `tools:` block of `.whackagent/config.md`, and `/wa-setup` proposes entries when it finds a tool config (`detekt.yml`, `.swiftlint.yml`, eslint, ruff, golangci-lint, clippy…):

```yaml
tools:
  - name: detekt
    run: ./gradlew detekt
    fix: ./gradlew detekt --auto-correct   # optional
    when: [code, validation]
```

- **`code`**: the implementer runs the tool after build and tests, on every brick and every `/wa-feedback` round. A failure in a file the task touched counts as a red build, so it gets fixed with the code.
- **`validation`**: `/wa-validate` (and `/wa-autopilot`) runs the tool before the verifier. Failures join the autofix loop as `tool:<name>` findings, and the implementer tries the tool's own `fix` command before fixing by hand. The verifier is handed the tool output, so it doesn't spend its review re-reporting what the tool already enforces.

Each `run` covers the whole project. A failure in a file the task never touched is pre-existing: it's reported, never fixed, since it's not the task's scope. No `tools:` entry means no tool runs.

### Pull requests

Every PR whackagent opens (the ticket's draft, the `/wa-close` PR, a sprint PR) follows your repo's conventions, set in the `pr:` block of `.whackagent/config.md`. `/wa-setup` proposes it from what it finds: your PR template, CODEOWNERS, a PR section in `CONTRIBUTING.md`, the title style of recent merged PRs, your labels.

```yaml
pr:
  template: auto            # your repo's PR template, sections filled from the task file
  title: "[#{n}] {title}"   # {title} {n} {slug}
  labels: [whackagent]      # added when the PR opens
  assignees: ["@me"]
  reviewers: [my-org/android]   # requested when the PR goes ready, never on a draft
  doc: CONTRIBUTING.md#Pull requests   # rules the keys can't express (changelog line, size limit)
```

- **Every PR gets at least one label from your repo's own labels**, on top of `pr.labels`: the best fit for the change (bug, feature, docs, then an area label if you have them), named in the report. Labels are never created; a repo with no labels at all gets PRs without one.
- **The template is filled, not replaced.** Its headings stay, each section is written from the task file, and its checkboxes are ticked only when a round proved them (build, tests, tools, runtime check) or the diff shows them.
- **whackagent's part sits in its own marked block**: `Closes #n`, the acceptance criteria checklist, numbered manual test steps (setup, navigation path from launch to the feature, then each action with its expected result), the status line. A template with its own testing section gets the steps there instead. Each round rewrites that block only, so whatever a human added to the body stays.
- **Reviewers aren't pinged on drafts.** A draft is your turn to test; reviewers are requested when the PR goes ready.
- No `pr:` block keeps the previous behavior: no template, title = task title, assigned to you.

### Other settings

`/wa-setup` writes `.whackagent/config.md` from [`templates/config.md`](templates/config.md), where every key carries a comment. The ones not covered above:

| Key | Default | What it does |
| --- | --- | --- |
| `discussion_language` | `en` | Language Claude talks to you in. Files and code stay in English |
| `primary_language` | `generic` | Picks the convention pack: `swift`, `kotlin`, `typescript`, or `generic` for anything else |
| `review.inline_micro_fixes` | `true` | `/wa-feedback` applies a micro-fix itself (≤2 files, ≤~20 lines, no new type or API change) instead of spawning the implementer |
| `review.public_doc` | `true` | The verifier requires doc comments on public API |
| `build.test_command` | `""` | Test command; empty uses the build tool's own test task |
| `verify.target` | `local` | Where the runtime check runs: `simulator`, `emulator`, `device`, `browser` or `local` |
| `branch.checkout_next` | `true` | After `/wa-close`, check out the next task's branch (with `branch.per_task` and `commit.auto_commit_after_validation`) |

## Typical flow

Bootstrap once, then loop: describe → grill → code → you test → you validate → verifier → closed. Prioritization isn't a step you run — it happens on its own every time a task is added.

**0. Setup (once per project)**

```
/wa-setup
```

Detects language + project kind, scaffolds `.whackagent/`.

**1. Describe a task — `/wa-task`, then `/wa-grill`**

```
/wa-task Sign in with Apple on the login screen
```

Creates `.whackagent/tasks/login-apple.md` and stops there, suggesting `/wa-grill <#>`. You run `/wa-grill`: it grills the idea (grill-me) until it's clear, plans the architecture, and writes the spec + a size (🟢 quickwin / 🟡 medium / 🔴 large). Hand `/wa-task` a spec document instead and it first cuts it into a few feature-sized tasks, each carrying its excerpt of the spec — one proposal, created on your yes — then you grill them one at a time with `/wa-grill <#>`.

Before stopping, `/wa-task` prioritizes on its own — there's no separate command for it: a product-owner pass slots the new task where it belongs, applies YAGNI, and flags anything too big to split (asking first). You end up looking at a fresh, ordered board — top of the list is what to code next:

```
### 📥 Todo

1 · 🟢 **Login Apple**
    Sign in with Apple on login screen
2 · 🟡 **Offline cache** · `feed-offline`
    Cache the feed for offline reads
3 · 🔴 **Payments** ⚠
    Stripe checkout + receipts

🟢 quick win · 🟡 medium · 🔴 large · ⚠ not grilled
```

**2. Code it — `/wa-code <task>`**

```
/wa-code 1
```

A single command runs the whole coding cycle, orchestrating isolated subagents:

1. **Plan**: read the task, search the existing code to avoid rewriting, write a **BRIEF** (existing files + their sizes, what to reuse, layer boundaries, target layout) handed to every subagent so nobody re-explores the same ground, break it into bricks, plan the tests. The bricks are posted on the ticket as one comment, one line each (GitHub provider; nothing with local files). `/wa-code` and `/wa-autopilot` run on Opus, since this planning is where judgment pays.
2. **Code**: one `wa-implementer` (runs on Sonnet) for the whole task, fed brick by brick (sequential) — it writes the feature *and* the tests and proves the build. Keeping the same agent across bricks means the conventions and the BRIEF are read once, and brick 2 already knows what brick 1 built.

   **Who tests it is a setting** (`verify.mode`). Default `autopilot`: unattended runs get driven by the agent — taps and screenshots, a browser, `curl` against the service, or a CLI run, acceptance criteria checked against what it sees, because nobody else is there — while an attended `/wa-code` stops at build + tests and **you** validate by using it. `always` drives it every time; `off` never. Whatever the mode, the implementer may still launch the app when it can't write the feature without seeing it run (reproduce a bug, judge a layout) — that's implementation, and it says so rather than passing it off as proof.
3. **Report**: same card every time — **Problem**, **Goal**, **Done**, **To test** (checklist of what the agent didn't prove + regression zones), then a build · tests · tools · run · review status line (`tools` only when you declared some). Saved in `.whackagent/reports/login-apple.md`, task moved to `review` — meaning *waiting for you to test it*. `/wa-autopilot` and `/wa-feedback` use the same card.

**3. Test it, iterate — `/wa-feedback`**, then **4. give the green light — `/wa-validate`**

The order matters, and it's the whole point of the flow: **code → you test → you validate → the verifier runs.** A review that happens before you've said "yes, that's the feature" reviews code three feedback rounds are about to move.

`/wa-validate <task>` is that green light. It says *"this matches my spec"* — nothing more. It does **not** close the task:

1. It dispatches one `wa-verifier`, which sweeps four lenses over the diff — **style**, **elegance**, **structure** (layers, boundaries, file tree) and **correctness** (real bugs, plus whether the diff meets the acceptance criteria) — and reports which ones ran. It's handed the diff hunks, so it judges the change instead of hunting for it, then autofix loops until clean. One agent rather than one per lens is a measured call: an isolated agent costs ~50k tokens of context before it reads a line, and every lens judges the same diff against the same rulebook — paying that twice bought nothing but duplicate findings to dedupe. And every round resumes the *same* agent rather than spawning a new one — it already holds its modules and the code, so round 2 costs a diff instead of a full re-read.

2. The scope is the **whole diff** — the code plus every feedback round, in one pass. Sending three notes costs three fixes, not three reviews.
3. Findings are severity-ordered, autofixed in a loop, and written to the task's `## Review`. A clean verdict (or findings you explicitly accept) moves the task to `validated`, **not** `done` — the autofix may have changed code you'd tested, so you get to retest. Findings left open keep it in `review`.
4. `/wa-validate` never closes anything. On the local provider it never touches git: retest, then **`/wa-close`** — next section. Under the GitHub provider a clean verdict syncs the wiki and marks the ticket PR ready (it stays a draft when autofix changed code since your test, until you retest and run `/wa-validate` again).

`review.when: each_round` restores a review after `/wa-code` and after every `/wa-feedback` if you'd rather catch drift early — `/wa-validate` still runs the final pass. **No task closes unreviewed either way: `/wa-close` refuses a task the verifier never saw.**

Iterating before that green light is `/wa-feedback`:

```
/wa-feedback the button should be secondary, and the error toast is too aggressive
```

Feedback is where quality usually leaks: the change looks small, so it gets patched inline — outside the conventions, outside the review, and nothing gets re-run. This command refuses to work that way, without making a one-liner cost an agent either. Each note is **routed by size**: a **micro-fix** (≤2 files, ≤~20 lines, no new file/type, no layer or public-API change) is applied straight away — convention module read first, build + tests re-run, hunks tagged so the verifier looks at them harder. Anything bigger goes back through `wa-implementer`, which re-reads every convention module before touching a line. Both paths get the runtime check when `verify.mode` puts it on the agent, and both end up in front of the verifier at `/wa-validate` — inline hunks flagged as written without a convention pass, so they get the harder look.

It also triages what you said: a **defect** gets fixed, an **adjustment** updates the acceptance criteria too, a **new feature** in disguise is sent back to `/wa-task` instead of being silently built — and a **rule** ("always do X") is offered up for your conventions file, so it stops being forgotten on the next task.

**5. Close it — `/wa-close <task>`**

```
/wa-close login-apple
```

Retested and still good? This ends the task and puts the branch where it belongs. It's a separate command from `/wa-validate` because it answers a different question — not *"is this code good"* but *"where does this work land"* — and half of what it does to git can't be undone.

So it always shows the plan first and waits for a yes:

```
Closing login-apple

commit    : 2 uncommitted files → commit (Jane Doe)
sprint    : merge wa/login-apple → sprint/login-refacto
branch    : wa/login-apple deleted (merged)
worktree  : ../<repo>-worktrees/login-apple removed
after     : 🏁 login-refacto — 3/5

ok? [y/n]
```

Where the work lands depends on one thing: whether the task is in a sprint.

- **In a sprint** → merged into the sprint branch, unless `close.strategy` is `pr`: then it gets a PR onto the sprint branch, like a standalone task gets one onto `target`.
- **Standalone** → `close.strategy` in your config, asked at `/wa-setup`:

```yaml
close:
  strategy: nothing   # nothing | pr | merge
  target: main        # where pr/merge lands
  delete_branch: auto # auto = only once the code lives elsewhere
```

`nothing` is the default and stops after the commit — the branch stays, you open the PR yourself. `pr` pushes and leaves a PR ready for review onto `target`: a draft PR already open for the branch is marked ready (body refreshed, reviewers requested), otherwise a PR is opened ready. It never merges the PR; that stays a human's call on GitHub. It asks every single time, because a PR is visible to other people the moment it opens. `merge` merges locally without pushing. Under the GitHub backlog provider, `close.strategy` doesn't apply to tickets: `/wa-validate` marks the PR ready and `/wa-close` offers to merge it.

A branch is only deleted once its code exists somewhere else: merged into its sprint branch, or merged into `target`. `pr` and `nothing` keep it — a PR needs its branch, and so do you. The task's worktree (an autopilot leftover, or any task under `branch.worktree`) gets removed with it, and if it's dirty the command stops and asks.

When the **last task of a sprint** closes, the sprint branch becomes the thing to deliver, so the same `close.strategy` is offered for it — proposed, never done silently:

```
🏁 login-refacto — 5/5, last task closed.
→ Recommended: PR sprint/login-refacto → main   (close.strategy: pr)
  Otherwise: keep the branch, you ship it yourself.
```

**6. Keep knowledge fresh — `/wa-wiki`**

```
/wa-wiki
```

Updates the wiki. `/wa-close` runs it on every close (under the GitHub provider, a clean `/wa-validate` or autopilot delivery does), so the wiki lands in the same commit/PR as the code it describes; run it yourself only for a catch-up sync.

> Prefer autonomy? `/wa-autopilot` runs the `/wa-code` cycle across the top backlog tasks on its own, one branch per task — and tasks whose files don't overlap run **at the same time**, each implementer in its own git worktree. It delivers **reviewed code**: built, run, then `/wa-validate` run by autopilot itself — its runtime check stands in for your green light — committed on its branch, task left at `validated`. You test it, then `/wa-close` (GitHub provider: the PR is already ready; merge it on GitHub or with `/wa-close`). Findings the autofix couldn't clear stay open: task left at `review`, listed in the report.

> **Branch per task.** Set `branch.per_task: true` (asked at `/wa-setup`) and `/wa-code` codes on `wa/<slug>` instead of your current branch. Combine it with `commit.auto_commit_after_validation` and `/wa-close` commits the task, then checks out the next task's branch for you — chain tasks without touching git.
>
> **Worktree per task.** Add `branch.worktree: true` (the third answer to the branch question at `/wa-setup`) and each task branch gets its own git worktree at `../<repo>-worktrees/<slug>` instead of being checked out in your repo. Your main checkout never switches branch, so several tasks can stay open side by side, and a dirty tree never blocks the next task. The folder is `paths.worktrees` and must sit outside the repo, so the nested checkout never gets indexed, searched or picked up by a build. The backlog and reports stay in the main checkout. The cost: each worktree builds from cold once, and you test from it (open your IDE, simulator or dev server there). `/wa-autopilot` uses the same folder.
>
> **Branch per sprint.** A task carrying a `sprint:` doesn't fork off `branch.base` — it forks off `sprint/<sprint>`, created from the base the first time a task of that sprint is coded (by `/wa-code` or by an `/wa-autopilot` wave). `/wa-close` merges each task back into it (with `close.strategy: pr`, through a PR you merge). That's the point: the third task of a login refacto starts from the first two instead of rediscovering them as a merge conflict. Nothing lands on a sprint branch before its task is reviewed and closed, so the base of the sprint stays code you approved. `branch.sprint_prefix: ""` turns it off.
>
> **Test branch.** With branches per task, two or more coded tasks waiting for your test on the same base (a sprint branch, or the trunk for standalone tasks) get merged into one local, throwaway branch, `wa-test/<base>` (`wa-test/sprint-login-refacto`), so you build and launch once and test them all instead of switching branches. `/wa-code`, `/wa-feedback` and `/wa-validate` rebuild it after their round, `/wa-autopilot` at the end of its run (one per base it touched), and `/wa-close` rebuilds it without the closed task or deletes it once fewer than two are left. It only takes committed work: on the local provider an attended round leaves its code uncommitted until `/wa-close`, so that task stays on its own branch. With `branch.worktree: true` it gets its own worktree (`../<repo>-worktrees/wa-test-<base>`); otherwise it is checked out in your repo only when the tree is clean. A task that conflicts with the others is left out and named in the report, never resolved there. The branch is never pushed, never landed and never the base of a PR, so teammates and the board never see it; each task branch stays the unit you validate and close. Every report ends with a 📍 line saying where to test: the branch you're on, the worktree, or the test branch. `branch.test_branch: false` turns it off (a config written before the key existed has it off).

## Shared backlog on GitHub

By default the backlog is files in your repo, for one agent at a time. Set `backlog.provider: github` (asked at `/wa-setup`) and it moves to a **GitHub Project**, so several agents in different worktrees, or on different machines, share one board without taking the same ticket.

The board doesn't require whackagent behind it. `/wa-setup` installs a **`BOARD.md`** contract in the project, plus pointers to it in `AGENTS.md`, `CLAUDE.md` and the Copilot and Cursor instruction files, a copy of the board CLI, and board sections in the PR template. Any dev, using any agent or work loop, follows that one file and the board stays right. See [GITHUB.md → One board, any work loop](GITHUB.md#one-board-any-work-loop).

Every ticket goes through six states. Agents only ever *take* a ticket; the rest is moved by what happens in the repo:

| State | Who moves it there |
| --- | --- |
| `todo` | an issue is opened (by `/wa-task`, or by hand on GitHub) |
| `grilling` | an agent claims it with `/wa-grill #12`, a lock, so no other agent grills it |
| `grilled` | the hooks workflow, when branch `wa/12-<slug>` is pushed with its spec and non-empty acceptance criteria |
| `coding` | an agent claims it for one round (`/wa-code 12`, `/wa-autopilot`, `/wa-feedback`, `/wa-validate`, `/wa-close`), a lock held only while the agent works |
| `review` | the hooks workflow, when a round's push opens the draft PR or updates it. Draft = your turn to test; a clean `/wa-validate` marks it ready = your turn to merge (on GitHub, or `/wa-close`) |
| `done` | the hooks workflow, when the PR is merged. The issue is closed. |

A closed-unmerged PR sends the ticket back to `grilled`.

- **Locks** are git refs (`refs/wa-claims/<issue>/<phase>`) created through the GitHub API. Creating a ref that already exists fails server-side, so when N agents claim the same ticket exactly one wins. The losers move on to the next ticket. The ref points at a commit naming the agent (`host:worktree`), so the board shows who holds what. Stale locks are flagged by `/wa-board` and cleared only by you (`/wa-task release 12`).
- **Reserve a ticket by assigning it.** An issue assigned to another GitHub account than the one your agent runs as can't be claimed by it. Assign yourself on GitHub, and other devs' agents leave the ticket alone; unassigned tickets stay open to everyone. Claiming assigns your account too, so a ticket your agent started stays yours until it's done; an aborted claim gives back only the assignment it made.
- **Where data lives:** the issue holds title and summary; the Project holds Status, priority (card order) and Size; a sprint is a parent issue (label `wa-sprint`, sprint name = its title in kebab-case) whose sub-issues are its tickets, so GitHub shows its progress bar. The parent stays off the board and closes when the sprint lands. The spec is the task file on the ticket branch, merged with the code. There is no local mirror.
- **Milestones are the repo's GitHub milestones** (see [Milestones](#milestones)). You create them on GitHub; "highest" is the open one with the highest title in version order. The hooks never touch a milestone, and the script never creates one; it closes one only when `/wa-release` asks, on your yes.
- **Order is yours.** New tickets land at the bottom. Agents reorder only when you run `/wa-task` with no argument, and apply the new order on your yes.
- **Setup:** `/wa-setup backlog` creates or adopts the Project, adds the columns without touching existing ones, installs the hooks workflow through a PR (a small caller of whackagent's reusable workflow, so hook fixes reach every project with each release, no new PR), and walks you through the `WA_PROJECT_TOKEN` secret (a classic PAT with `project` + `repo`, needed because the Actions token can't write to Projects). That token reaches every repository its account can, and any collaborator with write access can read it, so create it on a dedicated bot account. It can migrate an existing local backlog.
- **Workflow at a glance:** [WORKFLOW.md](WORKFLOW.md), short notes and diagrams: board states, whose turn it is, any work loop, the whackagent loop, merge, hook events.
- **Full walkthrough:** [GITHUB.md](GITHUB.md) explains what every command does on GitHub, the agent round, PRs, sprints, stacking and the gotchas.
- **Another tracker** (Jira, Linear, Trello, Notion) means a new folder under `providers/` implementing the same contract (`providers/CONTRACT.md`); the skills don't change.

## File tree created in your project

```
.whackagent/
  config.md            # language, coding language, project_kind, review timing + modules, paths, commit + branch + close policy
  conventions/         # copied convention modules (only the useful ones), editable per project
  BACKLOG.md           # task index (order = priority)
  tasks/<slug>.md      # one task = one file (frontmatter + body)
  wiki/index.md        # wiki summary
  wiki/<page>.md       # domain pages, [[wikilink]] links (Obsidian-compatible)
  reports/<slug>.md    # run reports, local only: /wa-setup gitignores them
```

That's the default layout. Every one of those paths is configurable — `paths:` in `config.md`, asked at `/wa-setup`:

```yaml
paths:
  backlog: docs/BACKLOG.md
  tasks: docs/tasks
  wiki: docs/wiki          # committed and browsable on GitHub, for teammates who don't run whackagent
  reports: .whackagent/reports
  conventions: .whackagent/conventions
  worktrees: ../<repo>-worktrees   # task worktrees, must be outside the repo
```

Relative resolves from the repo root (`{worktrees}` from the main checkout root, even inside a worktree); a sibling repo is a relative path too (`../team-wiki/docs`). The config is versioned and shared, so never put a user-specific absolute path (`/Users/<name>/…`, `~/…`) or your personal commit identity in it: leave `commit.author_*` empty and each committer's own `git config` identity is used. Only `.whackagent/config.md` is fixed — it's the file that carries the paths. Omit a key and it takes the default above, so a config written before `paths:` existed keeps working. Moving a path after setup means moving the files yourself; nothing back-fills. Reports aren't versioned: everything in them already lives in the task file and the wiki, so `/wa-setup` adds them to `.gitignore` (and offers to untrack ones already committed). A shared wiki is also a good reason to set `compress_wiki: false` — caveman compression saves the agents tokens and costs your teammates readability.

## Task

```markdown
---
title: Login Apple          # short, explicit — the feature at a glance
summary: Sign in with Apple on the login screen   # one line, for the board
size: quickwin             # quickwin 🟢 | medium 🟡 | large 🔴
sprint: login-refacto       # optional — groups the tasks of one bigger piece of work
milestone: 0.3.0            # release scope — set on creation to the highest open milestone
status: todo                # todo | in-progress | review | validated | done | canceled
                            # review = coded, waiting for your test · validated = spec approved,
                            # verifier passed, waiting for your retest
grilled: false             # true once it went through /wa-grill (grill-me)
wiki: [[auth]], [[onboarding]]
note:                       # trigger / free context (optional)
---

## Context / Decisions
## Acceptance criteria
## Implementation
## Review
## Verification
## Feedback
```

## Conventions

Conventions are **modular**, one file per rule set, and **self-contained** (no dependency on another plugin). Two languages ship as multi-module packs with the same layout:

```
conventions/swift/                    conventions/kotlin/
  style.md                              style.md                 # file layout, naming, member order, doc/comments, format
  elegance.md                           elegance.md              # idiomatic code, not another language ported over; concurrency
  architecture-global.md                architecture-global.md   # YAGNI · SOLID · DRY, composition, DI, testability
  architecture-app.md                   architecture-app.md      # app tree: iOS (Coordinator → ViewModel → Store → View) / Android + KMP (UI → ViewModel → Repository)
  architecture-package.md               architecture-package.md  # library / CLI / server tree
  swiftui.md                            compose.md               # UI toolkit rules — copied ONLY if the project uses it
  testing.md                            testing.md               # Swift Testing / JUnit + coroutines-test, fakes
```

Single-file packs: `typescript.md` (front end and back end) and `generic.md` — the fallback for every other language (Rust, Go, Python, C#, Java, Dart, …). Generic is a starting point to grow with your team's rules, not a lesser mode: the pipeline, the runtime check and the review work the same whatever pack is loaded.

`/wa-setup` detects the language, the **kind** (`app` · `web` · `server` · `cli` · `package`) and the UI toolkit, then copies **only the useful modules** into `.whackagent/conventions/` (no `swiftui.md` in a package without SwiftUI, no `compose.md` in a Ktor server). You edit these copies to adapt per project (e.g. drop public doc). A polyglot repo (KMP shared code + iOS app) can load two packs.

The copied list lands in `review.modules` — the verifier reads exactly that, and nothing else in the tree.

## Skill dependencies

- **grill-me**: task clarification in `/wa-grill`
- **caveman**: config and wiki compression at setup and on each `/wa-wiki` (`compress_wiki: true`, saves re-reading tokens)

## Credits

Originally created by Benjamin Pisano. Maintained by Rémi Latapy. MIT licensed, see [LICENSE](LICENSE).
