---
name: wa-proto
description: Prototypes a UI idea as a Claude artifact, with light/dark and controls to vary it.
---

# /wa-proto

UI idea → clickable proto, published as a Claude artifact. Free design; a few musts.

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
   - Repo has a look (colors, fonts, components) → start from it.
   - No config → infer from repo and strings, never stop.
3. **Build** → **Musts**. Everything else is yours: layout, style, framing, how controls look.
4. **Save** the source.
   - Config → `{wiki}/protos/<slug>.html`. Inside a task → `<task slug>-<subject>.html`.
   - No config → scratchpad, say where.
5. **Publish** as a Claude artifact, give the link. Rework → same source, same URL.
   - No artifact tool → open the source locally, give the path.
6. **Ask** once: `Proto OK, or changes?` + own doubt as recommendation (**components → Question**).
   - Notes → edit, republish, ask again.
7. **Link** — task in play → `proto: [[protos/<file>]] · <artifact link>` in `## Context / Decisions` (**store → write sections**). Decision the proto settled → note it there too.
8. **Resume** — called inside a skill (grill, feedback, pitch) → back to its open step, the question where it stopped.

## Musts

- **Light / dark** toggle. Both themes designed, not one inverted.
- **Controls panel** — everything the idea can vary:
  - states (`empty`, `filled`, `error`, `loading`), variants (`A | B`)
  - customization: colors, density, type, copy, sizes
  - labels in `discussion_language`
- **Real content** in `ui_strings_language`, glossary terms, wording ladder. Never lorem ipsum, `Title`, `Button`.
- **Platform** (`verify.platform`): size and idioms of the target (iOS → an iPhone screen). Style free.
- **Interaction**: only what judging the idea needs. No backend, no fetch.
- Name = subject + `· v<n>`, bumped on each rework.

## Never

- Never two protos for variants: one proto, a variant control.
- Never touch project code, task state or locks.
- Never commit.

## Next

- Standalone → `→ next: /wa-task <idea>`, or `/wa-draft <idea>`.
- Inside a skill → back to it, no Next line.
