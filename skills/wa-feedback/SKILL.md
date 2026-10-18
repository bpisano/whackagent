---
name: wa-feedback
description: Applies your notes on a coded task, then re-checks it. Use after /wa-code or /wa-autopilot.
---

# /wa-feedback

Applies the user's notes on a coded task, without losing rules. Ends at `to-test`.

Read: voice, pr, components, tasks, git, store

## Steps

1. **Resolve the task** per **tasks → Ids**.
   - No id → the `coding` task, else the most recent `to-test`. Ambiguous → ask.
   - Read config + task per **store**: criteria, `## Implementation`, `## Review`, `## Verification`.
   - `to-close` → review is stale. Apply notes, round ends `to-test`: needs a fresh `/wa-validate`.
2. **Get on the right branch** (**git → Task branch**).
   - Code on `<branch.prefix><key>`, you're elsewhere → say which, switch only on yes.
   - On the sprint test branch, clean tree → switch, no ask (**git → Sprint test branch → Leaving it**). Values tweaked there → carry over, they're feedback.
   - `github` → `git fetch` + pull first.
   - `stacked on:` line, blocker moved → rebase own commits onto its new tip, update the line (**git → Stacking**).
   - Task is a blocker with stacked dependents → say they go stale until their next round.
3. **Lock** — `github` → `claim <n> coding` (**store-github → Locks**).
   - PR ready → `gh pr ready --undo` before touching code.
4. **Triage** each note, one line each, bucket said out loud:
   - **defect** — misses criteria → fix, criteria unchanged.
   - **adjustment** — works, not what user wants → fix + update `## Acceptance criteria`.
   - **new scope** — never covered → don't code. Say it's a new task, propose `/wa-task <desc>`.
   - **rule** — durable preference ("always X", "never Y") → step 5, then adjustment.
   - Unclear → ask. Never widen scope.
5. **Capture the rule** into `{conventions}/<module>.md`, module by what it governs (style, elegance, architecture-\*, testing, wording).
   - Word choice, rewritten string, tone fix → **voice → Learning**.
   - Draft the line in the module's voice, show it, write only on yes.
   - Never touch unrelated parts. Fits nowhere → free-form notes in `.whackagent/config.md`.
   - Resumed agents hold the old module → tell them which module and the new rule, or respawn fresh.
6. **Fix** — route each item (**Micro-fix**), say `inline` or `implementer` per item.
   - Mixed batch → inline ones yourself, dispatch the rest. One item never split across both.
   - **Inline** → **Micro-fix** steps.
   - **Implementer** → `wa-implementer` fix mode, one dispatch per coherent batch, sequential (builds collide).
     - Resume by `agentId` when you have one (**wa-code → Verify** resume rules): notes verbatim + triage, nothing else.
     - Else fresh, note the id: task ref, conventions dir, notes + triage, changed files from `## Implementation`, `build.command` / `build.test_command` if set, `autopilot: false`.
     - No id is normal (new session, `/wa-autopilot` run).
     - Tell it: fix only what's named, minimal diff, no explanatory comments, re-run build + tests.
     - Criteria moved → tell it, so the runtime check uses the new ones.
   - `RESULT: blocked` → ask its `BLOCKED:` question.
7. **Review** per `review.when`:
   - `on_validation` (default) → skip, echo `review: → /wa-validate`. Note round hunks in `## Implementation`: `/wa-validate` needs the cumulative diff.
   - `each_round` → one `wa-verifier` per **wa-code → Verify**, scoped to touched files, hunks inline.
     - Flag `inline` hunks: main thread, no convention pass, judge harder.
     - Resumed → send hunks + its earlier findings to mark fixed / open.
     - Check `LENSES:` covers all four. Autofix per `review.autofix`, cap 3 rounds.
     - Append to `## Review` under a dated feedback round, never overwrite.
8. **Runtime check** per `verify.mode`:
   - `always` → re-driven in step 6 (you inline, implementer else), against updated criteria. Prior proof is void.
     - Fails → back to step 6. Can't run → ask.
     - Append to `## Verification`, keep earlier rounds.
   - `autopilot` / `off` → append `round <n>: manual validation — not run by agent`, `run: yours`.
9. **Log** — append to `## Feedback`: asked (user's words), triage, changes, review verdict (`deferred` if `on_validation`), verify verdict, rule captured, `inline` hunk tags.
   - Refresh `{reports}/<key>.md`.
   - `github` → `status: to-test`, commit (**git → Commits**), push, mergeable check (**store-github → Rounds**).
   - Aborted before any push → `release <n> coding --reset-to <state claimed from>`.
   - Sprint task → rebuild + check out **git → Sprint test branch**.
10. **Report** → **components → Report**, feedback variant: `· round <n>` + **Asked**.

## Micro-fix

Inline only when **all** hold:
- ≤ 2 files, ≤ ~20 changed lines.
- No new file, type or folder.
- No layer/boundary call, public API, concurrency/async change, new dependency.
- Local edits: wording, string, color, spacing, constant, in-file rename, condition tweak, param default, component variant.
- Triage = defect or adjustment.

Else, in doubt, or `review.inline_micro_fixes: false` → implementer.

Inline steps:
1. Read the governing module first: `style.md`, + `swiftui.md` for views, `elegance.md` for logic. Once per session.
2. Minimal diff, no explanatory comments.
3. Re-run build + tests (`build.command` / `build.test_command`, else language default). Red → fix or escalate.
4. `verify.mode: always` + a surface (UI) touched → drive the app. Can't from here → escalate.
5. Tag hunks `inline` in `## Feedback`.

Mid-fix needs a third file, a new type, or a layer call → stop, hand the whole item to the implementer.

## Never

- Never patch past micro-fix bounds. "Basically one line" is a claim, bounds are the test.
- Never skip review or runtime check because the change is small. Deferred ≠ skipped.
- Never leave an inline fix unbuilt, untested or untagged.
- Never code new scope disguised as feedback.
- Never apply feedback on a branch without the code, never on a test branch.
- Never claim a check nobody ran.
- Never set `done`, never close. Never commit, except `github` round end. Never mark the PR ready, never merge.
- Never push mid-round.

## Ask

- Triage doubt, ambiguous note, `BLOCKED:` → **components → Question**.

## Next

- More notes → `/wa-feedback <id> <notes>`.
- Matches spec → `→ next: retest, then /wa-validate 42 or /wa-close 42` (`/wa-close` runs the verifier itself).
