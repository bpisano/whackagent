---
name: wa-review
description: Make a code review. --fix to autofix.
---

# /wa-review

Standalone review — audit existing code, diff, or whole project. Same engine as `/wa-code` verify phase, usable anywhere.

Wording (screen + reports): **wa-board → Voice** — telegraphic, tech terms stay English.

## Scope (argument)

- **`/wa-review`** → current working diff (git diff vs HEAD / staged).
- **`/wa-review <path>`** → that file or directory.
- **`/wa-review <branch>`** → diff of that branch vs base.
- **`/wa-review --all`** → whole project source.

## Conventions

- `.whackagent/config.md` exists: use its `review.modules` + project `{conventions}/` — `paths.conventions`, default `.whackagent/conventions/` (project copies + toggles win).
- No config (fresh existing project): detect language + kind, fall back to plugin defaults in `${CLAUDE_PLUGIN_ROOT}/conventions/` — load `swift/` modules (style, elegance, matching architecture-\*, swiftui if SwiftUI, testing) or single `<lang>.md`. Tell user it run on defaults; suggest `/wa-setup` to customize.

## Do

1. Resolve scope + changed/target files.
2. **Dispatch one **wa-verifier**.** **Note `agentId`** — how later rounds resume it. Pass module paths (`review.modules`), target files **plus diff hunks when scope is diff**, and toggles.
3. **Check `LENSES:` line** — `style`, `elegance`, `structure`, `correctness`, all four ✓; missing one goes back for that lens alone. Then show findings severity-ordered, grouped by lens tag.
4. **Fix?**
   - Default → **report only**. No mutate existing code unasked.
   - `--fix` → dispatch **wa-implementer** in **fix mode** with aggregated findings + conventions dir (tell it: fix only what findings name, re-read style, add no comments), note `agentId`, then re-review. Loop until clean or no progress (cap 3 rounds). `BLOCKED:` → stop and ask.
   - **Rounds 2+ resume same agent by id** instead of respawn — per **`/wa-code` → step 3** (delta only, anti-stale warning, respawn fresh past 3 rounds, fall back to fresh spawn if id lost).
5. If invoked on whackagent task (path is task files), record findings in task `## Review`.

## Lenses

**style** — how written. **elegance** — idiomatic, not C-in-Swift. **structure** — layers, boundaries, naming, file tree. **correctness** — real bugs, and whether code does what it claims. One agent sweep all four: isolated agent cost ~50k tokens context before it read a line, and every lens judge same diff against same rulebook. Cost of one agent: forgetting lens now silent — that what `LENSES:` line is for.

## Note

For in-flow review of task you build, use **`/wa-code`** — its step 3 is same review with autofix on. `/wa-review` is standalone entry point.