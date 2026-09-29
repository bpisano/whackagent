---
name: wa-task
description: Clarifies an idea or issue with you until it's a clear task, then reorders the backlog. No argument: reorders only.
---

# /wa-task

Fuzzy idea → clear grilled task, backlog ordered. Clarity before code. **Always grills** — idea to note for later is `/wa-draft`. Also adopts GitHub issues filed by the team (`github` backend).

Wording (whole conversation + reports + PRs): **wa-board → Voice** — telegraphic, tech terms stay English in every language (franglais, never literal translation).

Owns two things: **writing task** (steps 1–5), **placing it** (step 6). Grill holds the `grilling` lock (**wa-board → States → Locks**) — one grill per task at a time. Prioritization not separate command — task not ordered isn't landed.

## Do

0. **Read arg.**
   - Free text → new task, steps below.
   - Task id (`/wa-task 3`, `/wa-task 42`) → resolve per **wa-board → Task ids**, echo `#42 → Sync offline changes`, grill that existing `draft` instead of creating, then step 6. Not `draft` → say state, stop (`grilling` → see step 3 *Lock*; `todo` and later → already grilled, `/wa-feedback` changes scope once coded).
   - **`github`: issue with no Status or off board** → **adopt it.** `github-board get <n>` puts it on board as `draft`. Grill seeded with its title + body. Then rewrite title per **wa-board → Titles and summaries** (`gh issue edit <n> --title`), original body kept as a `>` quote at top of `## Context / Decisions`. Echo `#57 adopted: "crash when i zoom" → Fix crash on map zoom`.
   - **`release <id>`** → clear a stale lock, see *Release* below. Nothing else.
   - Bare arg matches **live sprint**, no task id → ambiguous, ask which (recommend: new task inside that sprint, since `/wa-task` creates): `Login refacto is a sprint. New task inside it (recommended), or do you want the view? → /wa-board login-refacto`.
   - **No arg → prioritization only.** Skip to step 6, whole backlog in scope, full pass (see *Explicit run* there).
1. Read `.whackagent/config.md` + `{wiki}/index.md` for project context. `{…}` paths come from its `paths:` block — see **wa-board → Paths**. Task reads and writes go through **wa-board → Task store**.
2. **Title first.** Distill request into short explicit title, **verb + thing** — clear at a glance to someone who never saw this conversation (`Add Apple login`, not `Login Apple`, not `Improve auth`). Rules: **wa-board → Titles and summaries** — ≤ 5 words, verb first, never narrative, never metaphor, tech terms in English, never repeats the sprint. Slug = kebab-case title (`add-apple-login`).
3. **Lock, then grill.**
   - **Lock.** `github`: free text → `github-board create` first (**Task store → create**, `--note` = raw idea); then `github-board claim <n> grilling` **before first question**. Exit 3 → your own lock (`agent` = `github-board whoami`) → resume grill; someone else's → `🔒 #42 grilling — alice@mbp since 2h`, stop. Exit 4 → say state, stop. `files`: task file (from template) + backlog line created now, `status: grilling`, no lock.
   - **Grill.** Invoke **grill-me** skill: interview user relentlessly down design tree, one question at time. Resolve scope with **YAGNI** — push back on speculative. Question answerable from code → **go read code** (targeted Grep/Glob, scoped to feature). Never ask user what project already tells you.
   - **Every question carries recommendation. No exception.** See *Grill question format* below — bare question is bug, not style choice.
   - **Cover architecture.** Grill must settle *where this lives*: which feature/folder, what new files/folders, how fits architecture module (group by feature, proper nesting — not flat), which layer boundaries touch. Read architecture module in `{conventions}/` first, so grill against real rules.
   - **Dependencies.** Task builds on another not landed yet → ask (with recommendation) or confirm what code shows. Record per **wa-board → Dependencies**.
   - **No skip.** Every task grilled — quick win too: short grill, 1–2 questions. User wants it noted, grilled later (*"just note it, grill later"*) → stop like `/wa-draft`: `github` → `github-board release <n> grilling --reset-to draft`; `files` → `status: draft`. Echo `/wa-task <id>` to grill later.
   - **Grill abandoned** (user says stop) → same reset. Left mid-grill without a word → lock stays; `/wa-task <id>` resumes, `/wa-task release <id>` frees.
4. **Write the task file** per **wa-board → Task store**, content from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `files`: `{tasks}/<slug>.md`, `title`, `status: todo`, `created` = today, `blocked_by:` slugs.
   - `github`: `{tasks}/<n>-<slug>.md` **on task branch**, frontmatter `issue: <n>`, `status: todo`, `wiki:`, `note:`, `created:` — no `title`/`summary`/`size`/`sprint`/`blocked_by` lines. Issue holds them: `gh issue edit <n> --title … --body …` (summary = first body line), `github-board set-field`, `github-board depend`. Landing per *GitHub landing* below.
   - `summary` — **≤ 8 words**, the goal, plain (line 2 of wa-board list). Adds what title doesn't say — never repeats it. Result once done, not the mechanism nor the story. Rules: **wa-board → Titles and summaries**.
   - `size` — effort estimate: `quickwin` (🟢, hour or less), `medium` (🟡), `large` (🔴, multi-session / probably split). Base on what grill surfaced.
   - `sprint` — human title, or **empty**. Rules in *Sprints* below. Default empty: most tasks stand alone.
   - `wiki:` — link relevant existing wiki pages with `[[page]]`; note any page to create.
   - Fill `## Context / Decisions` with resolved decisions from grill.
   - Fill `## Acceptance criteria` — observable checks meaning "done" (what appears on screen, what input must produce). These drive `wa-verifier`; keep concrete, YAGNI. Skip only for tasks with no runnable surface (pure lib/logic).
   - Title, summary and body in `discussion_language`, tech terms English (**wa-board → Voice**). `github`: creating or editing the issue, its branch, pushing the task file need no extra yes — it's what the user asked for.
5. **Place it.** Under `todo`, **next to its sprint siblings** when it has one, else bottom — **below its blockers**. `files`: backlog line moves to Todo, links the task file relative to backlog's own folder (works when backlog and tasks sit in different trees), sprint echoed as `· <Sprint>`. `github`: `github-board move`; column moves by itself (hook, 1–3 min lag — never patch it).
6. **Prioritize.** Run pass below — always, never ask permission, part of adding task. Several tasks one go → one pass at end, not one per task.

## GitHub landing

End of grill, `github` only. Task file lives on task branch (**wa-board → Task store → task branch and rounds**) — pushing it ends the grill.

1. **Base** = sprint branch `<branch.sprint_prefix><kebab(sprint)>` when task in sprint (absent on remote → create from `branch.base`, push), else `branch.base`.
2. **Branch** — `gh issue develop <n> --name <branch.prefix><n>-<slug> --base <base>` (links it in issue **Development**). Never `git checkout -b` + push.
3. **Temporary worktree** — `git fetch origin <branch>`, `git worktree add ../.wa-worktrees/<n>-<slug> <branch>`. Never switch user's checkout: dirty tree untouched, grill never hijacks what they're on.
4. **Write** `{tasks}/<n>-<slug>.md` there (step 4), `git add` that one file, commit `Grill #<n> <title>` as `commit.author_name`/`author_email` — **never Claude** — push.
5. **Remove worktree** (`git worktree remove`). Branch stays on remote; `/wa-code` picks it up.
6. Hook: card → Todo, grilling lock released, `✅ grilled` comment linking the file. Push failed → lock still held: say so, stop — never `release` over an unpushed spec.

## Release

`/wa-task release <id>` — human-triggered cleanup of a lock nobody holds anymore (agent crashed, teammate gone). `github` only (`files` has no lock: fix `status:` by hand).

1. `github-board claims` → show owner, since, last activity, `stale`. Not stale → say so, recommend waiting or asking owner; go on only on yes.
2. `grilling` → `github-board release <n> grilling --reset-to draft --reason "<why>"`.
3. `coding` → reset to what the task file on its branch says (`status:` `todo` / `to-test` / `to-close`) — recommend that, one line. Owner's unpushed work isn't deleted, just off the board — say so.

## Sprints

Optional grouping for work too big for one task — `sprint: Login refacto` (`github`: milestone). Canonical rules in **wa-board → Sprints**; here is when to set it.

**Set a sprint when:**

- user names one (*"it's for the login refacto sprint"*) → take their words as title (`Login refacto`);
- task is `large` and grill just split it, or about to → split children share one sprint (below);
- task obviously belongs to work already in flight → existing sprint's tasks touch same feature/screen. **Propose it, one line, don't assume**: `📎 Belongs in sprint Login refacto?`

**Leave empty otherwise.** Sprint of one task is noise. Most tasks stand alone — empty is default, `quickwin` almost never needs one.

**Naming**: per **wa-board → Sprint names** — human title ≤ 3 words, names *body of work*, not first task (`Login refacto`, not `Apple login`). Reuse existing sprint verbatim rather than coining near-duplicate — check live sprints (`files`: `sprint:` values; `github`: open milestones) before minting new one.

**Never** create sprint file, sprint section in `{backlog}`, or sprint state. `files`: label on tasks *is* sprint. `github`: milestone, created on first task that names it (`github-board set-field <n> sprint "<Sprint>"`).

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

1. List backlog per **wa-board → Task store** — `todo` and `draft` tasks in scope (config already read), with blockers.
2. Each todo/draft task, challenge with **YAGNI**: _need now?_ Three outcomes:
   - **keep** — stays where it is.
   - **defer** — keep but push down order.
   - **cancel** — `files`: `status: canceled`, note why. `github`: `github-board cancel <n> --reason "<why>"`.
3. **Split** when task too big for one coherent feature: create child tasks (verb + thing titles each), link to parent via `note:` (`github`: `#<n>`), mark parent `canceled` or keep as umbrella — your call, tell user. Children not yet grilled → `draft`. **Child building on a sibling → blocked by it** (**wa-board → Dependencies**).
   - **Children inherit sprint.** Parent had one → every child gets same `sprint`. Parent had none → split *is* reason sprints exist: name one after body of work parent described (`refonte du login` → `Login refacto`), set on all children, say so in one-line split proposal. Parent kept as umbrella → carries sprint too.
4. **Re-estimate size** when picture changed (`large` 🔴 task split may now be `medium`/`quickwin`). Update each task `size`.
5. **Reorder.** Order inside each section = priority (top = next). No numeric labels anywhere — order alone carries priority. Write it per **Task store → reorder** (`github`: `github-board move`). **Blocker always above what it blocks.**
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

Board list from step 7 already on screen with fresh ids. Suggest **`/wa-code <id>`** for top unblocked `todo` (or `/wa-autopilot <id,id>` if new tasks are quick wins), **`/wa-task <id>`** for a `draft` worth grilling now.