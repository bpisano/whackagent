---
name: wa-proto
description: Prototypes a UI idea as one HTML page in the fixed proto shell, light/dark and an optional control panel.
---

# /wa-proto

UI idea → clickable HTML proto. Same shell every time; only the proto changes.

Read: voice, components, tasks, store

## Steps

1. **Pick the subject.**
   - `<idea>` → that idea.
   - `<id>` → that task: `## Acceptance criteria`, glossary **Screens** / **Parts** (**tasks → Ids**).
   - No arg → what the conversation is on now: last exchanges, open grill question, feedback note. Not the whole task.
     - Say it, one line, no question: `Proto: Composer, empty vs reply`.
     - No UI in sight → ask the idea, stop.
2. **Load context.**
   - Config → `{conventions}/glossary.md`, `wording.md` (**Project voice**, **Validated examples**), `verify.platform`, `ui_strings_language`.
   - No config → infer from repo and strings, never stop.
3. **Build** from `${CLAUDE_PLUGIN_ROOT}/templates/proto.html` → **Shell**.
4. **Save.**
   - Config → `{wiki}/protos/<slug>.html`. Inside a task → `<task slug>-<subject>.html`.
   - No config → scratchpad or temp dir, say where.
5. **Publish.**
   - Artifact tool → publish the file, give the link. Rework → same path, same URL.
   - Else → prepend `<!doctype html><meta charset="utf-8">`, `open` it, give the path.
6. **Ask** once: `Proto OK, or changes?` + own doubt as recommendation (**components → Question**).
   - Notes → edit, republish same path, ask again.
7. **Link** — task in play → `proto: [[protos/<file>]]` in `## Context / Decisions` (**store → write sections**). Decision the proto settled → note it there too.
8. **Resume** — called inside a skill (grill, feedback, pitch) → back to its open step, the question where it stopped.

## Shell

- Edit only the `PROTO` blocks: `#proto` markup, `PROTO CSS`, `PROTO`, `CONTROLS`, `onControl`. Shell markup, CSS, script never.
- **Frame** → `PROTO.frame`:
  - `phone` — iOS / Android (`verify.platform`)
  - `window` — web, macOS
  - `none` — one component alone (button, row, card)
  - Several make sense → list them in `PROTO.frames`: the panel gets `Frame`.
- **Colors** from tokens only: `--bg --fg --muted --separator --fill --accent --danger`. Never a literal: dark mode works untouched. Project accent → set `--accent` in all three theme blocks.
- **Look** per platform: system font, native components imitated. No invented brand.
- **Controls** = what the idea varies. None → no panel.
  - States (`empty`, `filled`, `error`, `loading`), variants (`Variant: A | B`), toggles, sliders.
  - Types: `radio` (4+ options), `segmented` (2–3), `toggle`, `slider`.
  - A control sets `data-<id>` on `#proto` (slider: also `--<id>`). CSS reacts. JS only in `onControl`.
  - Labels in `discussion_language`.
- **Content**: real data in `ui_strings_language`, glossary terms, wording ladder. Never lorem ipsum, `Title`, `Button`.
- **Interaction**: only what judging the idea needs (tap a row, open a sheet). No backend, no fetch.
- `PROTO.name` = subject + `· v<n>`, bumped on each rework. `<title>` = subject.

## Never

- Never change the shell, or add a header, legend or explanation on the stage.
- Never two protos for variants: one proto, a `Variant` control.
- Never touch project code, task state or locks.
- Never commit.

## Next

- Standalone → `→ next: /wa-task <idea>`, or `/wa-draft <idea>`.
- Inside a skill → back to it, no Next line.
