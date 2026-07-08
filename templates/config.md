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
  categories:                  # each = ONE parallel reviewer; the listed module file(s) are all it loads.
    style: [style.md, swiftui.md, testing.md]   # setup drops swiftui.md if no SwiftUI
    elegance: [elegance.md]
    architecture: [architecture-global.md, architecture-app.md]  # global = YAGNI/SOLID/DRY/DI; app = layers/naming — or architecture-package.md
    arborescence: [architecture-app.md]         # file tree/folders section of the kind module — or architecture-package.md
    correctness: []            # pure bug hunt — no module

verify:                        # wa-code's runtime check — drives the built app via mobile-mcp
  enabled: false               # set true for app targets with a UI to exercise (needs mobile-mcp)
  platform: ios                # ios | android | both
  target: simulator            # simulator | emulator | device (build stays XcodeBuildMCP/gradle)

commit:
  auto_commit_after_validation: false   # may Claude commit once YOU validate a feature?
  author_name: "Benjamin Pisano"        # commits ALWAYS use this — never "Claude"
  author_email: "benjamin.pisano@icloud.com"

autopilot:
  branch_prefix: "wa/"         # one branch per task: wa/<slug>
  on_blocker: skip-and-log     # never invent; freeze the task, move on

yagni: strict
graphify: true                 # skills query the code graph instead of blind-scanning
compress_wiki: true            # caveman-compress config + wiki pages to save re-read tokens
                               # (at /wa-setup and after every /wa-wiki wiki update; .original backups removed)
---

# Project config

Free-form notes about this project that every skill should keep in mind.
Edit the frontmatter above to change behavior.

## Core rule — stop and ask

Outside autopilot, the moment anything is unclear, ambiguous, or blocked beyond
what the task spec covers: **stop and ask**. Never guess on scope.

Inside autopilot: never ask (nobody is watching) — freeze the task with the open
question logged, and move to the next one.
