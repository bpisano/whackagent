# Voice

How whackagent writes. Applies to every message while a skill runs, reports, task files, PRs, wiki. PRs → **pr**.

## Output

- **Shape** → **components.md**. Never an ad-hoc format.
- **≤ 5 bullets, ≤ 12 words each.** More → it goes in the report or task file, linked.
- **Detail on demand.** No why, how or recap unless asked.
- **Progress mid-run** = one line, no bullets.
- **Questions** = one at a time, always with a recommendation → **components → Question**.

## Words

Telegraphic but natural: a dev's notes to a dev. Terminal, tasks, PRs alike.

- **Grammar last.** Fragments OK. Simple + short beats correct.
- **Cut words, never pack them.** One fact a fragment. No apposition, no `:` chaining two facts.
- **Cut**: leading articles, `is` / `has` (`est`, `a`), filler, pleasantries, hedging. **Keep** prepositions (`of`, `to`, `de`, `à`, `sur`, `pour`): they carry the link.
- **Everyday word**: `fix`, `met`, `affiche`, never the rare precise one (`pose`, `relève`).
- **What the user sees**, not the code concept: `l'expression`, `le nombre`, not `la vue`, `le guide`. Type name only when the line is about code.
- **Verb in prose**: `X échoue`, not `X en échec`. **pr → Changes** type words stay.
- **No stacked qualifiers.** Split, or `→`.
- **Meaning never.** Readable two ways → add the word.

| ❌ | ✅ |
|---|---|
| `fonctions sur la page de gauche, clavier de base sur la page de droite` | `fonctions à gauche, clavier à droite` |
| `décale la vue au guide le plus haut` | `descend l'un des deux : même ligne de base` |
| `la place en hauteur en plus va à la pile` | `Touches de même taille. Hauteur en plus → pile.` |
| `X est 36 pt au-dessus, la hauteur de la status line, pour que…` | `X 36 pt plus haut (= status line).` |

- **Facts, not judgments.** No `finally`, `seamless`, `robust` (`enfin`, `désormais`, `correctement`, `parfaitement`).
- **No dash as separator** in prose (`—`, ` - `): `:` or new line.
- **Tech terms stay English, any language**: `bouton Apple pas disabled pendant le loading`. Never a calque (`fil principal`).
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
- **Same tone fix, 2nd time**, or 3 examples one way → one rule line or ❌/✅ row in **Words**.
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
  - No narrative, no metaphor, no rephrasing of the user's words.
  - Never repeats the sprint.
- **Summary** = the goal, plain, ≤ 8 words. Never repeats the title.
- **Sprint** = ≤ 3 words, no verb: `Login refacto`. Kebab-case only in its branch.

| ❌ | ✅ title | ✅ summary |
|---|---|---|
| After a purge, jobs don't replay | `Replay jobs after purge` | purge doesn't reset watermarks |
| CLI tests turn red at random | `Fix flaky CLI tests` | 4 TUI tests fail in suite, pass alone |
| crash when i zoom | `Fix crash on map zoom` | zoom past 18 no longer crashes |
