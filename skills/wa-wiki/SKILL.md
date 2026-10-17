---
name: wa-wiki
description: Answers from the project wiki. No argument: syncs the wiki with recent changes.
---

# /wa-wiki

No arg → **update**: sync `{wiki}` with changes. Arg → **query**: answer from the wiki.

Read: voice, tasks, git

## Steps

1. **Read config** → **tasks → Config and paths**. Write `{wiki}` where it points, never the default.
2. **Pick the mode.**
   - No arg → **Update**.
   - `<feature or question>` → **Query**.

## Update

1. **Scope.**
   - Called by `/wa-close` → that task only: its diff, `wiki:` field, report.
   - Manual → recent `done` tasks, latest `{reports}/*.md`, git diff since last sync.
2. **Write** pages under `{wiki}/`:
   - Reflect new or changed behavior in the right `[[page]]`.
   - Cross-link wiki↔wiki, link the task where useful.
   - Create every page a task's `wiki:` flagged missing.
   - Narrative (why + shape), never a code dump.
3. **Compress** — only if `compress_wiki: true`:
   - Run **caveman-compress** on each page written, delete its `*.original.md`.
   - Never `pitch.md`.
   - `{wiki}` outside `.whackagent/` → say it once, recommend `compress_wiki: false`.
4. **Commit.**
   - Called by `/wa-close` → never: it commits pages with the code.
   - Manual → only if `commit.auto_commit_after_validation: true` and task is `to-close` or `done`. Author → **git → Commits**.
   - Else leave it uncommitted.

## Query

Read-only.

1. Search `{wiki}/` pages, follow `[[links]]`.
2. Wiki thin → targeted Grep/Glob in source, scoped to the ask. Never a full-tree scan.
3. Answer short, synthesized. Cite `[[page]]` and task ids used. Never dump files.

## Never

- Never commit unvalidated work outside autopilot.
- Never edit files in query mode.

## Ask

- Unsure which page a change belongs to → ask. Never scatter duplicates.

## Next

- Manual update → `→ next: /wa-board`.
- Inside `/wa-close` → back to `/wa-close`.
