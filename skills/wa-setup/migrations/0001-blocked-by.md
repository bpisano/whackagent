# 0001 · blocked_by

Local `depend` once wrote free text `note: Depends on <x>`, read by no skill. Now frontmatter `blocked_by: [<slug>, …]` (**reference/blockers.md**). Local provider only: GitHub dependencies already live in issue relationships.

## Detect

`backlog.provider: local` (or key missing), and any `{tasks}/*.md` not `done`/`canceled` whose `note:` says `Depends on <x>` with `<x>` a known slug (`{tasks}/<x>.md` exists) not yet in its `blocked_by:`.

## Plan

`0001 blocked_by : <n> tasks — note "Depends on" → blocked_by:` (recommended: yes — board, `/wa-code`, `/wa-autopilot`, prioritization start acting on them), then one line each: `sync-offline ← login-apple`. Name matching no task → listed `? sync-offline: "Depends on the new API"`, left as text.

## Apply

Each detected task file, frontmatter only:

1. Matched slugs → `blocked_by:` inline list, under `note:`. Line exists → append, no duplicate, existing entries kept.
2. Remove matched `Depends on …` part from `note:`. Rest of note kept verbatim; nothing left → `note:` empty.
3. Unmatched names stay in `note:` untouched. Body, other fields, `{backlog}` untouched.
