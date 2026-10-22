# PR

Every PR whackagent opens or edits. Read by teammates who never saw the task. **voice** applies.

## Language

`pr_language` (empty → `discussion_language`): title, body, headings. `Closes` stays English.

## Titles

- **Task PR title** = task title as-is. `pr_title_prefix: true` → commit prefix first (`fix: Crash on map zoom`), for squash merges.
- **Label** = task type. Sprint PR → every type of its tasks.
- **Sprint PR title** = area, 1–3 words (`Login`, `Map performance`). No verb, number, em-dash, colon or list. Wider change → more generic word.

## Body

- Template = `.github/pull_request_template.md` if the repo has one, else `{conventions}/pr.md`. Fill it as-is: sections, order, `Closes` last. ≤ 20 lines.
- **Rewritten whole** at every write: end state, never round history ("after feedback").
- **Sprint PR** sums up the sprint: never one bullet per task.
- No task slugs, sprint jargon, verifier rounds, test counts, process section, follow-up list.
- Before `gh pr create` / `gh pr edit` → drop any `🤖`, `Generated with`, `Co-Authored-By` line.

## Changes

One change a line, glossary terms, sorted by type:

| type | en | fr |
|---|---|---|
| new | `Add …` | `Ajout de …` |
| behavior changed | `Change … : <before → after>` | `Modification de … : …` |
| bug | `Fix …` | `Correction de …` |
| gone | `Remove …` | `Suppression de …` |
| measured perf / UX | `Improve … : <measure>` | `Amélioration de … : <mesure>` |

- Other language → same five, native words. Nothing fits → plain line, rare.
- Words the user sees, not `debounce` / `backoff`. Why, not how.
- `Improve` only with a measure.

## Screenshots

`pr_screenshots.mode: auto` + `verify.platform` set + a PR in the flow (`board`, or `close.strategy: pr`). Else none, section dropped.

- Independent of `verify.mode`: `autopilot` / `off` gate runtime checks, never shots.

- **Capture** — task review clean → one `wa-screenshot`. Inputs: task file, diff, `merge-base`, `verify.platform`, glossary **Screens** / **Parts**, out dir `{reports}/<key>/shots/`.
  - Cached with its sha. Later delta touches a shot screen → re-shoot that screen only.
  - No screen touched → none.
- **Section** `## Screenshots`, after `## Changes`, even if the template lacks it. Caption = glossary screen name.
  - New screen → images in a row.
  - Changed screen → `| Before | After |` table, one row a state. State absent before → `—`.
- **Upload**, two passes:
  1. Body with `![<Screen> <state>](./<file>.png)` in place → `gh pr edit <pr> --body-file … --attach <file>…` (`gh pr create` at `/wa-close`). Paths rewritten to `user-attachments` URLs.
  2. Each `![alt](url)` → `<img src="url" width="<pr_screenshots.width>" alt="alt">` → `gh pr edit --body-file`.
  - Body rewrite → keep uploaded URLs, attach new shots only.
- **Sprint PR** → reuse task PR URLs: per screen, first task's before, last task's after. No capture, no upload.
- **Failure** never blocks (build, sim, `gh` < 2.102, `--attach` non-zero). Keep what uploaded, never half a pair. **Warning** + **components → Shots**.
- No confirm before upload. Never a shot from the sprint test branch.

## Example

```md
Les mails des 30 derniers jours sont lisibles hors ligne.

## Changes
- Ajout du téléchargement du contenu des mails de l'Inbox (≤ 30 jours) pendant la Sync
- Modification de l'écran de mail : contenu local d'abord, sinon téléchargement

## To test
- [ ] Mode avion → un mail récent s'ouvre

Closes #53
```
