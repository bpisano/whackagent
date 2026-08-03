---
title:                  # SHORT, explicit — the feature in one glance ("Login Apple", not "Auth work")
summary:                # one short sentence: what this task is about, for the backlog table
size: medium            # quickwin | medium | large  → 🟢 | 🟡 | 🔴 in the backlog table
status: todo            # todo | in-progress | review | validated | done | canceled
                        #   review    = coded, waiting for YOU to test it
                        #   validated = you said it matches the spec, verifier ran, waiting your retest
                        #   done       = retested and closed by /wa-validate
grilled: false          # set true once clarified via /wa-task (grill-me)
wiki:                   # [[page]] refs, comma-separated
note:                   # free-form trigger / context (optional, not auto-evaluated)
created:                # YYYY-MM-DD
---

## Contexte / Décisions

<!-- Filled by /wa-task. What, why, scope (YAGNI), decisions resolved during grill. -->

## Critères d'acceptation

<!-- Filled by /wa-task. Observable checks that mean "done" — each one a thing you can see
     on screen or a state an input must produce. wa-verifier drives these on device. -->

## Implémentation

<!-- Filled by /wa-code. Approach, files touched, build proof, notes from wa-implementer. -->

## Review

<!-- Filled by /wa-validate (and /wa-code when review.when: each_round). Findings tagged by
     lens (style / elegance / structure / correctness) + what autofix changed, one block per
     round. -->

## Vérification

<!-- Filled by /wa-code (verify phase). wa-verifier checks (✅/❌) + screenshot paths per criterion. -->

## Feedback

<!-- Filled by /wa-feedback, one block per round: what you asked (your words), triage
     (defect / adjustment / new scope / rule), what changed, review + verify verdicts,
     any rule promoted into a convention module. Rounds append, never overwrite. -->

