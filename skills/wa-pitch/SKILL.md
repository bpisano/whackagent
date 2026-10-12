---
name: wa-pitch
description: Starts a project from your pitch: grills it, previews the UI, splits it into sprints and tasks.
---

# /wa-pitch

Project pitch → grilled scope → UI preview (UI projects) → sprints + `draft` tasks on backlog. Start of project, or whole new product area. One idea, one task → `/wa-task`.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Owns three things: **pitch page** (`{wiki}/pitch.md`), **UI preview** (`{wiki}/pitch-preview.html`), **first backlog**. Never codes, never grills task in detail — pitch grill settles *product*, `/wa-task <id>` settles each task.

## Do

0. **Read arg.** Pitch text, any length, any shape. Empty → ask for it (*"Pitch the project: what, for whom, why."*), stop.
1. **Context.** Read `.whackagent/config.md` — missing → `/wa-setup` first, stop. `{…}` paths per **wa-board → Paths**, task writes per **wa-board → Task store**. Read `{wiki}/index.md`. Code already there → skim it (targeted Glob: entry point, folders, dependencies) so grill never asks what repo tells.
   - **`{wiki}/pitch.md` exists** → re-pitch: say so, grill only what changed, update page + preview, add only tasks no live task covers (match by title + summary). Never duplicate, never touch task past `draft`.
2. **Grill the pitch.** Invoke **grill-me** skill, one question at a time, format per **wa-task → Grill question format** — every question carries recommendation + why. Settle, in this order:
   - **Who + problem** — one user, one pain. Vague (*"everyone"*) → push back.
   - **Core loop** — one thing user does every time they open it. Everything else hangs off it.
   - **v1 scope** — **YAGNI, hard.** Each feature: needed for core loop to work? No → `Later`. Recommend the cut, never kitchen sink.
   - **Screens / surface** (UI project) — which screens, what's on each, how user moves between them. CLI → commands + output. Server/package → endpoints / public API.
   - **Data** — what's stored, where (local, backend, which one), accounts or not, offline or not.
   - **Stack + architecture skeleton** — platforms, min OS, frameworks, third-party services. Read architecture module in `{conventions}/` first: top-level features/folders named now, so tasks land in real places.
   - **Out of scope** — said out loud, written down. Stops it creeping back in task grills.
   - Stop when every v1 feature can be named in one line and placed on a screen (or command, endpoint). Not before, not after: task-level detail (edge cases, error copy, exact files) belongs to `/wa-task`.
   - User cuts short (*"enough, go"*) → remaining forks take your recommended answer, listed under `## Open guesses` in pitch page.
3. **UI preview** — UI project only, see *UI preview* below. Not skippable for UI project; skipped silently otherwise.
4. **Write pitch page** `{wiki}/pitch.md` (format below), link it in `{wiki}/index.md` (`- [[pitch]] — what we build, for whom, v1 scope`). Not compressed, whatever `compress_wiki` says: humans reread it.
5. **Split into sprints and tasks** — rules in *Split* below. Show plan as **one list**, sprint by sprint, **wa-board list format** without ids. **One yes for whole plan.** User edits (drop, merge, move, rename) → apply, show again.
6. **Create tasks** — each a `draft`, per **wa-board → Task store → create**, in plan order (order = priority):
   - `files`: `{tasks}/<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`, `status: draft`, `created` = today, `sprint`, `size`, `blocked_by`, `wiki: [[pitch]]`; backlog line under **Draft**, sprint echoed `· <Sprint>`.
   - `github`: `github-board create --title … --summary … --size … --sprint … --note …`, then `github-board depend <n> --on …`. No branch, no task file — grill makes them.
   - **`note:` = what pitch already decided for this task**, 1–3 lines (screen, data, the cut). Seeds its grill: `/wa-task <id>` starts from there, stays short.
   - Backlog not empty → pitch tasks land below existing drafts, say so; `/wa-task` (no arg) reorders.
7. **Show board** in **wa-board list format**, progress line per sprint, then next step.

## UI preview

UI project = `project_kind: app`, or pitch describes screens (web app, site, dashboard). CLI, package, server → none.

HTML mockup of v1, shown **after grill, before split** — user sees product, corrects it while still cheap. What they correct changes task list.

- **One screen per v1 feature**, side by side in core-loop order, each labeled with feature name. Feature spanning states that matter (empty, filled) → both. Nothing from `Later`.
- **Platform frame + native look**: iPhone frame and iOS components for `ios`, Android for `android`, browser window for web. Platform defaults, system font, neutral accent — preview of *features*, not brand design. Say so once on page.
- **Real content.** Sample data that fits pitch (real-looking names, amounts, dates), UI strings in `ui_strings_language`. Never lorem ipsum, never `Title` / `Button`.
- **Static.** No app logic. Navigation between screens shown by order + labels, not wired.
- **Write** `{wiki}/pitch-preview.html` — one self-contained file, inline CSS, light + dark.
- **Publish as artifact**: Artifact tool available → load `artifact-design` skill, then publish that file; give link. No Artifact tool → `open` file locally, say where it is.
- **Ask once**: `Preview OK, or screens to change?` with own doubt as recommendation when you have one (`→ Recommended: drop the stats tab, core loop works without it`). Notes → edit same file, republish same artifact (same path → same URL), ask again. Yes → go on.
- Screen added, dropped or reshaped here = scope change → pitch page and split follow preview, never other way.

## Pitch page

`{wiki}/pitch.md`, in `discussion_language`, full simple sentences (reread months later — same exception as task bodies in **wa-board → Voice**). Short: one screen of text.

```markdown
# Pitch — <Project>

<one sentence: what it is, for whom>

## Problem
## Core loop
## v1
- <feature> — <one line>
## Screens            ← UI project; `## Commands` / `## API` otherwise
- <screen> — <what's on it>
## Data
## Stack
## Out of scope
## Later
## Open guesses        ← only when grill was cut short
## Preview             ← UI project: [pitch-preview.html](pitch-preview.html) + artifact link
```

## Split

Sprint and task rules stay **wa-board → Sprints**, **Titles and summaries**, **Sprint names**, **Dependencies**. Here: how to cut a pitch.

- **Sprint = one testable slice.** End of sprint, user launches app and something new works end to end. Named after body of work, ≤ 3 words (`Onboarding`, `Trip planner`).
- **First sprint = walking skeleton**: project scaffold, navigation shell, core loop in thinnest form. Later sprints widen it. Never a "setup" sprint that shows nothing on screen.
- **Sprint order = core loop first**, then what makes it usable, then comfort. Backlog order follows: sprint blocks contiguous, sprint 1 on top.
- **Task = one coherent feature**, `quickwin` or `medium`. `large` → split now, pitch is the moment. Title verb + thing ≤ 5 words, summary ≤ 8 words, never repeats sprint.
- **UI project → task per screen or per behavior on a screen**, never per layer (`Build models`, `Build views` = wrong cut: nothing testable until last one lands).
- **Dependencies set now**: task building on another → `blocked_by`. Inside sprint, blockers first.
- **v1 only.** `Later` and `Out of scope` stay in pitch page — never tasks, never a "backlog" sprint.
- **Sprint of one task → no sprint.** Standalone task, placed where priority says.
- 3–6 tasks per sprint healthy. Sprint past 8 → two slices hiding in one, cut it.

## Never

- Never create `todo`: pitch tasks are `draft`, grilled one by one with `/wa-task <id>`.
- Never write `## Context / Decisions` or `## Acceptance criteria`, never take lock, never create branch.
- Never create sprint file or sprint section — sprint exists because tasks name it.
- Never code, scaffold or install anything: first sprint's first task does.
- Never commit. Pitch page, preview and task files left in tree for user (`github`: issues already created — say how many).

## Stop and ask

Pitch contradicts itself, or contradicts code already there → surface it, don't pick silently. Every question with recommendation, per **wa-task → Grill question format**.

## Next step

Board already on screen. Suggest **`/wa-task <id>`** on first task of first sprint to grill it, then `/wa-code <id>`. Whole sprint grilled → `/wa-autopilot <sprint>`.