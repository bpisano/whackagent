---
name: wa-feedback
description: Apply your feedback on a task that was just coded — routed by size (micro-fix applied here, anything bigger through the same isolated pipeline as /wa-code), then re-verified and reviewed before any commit. Use after /wa-code or /wa-autopilot when you want changes to what was built.
---

# /wa-feedback

You looked at what got built and you have notes. This applies them **without losing the rules**.

Feedback is where quality leaks: the change feels small, so code gets patched straight from main thread — where convention modules were never loaded, no reviewer ever looks at it, nothing gets re-run. Three rounds later the feature drifted off style, off architecture, and nobody re-checked it works. This skill makes that impossible: **what makes an inline fix safe is that a reviewer still sees it before the commit** — never the fact that it looked small.

## Hard rules

1. **Route the fix by size, not by feel.** A **micro-fix** (see *Micro-fix or implementer*) you apply yourself, from here. Anything else — and anything you're unsure about — goes through **wa-implementer** in fix mode. A fresh one gets the conventions dir and re-reads every module before touching anything; a resumed one already holds them (see *Reusing the coding run's agents*).
2. **Always re-verify before the task closes.** *When* depends on `review.when`: `each_round` → a verifier round after every fix; `on_validation` (default) → none here, one pass over the whole diff at `/wa-validate`. What's never allowed is zero — tiny changes are exactly the ones that break style and architecture, and none of them reaches a commit unreviewed.
3. **Re-run the app per `verify.mode`.** `always` → re-drive it, every round: prior runtime proof is void the moment the code changed. `autopilot` (you're attended here) or `off` → nobody drives it; say `run: à toi` and let the user re-test. What's never allowed is claiming a check that wasn't run.
4. **Never mark a task done, ever.** This command iterates; **`/wa-validate`** is the only thing that reviews and closes. A round ends at `review`, waiting for the user's next test.

## Micro-fix or implementer

Spawning an isolated agent costs ~50k tokens before it reads a line. For "make the button secondary" that's absurd — **when the review still runs before the commit anyway** (it always does: `review.when: each_round` reviews the round, `on_validation` reviews the cumulative diff at `/wa-validate`). So the main thread may apply a fix itself, under a bounded definition.

**Micro-fix — all of these, no exception:**
- ≤ 2 files touched, ≤ ~20 changed lines total;
- **no new file, no new type, no new folder** — nothing that involves the file/folder layout;
- no layer/boundary decision, no public API change, no concurrency or async change, no new dependency;
- local edits only: wording, string, color, spacing, a constant, a rename inside a file, a condition tweak, a parameter default, swapping a component variant;
- triage said **defect** or **adjustment** — never *new scope*.

Anything else → **implementer**. Doubt → **implementer**. `review.inline_micro_fixes: false` in config → implementer, always.

**Applying a micro-fix yourself, the cost of the shortcut:**
1. **Read the governing convention module first** — `style.md`, plus `swiftui.md` for a view, `elegance.md` for logic. Once per session is enough. You are the one holding the rules for this edit; nobody handed them to you.
2. **Minimal diff, no explanatory comments** (`style.md`), same as an implementer would.
3. **Re-run build + tests** yourself (`build.command` / `build.test_command`, else the language default). Red → fix or escalate; never leave a red tree.
4. **Re-run the app** only when `verify.mode: always` and the surface runs. Can't drive it from here → escalate to the implementer, which holds the build session. Other modes → nothing to drive, the user tests it.
5. **Tag the hunks `inline`** in `## Feedback`. At review time (step 5, or `/wa-validate`) tell the verifier explicitly: *"these hunks were written by the main thread, no convention pass — judge them harder."* An inline fix is the one place the rulebook wasn't in context.

**Escalate mid-fix, without finishing.** It needs a third file, or a new type, or the "one line" turns out to be a layer decision → **stop, hand the whole item to the implementer.** A micro-fix that grew is exactly the change that shouldn't have been inline; don't push it through because you already started.

## Reusing the coding run's agents

`/wa-code` noted the `agentId` of every agent it spawned (the implementer, the verifier). Same session → they're still reachable, and they still hold the conventions, the BRIEF, the code, and the runtime checklist. **Resume them** (`SendMessage` to the id) instead of spawning fresh ones: a feedback round then costs a delta, not a full re-read of the feature.

Rules are `/wa-code` → *Resuming, rounds 2+*, in full — delta only, anti-stale warning every time, respawn fresh past 3 rounds. Two things specific here:

- **No id to hand is normal, not an error.** New session, or the task was delivered by `/wa-autopilot` in another run → spawn fresh with the full inputs. The flow is identical either way; resume is only ever an optimization.
- **A captured rule invalidates context.** Wrote a new line into a convention module (step 3)? The resumed agents hold the *old* module. Tell them explicitly which module changed and what the new rule says — or respawn them fresh. Never let a resumed agent work from a stale rulebook.

## Do

1. **Resolve the task.** Arg = slug or display index (`/wa-feedback 2 the button should be secondary`), resolve per **wa-board → Task indexes**. No task given → the one `in-progress`, else most recent `review`. Ambiguous → ask, don't guess. Read `.whackagent/config.md` + the task file at `{tasks}/<slug>.md` (needs `## Critères d'acceptation`, `## Implémentation`, `## Review`, `## Vérification`). `{…}` paths come from the config's `paths:` block — see **wa-board → Paths**.
   - **`status: validated` → the review it passed is now stale.** Apply the notes as usual, then set it back to `review`: the task needs a fresh `/wa-validate` before it can close. Never close on a review that predates the last edit.
   - **Right branch first.** Task delivered by `/wa-autopilot` — or by `/wa-code` with `branch.per_task: true` — lives on `<branch.prefix><slug>`. Check current branch; if the work isn't here, say which branch it's on and switch **only after user confirms** (their tree may be dirty). Never apply feedback to a branch that doesn't hold the code.
2. **Triage each feedback item** — say out loud which bucket, one line each:
   - **defect** — doesn't match acceptance criteria → fix, criteria unchanged.
   - **adjustment** — works, but not what user wants (naming, placement, wording, behavior detail) → fix, and **update `## Critères d'acceptation`** so the criteria match reality; otherwise verify re-fails on the old criterion forever.
   - **new scope** — a feature the task never covered → **do not code it**. Propose `/wa-task <desc>`. Say plainly: "that's a new task, not feedback."
   - **rule** — a durable preference ("always X", "never Y", "I told you this last time") → see *Capture the rule* below, then treat as adjustment.
   Unclear which bucket → **stop and ask**. Never silently widen scope.
3. **Capture the rule.** Feedback that states a general preference must land in `{conventions}/<module>.md`, not just in this fix — that's how the rule stops being forgotten next round. Pick the module by what it governs (style / elegance / architecture-\* / testing), draft the line in the module's own voice, **show it and ask before writing**. Never rewrite unrelated parts of a module. If it belongs nowhere, put it in `.whackagent/config.md`'s free-form notes instead (that one file never moves).
4. **Fix.** **Route each item first** (*Micro-fix or implementer*) and **say the route out loud**, one word per item: `inline` or `implementer`. Mixed batch → apply the inline ones yourself, dispatch the rest; never split a single item across both.
   - **Inline** — apply per the five steps of that section: governing module read, minimal diff, build + tests, runtime check if the mode owes one, hunks tagged `inline`. Grew past the bounds → escalate the whole item, don't finish it.
   - **Implementer** — **wa-implementer** in **fix mode**, one dispatch per coherent batch (sequential — builds collide otherwise). Resume the task's implementer by its id when you have one: send the feedback items **verbatim in the user's words** plus your triage, and nothing else — it already has the task, the conventions and the code it wrote. Fresh spawn otherwise (note its id for the next round): task path, conventions dir, feedback + triage, changed-files context from `## Implémentation`, `build.command`/`build.test_command` when config sets them, `autopilot: false`. Either way tell it: fix only what's named, minimal diff, no explanatory comments, re-run build/tests.
   - `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Don't guess what the user meant.
5. **Re-verify — only when `review.when: each_round`.** `on_validation` (default) → skip, echo `review: à /wa-validate`, go to step 6: a feedback round is then implementer + runtime check only, and the verifier judges everything at once when the user gives their feu vert. Keep the round's diff hunks noted in `## Implémentation` — `/wa-validate` needs the cumulative diff.
   Dispatch one **wa-verifier**, scoped to the files this fix touched, with the diff hunks inline, **flagging which hunks came from an inline fix** so they get the harder look. Resume it by its id when you have one: send the hunks plus its earlier findings to re-state as fixed or still open; fresh spawn with modules + hunks otherwise. Check its `LENSES:` line covers all four, then severity-order the findings. Autofix loop per `review.autofix` (cap 3 rounds, same as `/wa-code`). Append to the task's `## Review` under a dated feedback round — don't overwrite the original.
6. **Re-run it — only when `verify.mode: always`.** It gets re-driven in step 4 — by you for an inline fix, by the implementer otherwise — against the **updated** acceptance criteria; tell it explicitly when triage moved them, since it reuses its checklist otherwise. Failed checks → back through step 4. Can't run → stop and ask. Append to `## Vérification`, keep the previous round's entry.
   Other modes → append `round <n> : validation manuelle — non exécutée par l'agent` and hand the ball back: the summary in step 8 says what to test, in one line, so the user knows exactly what changed under their fingers.
7. **Log it.** Append a round to the task's `## Feedback`: what user asked (their words), triage, what changed, review verdict (`différée` when `review.when: on_validation`), verify verdict, any rule captured. Refresh `{reports}/<slug>.md`.
8. **Report + loop.** Short on-screen summary: items → what changed → review clean (or `à /wa-validate`) → what to retest. More notes → run again, next round. The feature matches the spec now → **`/wa-validate <slug>`**: that's what fires the verifier and, after your retest, closes the task. **Never set `done` here, never commit** — say the next command instead.

## Asking

Triage doubt, ambiguous note, `BLOCKED:` from the implementer → ask, but **always with your recommended answer** and the one-line reason (which bucket you'd put it in, what you'd change). Never bounce a bare question back at the user. Same rule as `/wa-task`'s grill.

## Never

- Never patch code yourself beyond the micro-fix bounds — "it's basically one line" is the claim, the bounds are the test.
- Never skip review or verify because the change was small — deferring it to validation is a schedule, not a skip. An inline fix is *more* review-bound than a dispatched one, not less: no convention module was in context when it was typed.
- Never leave an inline fix unbuilt, untested, or untagged.
- Never implement a new feature that arrived disguised as feedback.
- Never add comments explaining a fix (`style.md` — code carries meaning, the task file carries rationale).
- Never commit and never close — `/wa-validate` owns both ends of that.

## Next step

More notes → run again. Feature conforme au cahier des charges → **`/wa-validate <slug>`** (verifier on the whole diff, then close after your retest). Closed → **`/wa-wiki`**.
