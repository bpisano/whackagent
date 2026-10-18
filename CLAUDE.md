# whackagent — authoring rules

Plugin of skills (`skills/`), agents (`agents/`), shared rules (`reference/`). Every edit keeps these true. `scripts/lint-skills` checks them: run it before every commit, green or no commit.

## One rule, one place

- Shared rules live in `reference/`, one topic per file:
  - `voice.md` — how to write (output, words, glossary, learning, titles)
  - `pr.md` — PR titles, body, changes patterns
  - `components.md` — every shape shown to the user
  - `tasks.md` — config, paths, states, ids, sprints, blockers
  - `git.md` — commits, branches, test branch, stacking
  - `store-files.md` / `store-github.md` — task operations per backend
- `reference/` is read at runtime: rules for running a skill only. Rules for writing one → here.
- A skill **cites** a rule (`→ **git → Stacking**`), never restates it.
- Rule used by one skill only → stays in that skill.
- `conventions/` and `templates/` are copied into user projects: not authoring rules, never cite `reference/` from them.

## Skill template

```md
---
name: wa-x
description: <one sentence, action verb>
---

# /wa-x

<1–2 lines: role + result.>

Read: voice, components, tasks, store      ← reference/ files this skill needs

## Steps
1. **<Verb>** — …
   - sub-cases as bullets

## <Named block>     ← only for a step past ~10 lines, cited from it

## Never
- one hard rule per line

## Ask
- when to stop and ask (optional)

## Next
- next command, per case
```

- `Read:` names files in `${CLAUDE_PLUGIN_ROOT}/reference/`. `store` = `store-<tasks.backend>.md`.
- No other sections. No "why" for humans: that goes in `README.md`.

**Agent template**: frontmatter, `# <name>`, 1–2 lines, `## Inputs`, `## Steps`, named blocks (cited from a step), `## Never`, `## Return`.

## Budgets

| file | max words |
|---|---|
| skill | 1 200 |
| `wa-setup` | 2 000 |
| agent | 800 |
| `reference/*` | 800 |
| `reference/components.md` | 1 000 |
| migration | 400 |

Over budget → cut elsewhere before adding.

## Output

- Every shape the user sees is a component of `reference/components.md`. Never an inline format in a skill.
- New display need → add the component first, then cite it.
- Same vocabulary everywhere: `⛔ #12`, `🔒 <owner> <age>`, `⇡ #42`, `→ next:`.

## Writing skills

- `reference/voice.md` applies to skill text too: telegraphic, bullets, short words.
- Cut before adding. Delete any line that restates a reference, re-explains the flow, or describes default model behavior.
- Imperative, second person implied: `Read the task.`, not `You should read`.
- English, examples too. Real names (`#42 Add Apple login`), shortest that shows the point.

## Migrations

A change to what's stored in a user project → a migration, same commit.

- Stored = config keys, task file (states, fields, headings), backlog, GitHub board, hook, files copied from `conventions/` or `templates/`.
- Config key added or removed, module or hook changed → nothing to write: **wa-update → Sync** catches it. Value renamed or reshaped → migration first (sync drops unknown keys).
- One file: `skills/wa-update/migrations/<version>-<name>.md`, version = the release that changes the format.

```md
# 0.12 · Lifecycle

<one line: what changed>

## Detect      ← matches only while not migrated: re-run safe
## Plan        ← one Plan row: `<version> <name> : <what>`
## Apply
```

- A skill hitting an old format → `→ next: /wa-update`, stop. Never alias it.
- Delete a migration once no project can still need it, never before.

## Release

- Bump `version` in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.
- Behavior change → update `README.md`.
- Stored format changed → migration added (**Migrations**).
- Commit `feat:` / `fix:` / `refactor:` + summary + `vX.Y.Z`. Push on `main`.
