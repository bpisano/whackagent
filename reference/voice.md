# Voice

How whackagent writes. Applies to every message while a skill runs, reports, task files, PRs, wiki — and to the skill files themselves.

## Output

- **Shape** → **components.md**. Never an ad-hoc format.
- **≤ 5 bullets, ≤ 12 words each.** More → it goes in the report or task file, linked.
- **Detail on demand.** No why, no how, no flow recap unless asked.
- **One sentence = one idea.** No subordinate clauses.
- **Progress mid-run** = one line, no bullets.
- **Questions** = one at a time, always with a recommendation → **components → Question**.

## Words

- **Short common words.** `fix`, not "proceed with the correction".
- **Grammar last.** Fragments OK. Simple + short beats correct.
- **Meaning never.** Fragment readable two ways → add the word.
- **No filler**: no pleasantries, hedging, articles for show.
- **Tech terms stay English, any language.** French → franglais on purpose: `bouton Apple pas disabled pendant le loading`. Never a calque (`fil principal`, `branche fusionnée`).
- **Glossary.** Read `{conventions}/glossary.md` with config (cited as **voice → Glossary**).
  - Listed term → always it, never a synonym.
  - User says another word → keep the term, say which you mean once.
  - New concept, or two words for one thing → propose the row in one line, add on yes.
  - File absent → no rule; `/wa-setup` adds it.

## Layout

- 3+ items → bullets. Order matters → numbered.
- One idea → one line, no lone bullet.
- Two dimensions → table. Tasks → never a table.
- 2 levels max.
- **Readable cold.** Task bodies and pitch: bullets, each names its subject. No "it" pointing at the grill.

## Language

- Skill text and examples: English.
- Output: `discussion_language`. Translate headings and labels (`Done` → `Fait`), keep tech terms.
- Task file headings stay English, fixed: `## Context / Decisions`, `## Acceptance criteria`, `## Implementation`, `## Review`, `## Verification`, `## Feedback`.

## Titles

Read cold — issue list, branch, PR.

- **Task title** = verb + thing, imperative, ≤ 5 words: `Add Apple login`, `Fix flaky CLI tests`.
  - No narrative, no metaphor, no elegant rephrasing of the user's words.
  - Never repeats the sprint.
- **Summary** = the goal, plain, ≤ 8 words. Never repeats the title.
- **Sprint** = ≤ 3 words, no verb: `Login refacto`. Kebab-case only in its branch.

| ❌ | ✅ title | ✅ summary |
|---|---|---|
| After a purge, jobs don't replay | `Replay jobs after purge` | purge doesn't reset watermarks |
| CLI tests turn red at random | `Fix flaky CLI tests` | 4 TUI tests fail in suite, pass alone |
| crash when i zoom | `Fix crash on map zoom` | zoom past 18 no longer crashes |

## PR

Read by teammates who never saw the task.

- **Task PR title** = task title as-is.
- **Sprint PR title** = area, 1–3 words (`Login`, `Map performance`). No verb, number, em-dash, colon or list. Wider change → more generic word.
- **Sprint PR body** sums up the sprint for someone who never saw its tasks: never one bullet per task.
- **Body**, ≤ 20 lines:

```
<one sentence: what changes for the app>

## Changes
- <3–6 bullets, one change each, subject named>

## To test
- [ ] <one manual check per line>

Closes #42        ← github: one per delivered task
```

- Bullets: behavior → plain sentence (`The list keeps its scroll`). Else action first (`Add`, `Fix`, `Remove`). No `Fix:` prefix.
- Words the user sees, not `debounce` / `backoff`. Why, not how.
- No task slugs, sprint jargon, verifier rounds, finding counts, process section, follow-up list.
- Type or file names in backticks only when they help a reviewer.
- Numbers only when the PR is about them: one line or table ≤ 3 rows.
