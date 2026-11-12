# PR

Every PR whackagent opens or edits. Read by teammates who never saw the task. **voice** applies.

## Language

`pr_language` (empty → `discussion_language`): title, body, every heading and label, the template's too (`Changes` → `Changements`, `To test` → `À tester`). `Closes` and code stay English.

## Titles

- **Task PR title** = task title as-is. `pr_title_prefix: true` → commit prefix first (`fix: Crash on map zoom`), for squash merges.
- **Label** = task type. Sprint PR → every type of its tasks.
- **Sprint PR title** = area, 1–3 words (`Login`, `Map performance`). No verb, number, em-dash, colon or list. Wider change → more generic word.

## Body

- Template = `.github/pull_request_template.md` if the repo has one, else `{conventions}/pr.md`. Fill it as-is: sections, order (headings translated), `Closes` last (`plane`: **store → Other**). ≤ 20 lines, folds aside.
- **Rewritten whole** at every write: end state, never round history ("after feedback").
- **Sprint PR**: intro sums up the sprint, `Changes` → **steps → Sprint PR**.
- No task slugs, sprint jargon, verifier rounds, test counts, process section, follow-up list.
- Before `gh pr create` / `gh pr edit` → drop any `🤖`, `Generated with`, `Co-Authored-By` line, then **how-it-works → Check** green.

## Changes

One change a line, glossary terms. `commit.steps: on` → one line a step, build order (**steps → Changes**). Else by type:

| type | en | fr |
|---|---|---|
| new | `Add …` | `Ajout de …` |
| behavior changed | `Change … : <before → after>` | `Modification de … : …` |
| bug | `Fix …` | `Correction de …` |
| gone | `Remove …` | `Suppression de …` |
| measured perf / UX | `Improve … : <measure>` | `Amélioration de … : <mesure>` |

- Other language → same five, native words. Nothing fits → plain line.
- Words the user sees, not `debounce` / `backoff`. Why, not how: how → the bullet folds, **how-it-works**.
- `Improve` only with a measure.

## Screenshots

`pr_screenshots.mode: auto` + `verify.platform` set + a PR in the flow (`board`, or `close.strategy: pr`). Else none, section dropped.

- **Capture** — task review clean → one `wa-screenshot`. Inputs: task file, diff, `merge-base`, `verify.platform`, `pr_screenshots.replay`, glossary **Screens** / **Parts**, out dir `{reports}/<key>/shots/`.
  - Cached with its sha, `ShotsTests.swift` too. Later delta touches a shot screen → re-shoot that screen only.
  - No screen touched → none.
- **Section** `## Screenshots`, after `## Changes`, even if the template lacks it. Caption = glossary screen name.
  - New screen → images in a row.
  - Changed screen → `| Before | After |` table, one row a state. State absent before → `—`.
- **Upload** → **shots → Upload**.
- **Components** — `COMPONENTS` shots: same upload, placed per **how-it-works → UI bullet**.
- **Sprint PR** → reuse task PR URLs: per screen, first task's before, last task's after. No capture, no upload.
- **Failure** never blocks (build, sim, `gh` < 2.102, `--attach` non-zero). Keep what uploaded, never half a pair. **Warning** + **components → Shots**.
- No confirm before upload. Never a shot from the sprint test branch.

## To test

- Each group of checks starts with its path: plain line, no bullet, no emoji, first screen after launch → screen to test: `Onglet Entraînement → Créer une séance → Séries`.
- Path read in the code (tab, push, sheet). Words on screen, glossary **Screens** first. Several ways in → shortest.
- One group per area, app order. No screen → last group, no path.

## How it works

→ **how-it-works**.

## Vocabulary

Term a dev new to the PR may not know, in a bullet fold → numbered, defined in one fold.

- Yes: concept named in the code (borrow, idle, waiters), rare trade word (watchdog), non-obvious protocol command (EXAMINE). No: common dev words (retry, timeout, LOGIN), glossary terms, types of an Overview.
- First prose occurrence only, never in code. ≤ 8 a PR, central mechanism first.
- Mark: `watchdog<sup><a href="#user-content-watchdog">1</a></sup>`, appearance order.
- `## Vocabulary` (`Vocabulaire`) after `## Notes`, before `Closes`, even if the template lacks it. Under it `<details><summary>7 terms</summary>`, one numbered line each: `1. <a id="watchdog"></a>**watchdog** : …`.
- Definition, ≤ 30 words:
  1. `<term> : <category> that <difference>`, no article: `**borrow** : appel qui sort une session du pool`. Never the term itself, no other unknown word.
  2. One context: where and whose (`IMAPSessionPool.borrowSession`, called by `withSession`), or why it exists.
  - A code name always.

## Example

````md
Les mails des 30 derniers jours sont lisibles hors ligne.

## Changements
<dl><dd><details>
<summary>Modification de l'écran de mail : contenu local d'abord, sinon téléchargement</summary>
<dl><dd><br>

…

</dd></dl>
</details></dd></dl>

## À tester
Inbox → un mail de la semaine

- [ ] Mode avion → le mail s'ouvre

Closes #53
````
