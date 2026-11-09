# How it works

Technical detail of each `Changes` bullet, for a reviewer new to the task. **voice**, **pr** apply.

## Signals

Before writing: `${CLAUDE_PLUGIN_ROOT}/scripts/pr-check signals <base-branch>` → signals per code file. Sprint PR → sprint branch. `<base-branch>` = a branch name (`develop`, `sprint/3`), never a sha: the script fetches it and diffs the newest of local / `origin`, `base:` says which. Generated files (header comment, `linguist-generated`) → `generated (skipped)`, no signal.

- **Coverage**: each code file → one `Changes` line. In none → add its line. Tests follow their code.
- **Split**: new types of a line not linked → one line per group.
- Line signals = union of its files. Judgment adds blocks, never drops one.

| signal | block |
|---|---|
| always | **Before** / **Now**, Code fold |
| `type` | **Overview**, others named in **Now** |
| `signature` | **Callers** |
| ≥ 2 linked new types | `flowchart TD` |
| `states` | transitions → `stateDiagram-v2`, else cases in **Now** |
| ≥ 5 files, or ≥ 2 steps | parts |
| `async` | part `When … at once` |
| `failure` | part `If … fails` |
| `ui` on a component | **UI bullet** |

Cap: 2 Overview types, 2 diagrams, 4 parts. Over → split the line, never cut.

## Place

- The line folds: `<dl><dd><details>`, `<summary>` = its text (code → `<code>`), content in `<dl><dd><br>`. Never its own section.
- No signal, trivial (copy, rename, translations) → plain `- ` line.
- `generated (skipped)` → at most one plain `- ` line naming its source (`Update translations from Loco`), never a fold.
- Custom template → the section playing `Changes`. Known bug, no issue → `## Notes`.

## PR overview

≥ 3 new types over ≥ 2 lines → `<details>` under the intro sentence, before `Changes`, `<summary>` = `Overview` translated. `flowchart TD`, each new type a node, caption (**Diagram**). No code.

## Fold

Labels in `pr_language`, this order:

1. **Before** / **Now**. Nothing before → **Problem**. Test → **Situation**, **Risk**, **Expected**.
2. **Overview**: the type carrying the mechanism, visible. Real code: stored properties, signatures called from outside, bodies `{ … }`, role comment per member. ≤ 20 lines.
3. **Callers**: why in one sentence, others named, a ` ```diff ` on one caller, ≤ 12 lines. Visible.
4. Diagram + caption (**Diagram**).
5. Parts, execution order: bold title, ≤ 1 context sentence, bullets, diagram if useful, Code fold. No parts → Code fold.
6. **Read**: entry function → next → next, each linked to its line: in the diff → `pull/<n>/files#diff-<sha256(path)>R<line>`, else `blob/<head sha>/<path>#L<line>`. Parts → end of fold, else in Code.

≤ 2 fold levels.

## UI bullet

- Component alone, from **wa-screenshot** `COMPONENTS`: `| Before | After |`. New → After alone. Screens stay in `## Screenshots`.
- One image per variant, in a row.
- **Usage**: the call a dev writes, real parameters, one commented call per variant, ≤ 10 lines.
- Then the blocks of its other signals.

## Check

Before `gh pr create` / `gh pr edit`: `pr-check check <body.md> <base-branch>`. ❌ → fix, rerun. Publish green only.

## Code

- Code fold `<summary>` = 🧩 + what it shows: `<code>Pool.borrow</code>`, ≤ 2, ` · `.
- Mechanism → pseudo-code, real names. Contract → real code from the diff, cut, ≤ 15 lines.
- Inside its real owner: `actor IMAPSessionPool {`. Free function → none. Role comment on the type line.
- Properties the snippet reads → declared atop the owner, commented. No caption under code.
- Never one function twice. `if / else` over `??` or chained `guard`.
- Comments: intent, not the name. Each branch: when it happens. No unknown name.
- Test → each `#expect` says what it proves.

## Diagram

- Mermaid, when it beats code. `flowchart TD` (never `LR`) → steps, branches. `sequenceDiagram` → exchanges. `stateDiagram-v2` → states with transitions.
- ≤ 8 nodes, arrow labels ≤ 4 words, detail → `Note`. Node = name alone. Categories → named `subgraph`.
- **Caption** right under, one per name: `- <sub>`Pass` : une synchro d'un Compte.</sub>`. Glossary and Overview names skipped.

## Words

A dev talking to a dev: simple, not simplified.

- **Part title** starts with the situation: `How` / `When` / `If` (`Comment`, `Quand`, `Si`). Subject + verb, common words, no comma, no `?`. `Quand les 3 sessions sont occupées`, never `Attente quand 3 sessions travaillent`.
- ≥ 2 independent facts → bullets. Paragraph = one sentence, or two linked by a cause.
- Bullet = a spoken sentence: subject, verb, active. Condition → `Si …, …`, never `<case> : <result>`. Verb over noun: `échoue`, not `en échec`.
- Technical terms stay: LOGIN, FETCH, retry. Unknown one → **pr → Vocabulary**.
- Concept named in the code → the code's word, English in any language: borrow, `giveBack`, idle, waiters. Never translated. Glossary terms unchanged.
- Concrete subject, never `on` / `we`. No emphasis.

## Truth

From the diff vs `merge-base` + `## Context / Decisions`. Link unsure → read the caller, never guess.

## Example

Full body, overview and three folds: `${CLAUDE_PLUGIN_ROOT}/scripts/pr-check-fixtures/swift/body-good.md`.
