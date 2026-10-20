---
# GitHub provider (backlog.provider: github): file named {tasks}/<issue#>-<slug>.md, lives on ticket
# branch, frontmatter keeps ONLY issue / phase / wiki / note / created (+ ported-from / lands when set). title, summary, size, sprint,
# milestone, status live on GitHub (issue + Project) — never here. phase: in-progress | review | validated.
# issue: 12
# phase:
title:                  # label ≤ 5 words, not a sentence ("Fix flaky CLI tests", not "Tests turn red at random")
summary:                # ≤ 8 words, the goal plainly — never the mechanism, never repeat the title
size: medium            # quickwin | medium | large  → 🟢 | 🟡 | 🔴 in backlog list
sprint:                 # OPTIONAL kebab-case label group big work ("login-refacto").
                        # Empty = standalone task. Sprint exist because task name it —
                        # no sprint file, no create command. See /wa-task → Sprints.
milestone:              # release scope. Set at creation = highest open (version order of backlog.milestones).
                        # Not sprint. See reference/milestones.md.
status: todo            # todo | in-progress | review | validated | done | canceled
                        #   review    = coded, wait YOU test it
                        #   validated = you say match spec, verifier ran, wait your retest
                        #   done       = retested + closed by /wa-close
grilled: false          # true once clarified via /wa-grill (grill-me)
wiki:                   # [[page]] refs, comma-separated
note:                   # free-form trigger / context (optional, not auto-evaluated)
# ported-from: #530     # TRACKS only (reference/tracks.md): back-port of track PR onto base. Sync reads it.
# lands: server         # TRACKS only: this task merges track into base. Uncomment when set.
created:                # YYYY-MM-DD
---

## Context / Decisions

<!-- /wa-task: user idea or spec excerpt. /wa-grill: what, why, scope (YAGNI), decisions
     resolved in grill, starting from that. -->

## Acceptance criteria

<!-- Fill by /wa-grill. Observable checks mean "done" — each one thing you see
     on screen or state input must produce. wa-implementer drives these on device
     when verify.mode puts runtime proof on agent; wa-verifier checks diff meets them. -->

## Implementation

<!-- Fill by /wa-code. Approach, files touched, build proof, notes from wa-implementer. -->

## Review

<!-- Fill by /wa-validate (and /wa-code when review.when: each_round). Findings tagged by
     lens (style / elegance / structure / correctness) + what autofix changed, one block per
     round. -->

## Verification

<!-- Fill by /wa-code and /wa-feedback. wa-implementer runtime CHECKS (✅/❌) + screenshot paths per
     criterion, or "manual validation — not run by agent" when verify.mode leaves the run to you. -->

## Feedback

<!-- Fill by /wa-feedback, one `### Round <n> — YYYY-MM-DD` block per round: what you asked (your words), triage
     (defect / adjustment / new scope / rule), what changed, review + verify verdicts,
     any rule promoted into convention module. Rounds append, never overwrite. -->