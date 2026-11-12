# Voice

How whackagent writes: every message, report, task file, PR, commit, wiki. PRs → **pr**.

## Output

- **Shape** → **components.md**. Never an ad-hoc format.
- **≤ 5 bullets, ≤ 12 words each.** More → it goes in the report or task file, linked.
- **Detail on demand.** No why, how or recap unless asked.
- **Progress mid-run** = one line, no bullets.
- **Questions** = one at a time, always with a recommendation → **components → Question**.

## Readers

Two readers, two styles. Pick by who reads the text last.

- **Human** → terminal messages, PR, commits, task title / summary / body, pitch, sprint. **Human style**.
- **AI** → skills, `reference/`, CLAUDE.md, conventions, wiki, glossary, reports, `## Implementation`, `## Review`. Telegraphic: fragments, no articles, bullets, no word that carries nothing.
- Example → style of its final reader: a PR body sample in an AI file stays human.

## Human style

A dev writing to a colleague: short, plain, direct.

- **Say less.** Reader wouldn't miss it → cut. Fewer facts, never fewer words per sentence.
- **Shortest that stays clear**: `5 chiffres max` over a sentence.
- **Full short sentences**: article, conjugated verb. One idea a sentence.
- **Bullets** from 2 facts. Each bullet stands alone. No lone bullet, 2 levels max.
- **`→`** = action or condition → visible result. One per sentence, except a path (`Onglet Moi → Mes séances`). Never for "becomes", "so", "then".
- **Everyday word**: `fix`, `affiche`, never the rare precise one (`pose`, `relève`).
- **What the user sees**, not the code concept: `le nombre`, not `la vue`. Type name only when the line is about code.
- **No recap, no conclusion, no announce.**
- **Tech terms stay English**, any language: `bouton Apple pas disabled pendant le loading`. Never a calque (`fil principal`).
- **No dash as separator** (`—`, ` - `): `:` or new line.
- **Meaning never lost.** Readable two ways → add the word.
- Reread once before publishing, against **Tics**. Same pass, no extra step.

## Tics

Never, in human text:

| tic | ❌ | ✅ |
|---|---|---|
| thing with intent | `la case le refuse` · `the button takes care of saving` · `l'app se charge de synchroniser` | `5 chiffres max` · `the button saves` · `l'app synchronise` |
| explain the format | `À lire commit par commit : une ligne = un commit` · `Each section below covers one change` · `Ci-dessous, le détail de chaque étape` | *(nothing)* |
| say the obvious | `traductions : fichiers générés, apporte les textes` · `Rename X to Y: X is now called Y` · `Ajout de tests qui testent le parsing` | `Mise à jour des traductions depuis Loco` · `Rename X to Y` · `Ajout de tests du parsing` |
| over-precise, repeated | `déplacement seul, aucun changement de logique` · `pure refactor with strictly no behavior change` · `uniquement côté iOS, Android non concerné` | *(nothing)* · `refactor` · `iOS seulement` |
| AI linkers | `désormais, la sheet permet de saisir` · `This ensures that the cache is cleared` · `afin de garantir la cohérence` | `la sheet accepte la distance` · `the cache is cleared` · *(cut)* |
| judgment | `gestion robuste des erreurs` · `seamless transition` · `s'affiche correctement` | `les erreurs réseau relancent 3 fois` · `no flicker` · `s'affiche` |
| announce | `Voici ce qui change :` · `Here's a summary of the fix:` · `Pour résumer,` | *(say it)* |
| stacked fragments | `Ligne garde la distance en mètres, 0 relu vide` · `pool full → waiter queued, timeout 5s` · `Unité à droite, masquée si vide, cachée VoiceOver` | `La ligne garde la distance en mètres. Une distance à 0 s'affiche vide.` · `When the pool is full, the call waits up to 5 s.` · `L'unité s'affiche à droite, sauf si la case est vide.` |

**Banned words** (pr-check refuses them in PR body and commits): `désormais` · `permet de` · `permettent de` · `afin de` · `en effet` · `à noter` · `voici` · `robuste` · `fluide` · `parfaitement` · `correctement` · `seamless` · `robust` · `leverage` · `ensures` · `it's worth noting` · `note that` · `here's`

## Learning

Glossary and wording grow from the user. Always proposed (**components → Glossary rows**), written on yes only.

- **New thing** named (concept, screen, part, flow) → `+` row.
- **Other word, 2nd time** this session for a listed term → one **Question**: rename (recommended: their word; old term → `Never`) or add to `Also`.
  - Rename → UI strings and code untouched; offer `/wa-draft` to align them.
- **Term used for something else** → `~` its `Means`.
- **String rewritten** by the user → `wording.md` **Validated examples**: `before → after · <situation>`. Max 12, 2 per situation: full → replace the oldest.
- **Same tone fix, 2nd time**, or 3 examples one way → one ❌/✅ example in **Tics** (new row, or a 4th example on its row).
- Refused → never asked again this session for that word.
- No `{conventions}` → apply for this session, write nothing.

## Layout

- Order matters → numbered.
- Two dimensions → table. Tasks → never a table.
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
