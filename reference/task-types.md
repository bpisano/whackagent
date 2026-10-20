## Task types

Optional task field `type:`, one per task. Canonical, every skill. Drives commit prefix, PR kind label, title verb — nothing else (no state, no branch, no board field).

**Test**: behavior exists today? No → `feature`. Yes, broken → `bug`. Yes, works, user sees change → `improvement`. User sees no difference → `refactor`.

| type | title verb hint | commit prefix (Conventional repos) | PR kind label (repo's own) |
|---|---|---|---|
| `feature` | `Add …` or bare noun | `feat:` | feature, enhancement |
| `improvement` | `Improve`, `Speed up`, `Change` | `feat:` (`perf:` when measured) | enhancement, improvement |
| `bug` | `Fix …` | `fix:` | bug, fix |
| `refactor` | `Split`, `Move`, `Upgrade`, `Remove` | `refactor:` (`chore:` deps/CI, `docs:` docs only) | refactor, chore, tech-debt |

- **Missing or empty → today's behavior**: prefix, label, title inferred from change, as before. Task file without `type:` never blocked, never rewritten on its own.
- **Set by `/wa-task`** at creation — inferred from request, echoed `→ type bug`, user corrects any time (one word). Unclear → leave empty, grill settles it. **Refined by `/wa-grill`** (test above, on what grill surfaced). Split child → its own type. Old tasks → optional backfill (`/wa-setup` reconfigure, migration `0002-task-types`).
- **Where** — local: task frontmatter, under `size:`. GitHub: task file frontmatter on ticket branch (whackagent-only, like `phase:`). Never tracker field, label or issue body. Ticket without task file yet (`/wa-task` create) → type not stored: first round writing task file (`/wa-grill`, or spec copied from issue body) infers it, echoes it.
- **Title contradicts type** (`Fix …` on `feature`) → fix title (**reference/voice.md → Titles and summaries**), not type. Slug stays.
- **Commit** — repo uses Conventional Commits (log, CLAUDE.md, `pr.doc`) → prefix from table, scope per repo habit. Other convention → type ignored. Fixed `task: …` prefixes untouched (**reference/commits.md**).
- **PR label** — kind label = repo label matching type (name + description, table above as hint). None matches → kind picked as before. Never create one (**reference/pull-requests.md**, *Labels*).
