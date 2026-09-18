---
name: wa-feedback
description: Apply your feedback on task just coded — routed by size (micro-fix here, bigger through same isolated pipeline as /wa-code), then re-verified and reviewed before any commit. Use after /wa-code or /wa-autopilot when you want changes to what was built.
---

# /wa-feedback

You saw build. You have notes. This apply them **without losing rules**.

Wording (screen + reports): **wa-board → Voice** — telegraphic, tech terms stay English.

Feedback where quality leak: change feel small, so code patched straight from main thread — no convention modules loaded, no reviewer look, nothing re-run. Three rounds later feature drift off style, off architecture, nobody re-check it work. This skill make that impossible: **inline fix safe because reviewer still see it before commit** — never because it looked small.

## Hard rules

1. **Route fix by size, not by feel.** **Micro-fix** (see *Micro-fix or implementer*) you apply yourself, here. Anything else — and anything unsure — go through **wa-implementer** in fix mode. Fresh one get conventions dir and re-read every module before touching; resumed one already hold them (see *Reusing the coding run's agents*).
2. **Always re-verify before task close.** *When* depend on `review.when`: `each_round` → verifier round after every fix; `on_validation` (default) → none here, one pass over whole diff at `/wa-validate`. Never allowed: zero. Tiny changes exactly ones that break style and architecture. None reach commit unreviewed.
3. **Re-run app per `verify.mode`.** `always` → re-drive every round: prior runtime proof void moment code changed. `autopilot` (attended here) or `off` → nobody drive; say `run: à toi`, user re-test. Never allowed: claim check that wasn't run.
4. **Never mark task done, ever.** This command iterate; **`/wa-validate`** review, **`/wa-close`** close. Round end at `review`, waiting user next test.

## Micro-fix or implementer

Isolated agent cost ~50k tokens before reading line. For "make button secondary" that absurd — **review still run before commit anyway** (always: `review.when: each_round` review the round, `on_validation` review cumulative diff at `/wa-validate`). So main thread may apply fix itself, under bounded definition.

**Micro-fix — all of these, no exception:**
- ≤ 2 files touched, ≤ ~20 changed lines total;
- **no new file, no new type, no new folder** — nothing touching file/folder layout;
- no layer/boundary decision, no public API change, no concurrency or async change, no new dependency;
- local edits only: wording, string, color, spacing, constant, rename inside file, condition tweak, parameter default, swap component variant;
- triage said **defect** or **adjustment** — never *new scope*.

Anything else → **implementer**. Doubt → **implementer**. `review.inline_micro_fixes: false` in config → implementer, always.

**Applying micro-fix yourself, cost of shortcut:**
1. **Read governing convention module first** — `style.md`, plus `swiftui.md` for view, `elegance.md` for logic. Once per session enough. You hold rules for this edit; nobody hand them to you.
2. **Minimal diff, no explanatory comments** (`style.md`), same as implementer would.
3. **Re-run build + tests** yourself (`build.command` / `build.test_command`, else language default). Red → fix or escalate; never leave red tree.
4. **Re-run app** only when `verify.mode: always` and surface run. Can't drive from here → escalate to implementer, it hold build session. Other modes → nothing to drive, user test it.
5. **Tag hunks `inline`** in `## Feedback`. At review time (step 5, or `/wa-validate`) tell verifier explicit: *"these hunks written by main thread, no convention pass — judge harder."* Inline fix = one place rulebook wasn't in context.

**Escalate mid-fix, without finishing.** Need third file, or new type, or "one line" turn out layer decision → **stop, hand whole item to implementer.** Micro-fix that grew exactly the change that shouldn't be inline; don't push through because you started.

## Reusing the coding run's agents

`/wa-code` noted `agentId` of every agent it spawned (implementer, verifier). Same session → still reachable, still hold conventions, BRIEF, code, runtime checklist. **Resume them** (`SendMessage` to id) instead of fresh spawn: feedback round then cost delta, not full re-read of feature.

Rules = `/wa-code` → *Resuming, rounds 2+*, in full — delta only, anti-stale warning every time, respawn fresh past 3 rounds. Two things specific here:

- **No id to hand is normal, not error.** New session, or task delivered by `/wa-autopilot` in another run → spawn fresh with full inputs. Flow identical either way; resume only optimization.
- **Captured rule invalidate context.** Wrote new line into convention module (step 3)? Resumed agents hold *old* module. Tell them explicit which module changed and what new rule say — or respawn fresh. Never let resumed agent work from stale rulebook.

## Do

1. **Resolve task.** Arg = slug or display index (`/wa-feedback 2 the button should be secondary`), resolve per **wa-board → Task indexes**. No task given → the `in-progress` one, else most recent `review`. Ambiguous → ask, don't guess. Read `.whackagent/config.md` + task file at `{tasks}/<slug>.md` (need `## Critères d'acceptation`, `## Implémentation`, `## Review`, `## Vérification`). `{…}` paths come from config `paths:` block — see **wa-board → Paths**.
   - **`status: validated` → review it passed now stale.** Apply notes as usual, then set back to `review`: task need fresh `/wa-validate` before `/wa-close`. Never close on review predating last edit.
   - **Right branch first.** Task delivered by `/wa-autopilot` — or `/wa-code` with `branch.per_task: true` — live on `<branch.prefix><slug>`. Check current branch; if work not here, say which branch it on and switch **only after user confirms** (their tree may be dirty). Never apply feedback to branch that don't hold the code.
2. **Triage each feedback item** — say out loud which bucket, one line each:
   - **defect** — don't match acceptance criteria → fix, criteria unchanged.
   - **adjustment** — work, but not what user want (naming, placement, wording, behavior detail) → fix, and **update `## Critères d'acceptation`** so criteria match reality; else verify re-fail on old criterion forever.
   - **new scope** — feature task never covered → **do not code it**. Propose `/wa-task <desc>`. Say plain: "that's a new task, not feedback."
   - **rule** — durable preference ("always X", "never Y", "I told you this last time") → see *Capture the rule* below, then treat as adjustment.
   Unclear which bucket → **stop and ask**. Never silently widen scope.
3. **Capture the rule.** Feedback stating general preference must land in `{conventions}/<module>.md`, not just this fix — that how rule stop being forgotten next round. Pick module by what it govern (style / elegance / architecture-\* / testing), draft line in module own voice, **show it and ask before writing**. Never rewrite unrelated parts of module. Belong nowhere → put in `.whackagent/config.md` free-form notes instead (that file never move).
4. **Fix.** **Route each item first** (*Micro-fix or implementer*) and **say route out loud**, one word per item: `inline` or `implementer`. Mixed batch → apply inline ones yourself, dispatch rest; never split single item across both.
   - **Inline** — apply per five steps of that section: governing module read, minimal diff, build + tests, runtime check if mode owe one, hunks tagged `inline`. Grew past bounds → escalate whole item, don't finish it.
   - **Implementer** — **wa-implementer** in **fix mode**, one dispatch per coherent batch (sequential — builds collide otherwise). Resume task implementer by id when you have one: send feedback items **verbatim in user words** plus your triage, nothing else — it already have task, conventions, code it wrote. Fresh spawn otherwise (note id for next round): task path, conventions dir, feedback + triage, changed-files context from `## Implémentation`, `build.command`/`build.test_command` when config set them, `autopilot: false`. Either way tell it: fix only what named, minimal diff, no explanatory comments, re-run build/tests.
   - `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Don't guess what user meant.
5. **Re-verify — only when `review.when: each_round`.** `on_validation` (default) → skip, echo `review: à /wa-validate`, go to step 6: feedback round then implementer + runtime check only, verifier judge everything at once when user give feu vert. Keep round diff hunks noted in `## Implémentation` — `/wa-validate` need cumulative diff.
   Dispatch one **wa-verifier**, scoped to files this fix touched, diff hunks inline, **flagging which hunks came from inline fix** so they get harder look. Resume by id when you have one: send hunks plus its earlier findings to re-state as fixed or still open; fresh spawn with modules + hunks otherwise. Check its `LENSES:` line cover all four, then severity-order findings. Autofix loop per `review.autofix` (cap 3 rounds, same as `/wa-code`). Append to task `## Review` under dated feedback round — don't overwrite original.
6. **Re-run it — only when `verify.mode: always`.** Re-driven in step 4 — by you for inline fix, by implementer otherwise — against **updated** acceptance criteria; tell it explicit when triage moved them, it reuse its checklist otherwise. Failed checks → back through step 4. Can't run → stop and ask. Append to `## Vérification`, keep previous round entry.
   Other modes → append `round <n> : validation manuelle — non exécutée par l'agent` and hand ball back: summary in step 8 say what to test, one line, so user know exactly what changed under their fingers.
7. **Log it.** Append round to task `## Feedback`: what user asked (their words), triage, what changed, review verdict (`différée` when `review.when: on_validation`), verify verdict, any rule captured. Refresh `{reports}/<slug>.md`.
8. **Report + loop.** **wa-code → Report card**, feedback variant: header `## 🟢 <title> · feedback #<n>`, **Demandé** (user words, short) replaces Problème + Objectif, rest identical — Fait, À tester, status line, next. More notes → run again, next round. Feature match spec now → **`/wa-validate <slug>`**: that fire verifier; **`/wa-close <slug>`** end it after your retest. **Never set `done` here, never commit** — say next command instead.

## Asking

Triage doubt, ambiguous note, `BLOCKED:` from implementer → ask, but **always with your recommended answer** and one-line reason (which bucket you'd pick, what you'd change). Never bounce bare question back at user. Same rule as `/wa-task` grill.

## Never

- Never patch code yourself beyond micro-fix bounds — "it's basically one line" is claim, bounds are test.
- Never skip review or verify because change small — deferring to validation is schedule, not skip. Inline fix *more* review-bound than dispatched one, not less: no convention module in context when typed.
- Never leave inline fix unbuilt, untested, or untagged.
- Never implement new feature arriving disguised as feedback.
- Never add comments explaining fix (`style.md` — code carry meaning, task file carry rationale).
- Never commit and never close — `/wa-validate` own review, `/wa-close` own commit and branch.

## Next step

More notes → run again. Feature conforme au cahier des charges → **`/wa-validate <slug>`** (verifier on whole diff), puis **`/wa-close <slug>`** after your retest. Closed → **`/wa-wiki`**.