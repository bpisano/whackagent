---
name: wa-review
description: Make a code review. --fix to autofix.
---

# /wa-review

Run the parallel review standalone — audit existing code, a diff, or the whole project. Same engine as `/wa-code`'s verify phase, usable anywhere.

## Scope (argument)

- **`/wa-review`** → current working diff (git diff vs HEAD / staged).
- **`/wa-review <path>`** → that file or directory.
- **`/wa-review <branch>`** → diff of that branch vs base.
- **`/wa-review --all`** → whole project source.

## Conventions

- If `.whackagent/config.md` exists: use its `review.modules` + the project's `{conventions}/` — `paths.conventions`, default `.whackagent/conventions/` (project copies + toggles win).
- If not (review on fresh existing project): detect language + kind, fall back to plugin defaults in `${CLAUDE_PLUGIN_ROOT}/conventions/` — load `swift/` modules (style, elegance, matching architecture-\*, swiftui if SwiftUI, testing) or single `<lang>.md`. Tell user it running on defaults; suggest `/wa-setup` to customize.

## Do

1. Resolve scope + changed/target files.
2. **Dispatch one **wa-verifier**.** **Note its `agentId`** — that's how later rounds resume it. Pass the module paths (`review.modules`), the target files **plus the diff hunks when the scope is a diff**, and the toggles.
3. **Check its `LENSES:` line** — `style`, `elegance`, `structure`, `correctness`, all four ✓; a missing one goes back for that lens alone. Then show findings severity-ordered, grouped by lens tag.
4. **Fix?**
   - Default → **report only**. Don't mutate existing code unasked.
   - `--fix` → dispatch **wa-implementer** in **fix mode** with aggregated findings + conventions dir (tell it: fix only what findings name, re-read style, add no comments), note its `agentId`, then re-review. Loop until clean or no progress (cap 3 rounds). A `BLOCKED:` → stop and ask.
   - **Rounds 2+ resume the same agents by id** instead of respawning — per **`/wa-code` → step 3** (delta only, anti-stale warning, respawn fresh past 3 rounds, fall back to a fresh spawn if an id is lost).
5. If invoked on whackagent task (path is task's files), record findings in task's `## Review`.

## Categories

**conventions** — how it's written *and* where it lives: style, idiomatic Swift, layers, boundaries, naming, file tree. **correctness** — real bugs and whether the code does what it claims. Two agents, not five: rule sets that belong together share one, because an isolated agent costs ~50k tokens of context before it reads a line.

## Note

For in-flow review of a task you're building, use **`/wa-code`** — its step 3 is this same review with autofix on. `/wa-review` is the standalone entry point.