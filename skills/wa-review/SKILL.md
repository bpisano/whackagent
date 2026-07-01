---
name: wa-review
description: Make a code review. --fix to autofix.
---

# /wa-review

Run the 5-category parallel review on its own — for auditing existing code, a diff, or a whole project. Same engine as `/wa-code`'s review phase, usable anywhere.

## Scope (argument)

- **`/wa-review`** → the current working diff (git diff vs HEAD / staged).
- **`/wa-review <path>`** → that file or directory.
- **`/wa-review <branch>`** → the diff of that branch vs the base.
- **`/wa-review --all`** → the whole project source.

## Conventions

- If `.whackagent/` exists: use `review.categories` + the project's `.whackagent/conventions/` (the project copies + toggles win).
- If not (review on a fresh existing project): detect the language + kind and fall back to the plugin defaults in `${CLAUDE_PLUGIN_ROOT}/conventions/` — load `swift/` modules (style, elegance, the matching architecture-\*, swiftui if SwiftUI, testing) or the single `<lang>.md`. Tell the user it's running on defaults; suggest `/wa-setup` to customize.

## Do

1. Resolve the scope + the changed/target files.
2. **Fan out, in parallel** — one **wa-reviewer** per category: `style`, `elegance`, `architecture`, `arborescence`, `correctness`. Pass each its `category`, its module path(s) only, the target files, and toggles. Each loads only its module → focused, forgets nothing.
3. **Aggregate** into one severity-ordered list, tagged by category; dedupe. Show it grouped by category.
4. **Fix?**
   - Default → **report only**. Don't mutate existing code unasked.
   - `--fix` → spawn **wa-implementer** in **fix mode** with the aggregated findings + conventions dir (tell it: fix only what findings name, re-read style, add no comments), then re-review. Loop until clean or no progress (cap 3 rounds). A `BLOCKED:` → stop and ask.
5. If invoked on a whackagent task (path is a task's files), record findings in the task's `## Review`.

## Categories

style · elegance (idiomatic Swift, not C-in-Swift) · architecture (design/layers/boundaries) · arborescence (file tree) · correctness (real bugs). One reviewer each so big rule sets never get half-remembered.

## Note

For the in-flow review of a task you're building, use **`/wa-code`** — its phase 3 is this same review with autofix on. `/wa-review` is the standalone entry point.
