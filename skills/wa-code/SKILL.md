---
name: wa-code
description: Run the full coding pipeline for a task — plan, code, verify, report — orchestrating isolated subagents.
model: opus
---

# /wa-code

You **PM**. Plan and dispatch, never write code. One task: **plan → code → verify → report**.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `paths.md` `session-name.md` `display.md` `blockers.md` · `branch.worktree: true` → + `worktrees.md` · `backlog.provider: github` → + `provider-github.md` `pull-requests.md` `commits.md` · `branch.tracks` non-empty → + `tracks.md` · `branch.test_branch: true` → + `test-branch.md`.

Wording (screen + reports): **reference/voice.md** — telegraphic, tech terms stay English.

Two subagents: one `wa-implementer`, one `wa-verifier`. **Spawn each once, keep alive** — later rounds = `SendMessage` to `agentId`, never fresh spawn. Isolated agent costs ~50k tokens context before reading line; resuming costs delta.

Read `.whackagent/config.md` and `{tasks}/<slug>.md` first. `{…}` paths from config `paths:` block — see **reference/paths.md**.

Arg = slug **or** wa-board display index (`/wa-code 3`) — resolve per **reference/display.md → Task indexes**, echo `3 → sync-offline`. Name session per **reference/session-name.md** (GitHub: once claimed, **0b**).

**Grill gate (soft):** `grilled: false` → warn *"not grilled — quick win, or `/wa-grill <slug>` first?"* Proceed if user confirms.

**Blocker gate (soft):** open blocker (**reference/blockers.md**) → warn *"blocked by login-apple (review) — code anyway? (recommended: no — land login-apple first: this task builds on its code)"*, old `note: Depends on` hint named in same warning. Proceed only on yes. Hint alone (no open blocker) → never gates: one info line `note: depends on <x> (old note)`, no question.

Set task `status: in-progress` (reflect in `{backlog}`). GitHub provider → step **0b** instead of this line, grill gate and step 0.

## 0. Branch — only if `branch.per_task: true`

1. Name = `<branch.prefix><slug>` (default `wa/<slug>`).
2. **Fork point** = `branch.base` — track task: its trunk (**reference/tracks.md**), same everywhere below — **unless task carry `sprint:`** and `branch.sprint_prefix` non-empty. Then base = sprint branch `<branch.sprint_prefix><sprint>` (default `sprint/login-refacto`): create from `branch.base` if absent, check up to date otherwise. Why it exist — task 3 of sprint fork off task 1 merged work, not rediscover it as conflict. `/wa-close` merges back into it.
3. Already on it → nothing. Exists but not checked out → check out, don't recreate. Absent → create from fork point above (`current` = where you are — on a `wa-test/` branch: its base, never fork from it, **reference/test-branch.md**; else named branch, fetched first if tracks remote).
4. **Dirty tree → stop and ask** before any checkout: carry over, stash, or stay? Never move uncommitted work silently.
5. Echo: `branch: wa/<slug> (base: sprint/login-refacto)` — name sprint branch when it one, say when you just created it.
6. **Track task only** (**reference/tracks.md**): trunk lags `branch.base` → offer sync before forking, recommended yes when fork is fresh. Task carry `lands: <track>` → *Landing* rule there: final sync, then merge track branch into this branch before plan. Neither → skip.

**`branch.worktree: true`** → no checkout here: steps 3–4 become worktree create/reuse per **reference/worktrees.md** (same name, same fork point; `current` = main checkout's branch). Echo `worktree: ../<repo>-worktrees/<slug> (wa/<slug>, base: …)`. Rest of pipeline runs in that worktree.

## 0b. GitHub provider — claim before code

`backlog.provider: github` (rules **reference/provider-github.md**) replaces grill gate, status write and step 0:

0. **Hooks version gate** (**reference/provider-github.md**, *Hooks version gate*) before claim.
1. **Resolve** arg: `#12` / `12` / display index. No arg → top unclaimed `grilled` from `wa-backlog list --state grilled`. Blocker gate on `wa-backlog get <n>` → `blocked_by`, before claim, per **BOARD.md → Dependencies**: open **related** blocker (same sprint or track) → never code it from base. Arg given → wait, or `/wa-autopilot` stacks it — say so, stop. No arg → skip it like exit 3 (`#12 skipped — blocked by #9, same sprint`), try next `grilled`. Unrelated → warn as above; yes → PR body `Blocked by #<x>: merge order is yours.`
2. **Claim** `wa-backlog claim <n> coding`. Exit 3 → `#12 coded by <agent>` — no arg given: try next `grilled`; arg given: stop. Exit 4 → not `grilled`/`review`: `todo` means not grilled → suggest `/wa-grill <n>`; stop.
3. **Branch** — ticket branch exists (grilling pushed it): `wa-backlog branch <n>`, fetch, check out **in current worktree**. Dirty tree → stop and ask first. Never create fresh branch when one exists: spec lives on it. Exists but holds no `{tasks}/<n>-*.md` (earlier round on issue-body spec dropped before first commit) → build task file from issue body as *Spec in issue body*, commit `task: spec #<n> <slug>`. **None** (spec in issue body, **reference/provider-github.md**, *Spec in issue body*) → create it linked, first commit = task file from issue body. Git refusing because another local worktree holds branch → say which, stop. `branch.worktree: true` → reuse or add `{worktrees}/<n>-<slug>` on that branch instead (**reference/worktrees.md**); worktree already there = yours to reuse, not a refusal.
4. **Spec** = `{tasks}/<n>-<slug>.md` on that branch (just built from issue body when step 3 created it). Set `phase: in-progress` there (local writes `status:`). **No push mid-round** — any push to branch with open PR fires `synchronize`: hook ends round and drops your claim while you still code.
5. **Track check** — only when `branch.tracks` non-empty: ticket milestone vs PR base / fork commit disagree on trunk → say so, offer move (**reference/tracks.md**), never code on wrong trunk. Then step 0.6 (sync offer, landing merge).
6. Rest of pipeline unchanged. Step 4 `status: review` → `phase: review`. Report card header shows `#<n>` + PR URL.
7. **Deliver = end of round** (**reference/provider-github.md**, *Agent round*, *Screenshots* — `each_round` only): commit code + task file (per **reference/commits.md**), push, open **draft PR** (or push to existing one + refresh its body, **reference/provider-github.md**, *PR body refresh*). Board moves to `review` by itself: ticket never waits for your test in `coding`. First push of ticket = outward-facing → one-line plan (`push wa/12-… + draft PR → sprint/x`) + yes, first time only; later rounds push without asking.
8. **Blocked / user drops it** → `wa-backlog release <n> coding --reset-to grilled --reason "<why>"` (`--reset-to review` when PR already open). Round created branch, never pushed commit → delete it, local + remote (`git push origin --delete <branch>`: holds only fork point), as `/wa-grill` abort. Coding lock never left dangling on abandon.

## 1. Plan

Read task and its `## Context / Decisions`. Then **one exploration pass — here, once, for everybody.**

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

**Post bricks** — provider `comment` on ticket, after decomposition, before first dispatch (GitHub: multi-line text → `wa-backlog comment <n> --body-file <file>`, `-` = stdin). One line per brick, what it builds + key file:

```
🧱 3 bricks
1. Apple auth provider — `AuthService`
2. Sign in with Apple button — `LoginView`
3. Button → provider wiring, error toast
```

Local provider → `comment` is no-op, nothing to do. Later round re-plans bricks → new comment, never edit old one, never touch issue body (human's).

## 2. Code

**One implementer for whole task**, bricks fed one at a time (sequential — builds collide otherwise).

- **Brick 1** — spawn `wa-implementer`, **note `agentId`**. Pass: task path, BRIEF, brick + target files/folders, conventions dir, test plan, `build.command` / `build.test_command` when config sets them (it never reads config — hand it commands), `tools` entries whose `when` holds `code` (name, `run`, `fix`), `verify` block **including `mode`** (it never reads config — say plainly whether it owes runtime proof), `autopilot: false`. Worktree mode → plus worktree path and its *work only under* line (**reference/worktrees.md**).
- **Glossary** — `{wiki}/glossary.md` exists → brick 1 also gets its path (step 3 verifier too). Absent → nothing passed.
- **Screenshots** — GitHub provider + `pr.screenshots: each_round` (or key missing) → every brick dispatch asks: *diff changes UI → return final-state `SCREENSHOTS:`* (**reference/provider-github.md**, *Screenshots*). Last receipt's shots = upload. `validation`, `off` or local provider → never asked.
- **Bricks 2..n** — `SendMessage` that id next brick **alone**. No conventions dir, no BRIEF, no task path: it holds them. It built brick 1 too, so know what to reuse — DRY stop being rule it must rediscover.

Receipts:
- `RESULT: done` → record files + build/test/tools/run proof + `NOTES:` worth keeping in `## Implementation`, continue.
- `RESULT: blocked` → **stop and ask** the `BLOCKED:` question. Dispatch nothing further until resolved.

**Runtime proof — `verify.mode` decides, and here you attended:**
- `always` → implementer exercises what it built (app, web, server, CLI — per `verify.platform`) after green build; holds build session, so proof cost it almost nothing. Its `CHECKS:` lines land in `## Verification`.
- `autopilot` (default) or `off` → **it doesn't.** You at keyboard: build + tests are receipt, and **you** validate by testing app. Say it in report — `run: yours` — so nobody mistake unrun app for passing one. Write that in `## Verification` too: *"manual validation — not run by agent"*.
- Either way implementer may launch app **because it needs to** (reproduce bug, judge layout) — lands in its `NOTES:`, not `CHECKS:`, and don't turn into proof pass.

## 3. Verify — only when `review.when: each_round`

`review.when: on_validation` (default) → **skip this step entirely.** Echo `review: at /wa-validate`, go to step 4.

Why it wait: feature not feature until user say so. Reviewing now review code three feedback rounds about to move — well-reviewed, still wrong thing. **`/wa-validate` is user green light on spec, and that fires verifier**, once, over whole diff. Nothing escape review; just happen when reviewing worth something.

All bricks green → spawn **one `wa-verifier`**. Note its `agentId`.

**Hand it change, not repo.** It gets: module paths (`review.modules`), changed-file list **with diff hunks inline** (worktree mode: diffed in the worktree), BRIEF, task path, toggles. It judges diff — don't hunt for what moved.
Plus glossary path when step 2 passed one.

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
- **Test branch** (`branch.test_branch: true`) — rebuild for this task's base per **reference/test-branch.md**, after delivery (GitHub: after push). Git only, no build. Built → checked out last, clean tree only (*Checkout* there). Result goes in card's 📍 line.
- **Say what to do next, in this order**: test it where 📍 line says. Notes → **`/wa-feedback`**. Matches spec → **`/wa-validate <slug>`**, which fires verifier; **`/wa-close <slug>`** ends it after your retest. GitHub: `/wa-validate` syncs wiki + readies PR; merge on GitHub or `/wa-close <n>`.
- **Iteration is `/wa-feedback` job.** Never patch code from this thread — even one-liner. `/wa-feedback` only place inline fixes are bounded, tagged, built, flagged to verifier (see its *Micro-fix or implementer*); untracked touch-up here undoes review it about to get.
- **Never set `done` yourself, never commit here.** `review` → `/wa-validate` → `validated` → `/wa-close` → `done`; user "ok that's it" = spec approval, not close.

### Report card

Canonical end-of-task report — here, each delivered task of `/wa-autopilot`, each `/wa-feedback` round (variant there). Same skeleton every time, wording per **reference/voice.md**:

```
## 🟢 Login Apple · `login-refacto`

**Problem** — email-only login, onboarding friction.
**Goal** — Sign in with Apple on login screen.

**Done**
- Sign in with Apple button on login (`LoginView`)
- Apple login creates/finds user (`AuthService`)
- Apple provider registered in auth config

**To test**
- [ ] Cancel sheet → stays on login
- [ ] Regression: email login still works

✅ verified by agent: tap Apple → sheet, login OK → Home

build ✅ · tests ✅ · run ✅ · review → /wa-validate
📍 you're on wa/login-apple
→ next: test it, then `/wa-validate login-apple` (or `/wa-feedback login-apple <notes>`)
```

- **Header** = size + title + sprint tag, as in wa-board list (**reference/display.md → Display format**).
- **Problem / Goal** — one line each, from `## Context / Decisions`. Empty (non-grilled quick win) → from `title` + `summary`. Why the task exists, what it aims for — not how.
- **Done** — what changes for the user, key file as short ref. **5 bullets max.** Full file list only in saved report.
- **To test** — checklist: acceptance criteria agent did **not** prove, plus regression zones the diff touches. Agent proved everything → `nothing required` + one optional smoke test. Never empty silently.
- **✅ verified by agent** — one line, criteria the runtime check proved (+ screenshot path or command). Omit when nothing proven.
- **Status line** — build · tests · tools (only when `code`-stage tools configured) · run (`✅` / `yours`) · review (`clean` / `→ /wa-validate`). Never claim check nobody ran.
- **📍 Where line** — where user tests, after status line. Main checkout → `📍 you're on <branch>` (`git branch --show-current` at report time). Worktree mode → `📍 test in <worktree> (<branch>)`. Test branch built → its line instead, plus its `⚠️` lines (**reference/test-branch.md**, *Where line*).
- Headings follow `discussion_language` (translated when not `en`).

## 5. Closing — not yours

Commit, branch landing and `status: done` belong to **`/wa-close`**. Nothing in this file commits or moves branch after step 0 — **except GitHub provider** step 0b.7: delivery commit + push + draft PR, so ticket leaves `coding`; and test branch rebuild + checkout (step 4): merges on local throwaway `wa-test/` branch only, never task, sprint or base branch. Ready PR = `/wa-validate`; merge = human, or `/wa-close` on their yes.

## Asking

Every question you put to user — `BLOCKED:`, architecture fork, failed check — **carries your recommended answer** plus one-line reason. Never relay bare `BLOCKED:`: read it, form opinion, propose it.

## Never

Never write code yourself. Never commit — closing is `/wa-close` job (GitHub provider exception: round-end commit + push, 0b.7; test branch merges aside, step 4). Never mark task `done`. Never switch branches with dirty tree. Never let subagents touch backlog/wiki/reports — you own those. Never write to literal `.whackagent/` path when config `paths:` points elsewhere.

## Next step

Test it. Notes → **`/wa-feedback`**. Matches spec → **`/wa-validate <slug>`** (verifier), then **`/wa-close <slug>`** after retest (syncs wiki itself). GitHub: `/wa-validate` syncs wiki + readies PR; merge on GitHub or `/wa-close <n>`.