---
name: wa-code
description: Run the full coding pipeline for a task — understand, code + test, review, report — orchestrating isolated subagents.
---

# /wa-code

Whole coding pipeline for one task: **understand → code + test → review → report + iterate**. You orchestrate from main thread; heavy work go to isolated subagents (`wa-implementer`, `wa-reviewer`) so main context stay clean. `wa-autopilot` run same pipeline unattended.

Read `.whackagent/config.md` and task file `.whackagent/tasks/<slug>.md` first.

**Grill gate (soft):** if `grilled: false`, warn *"This task wasn't grilled — quick win, or run `/wa-task <slug>` first?"* Proceed if user confirm quick win.

Set task `status: in-progress` (reflect in `BACKLOG.md`).

## 1. Understand

- Read task and architecture decisions from its `## Contexte / Décisions`.
- **Find the existing — graphify first.** If `graphify-out/` exists, query the code graph (per the **graphify** skill) to map the task's neighborhood: related code, callers, usages, layer boundaries. This is how you wander the project — not blind Grep. Fall back to targeted Grep/Glob only when no graph exists. Goal: don't re-code what exists, understand surroundings.
- **Decompose** feature into small modules/bricks. Decide **file/folder layout up front** per architecture + arborescence modules (group by feature, proper nesting — never flat).
- **Plan tests.** Sketch what to test (units, edge cases) before coding. YAGNI: only what task needs.

## 2. Code + test

Dispatch **wa-implementer** sequentially, one brick at a time (builds must not collide). Pass: task path, brick (with target files/folders), conventions **dir**, test plan, and `autopilot: false`.

Implementer code feature **and its tests**, then run build and/or tests to prove it work. Handle each receipt:
- `RESULT: done` → record files + build/test proof in task's `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask user** the `BLOCKED:` question. Don't dispatch further bricks until resolved.

## 3. Review

When all bricks coded + green, run multi-category review:

1. **Fan out, in parallel** — spawn one **wa-reviewer** per category: `style`, `elegance`, `architecture`, `arborescence`, `correctness`. Pass each its `category`, its module path(s) only (from `review.categories`), changed files, task path, and toggles. Each load only its module → focused, forget nothing.
2. **Aggregate** findings into one severity-ordered list, tagged by category; dedupe.
3. **Autofix** (if `review.autofix: true`): spawn **wa-implementer** once in **fix mode** with aggregated findings + conventions dir (fix only what findings name, re-read style, add no comments), then **re-review** (back to step 1). Loop until clean or no progress. Cap 3 rounds; if not converging, stop and show remaining findings. A `BLOCKED:` from autofix → stop and ask.
4. Record final per-category findings + what autofix changed in task's `## Review`.

## 4. Report + iterate

- **Show** on-screen summary: what built, files/folders touched, key decisions, test + review results. Invite user to iterate — apply requested changes (loop back into relevant phase).
- **Save** caveman-compressed report to `.whackagent/reports/<slug>.md` (what / files / decisions / tests / review verdict / task link).
- On user **validation**: set task `status: review` → `done` per convention, reflect in `BACKLOG.md`.

## Never

Never commit in normal flow — user validates first. Never let subagents touch backlog/wiki/reports — you own those here.

## Next step

After validation, suggest **`/wa-wiki`** to update wiki + code graph for what changed.