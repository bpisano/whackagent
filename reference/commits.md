## Commits

Canonical, every commit whackagent makes: `/wa-close`, `/wa-autopilot`, `/wa-release`, every GitHub provider round (`/wa-grill`, `/wa-code`, `/wa-feedback`, `/wa-validate`, `/wa-close`). Skill says *when* to commit and *what* goes in; this file says *who* and *how*.

One exception, outside this file: **test branch merges** (`/wa-code`, `/wa-feedback`, `/wa-validate`, `/wa-autopilot`, `/wa-close`, `branch.test_branch: true`). Plain `git merge` commits on local, never-pushed `wa-test/…` only, machine's git identity: not task work, never pushed or landed (**reference/test-branch.md**).

- **Author** — `commit.author_name` / `commit.author_email` from config when set (shared identity only, team bot). Empty (default) → machine's git identity (`git config user.name` / `user.email` at commit time). Identity unset there too → stop, say so: never invent one. **Never as Claude.**
- **Message** — repo's convention (project rules: CLAUDE.md, `pr.doc`; release commits: release doc first). Conventional Commits repo + task `type:` set → prefix from `${CLAUDE_PLUGIN_ROOT}/reference/task-types.md`; no `type:` → inferred from change, as before. One exception, GitHub provider task-file commits: fixed prefix `task: grill #<n> <slug>`, `task: re-grill #<n> <slug>`, `task: spec #<n> <slug>` (**wa-grill → GitHub provider**, **reference/provider-github.md**, *Spec in issue body*). Never reword them: ticket range greps them (**reference/provider-github.md**, *Squash merge*).
- **Trailers** (`Co-Authored-By`, `Generated with …`) — whackagent adds none of its own. Project rules (CLAUDE.md, `pr.doc`) and host's settings decide: follow them, nothing more.
