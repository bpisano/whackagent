---
name: wa-code
description: Run the full coding pipeline for a task — understand, code + test, review, report — orchestrating isolated subagents.
---

# /wa-code

Full coding pipeline, one task: **understand → code + test → review → verify → report + iterate**. You orchestrate from main thread; heavy work go to isolated subagents (`wa-implementer`, `wa-reviewer`, `wa-verifier`) — keep main context clean. `wa-autopilot` run same pipeline unattended.

Read `.whackagent/config.md` and task file `.whackagent/tasks/<slug>.md` first.

Arg is a slug **or** a display index from the wa-board table (`/wa-code 3`) — resolve per **wa-board → Task indexes**, echo `3 → sync-offline` before starting.

**Grill gate (soft):** if `grilled: false`, warn *"This task wasn't grilled — quick win, or run `/wa-task <slug>` first?"* Proceed if user confirm quick win.

Set task `status: in-progress` (reflect in `BACKLOG.md`).

## 1. Understand

- Read task + architecture decisions from its `## Contexte / Décisions`.
- **Find the existing — graphify first, always.** If `graphify-out/` exists you MUST query the code graph (per **graphify** skill) to map task neighborhood: related code, callers, usages, layer boundaries. This how you wander project — not blind Grep, never skipped. Fall back to targeted Grep/Glob only when no graph exists. Goal: don't re-code what exists (DRY), understand surroundings before decomposing.
- **Decompose** feature into small modules/bricks. Decide **file/folder layout up front** per architecture + arborescence modules (group by feature, proper nesting — never flat).
- **Plan tests.** Sketch what to test (units, edge cases) before coding. YAGNI: only what task needs.

## 2. Code + test

Dispatch **wa-implementer** sequentially, one brick at a time (builds must not collide). Pass: task path, brick (with target files/folders), conventions **dir**, test plan, `autopilot: false`.

Implementer code feature **and its tests**, then run build and/or tests to prove work. Handle each receipt:
- `RESULT: done` → record files + build/test proof in task's `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask user** the `BLOCKED:` question. Don't dispatch further bricks until resolved.

## 3. Review

When all bricks coded + green, run multi-category review:

1. **Fan out, in parallel** — spawn one **wa-reviewer** per category: `style`, `elegance`, `architecture`, `arborescence`, `correctness`. Pass each its `category`, its module path(s) only (from `review.categories`), changed files, task path, toggles. Each load only its module → focused, forget nothing.
2. **Aggregate** findings into one severity-ordered list, tagged by category; dedupe.
3. **Autofix** (if `review.autofix: true`): spawn **wa-implementer** once in **fix mode** with aggregated findings + conventions dir (fix only what findings name, re-read style, add no comments), then **re-review** (back to step 1). Loop until clean or no progress. Cap 3 rounds; if not converging, stop and show remaining findings. A `BLOCKED:` from autofix → stop and ask.
4. Record final per-category findings + what autofix changed in task's `## Review`.

## 3.5 Verify (runtime)

Static review says the code reads right; verify says it **works when used**. Run only when `verify.enabled: true` and the task has a runnable UI surface (skip pure-logic/lib tasks — nothing to drive).

1. Dispatch **wa-verifier** once. Pass: task path (for acceptance criteria), the implementer's `ARTIFACT:` (binary path + bundle id/package), `verify.platform` + `verify.target`, `autopilot` flag.
2. Verifier installs the built binary via **mobile-mcp**, drives the task's acceptance criteria with real inputs (tap/type/swipe), screenshots each checkpoint. Handle receipt:
   - `RESULT: pass` → record checks + screenshot paths in task's `## Verification`, continue.
   - `RESULT: fail` → treat like a critical finding: feed the failed checks back through the review autofix loop (Review step 3) if `review.autofix`, else **stop and show** the user what broke. Re-verify after a fix.
   - `RESULT: blocked` (mobile-mcp absent, no device, won't install) → **stop and ask** the user; don't silently mark verified.
3. Never claim a task works without the verifier's evidence when verify is enabled.

## 4. Report + hand off to feedback

- **Show** on-screen summary: what built, files/folders touched, key decisions, test + review results.
- **Save** caveman-compressed report to `.whackagent/reports/<slug>.md` (what / files / decisions / tests / review verdict / task link).
- Set task `status: review`. Invite user to look and send notes — **`/wa-feedback`**.
- **Iteration is `/wa-feedback`'s job, not yours.** User comes back with changes → invoke the **wa-feedback** skill and follow it. Do **not** patch code from this thread: conventions live in the subagents' context, not here, and an unreviewed touch-up undoes the review you just ran.
- On user **validation**: set task `status: done`, reflect in `BACKLOG.md`.

## Asking

Any question you put to the user — a `BLOCKED:` from a subagent, an architecture fork, a verify failure needing a call — **always carries your recommended answer** plus the one-line reason. Never relay a bare `BLOCKED:` question: read it, form an opinion, propose it. Same rule as `/wa-task`'s grill.

## Never

Never commit in normal flow — user validates first. Never let subagents touch backlog/wiki/reports — you own those here. Never hand-edit code after the review phase — that's `/wa-feedback`.

## Next step

Notes on what got built → **`/wa-feedback`**. After validation, suggest **`/wa-wiki`** to update wiki + code graph for what changed.