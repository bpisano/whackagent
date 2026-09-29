---
name: wa-draft
description: Notes an idea as a task, without questions. /wa-task grills it later.
---

# /wa-draft

Idea → `draft` task, nothing more. No grill, no branch, no lock. Grill comes later: **`/wa-task <id>`**.

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

## Do

1. **Read arg.** Idea text. Empty → ask for it, stop. Several ideas in one call (list, `;`, clear separate asks) → one task each.
2. Read `.whackagent/config.md` — `{…}` paths per **wa-board → Paths**, task writes per **wa-board → Task store**.
3. **Title + summary** per **wa-board → Titles and summaries** — verb + thing ≤ 5 words, summary ≤ 8 words. Slug = kebab-case title. Only question allowed: idea too vague to title (*"perf"* → which screen?) — one question, with recommended title.
4. **Fields, only what user said:**
   - `size` — rough guess from idea, or leave default `medium`. Grill re-estimates.
   - `sprint` — user named one → per **wa-board → Sprints** (reuse existing verbatim). Never propose one here.
   - blockers — user named one (*"after Apple login"*) → per **wa-board → Dependencies**. Never hunt for them: grill does.
5. **Create** per **wa-board → Task store → create**:
   - `files`: `{tasks}/<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`, `status: draft`, `created` = today, raw idea in `note:`; backlog line under **Draft**, bottom (sprint echoed `· <Sprint>`).
   - `github`: `github-board create --title … --summary … [--size] [--sprint] --note "<raw idea>"`, then `github-board depend <n> --on …` when blockers named. No branch, no task file — grill makes them.
6. **Echo** each task in **wa-board list format** (line 1 + line 2), then next step.

No prioritization pass — draft lands bottom of Draft. `/wa-task` (no arg) reorders when asked.

## Never

- Never grill, never ask design questions — that's `/wa-task`.
- Never take a lock, create a branch, or write `## Context / Decisions` / `## Acceptance criteria`.
- Never set `todo`: an ungrilled task is `draft`.

## Next step

**`/wa-task <id>`** to grill it when ready. `/wa-board` for the whole picture.
