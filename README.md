# whackagent

Flow de développement orchestré pour Claude Code. Un backlog + un wiki qui se référencent, un cycle de vie de tâche en étapes claires, des subagents isolés pour ne pas polluer le contexte principal, et un autopilot pour avaler des petites tâches la nuit.

Swift-first, mais piloté par des **templates de conventions par langage** (override par projet).

## Philosophie

- **YAGNI** partout. On code ce qui est utile maintenant, pas l'hypothétique.
- **Clarté avant code.** La moindre interrogation hors-spec → stop et on demande (sauf en autopilot, voir plus bas).
- **Contexte propre.** Les skills routent dans le thread principal ; le code et la review partent dans des subagents isolés.
- **Jamais de commit non sollicité.** En flow normal, aucun commit tant que tu n'as pas validé la feature. En autopilot, commits autorisés mais sur branche isolée uniquement, jamais de merge, jamais au nom de Claude — toujours au tien.

## Le flow

```
/wa-setup            →  config + scaffolding (.whackagent/), lance graphify   (une fois)
/wa-board            →  dashboard : tableau du backlog, suggère la prochaine action
/wa-task <desc>      →  crée une tâche + spec, la grille (grill-me, inclut l'archi)
/wa-prio             →  product-owner : ordonne le backlog, YAGNI, peut splitter
/wa-code <slug>      →  pipeline complet : comprendre → coder+tester → review → report+itère
/wa-autopilot [slug] →  applique wa-code sur 1..n tâches en autonomie, branche par tâche
/wa-review [scope]   →  review 5-catégories standalone (diff / path / projet) — audit, --fix optionnel
/wa-wiki             →  met le wiki + graphify à jour
/wa-wiki <feature>   →  cherche une info dans le wiki / le graphe
```

Chaque étape suggère la suivante. Tu ne cherches jamais quoi lancer.

## Le pipeline `/wa-code`

Une seule commande déroule tout le cycle de codage d'une feature, en orchestrant des subagents isolés :

1. **Comprendre** — lire la tâche, chercher l'existant (graphify) pour ne pas recoder, décomposer en petits modules, prévoir le plan de tests.
2. **Coder + tester** — `wa-implementer` (séquentiel) code la feature *et* les tests, puis run build/tests pour prouver que ça marche.
3. **Review** — 5 `wa-reviewer` en parallèle, un par lentille (**style · élégance · architecture · arborescence · correctness**), chacun ne charge que son module → focus, rien d'oublié. Agrège → autofix en boucle jusqu'au clean.
4. **Report + itère** — résumé à l'écran pour itérer avec toi, report sauvé dans `.whackagent/reports/<slug>.md`. À validation : tâche passée en `done`.

→ ensuite `/wa-wiki` met le wiki + le graphe à jour. Jamais de commit avant ta validation.

## Arborescence créée dans ton projet

```
.whackagent/
  config.md            # langue, langage, project_kind, catégories de review, droit de commit
  conventions/         # modules de convention copiés (que les utiles), éditables par projet
  BACKLOG.md           # index des tâches (ordre = priorité)
  tasks/<slug>.md      # une tâche = un fichier (frontmatter + corps)
  wiki/index.md        # sommaire du wiki
  wiki/<page>.md       # pages de domaine, liens [[wikilink]] (compatible Obsidian)
  reports/<slug>.md    # reports de features livrées
```

## Tâche : anatomie

```markdown
---
title: Login Apple          # court, explicite — la feature en un coup d'œil
summary: Sign in with Apple sur l'écran de connexion   # une ligne, pour le tableau
size: quickwin             # quickwin 🟢 | medium 🟡 | large 🔴
status: todo                # todo | in-progress | review | done | canceled
grilled: false             # true une fois passée par /wa-task (grill-me)
wiki: [[auth]], [[onboarding]]
note:                       # déclencheur / contexte libre (optionnel)
---

## Contexte / Décisions
## Implémentation
## Review
```

## Conventions — modules par catégorie

Les conventions sont **modulaires**, découpées par catégorie de review, et **auto-contenues** (aucune dépendance à un autre plugin). Swift :

```
conventions/swift/
  style.md             # one-type-per-file, types explicites, ordre des membres, commentaires/doc, format
  elegance.md          # Swift idiomatique (pas du C en Swift), concurrence (no Combine)
  architecture-app.md  # arbo iOS : Coordinator → ViewModel → Store → View, group-by-feature
  architecture-package.md  # arbo Swift non-iOS (package/CLI/serveur) : règles plus libres mais définies
  swiftui.md           # règles SwiftUI — copié SEULEMENT si le projet utilise SwiftUI
  testing.md           # Swift Testing + mocks
```

`/wa-setup` détecte le langage, le **kind** (app vs package) et l'usage de SwiftUI, puis copie **uniquement les modules utiles** dans `.whackagent/conventions/` (ex : pas de `swiftui.md` dans un package sans SwiftUI). Tu édites ces copies pour adapter par projet (ex : couper la doc publique). TypeScript et generic ont un fichier unique.

Chaque catégorie de review charge **seulement son module** → contexte focus, rien d'oublié.

## Dépendances de skills

- **grill-me** — clarification des tâches dans `/wa-task`
- **caveman** — compression des reports (phase report de `/wa-code`) + compression de la config et du wiki au setup et à chaque `/wa-wiki` (`compress_wiki: true`, économise les tokens de relecture)
- **graphify** — index du code interrogé par les skills (créé au setup, rafraîchi à `/wa-wiki`)
