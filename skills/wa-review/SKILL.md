---
name: wa-review
description: Reviews any code, outside a task. --fix applies the fixes.
---

# /wa-review

Standalone review of any code, same engine as **wa-code → Verify**. Report only, unless `--fix`.

Read: voice, components, tasks, store

## Steps

1. **Resolve scope** from the arg, then target files:
   - none → working diff vs HEAD (staged included)
   - `<path>` → that file or directory
   - `<branch>` → its diff vs base
   - `--all` → whole project source
2. **Load conventions.**
   - Config exists → `review.modules` + `{conventions}/` (**tasks → Config and paths**). Project copies and toggles win.
   - No config → run anyway, on plugin defaults: overrides **tasks → Config and paths** "missing → stop". Detect language + kind, use `${CLAUDE_PLUGIN_ROOT}/conventions/`:
     - Swift → `swift/` style, elegance, matching `architecture-*`, `swiftui` if SwiftUI, testing.
     - Else → single `<lang>.md`.
     - Say it ran on defaults, suggest `/wa-setup`.
3. **Verify** — only dispatch, payload and resume of **wa-code → Verify** apply. No BRIEF, no task ref. Never autofix from `review.autofix`.
   - One **wa-verifier**, note `agentId`.
   - Pass module paths, target files, toggles. Diff scope → diff hunks too.
   - `LENSES:` needs `style`, `elegance`, `structure`, `correctness` ✓. Missing one → send it back for that lens alone.
4. **Show** **Findings**, severity first, grouped by lens tag.
5. **Fix** — only with `--fix`:
   - Dispatch **wa-implementer** in fix mode: findings + conventions dir. Fix only what findings name, re-read style, no comments. Note `agentId`.
   - Re-review, resume both agents by `agentId`.
   - Loop until clean or no progress, cap 3 rounds.
   - `BLOCKED:` → stop, ask.
6. **Task files in scope** → write findings in that task's `## Review` (**store → write sections**).

## Never

- Never edit code without `--fix`.
- Never a lens skipped: one agent sweeps all four.

## Next

- Findings left → `→ next: /wa-review --fix`, else `/wa-board`.
- Reviewing a task in flow → `/wa-code` (autofix on).
