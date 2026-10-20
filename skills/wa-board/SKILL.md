---
name: wa-board
description: Renders a dashboard and suggests the next action based on the project's whackagent backlog.
model: haiku
---

# /wa-board

Dashboard. Lift lid on backlog, point next move.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `display.md` `blockers.md` · arg given → + `sprints.md` `milestones.md` · `backlog.provider: github` → + `provider-github.md` · `branch.tracks` non-empty → + `tracks.md`.

## Do

0. **Read arg.** None → whole backlog. Sprint name (`/wa-board login-refacto`) or milestone title (`/wa-board 0.3.0`) → **filtered view**: only its tasks, plus its progress line. Resolve per **reference/sprints.md** / **reference/milestones.md**; unknown name → say so, list known sprints and milestones, stop.
1. Read `.whackagent/config.md` (respect discussion language). Missing → tell user run `/wa-setup`, stop.
2. Read `{backlog}` + referenced task files (need each task `summary`, `size`, `grilled`, `sprint`, `milestone`, `blocked_by`) + provider `milestones` verb. **GitHub provider** → `wa-backlog list` (+ `--sprint` / `--milestone` when filtered), `wa-backlog milestones` and `wa-backlog claims` instead; see *GitHub board* below.
3. Render backlog as **list**, one section per status (see **reference/display.md → Display format**), priority order within each.
4. Suggest exactly **one** next action, by state (filtered run → scope suggestion to sprint or milestone). Task with ⛔ never suggested: take next one down (**reference/blockers.md**):
   - something in `validated` → reviewed, wait user retest: `/wa-close <slug>` to finish (or `/wa-feedback` if retest found something). Highest precedence — one step from done.
   - something in `review` → coded, wait user test: `/wa-feedback <slug> <notes>` if notes, else `/wa-validate <slug>` to fire verifier. Beats starting new work.
   - something `in-progress` → resume it (`/wa-code <slug>`)
   - top `todo` not grilled → `/wa-grill <slug>` to clarify (note: quick wins skip straight to `/wa-code`)
   - top `todo` grilled → `/wa-code <slug>`. Backlog order maintained by `/wa-task` prioritization pass — never suggest reprioritizing as step (if user *asks* to reorder, that `/wa-task` with no arg).
   - nothing in todo → `/wa-task <description>` to create one
   - batch of small grilled tasks → mention `/wa-autopilot` as option

## GitHub board

Same list format, sections by contract state, render order: **📥 Todo → 🔥 Grilling → 📐 Grilled → 🔨 Coding → 👀 Review → 🎉 Done → 🚫 Canceled** (heading = emoji + name). Canceled = issue closed as not planned (`not_planned: true` in `list --all`, whatever its column) — never under Done. Line 1 = `<#> · <size> **<title>** · #<n>`, plus sprint tag, plus `🔒 <agent>` when claimed (agent = worktree basename, short), `👤 @<login>` when `reserved` (assigned to another account). `⚠` = `todo` (not grilled). Extra blocks under legend when present:

- `⏳ stale claims` — `claims` rows with `stale: true`: `#12 coding · <agent> · 2d, no push` → suggest `/wa-task release 12`.
- `📝 drafts` — Project draft items: not tickets, convert to issue on GitHub.

**Review section splits draft vs ready** — `gh pr list --json number,headRefName,isDraft`: draft → `🧪 draft #<pr>` (your test), ready → `🔀 ready #<pr>` (your test, then merge — GitHub or `/wa-close`).

Next action (GitHub, table **providers/CONTRACT.md** → *Who's on turn*; `list` rows in `review` carry `phase`), first match wins: `review` + ready → test, then merge on GitHub or `/wa-close <#>` (merges on your yes) · `review` + draft → `/wa-feedback <#> <notes>` or `/wa-validate <#>` (marks it ready) · unclaimed `grilled` on top → `/wa-code <#>` · else top `todo` → `/wa-grill <#>` · several unclaimed `grilled` → mention `/wa-autopilot` as option. Never suggest ticket someone else holds — claimed by other agent, or `reserved`.

## Output

List, then one bold **→ next:** line per **reference/voice.md → Next line**. No re-explain whole flow each time. Wording per **reference/voice.md**.
