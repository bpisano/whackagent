---
name: wa-validate
description: Your green light on coded task — verifier over whole diff, verdict recorded. GitHub: marks PR ready. Never merges.
---

# /wa-validate

**Your green light on spec, not code.** You tested feature, does what spec says. That statement unlock verification pass: verifier judge *how* written, over whole diff, once.

Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `voice.md` `paths.md` `session-name.md` · arg is display index → + `display.md` · `branch.worktree: true` → + `worktrees.md` · `backlog.provider: github` → + `provider-github.md` `pull-requests.md` `commits.md` · `branch.tracks` non-empty → + `tracks.md`.

Wording (screen + reports): **reference/voice.md** — telegraphic, tech terms stay English.

Does **not** set task `done`, never touch git (GitHub provider: its round commits, pushes, marks ticket PR ready — *GitHub provider* below). You probably retest after review touch things — closing separate deliberate step: **`/wa-close`**.

Where it sit: `/wa-task` → `/wa-grill` → `/wa-code` → *you test, `/wa-feedback`, you test again* → **`/wa-validate`** → verifier → *you retest* → **`/wa-close`**.

## Why it's a command and not a step

Review every round burn one verifier per note, review code about to change anyway. Review before you said "yes, that's feature" review wrong feature well. So review wait for exactly one signal — yours — then run once, over everything.

## Do

1. **Resolve task.** Slug or display index, per **reference/display.md → Task indexes**; echo what you resolved. No arg → most recent `review`. Name session per **reference/session-name.md**. Read `.whackagent/config.md` + task file at `{tasks}/<slug>.md` — `{…}` paths from config's `paths:` block, see **reference/paths.md**.
   - `status: in-progress` → code not finished. Say so, don't review half-task.
   - `status: validated` → already reviewed. Code moved since → re-review delta; untouched → nothing to do, closing is **`/wa-close <slug>`**.
   - `status: done` / `canceled` → nothing to do.
2. **Be on right branch.** `branch.per_task` or `/wa-autopilot` delivery → work live on `<branch.prefix><slug>`. Not here → say which branch, switch **only after user confirms** (their tree may be dirty). `branch.worktree: true` → no switch: review in task worktree, recreated from branch if gone (**reference/worktrees.md**).
3. **State what you take as validated** — the `## Acceptance criteria`, listed back in one block. Criterion they know unmet means they wanted `/wa-feedback`, not this: say so and stop rather than review feature still being finished.
4. **Run project tools** — `tools` entries whose `when` holds `validation`, each `run` as given, whole project, here in main thread (verifier read-only). Failures in diff files → `tool:<name>` findings, severity `major`. Failures in files diff never touched → pre-existing: one line in report, never findings, never fixed. No such entry → skip, echo nothing.
5. **Dispatch verifier** — point of command. One `wa-verifier`, per `/wa-code` step 3 in full.
   - **Scope = cumulative diff**: `branch.base..HEAD` (track task: `<trunk>..HEAD`, **reference/tracks.md**) plus working tree when task has own branch, else every file in `## Implementation` and each `## Feedback` round. Hunks inline, `inline`-tagged ones **flagged as written without convention pass** — those get harder look.
   - Hand it step 4 tool findings, so it don't re-report them.
   - Resume run's verifier by `agentId` when id still live (hunks + anti-stale warning); fresh spawn otherwise.
6. **Check sweep → autofix.** `LENSES:` short of four ✓ → send back for missing lens first; this pass close task, lens skipped here skipped for good. Then merge tool findings, order by severity, keep lens and `tool:` tags. `review.autofix: true` → dispatch implementer (tool findings carry their `run` + `fix` commands: it try `fix` first, never you — fixer edits code), re-run failing tools + re-verify, loop until clean or no progress, **cap 3 rounds**. Not converging → stop, show what left. Record everything in `## Review` under `validation` round.
7. **Runtime.** `verify.mode: always` and autofix touched code → implementer re-drive app. Any other mode → **say plainly code moved since user tested it** and name files, so nobody treat stale test as proof.
8. **Set `status: validated`** (reflect in `{backlog}`) **only** when verdict clean, or user explicitly accepts remaining findings (record which in `## Review`). Otherwise stays `review`. Never `done` here — that's user's second look, not yours.
9. **Refresh `{reports}/<slug>.md`** (main checkout, never worktree) — append `validation` round: tool + verifier findings, what autofix changed, status line `review ✅ clean` or open findings. Report predating this pass otherwise still show unreviewed code.
10. **Report + hand back**, one of three:
   - **Clean, autofix changed nothing** → code they tested *is* code reviewed. Nothing to retest: *"`/wa-close <slug>` whenever you want."*
   - **Clean, autofix changed code** → list what changed, in their terms. *"Retest, then `/wa-close <slug>`."*
   - **Findings still open** → show severity-ordered, with recommendation per item (fix now / accept and close / spin off `/wa-task`). Don't hand off to `/wa-close` with findings open — say which ones you'd accept. Status stays `review`: next is `/wa-feedback`, then `/wa-validate`. User accepts every finding left → record them in `## Review`, set `validated` (step 8), then `/wa-close <slug>`.

## GitHub provider

`backlog.provider: github`: task file `phase:` plays `status:` (`review` → `validated`). Resolve `#n` / index. One **agent round** (**reference/provider-github.md**): `claim <n> coding` from `review` only once *Do* steps 1–3 and *Entry* (step 1 below) pass — in-progress, branch switch declined, criterion unmet, PR already ready → stop, nothing claimed (exit 3 → someone mid-round, say who, stop). **Every exit after claim without push** (rebase declined or red, user drops round, nothing to push) → `release <n> coding --reset-to review --reason "<why>"`. **Scope = ticket range** (`git diff $start^` + working tree, **reference/provider-github.md**), not `branch.base..HEAD`: squash-merged parent or stack makes that diff drag in already-landed code. `validated` stays whackagent-internal (task file), board never shows it.

**Clean verdict = ready PR.** Here ticket PR leaves draft; `/wa-close` only merges.

0. **Hooks version gate** (**reference/provider-github.md**, *Hooks version gate*) before claim.
1. **Entry.** `phase: validated`, code untouched since its review: PR draft (validated before this rule, or autofix touched code since user's test) → straight to step 3 readiness, no verifier; PR ready → nothing to do, nothing claimed, say `/wa-close <n>` merges it.
2. **Verify + autofix** — steps 3–7 above.
3. **Clean** (no finding open, or user accepted the rest — step 8) → readiness, same round:
   - **Wiki** — `/wa-wiki` update mode scoped to ticket (ticket-range diff + task file + `wiki:` pages), committed on ticket branch: docs ride ticket PR, never land separately.
   - **Commit** task file (`phase: validated`, `## Review`), autofix code, wiki pages — per **reference/commits.md**.
   - **Base moved** — fetch. PR base (`gh pr view --json baseRefName`) holds commits fork point lacks → rebase ticket range: `git rebase --onto origin/<base> $start^` (plain `git rebase <base>` replays squashed parents' commits). Stacked PR whose parent landed: GitHub retargets once parent branch deleted, else `gh pr edit --base <base>`. Base still another ticket's open branch → leave it: stacked PR goes ready, merges after parent. Conflicts mechanical (wiki index lines, imports, generated files) → resolve yourself; logic → stop and ask with recommended resolution. Rebased → build + tests again; red → stop, back to `/wa-feedback`.
     **Rebase = force-push** → attended run shows one-line plan first (`rebase onto origin/<base>, push --force-with-lease, #42 → ready, reviewers @team`), gets yes; no → skip rebase, push plain (no force) — mergeable check after push catches conflicts. Marking ready without rebase needs no extra confirm: invoking `/wa-validate` is the yes.
   - **Push** (`--force-with-lease` when rebased), **refresh body** (**reference/provider-github.md**, *PR body refresh*) — checklist from final `## Verification`, status line `Ready — validated, verifier clean. Test, then merge — or /wa-close <n>.` (autofix case: below)
   - **Autofix changed code since user's test** → PR stays **draft**, status line `Draft — validated; autofix touched <files> since your test. Retest, then /wa-validate <n> to mark ready.` Next `/wa-validate` = step 1 readiness only.
   - **Autofix changed nothing** → **`gh pr ready <pr>`** + `pr.reviewers` requested, assignees per **reference/pull-requests.md** (`@me` always).
4. **Findings open** (not accepted) → `phase: review`. Commit task file (`## Review`) + autofix code only — no wiki sync, no rebase —, push, refresh body. PR **stays draft**; was ready → `gh pr ready --undo`. Status line `Draft — verifier findings open: <list>. /wa-feedback · /wa-validate.`
5. Hook sets `review`, drops claim; `ready_for_review` comments `✅ ready`. Then mergeable check per **reference/provider-github.md**, *Agent round*.

Report (step 10) names PR + state. Hand-back: clean → `Ready #42 — test, then merge on GitHub or /wa-close <n>`; clean, autofix touched code → `Draft #42 — retest, then /wa-validate <n> to mark ready`; findings open → same three-way recommendation, PR draft.

## Interaction with the rest

- **`/wa-feedback` on `validated` task** → code moved after its review: status go back to `review`, task need `/wa-validate` again. Never close on review predating last edit.
- **`review.when: each_round`** → rounds already reviewed; this pass still run, over cumulative diff, and it's one that counts. Short: most findings already fixed.
- **`/wa-autopilot`** runs this command's steps 3–8 itself, unattended, its runtime check standing in for your green light — tasks arrive `validated` (clean) or `review` (findings open). Clean → nothing to do here unless code moved; `/wa-close` after your test.

## Never

- Never mark task `done` — that's `/wa-close`, after user retests reviewed code.
- Never review task user hasn't validated: without their yes, you review feature still moving. Only exception: `/wa-autopilot`, where its green runtime check is the yes.
- Never commit, merge, push, open PR or delete branch — **git belong to `/wa-close`**. GitHub provider exception: round-end commit, ticket-range rebase, push to ticket PR, mark it ready when clean or back to draft when findings open (above) — never merge.
- Never write code yourself — findings go to implementer, same as `/wa-code`.

## Asking

Every question carry recommended answer + one-line reason — finding worth accepting, branch worth switching, fix worth spinning off. Never bare question.

## Next step

Retest what review changed, then **`/wa-close <slug>`** — it commit, land branch (merge into sprint, PR, or nothing per `close.strategy`) and mark task `done`, wiki synced in same commit. GitHub provider: PR already ready, wiki inside — merge on GitHub, or `/wa-close <n>` merges it for you.