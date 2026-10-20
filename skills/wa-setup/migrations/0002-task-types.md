# 0002 · Task types

Optional backfill: open tasks created before `type:` existed get one (`feature`, `improvement`, `bug`, `refactor` — **reference/task-types.md**). Local provider only: GitHub task files live on ticket branches, next grill sets it there.

## Detect

`backlog.provider: local` (or key missing), and any `{tasks}/*.md` not `done`/`canceled` with **no `type:` line** in frontmatter. Line present, even empty = already decided, no match.

## Plan

`0002 task types : <n> typed from title, <m> to pick`, one line each, recommended type first, ambiguous ones `?`: `login-apple → feature` · `sync-offline → improvement?`. Three answers:

- `yes` (recommended: commit prefix and PR label follow type, one-word fix per line) → types as shown, user edits any line first.
- `empty` → `type:` line written empty: inferred as before, never offered again.
- `skip` → nothing written, offered again next reconfigure.

## Apply

1. Each detected task: `type: <t>` (or `type:` on `empty`) under `size:`.
2. Titles never rewritten here, slug never moves. `done`, `canceled`, body, `{backlog}` untouched.
