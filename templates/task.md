---
title:                  # verb + thing, ≤ 5 words ("Fix flaky CLI tests", not "Tests turn red at random")
summary:                # ≤ 8 words, the goal plain — never the mechanism, never repeat the title
size: medium            # quickwin | medium | large  → 🟢 | 🟡 | 🔴 in backlog list
sprint:                 # OPTIONAL human title grouping big work ("Login refacto").
                        # Empty = standalone task. Sprint exist because task name it —
                        # no sprint file, no create command. See wa-board → Sprints.
status: draft           # draft | todo | coding | to-test | to-close | done | canceled
                        #   draft    = idea, not grilled yet → /wa-task
                        #   todo     = grilled, ready → /wa-code
                        #   coding   = agent coding it
                        #   to-test  = coded, YOU test it → /wa-feedback or /wa-validate
                        #   to-close = spec OK + verifier passed, you retest → /wa-close
                        #   done     = closed by /wa-close
wiki:                   # [[page]] refs, comma-separated
note:                   # free-form trigger / context (optional, not auto-evaluated)
created:                # YYYY-MM-DD
---

## Context / Decisions

<!-- Fill by /wa-task. What, why, scope (YAGNI), decisions resolved in grill. -->

## Acceptance criteria

<!-- Fill by /wa-task. Observable checks mean "done" — each one thing you see
     on screen or state input must produce. wa-verifier drive these on device. -->

## Implementation

<!-- Fill by /wa-code. Approach, files touched, build proof, notes from wa-implementer. -->

## Review

<!-- Fill by /wa-validate (and /wa-code when review.when: each_round). Findings tagged by
     lens (style / elegance / structure / correctness) + what autofix changed, one block per
     round. -->

## Verification

<!-- Fill by /wa-code (verify phase). wa-verifier checks (✅/❌) + screenshot paths per criterion. -->

## Feedback

<!-- Fill by /wa-feedback, one block per round: what you asked (your words), triage
     (defect / adjustment / new scope / rule), what changed, review + verify verdicts,
     any rule promoted into convention module. Rounds append, never overwrite. -->