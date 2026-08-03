---
name: wa-task
description: Turn fuzzy idea into clear grilled task, then re-prioritize backlog. Clarity before code. No argument = prioritization pass alone.
---

# /wa-task

Turn fuzzy idea into clear grilled task, leave backlog ordered. Clarity before code.

Owns two things: **writing task** (steps 1–5) and **placing it** (step 6). Prioritization not separate command — task not ordered isn't landed.

## Do

0. **Read arg.**
   - Free text → new task, steps below.
   - Slug or display index from wa-board table (`/wa-task 3`) → resolve per **wa-board → Task indexes**, echo `3 → sync-offline`, grill that existing task instead of creating one, then step 6.
   - **No arg → prioritization only.** Skip to step 6, whole backlog in scope, full pass (see *Explicit run* there).
1. Read `.whackagent/config.md` + `{wiki}/index.md` for project context. `{…}` paths come from its `paths:` block — see **wa-board → Paths**.
2. **Title first.** Distill request into SHORT explicit title — feature clear one glance ("Login Apple", not "improve auth"). Slug = kebab-case title (`login-apple`).
3. **Grill.** Invoke **grill-me** skill: interview user relentlessly down design tree, one question at time. Resolve scope with **YAGNI** — push back on speculative. Question answerable from code → **go read code** (targeted Grep/Glob, scoped to feature). Never ask user what project already tells you.
   - **Every question carries recommendation. No exception.** See *Grill question format* below — bare question is bug, not style choice.
   - **Cover architecture.** Grill must settle *where this lives*: which feature/folder, what new files/folders, how fits architecture module (group by feature, proper nesting — not flat), which layer boundaries touch. Read architecture module in `{conventions}/` first, so grill against real rules.
   - Exception: user flags trivial quick win → skip grill, create task `grilled: false`.
4. **Write task file** at `{tasks}/<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `title`, `status: todo`, `grilled: true` (or false if skipped), `created` = today.
   - `summary` — one short sentence what task about (shown in backlog table). More descriptive than title, still one line.
   - `size` — effort estimate: `quickwin` (🟢, hour or less), `medium` (🟡), or `large` (🔴, multi-session / probably split). Base on what grill surfaced.
   - `wiki:` — link relevant existing wiki pages with `[[page]]`; note any page to create.
   - Fill `## Contexte / Décisions` with resolved decisions from grill.
   - Fill `## Critères d'acceptation` — observable checks meaning "done" (what appears on screen, what input must produce). These drive `wa-verifier`; keep concrete, YAGNI. Skip only for tasks with no runnable surface (pure lib/logic).
5. **Add to backlog.** Append task under **Todo** in `{backlog}`, link file (relative to backlog's own folder, so link works when backlog and tasks sit in different trees).
6. **Prioritize.** Run pass below — always, never ask permission, part of adding task. Several tasks created one go → one pass at end, not one per task.

## Grill question format

**Never ask bare question.** Every grill question ships with answer you'd pick and why. User job: confirm or correct — not design feature from blank prompt. Not "when you have opinion": always.

```
**Where does the token live?**
→ **Recommended: Keychain.** Refresh token survives reinstall-less relaunch, and
  UserDefaults would put it in plaintext backups.
  Alt: in-memory only — safer, but user re-logs at every cold start.
```

Rules:

- **Recommendation, then one-line why.** Why makes it reviewable — naked "I'd do X" gives user nothing to push against.
- **Name alternative you rejected** when real one exists, one line. Shows fork actually considered.
- **Cite ground.** Recommendation follows from something concrete: convention module, existing code you read, acceptance criteria, YAGNI. Never coin flip dressed as advice.
- **No basis to recommend?** Still recommend: give least-risk / most-reversible default, say plainly what you'd need to know to be sure. "It depends on your product intent" alone is non-answer — pick cheapest-to-undo option, flag as guess.
- **One question at a time.** Recommendation attached to each. Batch of five bare questions = exact failure this rule stops.
- Same rule for any question outside grill — architecture forks, `BLOCKED:` questions from subagents, `/wa-feedback` triage doubts.

## 6. Prioritization pass

Product-owner hat: what matters now, what order. New task(s) from this run = **focus**; rest of todo = context.

1. Read `{backlog}` + `todo` task files (config already read).
2. Each todo task, challenge with **YAGNI**: _need now?_ Three outcomes:
   - **keep** — stays in todo.
   - **defer** — keep but push down order.
   - **cancel** — set `status: canceled`, move under Canceled, note why.
3. **Split** when task too big for one coherent feature: create child task files (`<slug>-<part>.md`), link to parent via `note:`/`wiki:`, mark parent `canceled` or keep as umbrella — your call, tell user.
4. **Re-estimate size** when picture changed (`large` 🔴 task split may now be `medium`/`quickwin`). Update each task `size`.
5. **Reorder.** Order in **Todo** section = priority (top = next). No numeric labels in `{backlog}` — order alone carries priority. Reflect new order in `{backlog}`.
6. Show result using **wa-board table format** (# / Taille 🟢🟡🔴 / Tâche / Résumé / Grillée). `#` display-only, recomputed from order you just wrote — always print table after reordering so indexes user sees are current.

**Cheap and quiet by default** — user asked for task, not backlog audit:

- Slotting focus task vs existing ones: silent, no narration.
- Reorder + re-estimate: apply freely, reversible, order is whole point.
- **Cancel or split: never silent.** Propose one line each (`⚠️ sync-offline looks like 3 tasks — split?`), do only on yes. Applies to focus tasks and any existing task pass flags.
- No before/after diff; one table (the after) enough.
- Single todo task → nothing to order, skip straight to table.

**Explicit run** (`/wa-task` no arg, or user asks reorder): full pass over everything, show **before/after** tables plus rationale for any cancel/split.

## Stop and ask

Whole skill about no guessing. User answers leave contradiction → surface it, no paper over.

Priority call needs product intent you lack? Ask — no assume. But on automatic pass, ask only if new task slot genuinely undecidable; else put where it best fits, let user move it.

## Next step

Board table from step 6 already on screen with fresh `#` indexes. Suggest **`/wa-code <#>`** for top grilled todo (or `/wa-autopilot <#,#>` if new tasks are quick wins).