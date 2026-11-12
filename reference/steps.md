# Steps

Task history rewritten as build steps at close, read like a build manual. Each `Changes` line = one step = one commit. `commit.steps: off` → none of this: round commits, `Changes` by type, signals per file.

## Step

- Build order, bottom up: each step stands on the previous ones and builds alone.
- Order: generated files (`chore:`, alone) → moves and renames, no behavior change (`refactor:`) → behavior, lowest layer first → `docs:` last.
- Tests in the step of their code.
- One step = one line a reviewer understands. Can't name it in one line → split.
- ≤ 8 steps. Over → merge neighbors, never past 8.
- Start from the bricks of `## Implementation`.

## Message

```
refactor: Renommage des lignes répétitions en lignes éditables

Déplacement seul, aucun changement de logique.
Prépare la case Distance dans la même ligne.
```

- Subject = `<prefix>: <Changes line>`, `pr_language`, ≤ 60 chars. Prefix per step: `feat` · `fix` · `refactor` · `test` · `chore` · `docs`.
- Body 1–3 lines: what it brings, what to watch in review (`Déplacement seul`). **voice** applies.
- No number, no task slug. Author → **git → Commits**.

## Docs commit

Task file, wiki pages in the repo, reports → one last commit `docs: <Changes word for docs>`. Only commit without code, never built, never a `Changes` line.

## Split

At `/wa-close`, once, code frozen: after the close commit (and rebase), before push, PR ready, `gh pr create` or sprint merge.

1. One `wa-commit-split`. Inputs: task file, base (stack point if stacked), `HEAD` sha, `build.command`, `pr_language`, task type.
2. Returns `STEPS` → check `git diff <old HEAD> <new tip>` empty. Empty → `git reset --hard <new tip>` on the task branch, delete `wa-split/<key>`. Not empty → keep old history, **Warning**.
3. Returns `FALLBACK` → keep old history, **Warning** with its reason. Never blocks the close.
4. Pushed before → `--force-with-lease`, own task branch only.
5. Round after close (PR back to draft) → new commits stack, next close splits again.

Tree identical = `## Review` still valid: code unchanged.

## Changes

- Construction order, never by type. Line text = commit subject without prefix (`Ajout du nettoyage de la saisie Distance`).
- Signals per commit: `pr-check signals <base-branch> --steps`. Step with signals → fold (**how-it-works**). No signal, or `refactor` / `chore` / `docs` → plain `- ` line.
- Check: `pr-check check <body.md> <base-branch> --steps`: one line per code commit, same order, fold when signals.
- Fold **Read** links point to the commit diff: `pull/<n>/commits/<sha>#diff-<sha256(path)>R<line>`.
- Draft before close (round commits): lines from planned bricks, no commit links.

## Sprint PR

One fold more: task → its steps → each step's fold.

````md
<dl><dd><details>
<summary>Ajout du tableau Distance (#1377)</summary>
<dl><dd><br>

- Mise à jour des traductions depuis Loco
- Renommage des lignes répétitions en lignes éditables : déplacement seul

<dl><dd><details>
<summary>Ajout du nettoyage de la saisie Distance</summary>
…
</details></dd></dl>

</dd></dl>
</details></dd></dl>
````

- Task fold content = its task PR `Changes`, copied as is (commit links stay valid). Order = merge order into the sprint branch.
- `files` without task PR → write that task's `Changes` now, same rules.
- Sprint never re-split: tasks were split at their close, merged without squash.
