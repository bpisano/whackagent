---
name: wa-task
description: Turn a fuzzy idea into a clear, grilled task, then re-prioritize the backlog. Clarity before code. Called with no argument, runs the prioritization pass alone.
---

# /wa-task

Turn fuzzy idea into clear grilled task, then leave backlog ordered. Clarity before code.

Owns two things: **writing the task** (steps 1–5) and **placing it** (step 6). Prioritization is not a separate command — a task that's not ordered isn't done landing.

## Do

0. **Read the arg.**
   - Free text → new task, steps below.
   - Slug or display index from the wa-board table (`/wa-task 3`) → resolve per **wa-board → Task indexes**, echo `3 → sync-offline`, grill that existing task instead of creating one, then step 6.
   - **No arg → prioritization only.** Skip to step 6, whole backlog in scope, full pass (see *Explicit run* there).
1. Read `.whackagent/config.md` + wiki index for project context.
2. **Title first.** Distill request into SHORT explicit title — feature clear one glance ("Login Apple", not "improve auth"). Slug = kebab-case title (`login-apple`).
3. **Grill.** Invoke **grill-me** skill: interview user relentlessly down design tree, one question at time, recommend answer each. Resolve scope with **YAGNI** — push back on speculative. If question answerable from code, **query graphify first** (code graph, if `graphify-out/` exists) to explore — no ask user what project already tells, no blind-Grep.
   - **Cover architecture.** Grill must settle *where this lives*: which feature/folder, what new files/folders, how fits architecture module (group by feature, proper nesting — not flat), which layer boundaries touch. Read architecture module in `.whackagent/conventions/` first, so grill against real rules.
   - Exception: user flags trivial quick win → skip grill, create task `grilled: false`.
4. **Write task file** at `.whackagent/tasks/<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `title`, `status: todo`, `grilled: true` (or false if skipped), `created` = today.
   - `summary` — one short sentence what task about (shown in backlog table). More descriptive than title, still one line.
   - `size` — estimate effort: `quickwin` (🟢, hour or less), `medium` (🟡), or `large` (🔴, multi-session / probably split). Base on what grill surfaced.
   - `wiki:` — link relevant existing wiki pages with `[[page]]`; note any page to create.
   - Fill `## Contexte / Décisions` with resolved decisions from grill.
   - Fill `## Critères d'acceptation` — observable checks that mean "done" (what appears on screen, what an input must produce). These drive `wa-verifier`; keep them concrete, YAGNI. Skip only for tasks with no runnable surface (pure lib/logic).
5. **Add to backlog.** Append task under **Todo** in `.whackagent/BACKLOG.md`, link file.
6. **Prioritize.** Run the pass below — always, never ask permission, it's part of adding a task. Several tasks created in one go → one pass at the end, not one per task.

## 6. Prioritization pass

Product-owner hat: what matters now, what order. New task(s) from this run are the **focus**; the rest of todo is context.

1. Read `BACKLOG.md` + `todo` task files (config already read).
2. Each todo task, challenge with **YAGNI**: _need now?_ Three outcomes:
   - **keep** — stays in todo.
   - **defer** — keep but push down order.
   - **cancel** — set `status: canceled`, move under Canceled, note why.
3. **Split** when task too big for one coherent feature: create child task files (`<slug>-<part>.md`), link to parent via `note:`/`wiki:`, mark parent `canceled` or keep as umbrella — your call, tell user.
4. **Re-estimate size** when picture changed (a `large` 🔴 task that got split may now be `medium`/`quickwin`). Update each task's `size`.
5. **Reorder.** Order in **Todo** section = priority (top = next). No numeric labels written in `BACKLOG.md` — order alone carry priority. Reflect new order in `BACKLOG.md`.
6. Show result using **wa-board table format** (# / Taille 🟢🟡🔴 / Tâche / Résumé / Grillée). `#` is display-only, recomputed from the order you just wrote — always print the table after reordering so indexes user sees are current.

**Cheap and quiet by default** — user asked for a task, not a backlog audit:

- Slotting the focus task vs existing ones: silent, no narration.
- Reorder + re-estimate: apply freely, reversible, and order is the whole point.
- **Cancel or split: never silent.** Propose one line each (`⚠️ sync-offline looks like 3 tasks — split?`), do it only on yes. Applies to focus tasks and to any existing task the pass flags.
- No before/after diff; one table (the after) is enough.
- Single todo task → nothing to order, skip straight to the table.

**Explicit run** (`/wa-task` with no arg, or user asks to reorder): full pass over everything, show **before/after** tables plus rationale for any cancel/split.

## Stop and ask

Whole skill about no guessing. If user answers leave contradiction, surface it — no paper over.

Priority call needs product intent you lack? Ask — no assume. But on the automatic pass, ask only if the new task's slot is genuinely undecidable; otherwise put it where it best fit and let user move it.

## Next step

Board table from step 6 already on screen with fresh `#` indexes. Suggest **`/wa-code <#>`** for the top grilled todo (or `/wa-autopilot <#,#>` if the new tasks are quick wins).
