---
# whackagent config — written by /wa-setup, edit freely.
discussion_language: fr        # language Claude talks to you in
code_language: en              # identifiers, comments, log messages, commits
ui_strings_language: en        # user-facing strings
primary_language: swift        # swift | typescript | generic | ...
project_kind: app              # app | package | cli | server  (picks the architecture module)

conventions_dir: .whackagent/conventions   # per-category convention modules copied here by /wa-setup

review:
  when: on_validation          # WHEN the wa-verifier fan-out runs.
                               #   on_validation — once, when YOU validate the task: the whole diff
                               #     (code + every feedback round) gets reviewed in one pass. Feedback
                               #     rounds stay fast — no verify between each note.
                               #   each_round — after /wa-code and after every /wa-feedback fix.
                               #     Catches drift earlier, costs a fan-out per round.
                               # Either way the review happens before any commit: nothing closes unreviewed.
  inline_micro_fixes: true     # /wa-feedback may apply a MICRO-fix itself instead of spawning an
                               # implementer (~50k tokens of context for a one-liner). Bounded: ≤2 files,
                               # ≤~20 lines, no new file/type/folder, no layer or public-API change.
                               # Anything bigger, or any doubt, still goes to wa-implementer.
                               # false → every change goes through the implementer, whatever its size.
  autofix: true                # wa-code's verify phase re-dispatches the implementer until clean
  public_doc: true             # require doc on public API — flip false per company
  categories:                  # each = ONE parallel wa-verifier; the listed modules are all it loads.
                               # Two, not one per rule set: an isolated agent costs ~50k tokens of
                               # context before reading a line, so lenses sharing a rulebook share
                               # an agent. Splitting further buys focus you already have.
    conventions: [style.md, elegance.md, swiftui.md, testing.md, architecture-global.md, architecture-app.md]
                               # how it's written AND where it lives — setup drops swiftui.md if no
                               # SwiftUI, and swaps architecture-app.md for architecture-package.md
    correctness: []            # bugs + acceptance criteria — pure reasoning, no module

build:                         # how THIS project builds — the project wins over the plugin's default
  command: ""                  # e.g. "ign app", "make build", "./scripts/build.sh". Empty → XcodeBuildMCP
                               # for Apple targets, `swift build` for SwiftPM, the project's runner otherwise.
  test_command: ""             # e.g. "make test". Empty → the language default (`swift test`, …).

verify:                        # runtime check — the implementer drives the app it just built
  enabled: false               # set true for app targets with a UI to exercise
  platform: ios                # ios | android | both  (ios drives via XcodeBuildMCP, else mobile-mcp)
  target: simulator            # simulator | emulator | device

commit:
  auto_commit_after_validation: false   # may Claude commit once YOU validate a feature?
  author_name: "Benjamin Pisano"        # commits ALWAYS use this — never "Claude"
  author_email: "benjamin.pisano@icloud.com"

branch:
  per_task: false              # /wa-code works on its own branch per task instead of current one
  prefix: "wa/"                # branch name: <prefix><slug> → wa/login-apple
  base: current                # fork point: current | main | <branch name>
  checkout_next: true          # after validation + commit, hop onto next task's branch
                               # (only when per_task AND commit.auto_commit_after_validation)

autopilot:
  on_blocker: skip-and-log     # never invent; freeze the task, move on
                               # autopilot ALWAYS branches per task, whatever branch.per_task says

yagni: strict
compress_wiki: true            # caveman-compress config + wiki pages to save re-read tokens
                               # (at /wa-setup and after every /wa-wiki wiki update; .original backups removed)
---

# Project config

Free-form notes about this project that every skill should keep in mind.
Edit the frontmatter above to change behavior.

## Core rule — stop and ask

Outside autopilot, the moment anything is unclear, ambiguous, or blocked beyond
what the task spec covers: **stop and ask**. Never guess on scope.

**Every question comes with a recommended answer** — always, no exception. One
line for the pick, one line for why, plus the alternative when there's a real
one. No basis to choose? Recommend the most reversible option and say it's a
guess. A bare question with no proposal is never acceptable: answering must be
a confirm-or-correct, not homework.

Inside autopilot: never ask (nobody is watching) — freeze the task with the open
question logged, and move to the next one.
