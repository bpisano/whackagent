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
