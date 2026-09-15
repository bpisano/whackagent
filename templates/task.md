---
title:                  # SHORT, explicit — feature one glance ("Login Apple", not "Auth work")
summary:                # one short sentence: what task about, for backlog table
size: medium            # quickwin | medium | large  → 🟢 | 🟡 | 🔴 in backlog table
sprint:                 # OPTIONAL kebab-case label group big work ("login-refacto").
                        # Empty = standalone task. Sprint exist because task name it —
                        # no sprint file, no create command. See /wa-task → Sprints.
status: todo            # todo | in-progress | review | validated | done | canceled
                        #   review    = coded, wait YOU test it
                        #   validated = you say match spec, verifier ran, wait your retest
                        #   done       = retested + closed by /wa-close
grilled: false          # true once clarified via /wa-task (grill-me)
wiki:                   # [[page]] refs, comma-separated
note:                   # free-form trigger / context (optional, not auto-evaluated)
created:                # YYYY-MM-DD
---

## Contexte / Décisions

<!-- Fill by /wa-task. What, why, scope (YAGNI), decisions resolved in grill. -->

## Critères d'acceptation

<!-- Fill by /wa-task. Observable checks mean "done" — each one thing you see
     on screen or state input must produce. wa-verifier drive these on device. -->

## Implémentation

<!-- Fill by /wa-code. Approach, files touched, build proof, notes from wa-implementer. -->

## Review

<!-- Fill by /wa-validate (and /wa-code when review.when: each_round). Findings tagged by
     lens (style / elegance / structure / correctness) + what autofix changed, one block per
     round. -->

## Vérification

<!-- Fill by /wa-code (verify phase). wa-verifier checks (✅/❌) + screenshot paths per criterion. -->

## Feedback

<!-- Fill by /wa-feedback, one block per round: what you asked (your words), triage
     (defect / adjustment / new scope / rule), what changed, review + verify verdicts,
     any rule promoted into convention module. Rounds append, never overwrite. -->