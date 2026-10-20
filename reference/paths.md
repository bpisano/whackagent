## Paths

Every whackagent skill writes `{backlog}` `{tasks}` `{wiki}` `{reports}` `{conventions}` `{worktrees}` instead of literal folder. They resolve from `paths:` in `.whackagent/config.md`, read at step 1 — project may keep wiki in `docs/wiki/` so team that doesn't run whackagent still read it.

- **Key missing → the default** (`.whackagent/BACKLOG.md`, `.whackagent/tasks`, `.whackagent/wiki`, `.whackagent/reports`, `.whackagent/conventions`, `../<repo>-worktrees`). Config written before `paths:` existed keep working untouched.
- **Relative resolves from repo root**, not cwd. Absolute paths resolve, but never user-specific ones (`/Users/<name>`, `/home/<name>`, `~`) — config versioned, shared.
- **`.whackagent/config.md` is the one fixed path** — it carry the others.
- Path points at nothing → say which key and what it points at, suggest `/wa-setup`. Never fall back to `.whackagent/` behind user back, never create folder somewhere else: wiki silently written to default is wiki team never sees.
