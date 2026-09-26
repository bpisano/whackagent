---
name: wa-task
description: Turn fuzzy idea (or a GitHub issue filed by the team) into clear grilled task, then re-prioritize backlog. Clarity before code. No argument = prioritization pass alone.
---

# /wa-task

Fuzzy idea → clear grilled task, backlog ordered. Clarity before code. Also adopts GitHub issues filed by the team (`github` backend).

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Owns two things: **writing task** (steps 1–5), **placing it** (step 6). Prioritization not separate command — task not ordered isn't landed.

## Do

0. **Read arg.**
   - Free text → new task, steps below.
   - Task id (`/wa-task 3`, `/wa-task 42`) → resolve per **wa-board → Task ids**, echo `#42 → Sync offline changes`, grill that existing task instead of creating (a `draft` becomes `todo`), then step 6.
   - **`github`: issue number not on the board** → **adopt it.** Grill it like free text, seeded with its title + body. Then rewrite title per **wa-board → Titles and summaries** and body into task format, original text kept as a `>` quote at top of `## Context / Decisions`, add to board. Echo `#57 adopted: "crash when i zoom" → Fix crash on map zoom`.
   - Bare arg matches **live sprint**, no task id → ambiguous, ask which (recommend: new task inside that sprint, since `/wa-task` creates): `Login refacto is a sprint. New task inside it (recommended), or do you want the view? → /wa-board login-refacto`.
   - **No arg → prioritization only.** Skip to step 6, whole backlog in scope, full pass (see *Explicit run* there).
1. Read `.whackagent/config.md` + `{wiki}/index.md` for project context. `{…}` paths come from its `paths:` block — see **wa-board → Paths**. Task reads and writes go through **wa-board → Task store**.
2. **Title first.** Distill request into short explicit title, **verb + thing** — clear at a glance to someone who never saw this conversation (`Add Apple login`, not `Login Apple`, not `Improve auth`). Rules: **wa-board → Titles and summaries** — ≤ 5 words, verb first, never narrative, never metaphor, tech terms in English, never repeats the sprint. Slug = kebab-case title (`add-apple-login`).
3. **Grill.** Invoke **grill-me** skill: interview user relentlessly down design tree, one question at time. Resolve scope with **YAGNI** — push back on speculative. Question answerable from code → **go read code** (targeted Grep/Glob, scoped to feature). Never ask user what project already tells you.
   - **Every question carries recommendation. No exception.** See *Grill question format* below — bare question is bug, not style choice.
   - **Cover architecture.** Grill must settle *where this lives*: which feature/folder, what new files/folders, how fits architecture module (group by feature, proper nesting — not flat), which layer boundaries touch. Read architecture module in `{conventions}/` first, so grill against real rules.
   - Exceptions: user flags trivial quick win → skip grill, born `todo`. User wants it noted, grilled later (*"just note it, grill later"*) → skip grill, born `draft`.
4. **Create the task** per **wa-board → Task store** (`files`: `{tasks}/<slug>.md`; `github`: issue + board item), content from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `title`, `status: todo` (grilled or quick win) or `draft` (skipped), `created` = today.
   - `summary` — **≤ 8 words**, the goal, plain (line 2 of wa-board list). Adds what title doesn't say — never repeats it. Result once done, not the mechanism nor the story. Rules: **wa-board → Titles and summaries**.
   - `size` — effort estimate: `quickwin` (🟢, hour or less), `medium` (🟡), `large` (🔴, multi-session / probably split). Base on what grill surfaced.
   - `sprint` — human title, or **empty**. Rules in *Sprints* below. Default empty: most tasks stand alone.
   - `wiki:` — link relevant existing wiki pages with `[[page]]`; note any page to create.
   - Fill `## Context / Decisions` with resolved decisions from grill.
   - Fill `## Acceptance criteria` — observable checks meaning "done" (what appears on screen, what input must produce). These drive `wa-verifier`; keep concrete, YAGNI. Skip only for tasks with no runnable surface (pure lib/logic).
   - Title, summary and body in `discussion_language`, tech terms English (**wa-board → Voice**). `github`: creating or editing an issue needs no extra yes — it's what the user asked for.
5. **Place it.** Under its state (`todo` / `draft`), **next to its sprint siblings** when it has one, else bottom. `files`: backlog line links the task file relative to backlog's own folder (works when backlog and tasks sit in different trees), sprint echoed as `· <Sprint>`. `github`: board position.
6. **Prioritize.** Run pass below — always, never ask permission, part of adding task. Several tasks one go → one pass at end, not one per task.

## Sprints

Optional grouping for work too big for one task — `sprint: Login refacto` (`github`: milestone). Canonical rules in **wa-board → Sprints**; here is when to set it.

**Set a sprint when:**

- user names one (*"it's for the login refacto sprint"*) → take their words as title (`Login refacto`);
- task is `large` and grill just split it, or about to → split children share one sprint (below);
- task obviously belongs to work already in flight → existing sprint's tasks touch same feature/screen. **Propose it, one line, don't assume**: `📎 Belongs in sprint Login refacto?`

**Leave empty otherwise.** Sprint of one task is noise. Most tasks stand alone — empty is default, `quickwin` almost never needs one.

**Naming**: per **wa-board → Sprint names** — human title ≤ 3 words, names *body of work*, not first task (`Login refacto`, not `Apple login`). Reuse existing sprint verbatim rather than coining near-duplicate — check live sprints (`files`: `sprint:` values; `github`: open milestones) before minting new one.

**Never** create sprint file, sprint section in `{backlog}`, or sprint state. `files`: label on tasks *is* sprint. `github`: milestone, created on first task that names it.

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

1. List backlog per **wa-board → Task store** — `todo` and `draft` tasks in scope (config already read).
2. Each todo/draft task, challenge with **YAGNI**: _need now?_ Three outcomes:
   - **keep** — stays where it is.
   - **defer** — keep but push down order.
   - **cancel** — set state `canceled` per **Task store** (`github` closes issue as not planned), note why.
3. **Split** when task too big for one coherent feature: create child tasks (verb + thing titles each), link to parent via `note:` (`github`: `#<n>`), mark parent `canceled` or keep as umbrella — your call, tell user. Children not yet grilled → `draft`.
   - **Children inherit sprint.** Parent had one → every child gets same `sprint`. Parent had none → split *is* reason sprints exist: name one after body of work parent described (`refonte du login` → `Login refacto`), set on all children, say so in one-line split proposal. Parent kept as umbrella → carries sprint too.
4. **Re-estimate size** when picture changed (`large` 🔴 task split may now be `medium`/`quickwin`). Update each task `size`.
5. **Reorder.** Order inside each section = priority (top = next). No numeric labels anywhere — order alone carries priority. Write it per **Task store → reorder**.
   - **Sprint moves as block.** Its tasks stay contiguous in section, own internal order (dependencies first). Prioritize *sprint* against rest, then tasks inside. Splitting sprint across order needs reason — say out loud (*"moved Add Apple login out of the block: it unblocks onboarding"*).
6. **Tighten titles + summaries.** Any task in pass whose `title` or `summary` breaks **wa-board → Titles and summaries** (no verb, narrative sentence, metaphor, translated tech term, repeated sprint, summary > 8 words) → rewrite it, silently. Slug never moves.
7. Show result using **wa-board list format**. `files`: display indexes recomputed from order just written — always print list after reordering so indexes user sees are current. Sprints in play → progress lines under legend.

**Cheap and quiet by default** — user asked for task, not backlog audit:

- Slotting focus task vs existing ones: silent, no narration.
- Reorder + re-estimate: apply freely, reversible, order is whole point.
- **Assigning sprint user didn't name: propose, never silent** (one line, same as cancel/split). Sprint they named, or one inherited by split they already approved: silent.
- **Cancel or split: never silent.** Propose one line each (`⚠️ Sync offline changes looks like 3 tasks — split?`), do only on yes. Applies to focus tasks and any existing task pass flags.
- No before/after diff; one list (the after) enough.
- Single task → nothing to order, skip straight to list.

**Explicit run** (`/wa-task` no arg, or user asks reorder): full pass over everything, show **before/after** lists plus rationale for any cancel/split.

## Stop and ask

Whole skill about no guessing. User answers leave contradiction → surface it, no paper over.

Priority call needs product intent you lack? Ask — no assume. But on automatic pass, ask only if new task slot genuinely undecidable; else put where best fits, let user move it.

## Next step

Board list from step 7 already on screen with fresh ids. Suggest **`/wa-code <id>`** for top `todo` (or `/wa-autopilot <id,id>` if new tasks are quick wins), **`/wa-task <id>`** for a `draft` worth grilling now.