---
# whackagent config — written by /wa-setup, edit freely.
discussion_language: en        # language Claude talk to you in
primary_language: generic      # swift | kotlin | typescript | generic  (picks convention pack;
                               # any other language → generic)
project_kind: app              # app | web | server | cli | package  (picks architecture module)
                               # app = mobile or desktop GUI; package = library/SDK

paths:                         # WHERE whackagent keep each kind of file. Skills refer as
                               # {backlog} {tasks} {wiki} {reports} {conventions} {worktrees} — never literal path.
                               # Relative path resolve from repo root (sibling repo: ../other/docs).
                               # Config versioned, shared → NEVER user-specific absolute path
                               # (/Users/<name>, /home/<name>, ~): breaks every other machine.
                               # Point at committed, human-browsable folder when team share them —
                               # `docs/wiki` read on GitHub, `.whackagent/wiki` no.
                               # Missing key → default below, so old config still work.
  backlog: .whackagent/BACKLOG.md
  tasks: .whackagent/tasks
  wiki: .whackagent/wiki
  reports: .whackagent/reports          # run reports — local, gitignored by /wa-setup
  conventions: .whackagent/conventions  # convention modules copied here by /wa-setup
  worktrees: ../<repo>-worktrees  # task worktrees (branch.worktree, /wa-autopilot). <repo> = repo
                               # folder name. Resolve from MAIN checkout root, even when setup run
                               # from a worktree — keep relative. MUST sit OUTSIDE repo: nested
                               # checkout get indexed, grepped, globbed by builds.
                               # `.whackagent/config.md` itself NOT configurable: it carry these
                               # paths, so must sit at known spot.
                               # Move path after setup → move files too; nothing back-fill.

backlog:
  provider: local              # WHERE tickets live — providers/CONTRACT.md.
                               #   local  — {backlog} + task files, one agent (default).
                               #   github — GitHub Project + issues, many agents/worktrees.
                               #     Settings in repo variables (wa-backlog provision), not here.
                               #     Forces branch.per_task: true, branch.base = close.target
                               #     (named branch). Ignores close.strategy for tickets:
                               #     /wa-validate marks PR ready, /wa-close merges it on your yes.
  milestones: []               # OPEN release scopes (iteration, version), OLDEST FIRST. Local provider
                               # only — github read them from repo milestones. New task join LAST
                               # entry, so new work never grow current or past scope. You own list:
                               # add entry to open next scope, remove one when shipped (tasks keep
                               # their milestone:). Empty → tasks get no milestone.

release:
  doc:                         # WHERE project's release flow is written — `path` or `path#Heading`
                               # (docs/RELEASING.md, {wiki}/release.md, CLAUDE.md#Releasing).
                               # /wa-release follow it step by step, never invent flow.
                               # Empty → /wa-release search markdown, else interview you and write it.

review:
  when: on_validation          # WHEN wa-verifier run.
                               #   on_validation — once, at /wa-validate: your green light say feature
                               #     match spec, and THAT fire review over whole diff (code + every
                               #     feedback round). Coding and feedback round stay fast; nothing
                               #     reviewed while still moving.
                               #   each_round — also after /wa-code and after every /wa-feedback fix.
                               #     Catch drift earlier, cost verifier round each time. /wa-validate
                               #     still run final pass.
                               # Either way no task close unreviewed — /wa-close refuse task the
                               # verifier never saw. /wa-autopilot ignore this key: it always run
                               # /wa-validate itself after green runtime check.
  inline_micro_fixes: true     # /wa-feedback may apply MICRO-fix itself instead of spawn
                               # implementer (~50k tokens context for one-liner). Bounded: ≤2 files,
                               # ≤~20 lines, no new file/type/folder, no layer or public-API change.
                               # Bigger, or any doubt → wa-implementer.
                               # false → every change go through implementer, whatever size.
  autofix: true                # wa-code verify phase re-dispatch implementer until clean
  public_doc: true             # require doc on public API — flip false per company
  modules: [generic.md]        # what single wa-verifier load before judging. Setup write
                               # what it actually copied: UI module (swiftui.md, compose.md)
                               # only if project use that toolkit,
                               # architecture-package.md for non-app kinds, single <lang>.md for
                               # one-file packs. Paths relative to {conventions}.
                               # ONE verifier, not one per lens: isolated agent cost ~50k tokens
                               # context before reading a line, and every lens judge same diff
                               # against same rulebook — splitting pay twice, leave duplicate
                               # findings to dedupe. It sweep style, elegance, structure and
                               # correctness in one pass and report which ran.
                               # Legacy `categories: {conventions: [...], correctness: []}` read as
                               # union of its lists.

build:                         # how THIS project build — project win over plugin default
  command: ""                  # e.g. "make build", "./scripts/build.sh", "./gradlew assembleDebug".
                               # Empty → build tool detected in repo: XcodeBuildMCP (Xcode project),
                               # ./gradlew (Gradle), swift build (SwiftPM), package.json scripts,
                               # cargo, go, dotnet, mvn, make… — see wa-implementer.
  test_command: ""             # e.g. "make test". Empty → same tool's test task.

tools: []                      # project tools whackagent run — lint, static analysis, format check.
                               # Commands, never hardcoded per language. Each entry:
                               #   - name: detekt
                               #     run: ./gradlew detekt                 # whole project; exit ≠ 0 = fail
                               #     fix: ./gradlew detekt --auto-correct  # optional: tool own fixer,
                               #                                           # implementer try it before hand fix
                               #     when: [code, validation]
                               # when — code: implementer run it after build + tests, every brick and
                               #   feedback round; failure in changed file = red build.
                               #   validation: /wa-validate run it before verifier; failures join
                               #   autofix loop as `tool:<name>` findings.
                               # Failure only in file task never touched = pre-existing: reported,
                               # never fixed — not this task scope.
                               # Empty → no tool run.

verify:                        # runtime check — implementer drive app it just built
  mode: autopilot              # WHO exercise app after green build:
                               #   autopilot — agent drive it in /wa-autopilot only (nobody there
                               #     to test); attended /wa-code + /wa-feedback stop at build + tests and
                               #     YOU validate by testing app yourself. Default for anything runnable.
                               #   always — agent drive it every run, attended or not.
                               #   off — agent never drive it; build + tests whole proof.
                               # Under `autopilot` and `off` implementer may STILL launch app when
                               # it can't write feature without seeing it run (reproduce bug, judge
                               # layout, follow nav flow). That implementation, not proof: it drive
                               # minimum it need and say so in NOTES.
                               # Legacy `enabled: true` / `false` read as `always` / `off`.
  platform: none               # WHAT gets driven, and with which tool (list allowed: [ios, android]):
                               #   ios     — XcodeBuildMCP (simulator), mobile-mcp (device)
                               #   android — mobile-mcp (emulator or device)
                               #   web     — browser automation MCP (Playwright, Chrome)
                               #   desktop — desktop/computer-use MCP when one configured
                               #   server  — start it, hit endpoints (curl), read responses + logs
                               #   cli     — run binary with task inputs, check output + exit code
                               #   none    — library, nothing to drive; build + tests whole proof
                               # Legacy `both` read as [ios, android].
  target: local                # simulator | emulator | device | browser | local

commit:
  auto_commit_after_validation: false   # may Claude commit once YOU validate feature?
                               # (name kept for old configs: it gate the commit /wa-close make)
  author_name: ""              # commits use this — never "Claude". Empty (default) → committer's own
  author_email: ""             # `git config user.name` / `user.email` at commit time, never made-up one.
                               # Config versioned, shared → never personal identity here: teammates'
                               # commits would carry it. Set only for shared identity (team bot).
                               # Rules: reference/commits.md.

branch:
  per_task: false              # /wa-code work on own branch per task instead of current one
  worktree: false              # with per_task: each task branch checked out in own git worktree
                               #   at {worktrees}/<slug> — main checkout never switch branch, tasks
                               #   open side by side. Cost: cold build per worktree, open IDE there.
  prefix: "wa/"                # branch name: <prefix><slug> → wa/login-apple
  base: current                # fork point: current | main | <branch name>
                               # GitHub provider: named branch, same as close.target
  sprint_prefix: "sprint/"     # task carrying `sprint:` branch off SPRINT branch, not base:
                               #   sprint/login-refacto ← created from base: on first task of sprint
                               #   wa/login-apple       ← forked from it, merged back by /wa-close
                               # So task 3 of sprint see task 1 work — same screen, no blind conflict.
                               # Created by whoever need it first: /wa-code step 0 or /wa-autopilot
                               # wave setup. Empty string → sprint get no branch, tasks use base:.
  tracks: {}                   # long-shot features on own long-lived trunk beside base:
                               #   {server: develop_synchro} — key = milestone title, value = branch.
                               # Task in that milestone fork from + land on that branch instead of
                               # base:/close.target. New tasks never join it by default; agent
                               # suggests, you decide. Rules: reference/tracks.md. Needs per_task.
                               # You own list. Empty (default) → no track, flow unchanged.
  checkout_next: true          # after /wa-close commit, hop onto next task branch (worktree mode:
                               #   create its worktree)
                               # (only when per_task AND commit.auto_commit_after_validation)
  test_branch: true            # with per_task: ≥2 coded tasks waiting your test on one base
                               #   (sprint branch or trunk) → merged into LOCAL throwaway branch
                               #   wa-test/<base> (worktree mode: own worktree), so you test them
                               #   in one launch. Rebuilt after each delivery. Never pushed, never
                               #   landed; conflicting task skipped. Rules: reference/test-branch.md.
                               #   false or missing → no test branch, test each task branch.

close:                         # WHERE work land when /wa-close finish a task. Task in a sprint
                               # always merge into its sprint branch first — this block say what
                               # happen to branch that has nowhere left to go (standalone task,
                               # or sprint branch itself once its last task close).
  strategy: nothing            # nothing — /wa-close stop after commit, branch left alone.
                               #   YOU open the PR. Safest, and default.
                               # pr     — push branch + PR onto target: ready for review —
                               #   existing draft marked ready, else opened ready. Never merged.
                               #   Sprint task: PR onto its sprint branch, no local merge.
                               #   Outward-facing: /wa-close ALWAYS confirm before, every time.
                               # merge  — merge branch into target: locally, no push.
                               # GitHub provider: ignored for tickets — /wa-validate marks PR ready,
                               #   /wa-close merges it on GitHub (squash) on your yes, every time.
  target: main                 # where pr/merge land. Ignored by `nothing`.
  delete_branch: auto          # auto   — delete only once code live elsewhere (merged into sprint
                               #   branch, or merged into target). `pr` and `nothing` keep it:
                               #   PR need its branch, and so do you.
                               # always — delete after close whatever happen. Ask first when
                               #   branch unmerged — that throw work away.
                               # never  — /wa-close never delete a branch.
                               # Worktree for the slug (autopilot leftover) removed with it.

pr:                            # HOW every PR whackagent open look — ticket draft, /wa-close PR, sprint PR.
                               # Rules: reference/pull-requests.md. Release PR not: release doc own it.
  template: auto               # (key missing → none, old behavior)
                               # auto — repo PR template when present (.github/pull_request_template.md,
                               #   .github/PULL_REQUEST_TEMPLATE/…): sections filled from task file,
                               #   checkboxes ticked only when proved. <path> — that file. none — no template.
                               # whackagent part (Closes #n, criteria, status) always in own marked block;
                               # refresh rewrite only that block, human edits stay.
  title: "{title}"             # placeholders {title} {n} (issue number, GitHub) {slug}
                               # e.g. "[#{n}] {title}", "feat: {title}"
  labels: []                   # added at creation, e.g. [whackagent]. Label missing in repo → skipped.
                               # On top, every PR gets ≥1 label picked from repo's own labels
                               # (best fit: bug, feature, docs, area…) — never created.
  assignees: ["@me"]           # PR assignees at creation, on top of @me (always self-assigned)
  reviewers: []                # requested when PR goes ready, never on draft. Users or org/team.
                               # Empty → none requested (CODEOWNERS still apply).
  doc: ""                      # PR rules keys can't say (changelog line, size limit) — `path` or
                               # `path#Heading` (CONTRIBUTING.md#Pull requests). Empty → none.

compress_wiki: true            # caveman-compress config + wiki pages to save re-read tokens
                               # (at /wa-setup and after every /wa-wiki update; .original backups removed)
---

# Project config

Free-form notes about this project every skill should keep in mind.
Edit frontmatter above to change behavior.

## Core rule — stop and ask

Outside autopilot, moment anything unclear, ambiguous, or blocked beyond what task spec cover: **stop and ask**. Never guess on scope.

**Every question come with recommended answer** — always, no exception. One line for pick, one line for why, plus alternative when real one exist. No basis to choose? Recommend most reversible option and say it guess. Bare question with no proposal never acceptable: answering must be confirm-or-correct, not homework.

Inside autopilot: never ask (nobody watching) — freeze task with open question logged, move to next one.