---
name: wa-task
description: Turn a fuzzy idea into a clear, grilled task. Clarity before code.
---

# /wa-task

Turn fuzzy idea into clear, grilled task. Clarity before code.

## Do

1. Read `.whackagent/config.md` + wiki index for project context.
2. **Title first.** Distill request into SHORT explicit title — feature clear in one glance ("Login Apple", not "improve auth"). Slug = kebab-case title (`login-apple`).
3. **Grill.** Invoke **grill-me** skill: interview user relentlessly down design tree, one question at a time, recommend answer each. Resolve scope with **YAGNI** — push back on speculative. If a question is answerable from the code, **query graphify first** (the code graph, if `graphify-out/` exists) to explore — don't ask the user what the project already tells you, and don't blind-Grep.
   - **Cover architecture.** Grill must settle *where this lives*: which feature/folder, what new files/folders, how it fits architecture module (group by feature, proper nesting — not flat), which layer boundaries it touches. Read architecture module in `.whackagent/conventions/` first, so grill against real rules.
   - Exception: user flags trivial quick win → skip grill, create task `grilled: false`.
4. **Write task file** at `.whackagent/tasks/<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `title`, `status: todo`, `grilled: true` (or false if skipped), `created` = today.
   - `summary` — one short sentence what task about (shown in backlog table). More descriptive than title, still one line.
   - `size` — estimate effort: `quickwin` (🟢, hour or less), `medium` (🟡), or `large` (🔴, multi-session / probably split). Base on what grill surfaced.
   - `wiki:` — link relevant existing wiki pages with `[[page]]`; note any page to create.
   - Fill `## Contexte / Décisions` with resolved decisions from grill.
5. **Add to backlog.** Append task under **Todo** in `.whackagent/BACKLOG.md`, link file.

## Stop and ask

Whole skill about not guessing. If user answers leave contradiction, surface it — don't paper over.

## Next step

Suggest: **`/wa-prio`** (place in order) or **`/wa-code <slug>`** if already top priority + grilled.