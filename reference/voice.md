# Voice

How whackagent writes. Applies to every message while a skill runs, reports, task files, PRs, wiki. PRs → **pr**.

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
- **Facts, not judgments.** No `finally`, `now properly`, `seamless`, `much better`, `robust` (`enfin`, `désormais`, `correctement`, `parfaitement`, `nettement`). `Correction de l'ordre des mails`, never "les mails arrivent enfin dans l'ordre".
- **Tech terms stay English, any language.** French → franglais on purpose: `bouton Apple pas disabled pendant le loading`. Never a calque (`fil principal`, `branche fusionnée`).
- **Glossary.** Read `{conventions}/glossary.md` with config. Its rules apply to every word you write.
  - Screens, parts, flows → by their glossary name: `Login screen → Cancel`, not "the sign-in page".
  - User says an `Also` word, or a vague one ("the top page") → keep the term, say which you mean once.
  - File absent → no rule; `/wa-setup` adds it.

## Learning

Glossary and wording grow from the user. Always proposed (**components → Glossary rows**), written on yes only.

- **New thing** named (concept, screen, part, flow) → `+` row.
- **Other word, 2nd time** this session for a listed term → one **Question**: rename (recommended: their word; old term → `Never`) or add to `Also`.
  - Rename → UI strings and code untouched; offer `/wa-draft` to align them.
- **Term used for something else** → `~` its `Means`.
- **String rewritten** by the user → `wording.md` **Validated examples**: `before → after · <situation>`. Max 12, 2 per situation: full → replace the oldest.
- **Same tone fix, 2nd time**, or 3 examples one way → one rule line in **Voice**.
- Refused → never asked again this session for that word.
- No `{conventions}` → apply for this session, write nothing.

## Layout

- 3+ items → bullets. Order matters → numbered.
- One idea → one line, no lone bullet.
- Two dimensions → table. Tasks → never a table.
- 2 levels max.
- **Readable cold.** Task bodies and pitch: bullets, each names its subject. No "it" pointing at the grill.

## Language

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
