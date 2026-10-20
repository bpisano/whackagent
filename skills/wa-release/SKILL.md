---
name: wa-release
description: Ship one milestone — check its tasks landed, then walk you through the project's own documented release flow, step by step, confirming every outward move. No flow documented → set it up first, never guessed.
---

# /wa-release

**Milestone ready to ship.** `/wa-release` check scope landed, then follow **project's** release flow — the one written down, not one Claude know from elsewhere. Every app ship different (store, registry, deploy, tag, nothing). Guessing = shipping wrong thing.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `paths.md` `display.md` `provider.md` `milestones.md` `commits.md` · `backlog.provider: github` → + `provider-github.md` · `branch.tracks` non-empty → + `tracks.md`.

Wording (screen + reports): **reference/voice.md**. Every question: recommendation + one-line reason, **wa-grill → Question format**. Milestone rules: **reference/milestones.md**.

Where sit: tasks → `/wa-close` each → *milestone complete* → **`/wa-release <milestone>`**. Outside task lifecycle: touches no task state, claims nothing.

## Do

1. **Resolve milestone.** Read `.whackagent/config.md` (`{…}` paths per **reference/paths.md**). Provider `milestones` verb (**reference/provider.md**).
   - Arg → match title (exact, then unique case-insensitive). Unknown → list milestones, stop. Track milestone (key of `branch.tracks`) → refuse: track ships through its landing task inside a release milestone (**reference/tracks.md**), stop. Closed → say `already closed — released?`; resume only if `{reports}/release-<milestone>.md` has unfinished steps (step 5), else stop.
   - No arg → list open milestones except tracks, highest last, with progress (`🎯 0.2.0 — 5/5 done`), recommend **lowest open** — highest is where new work lands, lowest is what ships next. Fully done one beats it only when user says so.
   - No milestone at all → say release needs one (**reference/milestones.md**: local `backlog.milestones`, GitHub repo milestones), stop.
2. **Readiness.** `list --milestone <m> --all`. Canceled / closed-not-done tickets don't count.
   - **Not done** → list them (**reference/display.md → Display format**, line 1). Ask, recommendation by state:
     - move leftovers to next open milestone (`set-field <id> milestone <next>`) — recommended when all `todo`/grilled: scope cut, release keeps its date;
     - stop, finish them first — recommended when any in review/validated/coding: one step from done;
     - ship anyway, they stay in milestone — only on explicit word.
   - **Done but not landed** — code not on release branch → **blocker**: name each, say how it lands, stop.
     - Task of a sprint merged into sprint branch only, never onto `close.target` (local: sprint branch exists and `git diff <target>...<sprint>` non-empty; GitHub: no merged PR from sprint branch) → `/wa-close <sprint>`.
     - Local `close.strategy: pr` → `done` = PR opened, not merged (**providers/local.md**). One `gh pr list --state open --json number,headRefName,url`: done task whose branch (`<branch.prefix><slug>`, or sprint branch) still has open PR → merge it first. `gh` missing → say readiness unproven for PRs, ask (recommend: stop, check PRs by hand).
   - All landed → `✅ 0.2.0 — 7 tasks landed`.
3. **Find release flow** — *Release doc* below. Never proceed without one.
4. **Plan block**, one yes before anything runs — *Plan block* below.
5. **Walk steps**, one at a time — *Running steps* below. Resume: `{reports}/release-<milestone>.md` exists with unfinished steps → show done ones, resume at first open (recommend resume, never redo an outward step already recorded done).
6. **Close milestone** — flow finished → ask `close-milestone <m>` (recommended yes: shipped scope stays closed, new tasks can't grow it). Only command that closes one, only on yes. Then no open milestone left → say new tasks get none until user opens next (local: add line under `backlog.milestones`; GitHub: create on GitHub).
7. **Doc drift** — step done differently from doc, step missing, command changed → propose doc edit, applied on yes (commit per doc's own rules or left for user). Doc stays truth for next release.
8. **Report** — four lines max: milestone + version, what shipped where, milestone closed or not, next (`/wa-board`).

## Release doc

Flow lives in markdown the team maintains. Claude reads it, never invents it.

1. **`release.doc` set** in config (`path` or `path#Heading`) → read it. File/heading gone → say so, go to 2.
2. **Search markdown**, show what searched:
   - dedicated files: `RELEASE*.md`, `RELEASING*.md`, `DEPLOY*.md`, `PUBLISHING*.md`, anywhere outside build/vendor folders (`node_modules`, `build`, `.gradle`, `Pods`, `DerivedData`, `dist`);
   - `{wiki}` pages about release / deploy / publish;
   - sections in `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `docs/**/*.md` — headings matching release, releasing, deploy, publish, ship, store submission.
   - `CHANGELOG.md` = output of a release, not flow — note it, never use it as flow.
   Candidates → list `path#Heading` + first lines, recommend best (dedicated file > section; most specific wins). User confirms → write `release.doc` into config, say so.
3. **Nothing found → stop guessing.** Say `no release flow documented — searched <what>`. Offer (recommended: write it now, every later release reuses it):
   - **interview → write `{wiki}/release.md`**, add to `{wiki}/index.md`, set `release.doc`. Questions one at a time, in order: release branch (from where, release branch or not) · version (where it lives, scheme, who bumps) · changelog / release notes (file, format, from what) · checks (tests, lint, build per platform) · build + sign (artifacts, per platform) · distribution (store, registry, deploy target, who uploads) · tag + merge back · post-release (next dev version, announce). Each question's recommendation built from **repo evidence** (CI workflow files, fastlane, Gradle `versionName`, `package.json`, `Info.plist`, `Cargo.toml`, existing tags) — quote evidence, never assert it as the flow. User answers are the flow.
   - Page written in full simple sentences (like task files: reread months later), numbered steps, each step's owner (agent or human) and command when one exists. User reviews it before use.
   - or user writes it themselves → stop, `/wa-release <m>` again after.
   Page done → ask to continue this release with it (recommended yes).

Doc ambiguous on a step (no command, two readings) → ask, recommendation from doc context. Never fill gap from general knowledge silently.

## Plan block

Before any step runs. Steps come from doc, in doc order — never reordered, merged, or added.

```
🚀 release 0.2.0 — 7 tasks · flow docs/RELEASING.md#Mobile
version  : 0.2.0            (doc: version = milestone title)
1 🤖 bump version in app/build.gradle.kts, Info.plist
2 🤖 draft release notes → CHANGELOG.md (from 7 tasks)
3 🤖 run tests + release builds
4 ⚠️ commit + tag v0.2.0
5 ⚠️ push main + tag
6 👤 upload to Play Console / App Store Connect
7 ⚠️ merge main → develop
```

- **Version** — derived per doc. Doc silent + milestone title looks like version → recommend it, confirm. Never pick a scheme.
- **🤖 agent, local** — edits, builds, tests, drafts. Undone with git. Run after plan yes.
- **⚠️ agent, outward or irreversible** — commit, tag, push, merge, PR, publish, deploy, upload, store submission. Exact command shown, **own yes each time**, even after plan yes.
- **👤 human** — anything doc gives to a person, or needing credentials / consoles / signing keys Claude doesn't hold. Give instructions from doc, wait for `done`. Never try it with found secrets.

## Running steps

- **One step at a time**, echo `3/7 run tests + release builds`. Result → report file, then next.
- **Commits** — author + message per **reference/commits.md**.
- **Release notes** (only when doc asks) — from milestone's done tasks: title + summary, grouped per doc's format (else per task, newest first). Shown as draft, user edits before it lands anywhere.
- **Failure** → stop. Shortest decisive error line, cause, fix matching doc. Retry on yes. Never skip a step silently, never work around doc (no `--no-verify`, no forced push unless doc says).
- **Branch state** checks (clean tree, right branch, up to date) — when doc names release branch, check before first ⚠️ step. Dirty → stop, ask.
- **Report** `{reports}/release-<milestone>.md` — header (milestone, version, doc path, date), then one line per step: `✅ | ⏭ skipped (user) | ❌ <error> | ⏳`, time, command. Written after each step: crash mid-release → resume exact spot.

## GitHub provider

Same flow, provider verbs only (**reference/provider-github.md**). Readiness via `wa-backlog list --milestone <m> --all`; `close-milestone` through `wa-backlog`. Doc says open release PR / GitHub release → `gh` commands shown in plan as ⚠️, own yes each. Hooks untouched: release PR is not a ticket PR.

## Never

- Release flow from general knowledge, other projects, or CI files alone. Evidence feeds interview recommendations, never replaces doc.
- Outward step without its own yes. Plan yes covers 🤖 steps only.
- Closing milestone before flow finished, or without yes.
- Touching task state, claims, backlog order.
