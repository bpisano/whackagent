---
name: wa-grill
description: Grill one task until clear — interview down design tree, architecture included, write acceptance criteria. Clarity before code.
---

# /wa-grill

One task, fuzzy → grilled: decisions settled, acceptance criteria written, ready for `/wa-code`. Clarity before code. Tasks come from **`/wa-task`**, which creates them and suggests this command — never starts it.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `paths.md` `session-name.md` · arg is display index → + `display.md` · `backlog.provider: github` → + `provider-github.md` `commits.md` · `branch.worktree: true` → + `worktrees.md` · `branch.tracks` non-empty → + `tracks.md`.

Wording (screen + reports): **reference/voice.md** — telegraphic, tech terms stay English.

## Do

0. **Resolve task.** Slug, display index or `#n` per **reference/display.md → Task indexes**, echo `3 → sync-offline`. No arg → top `todo` not grilled (GitHub: top unclaimed `todo`). Free text instead of task → that's a new task: run **`/wa-task`** with it, then grill the task it created (user asked for grill). Name session per **reference/session-name.md**.
   - Already `grilled: true` (GitHub: `grilled`) → say so; re-grill only on yes (recommend: no — unless scope changed since).
   - Past `todo` / `grilled` (coding started; GitHub: `coding`, `review`) → stop: changes now go through `/wa-feedback`.
1. **Read** `.whackagent/config.md`, `{wiki}/index.md`, task file (GitHub: issue body via `wa-backlog get <n>`). `{…}` paths per **reference/paths.md**. `## Context / Decisions` holds what `/wa-task` left: user idea, or **spec excerpt** with `Open for grill` points.
2. **Grill.** Invoke **grill-me** skill (absent → run interview inline, per *Question format*): interview user relentlessly down design tree, one question at time. Resolve scope with **YAGNI** — push back on speculative. Question answerable from code → **go read code** (targeted Grep/Glob, scoped to feature). Never ask user what project already tells you.
   - **Start from what task already says.** Spec excerpt → ask its `Open for grill` points and what it leaves open, never re-ask what it states.
   - **Glossary terms.** `{wiki}/glossary.md` exists → decisions and criteria name things by its terms (screens by `Screens` name). User names new thing or second word for listed one → propose row, on yes `Glossary: + <row>` in `## Context / Decisions` (`/wa-wiki` writes it).
   - **Prior art before build.** Decision heads toward hand-rolled integration, bridge, SDK wrapper, parser or protocol client → search existing libraries first (package registry, official SDK docs, GitHub). Claimed support unclear → read source: stub full of `TODO()` ≠ support. Record survey in `## Context / Decisions`, one line per candidate, why fits or not. Nothing fits → say so, custom build decided on record. Never grill *how to build X* before *does X exist*.
   - **Every question carries recommendation. No exception.** See *Question format* — bare question is bug, not style choice.
   - **Track** — only when `branch.tracks` non-empty (**reference/tracks.md**). Scope belongs to track, task not on it (or the reverse) → **first question**, suggest move with reason; yes → `set-field <id> milestone <m>`. Task ports track work to base → `ported-from: #<pr>` in task file, grill what gets stripped. Task lands track → `lands: <track>`, grill flag, migrations, what stays dark.
   - **Cover architecture.** Grill must settle *where this lives*: which feature/folder, what new files/folders, how fits architecture module (group by feature, proper nesting — not flat), which layer boundaries touch. Read architecture module in `{conventions}/` first, so grill against real rules.
3. **Write** into task file:
   - `## Context / Decisions` — resolved decisions. Replaces idea / excerpt; keep excerpt's source ref line.
   - `## Acceptance criteria` — observable checks meaning "done" (what appears on screen, what input must produce). These drive the implementer's runtime checks and the verifier's correctness lens; keep concrete, YAGNI. Skip only for tasks with no runnable surface (pure lib/logic).
   - `size` re-estimated from what grill surfaced: `quickwin` (🟢, hour or less), `medium` (🟡), `large` (🔴, multi-session / probably split). `wiki:` pages it touches, pages to create. `grilled: true`.
   - `title` / `summary` wrong now → fix per **reference/voice.md → Titles and summaries** (slug stays).
4. **Too big?** Grill surfaced several features → propose split, one line (`⚠️ 3 features — split?`), only on yes: this task → **`split <id>`**, becomes root of sprint named after its title (kebab-case). Children through **wa-task → Spec** (cut rules, excerpt = decisions settled so far), all in that sprint. Task already in sprint → `split` exit 4: children join that sprint, this task `canceled`.
5. **Place** — local: **wa-task → Prioritization pass**, default quiet run, focus = this task. GitHub: nothing — board order shared, never automatic.
6. **Next**: `/wa-code <#>` (**reference/voice.md → Next line**).

**Quick win** — user flags trivial: no interview. Local → task stays `grilled: false` (`/wa-code` warns, proceeds on yes). GitHub → still claim, minimal spec (context one line, 1–3 acceptance criteria from title + summary), push: coding claim needs `grilled`, only pushed spec gets there.

## GitHub provider

`backlog.provider: github` — rules in **reference/provider-github.md**. Same grill, same task file content; what changes is where it goes and who may touch it.

1. **Claim** → `wa-backlog claim <n> grilling` — from `todo`, or from `grilled` for re-grill (yes from step 0). Exit 3 → `#12 grilled by <agent> since <time>` (or coded by — someone took it first) — stop, suggest next `todo`. Exit 4 → state neither, say which, stop.
2. **Branch** → fork point per `/wa-code` step 0 (`branch.base` — track ticket: its trunk, **reference/tracks.md** — or `sprint/<sprint>` when ticket has sprint). Dirty tree → stop and ask (worktree mode: doesn't apply). Track question (step 2) asked first when it applies — fork point depends on answer. Create it **linked to issue**, right away: `gh issue develop <n> --name <branch.prefix><n>-<slug> --base <fork point> --checkout` — `branch.worktree: true` → `--checkout --worktree {worktrees}/<n>-<slug>` (both: `--worktree` alone fails, `--checkout` lands in worktree, main checkout stays put — **reference/worktrees.md**), spec written and pushed from there. GitHub creates remote branch at fork point and lists it under issue **Development** — visible from first minute. Only way to link: branch created any other way (plain `git checkout -b`, then push) can never be linked afterwards. Empty branch push moves nothing (hook needs spec). **Re-grill** → branch exists: `wa-backlog branch <n>`, fetch, check out (worktree: reuse or add on it), never `gh issue develop` again; spec rewritten in place. **Re-grill, no branch** (spec in issue body, **reference/provider-github.md**, *Spec in issue body*) → first-grill path above (`gh issue develop`, first commit `task: grill #<n> <slug>`); `## Context / Decisions` notes issue-body criteria it supersedes.
3. **Grill** (step 2), **write** `{tasks}/<n>-<slug>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/task.md` with GitHub frontmatter: `issue: <n>`, `phase:` empty, `wiki:`, `note:`, `created:`. Title/summary/size/sprint → `wa-backlog set-field` / GitHub issue, never file. Dependencies grill settled (`Depends on #x` in `note:`) → **also** `wa-backlog depend <n> --on <x>[,<y>]` at once, so issue Relationships show blocking graph. Split children blocked by sibling they build on → same verb. `## Acceptance criteria` **must** be non-empty — hook reads it as proof grill finished.
4. **Commit + push, once, at end.** Commit only task file (`task: grill #<n> <slug>`; re-grill on existing branch: `task: re-grill #<n> <slug>` — first grill commit stays ticket range start), author per **reference/commits.md**, push `-u origin`. Never push mid-grill. Hook moves ticket to `grilled` and drops grilling claim — confirm with `wa-backlog get <n>` (wait ~30 s, re-read once; still `grilling` → say hook late, check Actions run, never set state yourself).
5. **Abort** (user drops mid-grill) → `wa-backlog release <n> grilling --reset-to todo --reason "<why>"` (re-grill: `--reset-to grilled` — branch existed → kept, old spec still on it; no branch before → spec still in issue body), delete branch if spec never pushed — local, plus remote one `gh issue develop` created (`git push origin --delete <branch>`: holds only fork point).
6. **Split** (step 4) → parent: `release <n> grilling` (spec never pushed → delete its branch, local + remote, as *Abort*), then **`wa-backlog split <n>`** → issue becomes sprint root (`wa-sprint`, off board, number/history/milestone kept), prints `sprint`. Children = new tickets via `/wa-task` create, `--sprint <that name> --milestone <parent's>` (split replaces parent, not new scope) → its sub-issues. Comment on root linking children. Never close root: hooks close it when sprint lands. Exit 4 already in sprint → children `--sprint <parent's sprint>`, parent closed `not planned` with comment linking children. Exit 4 name clash → say which sprint, ask user to retitle parent.

**Unattended grill** — `/wa-autopilot` AFK mode runs steps 1–4 itself, answering with its own recommendations, each tagged `(autopilot assumption)` in `## Context / Decisions`. Product-intent question → releases ticket back to `todo` with `BLOCKED:` reason, never guesses.

## Question format

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
- Same rule for any question outside grill — `/wa-task` cut proposal, architecture forks, `BLOCKED:` questions from subagents, `/wa-feedback` triage doubts.

## Stop and ask

Whole skill about no guessing. User answers leave contradiction → surface it, no paper over.

## Never

- Never create task from nothing — `/wa-task` creates, grill clarifies.
- Never code, never commit code — only task file (GitHub step 4).
- Never write to literal `.whackagent/` path when config `paths:` points elsewhere.

## Next step

**`/wa-code <#>`** on grilled task (or `/wa-autopilot <#,#>` for quick wins).
