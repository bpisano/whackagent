---
# whackagent config — written by /wa-setup, edit freely.
discussion_language: fr        # language Claude talks to you in
code_language: en              # identifiers, comments, log messages, commits
ui_strings_language: en        # user-facing strings
primary_language: swift        # swift | typescript | generic | ...
project_kind: app              # app | package | cli | server  (picks the architecture module)

conventions_dir: .whackagent/conventions   # per-category convention modules copied here by /wa-setup

review:
  autofix: true                # wa-code's review phase re-dispatches the implementer until clean
  public_doc: true             # require doc on public API (style reviewer) — flip false per company
  gate: auto                   # auto = skip `structure` when a round's diff can't move it
                               # (no file added/moved/renamed, no new type, small + single-layer).
                               # always = all three, every round. Either way the recorded verdict
                               # is always full — see wa-code.
  conventions_model: sonnet    # model for the `conventions` reviewer only — it compares code to an
                               # explicit checklist, which doesn't need the session model. `haiku` is
                               # the cheaper end, `inherit` keeps the session model. `structure` and
                               # `correctness` always inherit: they judge, they don't match patterns.
  categories:                  # each = ONE parallel reviewer; the listed module file(s) are all it loads.
                               # Three, not one per rule set: an isolated agent costs ~50k tokens of
                               # context before reading a line, so lenses that share a rulebook share
                               # an agent. Splitting further buys focus you already have.
    conventions: [style.md, elegance.md, swiftui.md, testing.md]  # how it's written — setup drops swiftui.md if no SwiftUI
    structure: [architecture-global.md, architecture-app.md]      # where it lives: layers/naming AND file tree — or architecture-package.md
    correctness: []            # pure bug hunt — no module

build:                         # how THIS project builds — the project wins over the plugin's default
  command: ""                  # e.g. "ign app", "make build", "./scripts/build.sh". Empty → XcodeBuildMCP
                               # for Apple targets, `swift build` for SwiftPM, the project's runner otherwise.
  test_command: ""             # e.g. "make test". Empty → the language default (`swift test`, …).

verify:                        # wa-code's runtime check — drives the built app via mobile-mcp
  enabled: false               # set true for app targets with a UI to exercise (needs mobile-mcp)
  platform: ios                # ios | android | both
  target: simulator            # simulator | emulator | device (build stays XcodeBuildMCP/gradle)

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
