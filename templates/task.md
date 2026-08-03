---
title:                  # SHORT, explicit — feature in one glance ("Login Apple", not "Auth work")
summary:                # one short sentence: what task about, for backlog table
size: medium            # quickwin | medium | large  → 🟢 | 🟡 | 🔴 in backlog table
status: todo            # todo | in-progress | review | validated | done | canceled
                        #   review    = coded, wait YOU test it
                        #   validated = you say match spec, verifier ran, wait your retest
                        #   done       = retested + closed by /wa-validate
grilled: false          # set true once clarified via /wa-task (grill-me)
wiki:                   # [[page]] refs, comma-separated
note:                   # free-form trigger / context (optional, not auto-evaluated)
created:                # YYYY-MM-DD
---

## Contexte / Décisions

<!-- Filled by /wa-task. What, why, scope (YAGNI), decisions resolved during grill. -->

## Critères d'acceptation

<!-- Filled by /wa-task. Observable checks meaning "done" — each one thing you see
     on screen or state input must produce. wa-verifier drives these on device. -->

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
     any rule promoted into convention module. Rounds append, never overwrite. -->