---
# whackagent config — written by /wa-setup, edit freely.
discussion_language: fr        # language Claude talks to you in
code_language: en              # identifiers, comments, log messages, commits
ui_strings_language: en        # user-facing strings
primary_language: swift        # swift | typescript | generic | ...
project_kind: app              # app | package | cli | server  (picks the architecture module)

paths:                         # WHERE whackagent keeps each kind of file. Skills refer to these as
                               # {backlog} {tasks} {wiki} {reports} {conventions} — never a literal path.
                               # Relative paths resolve from the repo root; absolute ones are allowed
                               # (a wiki living in a sibling repo, say).
                               # Point them at committed, human-browsable folders when the team shares
                               # them — `docs/wiki` reads on GitHub, `.whackagent/wiki` doesn't.
                               # Missing key → the default below, so an older config keeps working.
  backlog: .whackagent/BACKLOG.md
  tasks: .whackagent/tasks
  wiki: .whackagent/wiki
  reports: .whackagent/reports          # run reports — usually keep local, gitignore-able
  conventions: .whackagent/conventions  # convention modules copied here by /wa-setup
                               # `.whackagent/config.md` itself is NOT configurable: it's the file that
                               # carries these paths, so it has to sit at a known spot.
                               # Moving a path after setup → move the files too; nothing back-fills.

review:
  when: on_validation          # WHEN the wa-verifier runs.
                               #   on_validation — once, when you run /wa-validate: your feu vert says the
                               #     feature matches the spec, and THAT fires the review, over the whole
                               #     diff (code + every feedback round). Coding and feedback rounds stay
                               #     fast; nothing gets reviewed while it's still moving.
                               #   each_round — also after /wa-code and after every /wa-feedback fix.
                               #     Catches drift earlier, costs a verifier round each time. /wa-validate
                               #     still runs the final pass.
                               # Either way no task closes unreviewed — /wa-validate is the only door.
  inline_micro_fixes: true     # /wa-feedback may apply a MICRO-fix itself instead of spawning an
                               # implementer (~50k tokens of context for a one-liner). Bounded: ≤2 files,
                               # ≤~20 lines, no new file/type/folder, no layer or public-API change.
                               # Anything bigger, or any doubt, still goes to wa-implementer.
                               # false → every change goes through the implementer, whatever its size.
  autofix: true                # wa-code's verify phase re-dispatches the implementer until clean
  public_doc: true             # require doc on public API — flip false per company
  modules: [style.md, elegance.md, swiftui.md, testing.md, architecture-global.md, architecture-app.md]
                               # what the single wa-verifier loads before judging. Setup drops
                               # swiftui.md if no SwiftUI, and swaps architecture-app.md for
                               # architecture-package.md. Paths are relative to {conventions}.
                               # ONE verifier, not one per lens: an isolated agent costs ~50k tokens
                               # of context before reading a line, and every lens judges the same diff
                               # against the same rulebook — splitting paid twice for that and left
                               # duplicate findings to dedupe. It sweeps style, elegance, structure and
                               # correctness in one pass and reports which ran.
                               # Legacy `categories: {conventions: [...], correctness: []}` reads as the
                               # union of its lists.

build:                         # how THIS project builds — the project wins over the plugin's default
  command: ""                  # e.g. "ign app", "make build", "./scripts/build.sh". Empty → XcodeBuildMCP
                               # for Apple targets, `swift build` for SwiftPM, the project's runner otherwise.
  test_command: ""             # e.g. "make test". Empty → the language default (`swift test`, …).

verify:                        # runtime check — the implementer drives the app it just built
  mode: autopilot              # WHO exercises the app after a green build:
                               #   autopilot — the agent drives it in /wa-autopilot only (nobody's there
                               #     to test); attended /wa-code + /wa-feedback stop at build + tests and
                               #     YOU validate by testing the app yourself. Default for app targets.
                               #   always — the agent drives it on every run, attended or not.
                               #   off — the agent never drives it; build + tests are the whole proof.
                               # Under `autopilot` and `off` the implementer may STILL launch the app when
                               # it can't write the feature without seeing it run (reproduce a bug, judge a
                               # layout, follow a nav flow). That's implementation, not proof: it drives the
                               # minimum it needs and says so in NOTES.
                               # Legacy `enabled: true` / `false` reads as `always` / `off`.
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
