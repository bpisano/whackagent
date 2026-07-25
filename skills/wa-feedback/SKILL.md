---
name: wa-feedback
description: Apply your feedback on a task that was just coded — through the same isolated pipeline as /wa-code, so conventions are re-read and the change is re-reviewed and re-verified. Use after /wa-code or /wa-autopilot when you want changes to what was built.
---

# /wa-feedback

You looked at what got built and you have notes. This applies them **without losing the rules**.

Feedback is where quality leaks: the change feels small, so code gets patched straight from main thread — where convention modules were never loaded, no reviewer ever looks at it, nothing gets re-run. Three rounds later the feature drifted off style, off architecture, and nobody re-checked it works. This skill makes that impossible.

## Hard rules

1. **Never edit code from the main thread.** Every change — one line, one rename, one color — goes through **wa-implementer** in fix mode with the conventions dir. It re-reads every module before touching anything. You orchestrate, you don't type code.
2. **Always re-review after changing.** Review fan-out is not optional, not skippable because "it was tiny". Tiny changes are exactly the ones that break style and architecture.
3. **Always re-verify** when `verify.enabled: true` and the touched surface is runnable. Prior verification is void the moment the code changed.
4. **Never re-mark a task done on your own word.** Only the reviewer + verifier evidence closes it.

## Do

1. **Resolve the task.** Arg = slug or display index (`/wa-feedback 2 the button should be secondary`), resolve per **wa-board → Task indexes**. No task given → the one `in-progress`, else most recent `review`. Ambiguous → ask, don't guess. Read `.whackagent/config.md` + task file (needs `## Critères d'acceptation`, `## Implémentation`, `## Review`, `## Vérification`).
   - **Right branch first.** Task delivered by `/wa-autopilot` lives on `<branch_prefix><slug>`. Check current branch; if the work isn't here, say which branch it's on and switch **only after user confirms** (their tree may be dirty). Never apply feedback to a branch that doesn't hold the code.
2. **Triage each feedback item** — say out loud which bucket, one line each:
   - **defect** — doesn't match acceptance criteria → fix, criteria unchanged.
   - **adjustment** — works, but not what user wants (naming, placement, wording, behavior detail) → fix, and **update `## Critères d'acceptation`** so the criteria match reality; otherwise verify re-fails on the old criterion forever.
   - **new scope** — a feature the task never covered → **do not code it**. Propose `/wa-task <desc>`. Say plainly: "that's a new task, not feedback."
   - **rule** — a durable preference ("always X", "never Y", "I told you this last time") → see *Capture the rule* below, then treat as adjustment.
   Unclear which bucket → **stop and ask**. Never silently widen scope.
3. **Capture the rule.** Feedback that states a general preference must land in `.whackagent/conventions/<module>.md`, not just in this fix — that's how the rule stops being forgotten next round. Pick the module by category (style / elegance / architecture-\* / arborescence / testing), draft the line in the module's own voice, **show it and ask before writing**. Never rewrite unrelated parts of a module. If it belongs nowhere, put it in `.whackagent/config.md`'s free-form notes instead.
4. **Fix.** Dispatch **wa-implementer** in **fix mode**, one dispatch per coherent batch (sequential — builds collide otherwise). Pass: task path, conventions dir, the feedback items **verbatim in the user's words** plus your triage, changed-files context from `## Implémentation`, `autopilot: false`. Tell it: fix only what's named, minimal diff, no explanatory comments, re-run build/tests.
   - `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Don't guess what the user meant.
5. **Re-review.** Fan out **wa-reviewer** in parallel, one per `review.categories` entry, scoped to the files this fix touched. Aggregate, dedupe, severity-order. Autofix loop per `review.autofix` (cap 3 rounds, same as `/wa-code`). Append to task's `## Review` under a dated feedback round — don't overwrite the original review.
6. **Re-verify.** If `verify.enabled` and the touched surface runs: dispatch **wa-verifier** with the fresh `ARTIFACT:` and the **updated** acceptance criteria. `fail` → back through step 4 with the failed checks. `blocked` → stop and ask. Append to `## Vérification`, keep the previous round's entry.
7. **Log it.** Append a round to the task's `## Feedback`: what user asked (their words), triage, what changed, review verdict, verify verdict, any rule captured. Refresh `.whackagent/reports/<slug>.md`.
8. **Report + loop.** Short on-screen summary: items → what changed → review clean? → verify pass? More feedback → run again, next round. Task validated → `status: done`, reflect in `BACKLOG.md`.

## Never

- Never patch code yourself "just this once".
- Never skip review or verify because the change was small.
- Never implement a new feature that arrived disguised as feedback.
- Never add comments explaining a fix (`style.md` — code carries meaning, the task file carries rationale).
- Never commit; user validates first (unless `commit.auto_commit_after_validation`).

## Next step

Clean + verified → suggest **`/wa-wiki`** to sync wiki + graph, or `/wa-code <#>` for the next task.
