---
name: wa-code
description: Run the full coding pipeline for a task — plan, code, verify, report — orchestrating isolated subagents.
---

# /wa-code

You **PM**. Plan and dispatch, never write code. One task: **plan → code → verify → report**.

Wording (screen + reports): **wa-board → Voice** — telegraphic, tech terms stay English.

Two subagents: one `wa-implementer`, one `wa-verifier`. **Spawn each once, keep alive** — later rounds = `SendMessage` to `agentId`, never fresh spawn. Isolated agent costs ~50k tokens context before reading line; resuming costs delta.

Read `.whackagent/config.md` and `{tasks}/<slug>.md` first. `{…}` paths from config `paths:` block — see **wa-board → Paths**.

Arg = slug **or** wa-board display index (`/wa-code 3`) — resolve per **wa-board → Task indexes**, echo `3 → sync-offline`.

**Grill gate (soft):** `grilled: false` → warn *"not grilled — quick win, or `/wa-task <slug>` first?"* Proceed if user confirms.

Set task `status: in-progress` (reflect in `{backlog}`).

## 0. Branch — only if `branch.per_task: true`

1. Name = `<branch.prefix><slug>` (default `wa/<slug>`).
2. **Fork point** = `branch.base`, **unless task carry `sprint:`** and `branch.sprint_prefix` non-empty. Then base = sprint branch `<branch.sprint_prefix><sprint>` (default `sprint/login-refacto`): create from `branch.base` if absent, check up to date otherwise. Why it exist — task 3 of sprint fork off task 1 merged work, not rediscover it as conflict. `/wa-close` merges back into it.
3. Already on it → nothing. Exists but not checked out → check out, don't recreate. Absent → create from fork point above (`current` = where you are; else named branch, fetched first if tracks remote).
4. **Dirty tree → stop and ask** before any checkout: carry over, stash, or stay? Never move uncommitted work silently.
5. Echo: `branche: wa/<slug> (base: sprint/login-refacto)` — name sprint branch when it one, say when you just created it.

## 1. Plan

Read task and its `## Contexte / Décisions`. Then **one exploration pass — here, once, for everybody.**

Targeted Grep/Glob over task neighborhood: related code, callers, layer boundaries, what already does part of job. Write **BRIEF** — every subagent gets it verbatim instead of re-deriving same map six times:

```
BRIEF
FILES: <path (N lines) — what it does>          ← line count on every entry, no exception
       <path (2400 lines, READ RANGES ONLY: l.1958-2035) — what it does>
REUSE: <what exists and must be reused, not rewritten>
BOUNDARIES: <layers/modules involved, dependency direction>
LAYOUT: <target files/folders to create, per the architecture module>
GAPS: <what you couldn't resolve — the only thing subagents explore themselves>
```

Line counts not decoration: subagents run hard read budget (no whole-file `Read` above ~400 lines), sizes let them respect it without opening file to find size. Over threshold, name ranges that matter — 11k-token read become 500.

Then **decompose** into bricks, fix **file/folder layout up front** per architecture module (group by feature, proper nesting, never flat), **sketch tests** (units, edge cases — YAGNI, only what task needs).

## 2. Code

**One implementer for whole task**, bricks fed one at a time (sequential — builds collide otherwise).

- **Brick 1** — spawn `wa-implementer`, **note `agentId`**. Pass: task path, BRIEF, brick + target files/folders, conventions dir, test plan, `build.command` / `build.test_command` when config sets them (it never reads config — hand it commands), `verify` block **including `mode`** (it never reads config — say plainly whether it owes runtime proof), `autopilot: false`.
- **Bricks 2..n** — `SendMessage` that id next brick **alone**. No conventions dir, no BRIEF, no task path: it holds them. It built brick 1 too, so know what to reuse — DRY stop being rule it must rediscover.

Receipts:
- `RESULT: done` → record files + build/test/run proof in `## Implémentation`, continue.
- `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Dispatch nothing further until resolved.

**Runtime proof — `verify.mode` decides, and here you attended:**
- `always` → implementer drives app after green build; holds build session, so proof cost it almost nothing. Its `CHECKS:` lines land in `## Vérification`.
- `autopilot` (default) or `off` → **it doesn't.** You at keyboard: build + tests are receipt, and **you** validate by testing app. Say it in report — `run: à toi` — so nobody mistake unrun app for passing one. Write that in `## Vérification` too: *"validation manuelle — non exécutée par l'agent"*.
- Either way implementer may launch app **because it needs to** (reproduce bug, judge layout) — lands in its `NOTES:`, not `CHECKS:`, and don't turn into proof pass.

## 3. Verify — only when `review.when: each_round`

`review.when: on_validation` (default) → **skip this step entirely.** Echo `review: à /wa-validate`, go to step 4.

Why it wait: feature not feature until user say so. Reviewing now review code three feedback rounds about to move — well-reviewed, still wrong thing. **`/wa-validate` is user feu vert on spec, and that fires verifier**, once, over whole diff. Nothing escape review; just happen when reviewing worth something.

All bricks green → spawn **one `wa-verifier`**. Note its `agentId`.

**Hand it change, not repo.** It gets: module paths (`review.modules`), changed-file list **with diff hunks inline**, BRIEF, task path, toggles. It judges diff — don't hunt for what moved.

Then:
1. **Read `LENSES:` line** — `style`, `elegance`, `structure`, `correctness`, all four ✓. One missing = third of review didn't happen: send back for that lens alone before doing anything with findings.
2. **Order** findings by severity (arrive lens-tagged; keep tags).
3. **Autofix** (`review.autofix: true`) → `SendMessage` implementer the findings alone, then re-verify. Loop until clean or no progress, **cap 3 rounds**. Not converging → stop, show what left. `BLOCKED:` → stop and ask.
4. Record final findings + what autofix changed in `## Review`.

**Resuming, rounds 2+** — `SendMessage`, never respawn:
- **Implementer** → findings, nothing else.
- **Verifier** → fix diff hunks **plus its previous findings**, ask it to re-state every one as *fixed* or *still open* before hunting new ones.
- **Always say it:** *"files changed since your last turn — re-read the ones listed; your memory of their content is stale."*
- Past 3-round cap, respawn fresh: transcript full of build logs outweigh re-read it saves.

**`agentId` is handle, not name.** Spawn returns id like `a2f42843b98bdce70`; no way to name agent, label you see = its type plus your description. **Note each id as you spawn it**, mapped to role. Lost ids → spawn fresh. That fallback, not failure: resuming is optimization, never prerequisite.

## 4. Report

- **Show** the **Report card** below — `review → /wa-validate` in status line when step 3 skipped, so user know what still owed.
- **Save** to `{reports}/<slug>.md`: same card, plus full file/folder list, key decisions, review findings.
- Set `status: review` — means *waiting for user to test it*, nothing more.
- **Say what to do next, in this order**: test it. Notes → **`/wa-feedback`**. Matches spec → **`/wa-validate <slug>`**, which fires verifier; **`/wa-close <slug>`** ends it after your retest.
- **Iteration is `/wa-feedback` job.** Never patch code from this thread — even one-liner. `/wa-feedback` only place inline fixes are bounded, tagged, built, flagged to verifier (see its *Micro-fix or implementer*); untracked touch-up here undoes review it about to get.
- **Never set `done` yourself, never commit here.** `review` → `/wa-validate` → `validated` → `/wa-close` → `done`; user "ok c'est ça" = spec approval, not close.

### Report card

Canonical end-of-task report — here, each delivered task of `/wa-autopilot`, each `/wa-feedback` round (variant there). Same skeleton every time, wording per **wa-board → Voice**:

```
## 🟢 Login Apple · `login-refacto`

**Problème** — login email only, friction à l'onboarding.
**Objectif** — Sign in with Apple sur l'écran de login.

**Fait**
- Bouton Sign in with Apple sur login (`LoginView`)
- Login Apple crée/retrouve le user (`AuthService`)
- Entitlement Sign in with Apple activé

**À tester**
- [ ] Cancel sheet → reste sur login
- [ ] Régression : login email marche toujours

✅ vérifié par l'agent : tap Apple → sheet, login OK → Home

build ✅ · tests ✅ · run ✅ · review → /wa-validate
→ next : teste, puis /wa-feedback ou /wa-validate login-apple
```

- **Header** = size + title + sprint tag, as in wa-board list.
- **Problème / Objectif** — one line each, from `## Contexte / Décisions`. Empty (non-grilled quick win) → from `title` + `summary`. Why the task exists, what it aims for — not how.
- **Fait** — what changes for the app, key file as short ref. **5 bullets max.** Full file list only in saved report.
- **À tester** — checklist: acceptance criteria agent did **not** prove, plus regression zones the diff touches. Agent proved everything → `rien d'obligatoire` + one optional smoke test. Never empty silently.
- **✅ vérifié par l'agent** — one line, criteria the runtime check proved (+ screenshot path). Omit when nothing proven.
- **Status line** — build · tests · run (`✅` / `à toi`) · review (`clean` / `→ /wa-validate`). Never claim check nobody ran.
- Headings follow `discussion_language` (`Problem / Goal / Done / To test` in en).

## 5. Closing — not yours

Commit, branch landing and `status: done` belong to **`/wa-close`**. Nothing in this file commits or moves branch after step 0.

## Asking

Every question you put to user — `BLOCKED:`, architecture fork, failed check — **carries your recommended answer** plus one-line reason. Never relay bare `BLOCKED:`: read it, form opinion, propose it.

## Never

Never write code yourself. Never commit — closing is `/wa-close` job. Never mark task `done`. Never switch branches with dirty tree. Never let subagents touch backlog/wiki/reports — you own those. Never write to literal `.whackagent/` path when config `paths:` points elsewhere.

## Next step

Test it. Notes → **`/wa-feedback`**. Conforme → **`/wa-validate <slug>`** (verifier), puis **`/wa-close <slug>`** after retest. Closed → **`/wa-wiki`**.