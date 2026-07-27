---
name: wa-feedback
description: Apply your feedback on a task that was just coded — through the same isolated pipeline as /wa-code, so conventions are re-read and the change is re-reviewed and re-verified. Use after /wa-code or /wa-autopilot when you want changes to what was built.
---

# /wa-feedback

You looked at what got built and you have notes. This applies them **without losing the rules**.

Feedback is where quality leaks: the change feels small, so code gets patched straight from main thread — where convention modules were never loaded, no reviewer ever looks at it, nothing gets re-run. Three rounds later the feature drifted off style, off architecture, and nobody re-checked it works. This skill makes that impossible.

## Hard rules

1. **Never edit code from the main thread.** Every change — one line, one rename, one color — goes through **wa-implementer** in fix mode. A fresh one gets the conventions dir and re-reads every module before touching anything; a resumed one already holds them (see *Reusing the coding run's agents*). You orchestrate, you don't type code.
2. **Always re-verify after changing.** The fan-out is not optional, not skippable because "it was tiny". Tiny changes are exactly the ones that break style and architecture.
3. **Always re-run the app** when `verify.enabled: true` and the touched surface is runnable. Prior runtime proof is void the moment the code changed.
4. **Never re-mark a task done on your own word.** Only the verifiers' evidence closes it.

## Reusing the coding run's agents

`/wa-code` noted the `agentId` of every agent it spawned (the implementer, both verifiers). Same session → they're still reachable, and they still hold the conventions, the BRIEF, the code, and the runtime checklist. **Resume them** (`SendMessage` to the id) instead of spawning fresh ones: a feedback round then costs a delta, not a full re-read of the feature.

Rules are `/wa-code` → *Resuming, rounds 2+*, in full — delta only, anti-stale warning every time, respawn fresh past 3 rounds. Two things specific here:

- **No id to hand is normal, not an error.** New session, or the task was delivered by `/wa-autopilot` in another run → spawn fresh with the full inputs. The flow is identical either way; resume is only ever an optimization.
- **A captured rule invalidates context.** Wrote a new line into a convention module (step 3)? The resumed agents hold the *old* module. Tell them explicitly which module changed and what the new rule says — or respawn them fresh. Never let a resumed agent work from a stale rulebook.

## Do

1. **Resolve the task.** Arg = slug or display index (`/wa-feedback 2 the button should be secondary`), resolve per **wa-board → Task indexes**. No task given → the one `in-progress`, else most recent `review`. Ambiguous → ask, don't guess. Read `.whackagent/config.md` + task file (needs `## Critères d'acceptation`, `## Implémentation`, `## Review`, `## Vérification`).
   - **Right branch first.** Task delivered by `/wa-autopilot` — or by `/wa-code` with `branch.per_task: true` — lives on `<branch.prefix><slug>`. Check current branch; if the work isn't here, say which branch it's on and switch **only after user confirms** (their tree may be dirty). Never apply feedback to a branch that doesn't hold the code.
2. **Triage each feedback item** — say out loud which bucket, one line each:
   - **defect** — doesn't match acceptance criteria → fix, criteria unchanged.
   - **adjustment** — works, but not what user wants (naming, placement, wording, behavior detail) → fix, and **update `## Critères d'acceptation`** so the criteria match reality; otherwise verify re-fails on the old criterion forever.
   - **new scope** — a feature the task never covered → **do not code it**. Propose `/wa-task <desc>`. Say plainly: "that's a new task, not feedback."
   - **rule** — a durable preference ("always X", "never Y", "I told you this last time") → see *Capture the rule* below, then treat as adjustment.
   Unclear which bucket → **stop and ask**. Never silently widen scope.
3. **Capture the rule.** Feedback that states a general preference must land in `.whackagent/conventions/<module>.md`, not just in this fix — that's how the rule stops being forgotten next round. Pick the module by what it governs (style / elegance / architecture-\* / testing), draft the line in the module's own voice, **show it and ask before writing**. Never rewrite unrelated parts of a module. If it belongs nowhere, put it in `.whackagent/config.md`'s free-form notes instead.
4. **Fix.** **wa-implementer** in **fix mode**, one dispatch per coherent batch (sequential — builds collide otherwise). Resume the task's implementer by its id when you have one: send the feedback items **verbatim in the user's words** plus your triage, and nothing else — it already has the task, the conventions and the code it wrote. Fresh spawn otherwise (note its id for the next round): task path, conventions dir, feedback + triage, changed-files context from `## Implémentation`, `build.command`/`build.test_command` when config sets them, `autopilot: false`. Either way tell it: fix only what's named, minimal diff, no explanatory comments, re-run build/tests.
   - `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Don't guess what the user meant.
5. **Re-verify.** Fan out both **wa-verifier** in parallel — `conventions` and `correctness` — scoped to the files this fix touched, with the diff hunks inline. Resume each by its id when you have one: send the hunks plus its own earlier findings to re-state as fixed or still open; fresh spawn with modules + hunks otherwise. Aggregate, dedupe, severity-order. Autofix loop per `review.autofix` (cap 3 rounds, same as `/wa-code`). Append to the task's `## Review` under a dated feedback round — don't overwrite the original.
6. **Re-run it.** If `verify.enabled` and the touched surface runs, the implementer re-drives the app in step 4 against the **updated** acceptance criteria — tell it explicitly when triage moved them, since it reuses its checklist otherwise. Failed checks → back through step 4. Can't run → stop and ask. Append to `## Vérification`, keep the previous round's entry.
7. **Log it.** Append a round to the task's `## Feedback`: what user asked (their words), triage, what changed, review verdict, verify verdict, any rule captured. Refresh `.whackagent/reports/<slug>.md`.
8. **Report + loop.** Short on-screen summary: items → what changed → review clean? → verify pass? More feedback → run again, next round. Task validated → `status: done`, reflect in `BACKLOG.md`, then run **`/wa-code` § Validation handoff** (commit if `commit.auto_commit_after_validation`, then hop to the next task's branch when `branch.per_task` + `branch.checkout_next`). Same rules — no commit, no branch switch.

## Asking

Triage doubt, ambiguous note, `BLOCKED:` from the implementer → ask, but **always with your recommended answer** and the one-line reason (which bucket you'd put it in, what you'd change). Never bounce a bare question back at the user. Same rule as `/wa-task`'s grill.

## Never

- Never patch code yourself "just this once".
- Never skip review or verify because the change was small.
- Never implement a new feature that arrived disguised as feedback.
- Never add comments explaining a fix (`style.md` — code carries meaning, the task file carries rationale).
- Never commit; user validates first (unless `commit.auto_commit_after_validation`).

## Next step

Clean + verified → suggest **`/wa-wiki`** to sync wiki + graph, or `/wa-code <#>` for the next task.
