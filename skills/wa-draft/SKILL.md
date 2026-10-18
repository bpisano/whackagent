---
name: wa-draft
description: Notes an idea as a task, without questions. /wa-task grills it later.
---

# /wa-draft

Idea → `draft` task, nothing more.

Read: voice, components, tasks, store

## Steps

1. **Read the arg.**
   - Empty → ask for the idea, stop.
   - Several ideas (list, `;`, separate asks) → one task each.
2. **Read config** → **tasks → Config and paths**.
3. **Title + summary** → **voice → Titles**. Slug → **tasks → Ids**.
   - Too vague to title (`perf`) → one **Question**, recommended title. Only question allowed.
4. **Fields** — only what the user said:
   - `size` → rough guess, else `medium`.
   - `type` → from the title verb (**tasks → Types**). Unclear → none.
   - `sprint` → named only, assigned per **tasks → Sprints**.
   - blockers → named only (`after Apple login`) → **tasks → Blockers**.
5. **Create** per **store → create**:
   - `files` → template, `status: draft`, `created` = today, raw idea in `note:`. Backlog line bottom of Draft.
   - `github` → `create … --note "<raw idea>"`, then `depend` if blockers named. No branch, no task file.
6. **Echo** the new tasks as a **Task list**.

## Never

- Never grill or ask design questions.
- Never propose a sprint or hunt for blockers.
- Never take a lock or create a branch.
- Never write `## Context / Decisions` or `## Acceptance criteria`.
- Never set `todo`.
- Never reorder: draft lands bottom. `/wa-task` with no arg reorders.

## Next

- `→ next: /wa-task <id>` to grill it, or `/wa-board`.
