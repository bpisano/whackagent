---
name: wa-task
description: Clarifies an idea or issue with you until it's a clear task, then reorders the backlog. No argument: reorders only.
---

# /wa-task

Fuzzy idea → grilled `todo` task, backlog reordered. Always grills: notes are `/wa-draft`.

Read: voice, components, tasks, store, git

## Steps

1. **Read the arg.**
   - Free text → new task.
   - Task id → resolve and echo (**tasks → Ids**). `draft` → grill it, no new task.
     - `grilling` → step 4 lock rules.
     - `todo` or later → already grilled; scope change once coded = `/wa-feedback`. Stop.
   - `github` issue with no Status / off board → **adopt**:
     - `github-board get <n>` → on board as `draft`. Grill seeded with title + body.
     - Rewrite title (**voice → Titles**): `gh issue edit <n> --title`.
     - Original body → `>` quote at top of `## Context / Decisions`.
     - Echo the rename as a **Warning**: old title → new.
   - `release <id>` → **Release**, nothing else.
   - Matches a live sprint, no task id → **Question**: new task inside it (recommended), alt `/wa-board <sprint>`.
   - None, or user asks to reorder → **Prioritization** only, explicit run.
2. **Read context** — config (**tasks → Config and paths**) + `{wiki}/index.md`.
3. **Title first** — verb + thing (**voice → Titles**), clear to someone who never saw this chat. Slug from it.
4. **Lock.**
   - `github`: free text → `create` first, `--note` = raw idea. Then `claim <n> grilling` before the first question (**store → Locks**).
     - Exit 3, own lock (`agent` = `github-board whoami`) → resume grill.
   - `files`: task file from template + backlog line now, `status: grilling`.
5. **Grill** — invoke **grill-me**, one **Question** at a time, down the design tree.
   - YAGNI on scope: push back on speculative.
   - Answer in the code → read it (targeted Grep/Glob).
   - Read the architecture module in `{conventions}/` first. Settle where it lives: feature/folder, new files/folders, fit (by feature, nested, never flat), layer boundaries touched.
   - Builds on an unlanded task → ask or confirm from code, record (**tasks → Blockers**).
   - Quick win too: 1–2 questions.
   - New or settled product term → **voice → Glossary**.
   - UI project → settle meaning-carrying copy (destructive confirms, errors, empty states) against `{conventions}/wording.md`. Never the full string list.
   - **Park** — user says "note it, grill later" or stop:
     - `github` → `release <n> grilling --reset-to draft`. `files` → `status: draft`.
     - Echo `/wa-task <id>` to grill later.
   - Left silently → lock stays. `/wa-task <id>` resumes, `/wa-task release <id>` frees.
6. **Write the task** from `${CLAUDE_PLUGIN_ROOT}/templates/task.md`:
   - `files` → `{tasks}/<slug>.md`: `title`, `status: todo`, `created` today, `blocked_by:` slugs.
   - `github` → `{tasks}/<n>-<slug>.md` on the task branch (**GitHub landing**). Frontmatter `issue`, `status: todo`, `wiki`, `note`, `created` only. Issue gets title, summary (`gh issue edit <n> --title … --body …`), `set-field`, `depend`.
   - `summary` → **voice → Titles**: the result, not the mechanism.
   - `size` from the grill: `quickwin` ≤ 1h · `medium` · `large` multi-session, likely split.
   - `sprint` → **Sprints**. Default empty.
   - `wiki:` → `[[page]]` links to existing pages; note pages to create.
   - `## Context / Decisions` → decisions from the grill.
   - `## Acceptance criteria` → observable checks (on screen, input → output), concrete, YAGNI: they drive `wa-verifier`. None only with no runnable surface.
7. **Place it** — under Todo, next to its sprint siblings, else bottom. Always below its blockers.
   - `files` → backlog line to Todo, link relative to the backlog's folder, `· <Sprint>`.
   - `github` → `github-board move`.
8. **Prioritize** — always, never ask. Several tasks → one pass at the end.

## GitHub landing

`github` only. Ends the grill.

1. **Base** — sprint → sprint branch (**git → Sprint branch**); absent on remote → create from `branch.base`, push. Else `branch.base`.
2. **Branch** — `gh issue develop` (**store → Rounds**).
3. **Worktree** — `git fetch origin <branch>`, `git worktree add ../.wa-worktrees/<n>-<slug> <branch>`.
4. **Write** the task file there, `git add` it alone, commit `Grill #<n> <title>` (**git → Commits**), push.
5. **Remove** the worktree. Branch stays on remote for `/wa-code`.
6. Push failed → lock still held: say so, stop.

## Release

`/wa-task release <id>`, human only, `github` only. `files` → no lock: fix `status:` by hand.

1. `github-board claims` → owner, since, last activity, `stale`. Not stale → recommend waiting or asking the owner, go on only on yes.
2. `grilling` → `release <n> grilling --reset-to draft --reason "<why>"`.
3. `coding` → recommend the task file's `status:` on its branch (`todo` / `to-test` / `to-close`), one line. Say the owner's unpushed work stays, just off the board.

## Sprints

When to set `sprint:` (rules → **tasks → Sprints**):

- User names one → assign per **tasks → Sprints**.
- `large` task split → children share one.
- Fits an in-flight sprint (same feature/screen) → propose as a **Question**, joining it recommended.
- Else empty. Sprint of one = noise; `quickwin` almost never.
- New name = body of work, not first task.
- `github` → `set-field <n> sprint "<Sprint>"` creates the milestone.

## Prioritization

New task(s) = focus, rest of todo = context.

1. **List** `todo` + `draft` with blockers (**store**).
2. **YAGNI each** — keep · defer (push down) · cancel (`files`: `status: canceled` + why · `github`: `cancel <n> --reason`).
3. **Split** a task too big for one feature:
   - Children: titles per **voice → Titles**, `draft`, linked via `note:` (`github`: `#<n>`).
   - Parent → canceled or umbrella; tell the user.
   - Child building on a sibling → blocked by it.
   - Children inherit the parent's sprint. None → name one after the body of work, set on all, say so in the split proposal. Umbrella keeps it too.
4. **Re-size** when the picture changed.
5. **Reorder** (**store** reorder). Order = priority, no numeric labels.
   - Blocker above what it blocks.
   - Sprint = contiguous block, deps first. Rank the sprint, then inside it.
   - Breaking a block → say why.
6. **Tighten** titles + summaries breaking **voice → Titles**, silently. Slug never moves.
7. **Show** a **Task list** (`files`: always reprint, indexes are new).

Quiet by default:

- Slot, reorder, re-size → apply, no narration.
- Sprint the user didn't name → propose. Named, or from an approved split → silent.
- Cancel or split → **Warning** + `ok?`, one each, only on yes. Any task the pass flags.
- After list only, no diff. Single task → list.
- Explicit run (no arg, or user asks to reorder) → full pass, before/after lists, rationale per cancel/split.

## Never

- Never ask what the project already tells.
- Never ask before editing the issue, creating its branch or pushing the task file.
- Never switch the user's checkout or touch a dirty tree: the grill works in a worktree.
- Never `release` over an unpushed spec.
- Never a sprint file, backlog section or state.
- Never paper over contradicting answers: surface them.

## Ask

- Priority call needs product intent → ask.
- Auto pass → only when the slot is undecidable; else best fit, user moves it.

## Next

- Top unblocked `todo` → `/wa-code <id>` (quick wins → `/wa-autopilot <id,id>`).
- `draft` worth grilling now → `/wa-task <id>`.
