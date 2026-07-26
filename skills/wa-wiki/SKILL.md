---
name: wa-wiki
description: Keep the wiki up to date, or look up project knowledge. /wa-wiki updates, /wa-wiki <query> answers.
---

# /wa-wiki

Two modes, picked by argument.

- **`/wa-wiki`** (no arg) → **update** mode: sync wiki with changes.
- **`/wa-wiki <feature or question>`** → **query** mode: look up project knowledge, answer.

Read `.whackagent/config.md` first.

## Update mode — `/wa-wiki`

Task status + report handled by `/wa-code`. This step keep shared knowledge true.

1. **Figure out what changed** — recent `done` tasks, latest `.whackagent/reports/*.md`, and/or git diff since last sync.
2. **Wiki.** Update or create affected pages:
   - Reflect new/changed behavior in relevant `[[page]]`(s).
   - Cross-link: wiki↔wiki, link task where useful.
   - Create any page a task's `wiki:` flagged missing.
   - Keep narrative (*why* + shape), not code dump.
   - **Compress** (if `compress_wiki: true`): run **caveman-compress** on each page written, then delete `*.original.md` backup. Wiki only.
3. **Commit (only if allowed).** If `commit.auto_commit_after_validation: true` AND user validated feature, commit with configured author name/email — **never** as Claude. Else leave it. Outside autopilot, never commit unvalidated work.

Stop and ask if can't tell which page a change belongs to — don't scatter duplicates.

## Query mode — `/wa-wiki <feature or question>`

Read-only. Answer what user asked about project.

1. Search wiki pages (`.whackagent/wiki/`) for matching content; follow `[[links]]` — wiki first, it's the cheap answer.
2. Wiki thin on it → targeted Grep/Glob in the source, scoped to what was asked. No full-tree scan.
3. Answer concise, cite pages + related tasks used (`[[page]]`, task slugs). Don't dump whole files — synthesize.

## Next step

After update mode: suggest **`/wa-board`** for next task.