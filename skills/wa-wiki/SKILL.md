---
name: wa-wiki
description: Keep the wiki up to date, or look up project knowledge. /wa-wiki updates, /wa-wiki <query> answers.
---

# /wa-wiki

Two modes, picked by argument.

- **`/wa-wiki`** (no arg) → **update** mode: sync wiki with changes.
- **`/wa-wiki <feature or question>`** → **query** mode: look up project knowledge, answer.

Read `.whackagent/config.md` first — its `paths:` block says where `{wiki}` and `{reports}` actually live (see **wa-board → Paths**). The wiki is the path most often moved out of `.whackagent/`, precisely so a team can read it: write there, never to the default.

## Update mode — `/wa-wiki`

Task status + report handled by `/wa-code`. This step keep shared knowledge true.

1. **Figure out what changed** — recent `done` tasks, latest `{reports}/*.md`, and/or git diff since last sync.
2. **Wiki.** Update or create affected pages, under `{wiki}/`:
   - Reflect new/changed behavior in relevant `[[page]]`(s).
   - Cross-link: wiki↔wiki, link task where useful.
   - Create any page a task's `wiki:` flagged missing.
   - Keep narrative (*why* + shape), not code dump.
   - **Compress** (if `compress_wiki: true`): run **caveman-compress** on each page written, then delete `*.original.md` backup. Wiki only. **`{wiki}` outside `.whackagent/` → say it once and recommend `compress_wiki: false`**: a wiki moved into the project tree is one humans read, and caveman prose buys tokens at their expense.
3. **Commit (only if allowed).** If `commit.auto_commit_after_validation: true` AND the task is `validated` or `done` (i.e. it went through `/wa-validate`), commit with configured author name/email — **never** as Claude. Else leave it. Outside autopilot, never commit unvalidated work.

Stop and ask if can't tell which page a change belongs to — don't scatter duplicates.

## Query mode — `/wa-wiki <feature or question>`

Read-only. Answer what user asked about project.

1. Search wiki pages (`{wiki}/`) for matching content; follow `[[links]]` — wiki first, it's the cheap answer.
2. Wiki thin on it → targeted Grep/Glob in the source, scoped to what was asked. No full-tree scan.
3. Answer concise, cite pages + related tasks used (`[[page]]`, task slugs). Don't dump whole files — synthesize.

## Next step

After update mode: suggest **`/wa-board`** for next task.