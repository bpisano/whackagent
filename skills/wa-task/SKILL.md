---
name: wa-task
description: Create tasks from idea or spec, cutting large specs, then re-prioritize backlog. No arg = prioritization only. Never grills.
---

# /wa-task

Idea or spec → task(s) in backlog, ordered. **Creates, cuts, places — never grills, never starts `/wa-grill`**: run ends on suggestion, user launches `/wa-grill` — it clarifies one task at a time.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `display.md` `paths.md` `milestones.md` `task-types.md` `blockers.md` · task gets `sprint:` (split, user names one) → + `sprints.md` · `backlog.provider: github` → + `provider-github.md` · `branch.tracks` non-empty → + `tracks.md`.

Wording (screen + reports): **reference/voice.md** — telegraphic, tech terms stay English.

Owns three things: **creating** task, **cutting** spec too large for one task (*Spec*), **placing** it (*Prioritization pass*). Prioritization not separate command — task not ordered isn't landed.

## Do

0. **Read arg.**
   - **Free text idea** → one task, steps 1–5, then **stop** and suggest `/wa-grill <#>`. User flags trivial quick win → suggest `/wa-grill <#> quick win` (no interview path).
   - **Spec** → file path, URL, or pasted document (several sections, several features) → *Spec* below. Short idea, even multi-line → free text. Doubt → spec: cut rules still give one task when that's what it is.
   - **Existing task** (slug, display index, `#n`) → nothing to create: say so, suggest `→ /wa-grill 3`, stop.
   - Bare arg matches **live sprint**, no task slug → ambiguous, ask which (recommend: new task inside that sprint, since `/wa-task` creates): `login-refacto is a sprint. New task inside it (recommended), or do you want the view? → /wa-board login-refacto`.
   - `release <n>` → stale-claim cleanup (*GitHub provider*).
   - **No arg → prioritization only.** Skip to step 5, whole backlog in scope, full pass (see *Explicit run* there).
1. **Context.** Read `.whackagent/config.md`, `{wiki}/index.md`, backlog (`{backlog}`, or `wa-backlog list` under GitHub — **reference/provider-github.md**). `{…}` paths per **reference/paths.md**. Idea or spec block already covered by task → say so, reuse, never duplicate. Note live sprints.
2. **Title first.** Distill request into SHORT explicit title — feature clear one glance ("Login Apple", not "improve auth"). Rules: **reference/voice.md → Titles and summaries** — label ≤ 5 words, never a narrative sentence, never a metaphor, tech terms untranslated. Slug = kebab-case title (`login-apple`).
   - **Glossary** — `{wiki}/glossary.md` exists → title, summary, context use its terms, never a `Never` word. User names thing it lacks → propose row *"add `+ Term — means` to glossary? (recommended: yes — grill, code and PR then use same word)"*, on yes add `Glossary: + <row>` line to `## Context / Decisions` (`/wa-wiki` writes it). Absent → skip.
3. **Write task file** at `{tasks}/<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `title`, `status: todo`, `grilled: false`, `created` = today.
   - `summary` — **≤ 8 words**, the goal plainly (line 2 of wa-board list). Adds what title doesn't say — never repeats it. Result once done, not mechanism or story. Rules: **reference/voice.md → Titles and summaries**.
   - `size` — first estimate: `quickwin` (🟢, hour or less), `medium` (🟡), `large` (🔴, multi-session / probably split). `/wa-grill` re-estimates.
   - `type` — `feature` | `improvement` | `bug` | `refactor`, inferred from request (**reference/task-types.md**), echoed `→ type bug` — user corrects in one word. Unclear → empty, grill settles it.
   - `sprint` — kebab-case label, or **empty**. Rules in *Sprints* below. Default empty: most tasks stand alone.
   - `milestone` — highest entry of `backlog.milestones` that isn't track (version order, **reference/milestones.md**), empty when none; user named one → that. Rules **reference/milestones.md**. Echo `→ milestone <m>`.
   - **Track** — only when `branch.tracks` non-empty (**reference/tracks.md**). Never default. Idea clearly belongs to track (paths, modules, APIs only track has) → **suggest** it with reason, user decides: `→ milestone server? (touches oneSafe6_server/, sync API)`. User names track → that, no question. User asks to port track work to base → plain task on base, `ported-from: #<pr>`. To land track → `lands: <track>`, on milestone it ships in. User asks to move existing task onto or off track → **reference/tracks.md**, *Moving*.
   - `blocked_by:` — builds on another task → `depend <slug> --on <other>` (local: `blocked_by: [<other>]`, **reference/blockers.md**).
   - `## Context / Decisions` — user idea in their words, tightened; or **spec excerpt** (*Spec*). `## Acceptance criteria` left empty — `/wa-grill` writes them.
4. **Add to backlog.** Append task under **Todo** in `{backlog}`, link file (relative to backlog's own folder, so link works when backlog and tasks sit in different trees). Sprint set → echo as `· <sprint>` after link, slot line **next to its sprint siblings**, not bottom.
5. **Prioritize.** Run pass below — always, never ask permission, part of adding task. Several tasks one go → one pass at end, not one per task.

## Spec

Big spec → few tasks, each one coherent feature, ready to grill. **Cut, don't shred**: goal = split spec too large for one task, never break feature into small tickets. Read **whole** spec — ranges when big, never judge from first page.

1. **Map spec.** List its blocks: user-visible capability each delivers, spec sections it spans, what it depends on. No deep code exploration — grill does that. Targeted glance only when unsure a block already exists in code.
2. **Decide cut** per *Cut rules*. **One task → say `spec focused → one task`**, create it (steps 2–4, excerpt = whole spec), stop, suggest `/wa-grill <#>`.
3. **Propose**, one block, before writing anything — see *Proposal*.
4. **Create on yes**, per task, steps 2–4. Existing task covering a block → append excerpt (local: its `## Context / Decisions`; GitHub: `gh issue comment`), never rewrite it.
5. **Prioritize** once at end (step 5), sprint moves as block.
6. **Show** list (**reference/display.md → Display format**, fresh `#`). Next: `/wa-grill <#>` on top one — one task at a time (**reference/voice.md → Next line**).

### Cut rules

Task = one coherent feature: user tests it alone, one `/wa-code` pipeline, one PR, one review diff.

- **Split only at feature seams** — separate screen, flow or subsystem that ships and tests on its own. Spec already treating it as separate part = strong signal.
- **Never split by layer** (data / domain / UI), by file, or into steps of one feature — pieces untestable alone. Inner decomposition = grill + `/wa-code` bricks.
- **Never shred** — no task per acceptance criterion, field, button or edge case.
- **Doubt between one and two → one.** Grill can still split later (`/wa-grill` step 4); merging back costs more.
- **Size bound** — block beyond `large` (many sessions, many screens) → split. Everything fits `medium`/`large` → one task fine, even when spec long.
- **Count check** — big spec usually 2–6 tasks. Past ~8 → probably shredding: cut coarser, or say spec = several sprints and cut first one only.

### Proposal

```
Spec: docs/specs/timesheet-v2.md — 3 tasks · sprint timesheet-v2

1. 🟡 Weekly timesheet — edit week entries in one grid      §2 §3
2. 🔴 Timesheet export — month as PDF and CSV              §5    ← after 1
3. 🟡 Week approval — manager approves or rejects week     §6    ← after 1

Already in backlog: §4 offline edit → sync-offline (excerpt appended)
Out of task: §7 analytics — spec says "later" (YAGNI)
Open for grill: §5 PDF branding? · §6 notify by mail or push?

→ Recommended: these 3. §2–§3 same screen; export and approval ship and test alone.
  Alt: merge 1+3 — approval sits on same grid, but doubles review diff.
ok? [y / edit]
```

- **Every spec section lands somewhere** — a task, an existing task, or `Out of task` with reason. Nothing silently dropped.
- Title + summary per **reference/voice.md → Titles and summaries**. Size from spec breadth, re-estimated at grill.
- Order = dependency order; `← after N` when one builds on another.
- **Sprint** — several tasks from one spec → one sprint named after body of work, rules *Sprints* below (reuse live one when spec extends it). Shown in header, confirmed with proposal.
- **Ambiguities → `Open for grill`**, not asked now: grill's job, one task at a time.
- `edit` → user reshapes (merge, split, rename, drop); re-show block, create only on yes.

### Spec excerpt

What grill starts from — `/wa-grill` reads it instead of re-asking what spec already says.

```
**Spec** — docs/specs/timesheet-v2.md §5 (Export)
<sections this task covers, verbatim or tightened — never new requirement>

**Open for grill**
- PDF branding: logo or plain?
```

- Source ref always: path + sections, or `pasted spec` + date when no file.
- Tighten wording, never add scope. Requirement spec doesn't state = not in excerpt.
- Cross-task context (shared model, data another task creates) → one line naming that task.

## GitHub provider

`backlog.provider: github` — rules in **reference/provider-github.md**. Creating = issue on board, nothing else.

- **Create** → `wa-backlog create --title … --summary … [--size] [--sprint] [--milestone] --note "<idea or spec excerpt>"` (note = issue body) instead of steps 3–4, then `wa-backlog depend <n> --on <x>` per dependency. Ticket lands `todo`, bottom of board, milestone per **reference/milestones.md** (track: `--milestone <track>` on user's yes). **No claim, no branch, no task file** — `/wa-grill` makes them; `ported-from:` / `lands:` go in `--note`, grill copies them to task file. `type` not stored yet (no task file): grill infers it (**reference/task-types.md**).
- **Prioritization (step 5) under GitHub:** **not automatic.** Board order shared with humans and other agents — new ticket lands bottom of `todo`, full stop. Only explicit `/wa-task` (no arg): re-read `wa-backlog list` just before writing, show proposed order, apply with `wa-backlog move` **only on user yes**. Cancel = close issue `not planned` with reason comment, on yes.
- **`/wa-task release <n>`** — stale claim cleanup, human-triggered only. Show `wa-backlog claims` row (owner, age, last push), confirm, then `release <n> <phase> --reset-to <todo|grilled|review> --reason "stale: <age>, no push"` (`coding` → `review` when PR open, else `grilled`; `grilling` → `grilled` when spec already exists — issue body criteria or task file on branch —, else `todo`). Never on own initiative, never to take ticket another live agent holds.

## Sprints

Optional grouping label for work too big for one task — `sprint: login-refacto`. Canonical rules in **reference/sprints.md**; here is when to set it.

**Set a sprint when:**

- user names one (*"it's for the login refacto sprint"*) → take their words, kebab-case them;
- task is `large` and grill just split it, or about to → split children share one sprint (below);
- task obviously belongs to work already in flight → existing sprint's tasks touch same feature/screen. **Propose it, one line, don't assume**: `📎 Belongs in sprint login-refacto?`

**Leave empty otherwise.** Sprint of one task is noise. Most tasks stand alone — empty is default, `quickwin` almost never needs one.

**Naming**: kebab-case, names *body of work*, not first task (`login-refacto`, not `login-apple`). Reuse existing sprint verbatim rather than coining near-duplicate — check live `sprint:` values before minting new label.

**Never** create sprint file, sprint section in `{backlog}`, or sprint status. Label on tasks *is* sprint.

## Prioritization pass

Product-owner hat: what matters now, what order. New task(s) from this run = **focus**; rest of todo = context.

1. Read `{backlog}` + `todo` task files (config already read).
2. Each todo task, challenge with **YAGNI**: _need now?_ Three outcomes:
   - **keep** — stays in todo.
   - **defer** — keep but push down order.
   - **cancel** — set `status: canceled`, move under Canceled, note why.
3. **Split** when task too big for one coherent feature: parent → **`split <id>`** (root of sprint named after its title), create child task files (`<slug>-<part>.md`), link to parent via `note:`/`wiki:`. Child building on sibling → `depend <child> --on <sibling>`.
   - **Children inherit milestone** — parent's, never highest: split adds no scope (**reference/milestones.md**).
   - **Children inherit sprint.** Parent had one → every child gets same `sprint`. Parent had none → split *is* reason sprints exist: `split` names it after parent title in kebab-case (`Login redesign` → `login-redesign`), set on all children, say so in one-line split proposal. Title doesn't name body of work → fix title first (**reference/voice.md → Titles and summaries**).
4. **Re-estimate size** when picture changed (`large` 🔴 task split may now be `medium`/`quickwin`). Update each task `size`.
5. **Reorder.** Order in **Todo** section = priority (top = next). No numeric labels in `{backlog}` — order alone carries priority. Reflect new order in `{backlog}`.
   - **Blocker above blocked.** Task with open blocker (**reference/blockers.md**) never sits above it in Todo, sprint block included.
   - **Sprint moves as block.** Its tasks stay contiguous in section, own internal order (dependencies first). Prioritize *sprint* against rest, then tasks inside. Splitting sprint across order needs reason — say out loud (*"pulled login-apple out of the block: it unblocks onboarding"*).
6. **Tighten titles + summaries.** Any task in pass whose `title` or `summary` breaks **reference/voice.md → Titles and summaries** (narrative sentence, metaphor, translated tech term, summary > 8 words) → rewrite it, silently. Slug doesn't change.
7. Show result using **reference/display.md → Display format**. `#` display-only, recomputed from order just written — always print list after reordering so indexes user sees are current. Sprints in play → progress lines under legend.

**Cheap and quiet by default** — user asked for task, not backlog audit:

- Slotting focus task vs existing ones: silent, no narration.
- Reorder + re-estimate: apply freely, reversible, order is whole point.
- **Assigning sprint user didn't name: propose, never silent** (one line, same as cancel/split). Sprint they named, or one inherited by split they already approved: silent.
- **Cancel or split: never silent.** Propose one line each (`⚠️ sync-offline looks like 3 tasks — split?`), do only on yes. Applies to focus tasks and any existing task pass flags.
- No before/after diff; one list (the after) enough.
- Single todo task → nothing to order, skip straight to list.

**Explicit run** (`/wa-task` no arg, or user asks reorder): full pass over everything, show **before/after** lists plus rationale for any cancel/split.

## Stop and ask

Priority call needs product intent you lack? Ask — no assume. But on automatic pass, ask only if new task slot genuinely undecidable; else put where best fits, let user move it.

Every question — cut proposal, sprint name, slot — carries recommended answer plus one-line reason, format **wa-grill → Question format**. Never bare question.

## Never

- Never grill here, never invoke `/wa-grill` — suggest it, user runs it, one task at a time.
- Never write acceptance criteria, never code, never create branches.
- Never create from spec before yes on proposal.
- Never invent requirement idea or spec doesn't state.
- Never write to literal `.whackagent/` path when config `paths:` points elsewhere.

## Next step

Idea → list on screen, **`/wa-grill <#>`** on new task. Spec cut → list on screen with fresh `#`: **`/wa-grill <#>`** on top new task. No-arg pass → **`/wa-code <#>`** for top grilled todo (or `/wa-grill <#>` when top one not grilled).
