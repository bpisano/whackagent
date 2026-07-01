---
name: wa-review
description: Make a code review. --fix to autofix.
---

# /wa-review

Run 5-category parallel review standalone — audit existing code, diff, or whole project. Same engine as `/wa-code` review phase, usable anywhere.

## Scope (argument)

- **`/wa-review`** → current working diff (git diff vs HEAD / staged).
- **`/wa-review <path>`** → that file or directory.
- **`/wa-review <branch>`** → diff of that branch vs base.
- **`/wa-review --all`** → whole project source.

## Conventions

- If `.whackagent/` exists: use `review.categories` + project's `.whackagent/conventions/` (project copies + toggles win).
- If not (review on fresh existing project): detect language + kind, fall back to plugin defaults in `${CLAUDE_PLUGIN_ROOT}/conventions/` — load `swift/` modules (style, elegance, matching architecture-\*, swiftui if SwiftUI, testing) or single `<lang>.md`. Tell user it running on defaults; suggest `/wa-setup` to customize.

## Do

1. Resolve scope + changed/target files.
2. **Fan out, parallel** — one **wa-reviewer** per category: `style`, `elegance`, `architecture`, `arborescence`, `correctness`. Pass each its `category`, its module path(s) only, target files, toggles. Each loads only its module → focused, forgets nothing.
3. **Aggregate** into one severity-ordered list, tagged by category; dedupe. Show grouped by category.
4. **Fix?**
   - Default → **report only**. Don't mutate existing code unasked.
   - `--fix` → spawn **wa-implementer** in **fix mode** with aggregated findings + conventions dir (tell it: fix only what findings name, re-read style, add no comments), then re-review. Loop until clean or no progress (cap 3 rounds). A `BLOCKED:` → stop and ask.
5. If invoked on whackagent task (path is task's files), record findings in task's `## Review`.

## Categories

style · elegance (idiomatic Swift, not C-in-Swift) · architecture (design/layers/boundaries) · arborescence (file tree) · correctness (real bugs). One reviewer each so big rule sets never half-remembered.

## Note

For in-flow review of task you building, use **`/wa-code`** — its phase 3 is this same review with autofix on. `/wa-review` is standalone entry point.