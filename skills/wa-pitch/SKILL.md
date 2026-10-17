---
name: wa-pitch
description: Starts a project from your pitch: grills it, previews the UI, splits it into sprints and tasks.
---

# /wa-pitch

Pitch → grilled scope → UI preview → sprints of `draft` tasks. Owns pitch page, preview, first backlog. One idea → `/wa-task`.

Read: voice, components, tasks, store

## Steps

1. **Read the arg** — pitch text, any shape. Empty → ask `Pitch the project: what, for whom, why.`, stop.
2. **Context** — config (**tasks → Config and paths**), `{wiki}/index.md`.
   - Code there → skim entry point, folders, deps. Never ask what the repo tells.
   - `{wiki}/pitch.md` exists → re-pitch: say so, grill only changes, update page + preview.
3. **Grill** — **grill-me** skill, one **Question** at a time, in this order:
   1. **Who + problem** — one user, one pain. Vague → push back.
   2. **Core loop** — the one thing done every open.
   3. **v1 scope** — YAGNI hard: not needed by core loop → `Later`. Recommend the cut.
   4. **Surface** — screens, what's on each, moves between them; CLI commands + output; endpoints / public API.
   5. **Data** — what, where, accounts, offline.
   6. **Stack + skeleton** — platforms, min OS, frameworks, services. Read `{conventions}/` architecture module first; name top-level folders.
   7. **Out of scope** — written down.
   - Stop when each v1 feature fits one line on a screen / command / endpoint. Task detail → `/wa-task`.
   - User cuts short → your picks, under `## Open guesses`.
4. **Preview** → **UI preview**. UI project: never skipped. Else silently skipped.
5. **Write the pitch page** → **Pitch page**. Link in `{wiki}/index.md`: `- [[pitch]] — what we build, for whom, v1 scope`.
6. **Seed glossary** — grill's core concepts, one row each. Show, add to `{conventions}/glossary.md` on yes. Use only those terms after.
7. **Split** → **Split**. Show the plan as one **Task list**, sprint by sprint, no ids.
   - One yes for all. Edits → apply, show again.
8. **Create tasks** — each `draft`, per **store → create**, plan order = priority.
   - `files` → `created` today, `sprint`, `size`, `blocked_by`, `wiki: [[pitch]]`.
   - `github` → `create --title … --summary … --size … --sprint … --note …`, then `depend <n> --on …`. No branch, no task file.
   - `note` = what the pitch decided for it, 1–3 lines (screen, data, cut). Seeds its grill.
   - Re-pitch → only tasks no live task covers (title + summary).
   - Backlog not empty → land below existing drafts, say `/wa-task` reorders.
9. **Show the board** — **Task list**, 🏁 line per sprint.

## Wording module

`{conventions}/wording.md` absent → before drawing:
- Copy `${CLAUDE_PLUGIN_ROOT}/conventions/wording.md` + `${CLAUDE_PLUGIN_ROOT}/conventions/wording/` into `{conventions}/`.
- Ask **wa-setup → Questions** 11 (tone, person, audience), samples from the pitch's screens. Fill **Project voice** + **Voice**.
- Add `wording.md` to config `review.modules`.
- No `{conventions}/glossary.md` → copy `${CLAUDE_PLUGIN_ROOT}/templates/glossary.md`, add to `review.modules`.
- Say what was added, one line. No extra yes.

## UI preview

UI project = `project_kind: app`, or pitch has screens (web app, site, dashboard). After grill, before split.

- **Wording module** first.
- One labeled screen per v1 feature, side by side, core-loop order. Key states (empty, filled) → both. Nothing from `Later`.
- Native frame + look per platform (iOS, Android, browser). System font, neutral accent. Say once: features, not brand.
- Real sample data, strings in `ui_strings_language` per wording module + glossary. Never lorem ipsum, `Title`, `Button`.
- Static: navigation by order + labels.
- Write `{wiki}/pitch-preview.html`: one file, inline CSS, light + dark.
- Artifact tool → load `artifact-design`, publish, give link. Else `open` it, say where.
- Ask once `Preview OK, or screens to change?`, own doubt as recommendation.
  - Notes → edit, republish same path, ask again.
- Screen added, dropped, reshaped = scope change: page and split follow.

## Pitch page

`{wiki}/pitch.md`, `discussion_language`, readable cold, one screen. Never compressed, whatever `compress_wiki`.

```markdown
# Pitch — <Project>
<one sentence: what, for whom>
## Problem
## Core loop
## v1
- <feature> — <one line>
## Screens        ← `## Commands` / `## API` if not UI
- <screen> — <what's on it>
## Data
## Stack
## Out of scope
## Later
## Open guesses   ← grill cut short only
## Preview        ← UI only: [pitch-preview.html](pitch-preview.html) + artifact link
```

## Split

Naming → **voice → Titles**. Sprints, blockers → **tasks → Sprints**, **tasks → Blockers**.

- Sprint = testable slice: something new works end to end.
- Sprint 1 = walking skeleton: scaffold, nav shell, thinnest core loop. Never a setup sprint showing nothing.
- Order: core loop, usable, comfort. Sprint blocks contiguous, sprint 1 on top.
- Task = one feature, `quickwin` or `medium`. `large` → split now.
- UI → task per screen or behavior, never per layer (`Build models`).
- Builds on another → `blocked_by`, blocker first.
- v1 only. `Later`, `Out of scope` → never tasks or a backlog sprint.
- One-task sprint → no sprint. 3–6 tasks healthy, past 8 → cut in two.

## Never

- Never create `todo`, write `## Context / Decisions` or `## Acceptance criteria`, take a lock or create a branch.
- Never create a sprint file or section.
- Never touch a task past `draft`. Never duplicate one.
- Never code, scaffold or install. Convention modules (wording, glossary) are fine.
- Never commit. Files stay in the tree; `github` → say how many issues were created.

## Ask

- Pitch contradicts itself or the code → surface it as a **Question**, never pick silently.

## Next

- `/wa-task <id>` on sprint 1's first task, then `/wa-code <id>`.
- Whole sprint grilled → `/wa-autopilot <sprint>`.
