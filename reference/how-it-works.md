# How it works

Technical detail of each `Changes` bullet, for a reviewer new to the task. **voice**, **pr** apply.

## Place

- The line folds: `<dl><dd><details>`, `<summary>` = its text (code → `<code>`), content in `<dl><dd><br>`. Never its own section.
- Trivial bullet (copy, style, rename, translations) → plain `- ` line.
- Mechanism without a bullet: derived from one → in its fold. Independent → add its `Changes` line.
- Custom template → the section playing `Changes`.
- Sprint PR → sprint diff. Known bug, no issue → `## Notes`.

## Level

Per bullet, never shown. Doubt → higher.

| level | when | fold |
|---|---|---|
| easy | reads in one function, no new type, no state | one sentence + code unfolded, or none |
| medium | one new concept (type, rule, flow), 1–2 components | Before / Now, Overview if new type, Callers, Code |
| hard | ≥ 3 components, lifecycle or concurrency, failure handling, or several sub-mechanisms | all, ≤ 4 parts, ≤ 2 diagrams |

## Fold

Labels in `pr_language`, this order:

1. **Before** / **Now**. Nothing before → **Problem**. Test → **Situation**, **Risk**, **Expected**.
2. **Overview** — the type carrying the mechanism, visible. Real code: stored properties, signatures called from outside, bodies `{ … }`, role comment per member. ≤ 20 lines, ≤ 2 types.
3. **Callers** — signature, injection or lifecycle changed for callers. Why in one sentence, others named, a ` ```diff ` on one caller, ≤ 12 lines. Visible.
4. Diagram + caption (**Diagram**).
5. Hard → parts, execution order: bold title, ≤ 1 context sentence, bullets, diagram if useful, Code fold. Else → Code fold.
6. **Read**: entry function → next → next, each linked to its line: in the diff → `pull/<n>/files#diff-<sha256(path)>R<line>`, else `blob/<head sha>/<path>#L<line>`. Hard → end of fold, else in Code.

≤ 2 fold levels.

## UI bullet

- Component alone, from **wa-screenshot** `COMPONENTS`: `| Before | After |`. New → After alone. Screens stay in `## Screenshots`.
- One image per variant, in a row.
- **Usage**: the call a dev writes, real parameters, one commented call per variant, ≤ 10 lines.
- Logic behind → per level. Easy (color, spacing) → images only.

## Code

- Code fold `<summary>` = 🧩 + what it shows: `<code>Pool.borrow</code>`, ≤ 2, ` · `.
- Mechanism → pseudo-code, real names. Contract → real code from the diff, cut, ≤ 15 lines.
- Inside its real owner: `actor IMAPSessionPool {`. Free function → none. Role comment on the type line.
- Properties the snippet reads → declared atop the owner, commented. No caption under code.
- Never one function twice. `if / else` over `??` or chained `guard`.
- Comments: intent, not the name. Each branch: when it happens. No unknown name.
- Test → each `#expect` says what it proves.

## Diagram

- Mermaid, when it beats code. `flowchart TD` (never `LR`) → steps, branches. `sequenceDiagram` → exchanges. `stateDiagram-v2` → ≥ 3 code states.
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

````md
<dl><dd><details>
<summary>Ajout d'un pool de sessions IMAP par Compte</summary>
<dl><dd><br>

**Avant** : chaque opération ouvrait sa propre session.

**Maintenant** : `NIOIMAPClient` garde ses sessions dans un `IMAPSessionPool`.
- Le pool garde au plus 3 sessions connectées par Compte.
- Chaque opération fait un borrow de session, puis un `giveBack`.

**Quand les 3 sessions sont occupées**

- L'opération attend dans `waiters`.
- À chaque `giveBack`, le pool sert le premier waiter du Compte.

<details>
<summary>🧩 <code>IMAPSessionPool.borrowSession</code></summary>

```swift
actor IMAPSessionPool { // garde les sessions connectées de chaque Compte
    private var waiters: [Waiter] // opérations en attente d'une session
    …
```

</details>

</dd></dl>
</details></dd></dl>
````
