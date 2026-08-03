---
# whackagent config — written by /wa-setup, edit freely.
discussion_language: fr        # language Claude talk to you in
code_language: en              # identifiers, comments, log messages, commits
ui_strings_language: en        # user-facing strings
primary_language: swift        # swift | typescript | generic | ...
project_kind: app              # app | package | cli | server  (pick architecture module)

paths:                         # WHERE whackagent keep each kind of file. Skills refer as
                               # {backlog} {tasks} {wiki} {reports} {conventions} — never literal path.
                               # Relative path resolve from repo root; absolute allowed
                               # (wiki in sibling repo, say).
                               # Point at committed, human-browsable folder when team share
                               # them — `docs/wiki` read on GitHub, `.whackagent/wiki` no.
                               # Missing key → default below, so old config still work.
  backlog: .whackagent/BACKLOG.md
  tasks: .whackagent/tasks
  wiki: .whackagent/wiki
  reports: .whackagent/reports          # run reports — usually keep local, gitignore-able
  conventions: .whackagent/conventions  # convention modules copied here by /wa-setup
                               # `.whackagent/config.md` itself NOT configurable: it carry these
                               # paths, so must sit at known spot.
                               # Move path after setup → move files too; nothing back-fill.

review:
  when: on_validation          # WHEN wa-verifier run.
                               #   on_validation — once, when you run /wa-validate: your feu vert say
                               #     feature match spec, and THAT fire review, over whole
                               #     diff (code + every feedback round). Coding and feedback round stay
                               #     fast; nothing reviewed while still moving.
                               #   each_round — also after /wa-code and after every /wa-feedback fix.
                               #     Catch drift earlier, cost verifier round each time. /wa-validate
                               #     still run final pass.
                               # Either way no task close unreviewed — /wa-validate only door.
  inline_micro_fixes: true     # /wa-feedback may apply MICRO-fix itself instead of spawn
                               # implementer (~50k tokens context for one-liner). Bounded: ≤2 files,
                               # ≤~20 lines, no new file/type/folder, no layer or public-API change.
                               # Anything bigger, or any doubt, still go to wa-implementer.
                               # false → every change go through implementer, whatever size.
  autofix: true                # wa-code verify phase re-dispatch implementer until clean
  public_doc: true             # require doc on public API — flip false per company
  modules: [style.md, elegance.md, swiftui.md, testing.md, architecture-global.md, architecture-app.md]
                               # what single wa-verifier load before judging. Setup drop
                               # swiftui.md if no SwiftUI, and swap architecture-app.md for
                               # architecture-package.md. Paths relative to {conventions}.
                               # ONE verifier, not one per lens: isolated agent cost ~50k tokens
                               # context before reading a line, and every lens judge same diff
                               # against same rulebook — splitting paid twice for that and left
                               # duplicate findings to dedupe. It sweep style, elegance, structure and
                               # correctness in one pass and report which ran.
                               # Legacy `categories: {conventions: [...], correctness: []}` read as
                               # union of its lists.

build:                         # how THIS project build — project win over plugin default
  command: ""                  # e.g. "ign app", "make build", "./scripts/build.sh". Empty → XcodeBuildMCP
                               # for Apple targets, `swift build` for SwiftPM, project runner otherwise.
  test_command: ""             # e.g. "make test". Empty → language default (`swift test`, …).

verify:                        # runtime check — implementer drive app it just built
  mode: autopilot              # WHO exercise app after green build:
                               #   autopilot — agent drive it in /wa-autopilot only (nobody there
                               #     to test); attended /wa-code + /wa-feedback stop at build + tests and
                               #     YOU validate by testing app yourself. Default for app targets.
                               #   always — agent drive it every run, attended or not.
                               #   off — agent never drive it; build + tests whole proof.
                               # Under `autopilot` and `off` implementer may STILL launch app when
                               # it can't write feature without seeing it run (reproduce bug, judge
                               # layout, follow nav flow). That implementation, not proof: it drive
                               # minimum it need and say so in NOTES.
                               # Legacy `enabled: true` / `false` read as `always` / `off`.
  platform: ios                # ios | android | both  (ios drive via XcodeBuildMCP, else mobile-mcp)
  target: simulator            # simulator | emulator | device

commit:
  auto_commit_after_validation: false   # may Claude commit once YOU validate feature?
  author_name: "Benjamin Pisano"        # commits ALWAYS use this — never "Claude"
  author_email: "benjamin.pisano@icloud.com"

branch:
  per_task: false              # /wa-code work on own branch per task instead of current one
  prefix: "wa/"                # branch name: <prefix><slug> → wa/login-apple
  base: current                # fork point: current | main | <branch name>
  checkout_next: true          # after validation + commit, hop onto next task branch
                               # (only when per_task AND commit.auto_commit_after_validation)

autopilot:
  on_blocker: skip-and-log     # never invent; freeze task, move on
                               # autopilot ALWAYS branch per task, whatever branch.per_task say

yagni: strict
compress_wiki: true            # caveman-compress config + wiki pages to save re-read tokens
                               # (at /wa-setup and after every /wa-wiki wiki update; .original backups removed)
---

# Project config

Free-form notes about this project every skill should keep in mind.
Edit frontmatter above to change behavior.

## Core rule — stop and ask

Outside autopilot, moment anything unclear, ambiguous, or blocked beyond
what task spec cover: **stop and ask**. Never guess on scope.

**Every question come with recommended answer** — always, no exception. One
line for pick, one line for why, plus alternative when real one exist. No basis
to choose? Recommend most reversible option and say it guess. Bare question with
no proposal never acceptable: answering must be confirm-or-correct, not homework.

Inside autopilot: never ask (nobody watching) — freeze task with open
question logged, move to next one.