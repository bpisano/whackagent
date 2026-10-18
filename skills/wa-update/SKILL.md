---
name: wa-update
description: Brings a project up to the installed plugin version: runs pending migrations, syncs config, modules and board.
---

# /wa-update

Run after a plugin update. Migrates old formats, syncs what the plugin ships. Safe to re-run.

Read: voice, components, tasks, git, store

## Steps

1. **Read config** → **tasks → Config and paths**.
2. **Dirty tree** → say so before the plan. Never stash or move edits.
3. **Detect migrations** — every `migrations/*.md` beside this file, version order (`0.9` < `0.12`). Its `## Detect` matches → one row from its `## Plan`.
4. **Check sync** → **Sync**: one row per drift.
5. **Plan** — one **Plan**: migrations first, then sync. `ok? [y/n] (or skip <n>)`.
   - Nothing → `✅ up to date`, stop.
6. **Apply** in plan order: migration → its `## Apply`, sync row → its **Sync** step.
   - Failure → stop. Rows after it untouched.
7. **Report** — the **Plan** rows, each ✅ / ❌ / skipped, then **Next**.

## Sync

Project vs this plugin version. Runs after migrations: they read keys sync would drop.

1. **Config keys** vs `${CLAUDE_PLUGIN_ROOT}/templates/config.md`:
   - In template, not config → add with default + its comment.
   - In config, not template → remove, name it.
   - Key by key. Never change a value. Rest byte-for-byte.
2. **Modules** — each `review.modules` file vs `${CLAUDE_PLUGIN_ROOT}/conventions/`:
   - Differs → diff summary, copy on yes. Never overwrite silently.
   - `wording/` differs → replace whole. Never **Project voice**, **Voice**, **Validated examples**.
   - `apple/` present: re-export (**wa-setup → First setup** 1), `diff -rq --exclude=SKILL.md` on `swiftui-*`. Differs, folder added or gone → delete `swiftui-*` (read-only), copy whole. Only `SKILL.md` differs, or no Xcode 27 → no row.
   - No `{conventions}/glossary.md` → copy `${CLAUDE_PLUGIN_ROOT}/templates/glossary.md`, add to `review.modules`.
   - No `{conventions}/pr.md`, no `.github/pull_request_template.md` → copy `${CLAUDE_PLUGIN_ROOT}/templates/pr.md`.
   - Glossary `## Rules` ≠ template's → replace that section only. Rows never touched.
   - UI project, no `wording.md` → ask **wa-setup → Questions** 11, copy per **wa-setup → Scaffold**.
   - `apple.md` / `wording.md` never without their folder.
3. **GitHub** (`github` only), helper → **store-github → Helper**:
   - Hook on default branch, `template version:` < `${CLAUDE_PLUGIN_ROOT}/templates/github-board.yml` → update PR per **wa-setup → GitHub scaffold** 3.
   - `WA_PROJECT_TOKEN` not in `gh secret list` → **wa-setup → GitHub scaffold** 4.
   - `github-board config --refresh` differs → refresh.
   - `provision --project <n>`: missing states → add. Extras → name, ask, `--prune-status` on yes.

## Never

- Never change a config value: keys added or removed only.
- Never overwrite a user-edited module or file without diff + yes.
- Never run a migration whose `## Detect` doesn't match.
- Never commit, except where a migration or the hook PR says so.
- Never ask setup questions beyond a new module: that's `/wa-setup`.

## Ask

- A migration hits a case its file doesn't cover → stop that row, ask.

## Next

- Changes made → `→ next: review the diff, commit`.
- Up to date → `→ next: /wa-board`.
- Failure → fix, re-run `/wa-update`.
