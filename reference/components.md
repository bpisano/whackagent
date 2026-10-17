# Components

Every shape shown to the user. Skills cite, never redefine. New need → new component here first. Labels follow **voice → Language**.

## Task ref

A task inside a sentence: `#42 Add Apple login` (`files`: `3 Add Apple login`).

## Task line

One task, one line:

```
#42 · 🟢 **Add Apple login** · Login refacto · ⛔ #12 · 🔒 alice@mbp 2h — to test
```

- `<id> · <size> **<title>**`, then what applies, in order:
  - `· <sprint>` — dropped when the view is that sprint
  - `· ⛔ #12` — open blockers
  - `· 🔒 <owner> <age>` — lock held; stale → `🔒⏳`
  - `· ⇡ #42` — stacked on #42 (keeps `⛔ #42` while #42 is open)
  - `— <outcome>` — only in **Batch report**
- Id: `files` → display index `3 ·` (never `3.`), `github` → `#42 ·`.
- Size: 🟢 quickwin · 🟡 medium · 🔴 large.

## Task list

N tasks. Never a table.

```
### Todo

1 · 🟢 **Add Apple login** · Login refacto
    Sign in with Apple on login screen

### Draft

2 · 🔴 **Sync offline changes**
    Offline queue + conflict handling

🟢 quick win · 🟡 medium · 🔴 large
🏁 Login refacto — 0/1 (1 todo)
```

- **Task line** + `summary` indented 4 spaces. Never the body.
- One section per non-empty state, lifecycle order (**tasks → States**). Done: few recent only.
- Priority order inside a section. Indexes run on across sections. Legend once, below.
- One 🏁 line per sprint in play: `🏁 <sprint> — <done>/<total> (<n> <state>, …)`, canceled out of the count. Sprint view → that line on top.

## Question

```
**Where does the token live?**
→ **Keychain** (recommended) — survives relaunch; UserDefaults lands in backups.
  Alt: memory only — safer, re-login every cold start.
```

- One at a time. Recommendation always, one-line why, grounded (code, convention, criteria, YAGNI). Real alternative → `Alt:` line.
- No basis → still pick the cheapest to undo, flag it as a guess, say what you'd need to know.
- Choice between named options → numbered list, recommended first.

## Warning

```
⛔ blocked by #12 Add Apple login (todo) — code it first?
ok?
```

- `⚠️` / `⛔` / `🔒` + what + consequence. `ok?` only when the user must decide.

## Plan

```
project : whackagent board (new)
hook    : .github/workflows/whackagent-board.yml
ok? [y/n]
```

- One `<label> : <value>` row per change. Yes → run all.
- Batch waves: `wave 1 (∥): #42 · #43` / `wave 2: #44 ⇡ #42` / `skipped: #48 ⛔ #12`.

## Progress

One line mid-run, no bullets: `⏳ #42 verify — round 2`.

## Findings

Review results, severity first:

```
🔴 AuthStore.swift:42 — token in UserDefaults → Keychain
🟠 LoginView.swift:18 — [style] force unwrap → guard
```

- 🔴 critical · 🟠 major · 🟡 minor. ≤ 12 words a line. Clean → `✅ review clean`.
- User decides → each line ends with the pick: `fix` / `accept` / `→ /wa-task`.

## Branch line

Where the user stands now. Always in a **Report**.

- `branch: wa/42-add-apple-login — you're on it`
- `test branch: sprint/login-refacto-test = sprint + #42 · #43 — you're on it`
- Missing piece → `⚠️ #45 not in — conflicts with #42 (AuthStore.swift)`
- Not built → `⚠️ test branch not built — dirty tree` (or `uncommitted`)
- Couldn't switch → `⚠️ still on <branch> — dirty tree · git checkout <task branch>`
- Batch report → the task's own branch (`github`: + draft PR link)

## Status line

`build ✅ · tests ✅ · run ✅ · review → /wa-validate`

- Each check `✅` / `❌` / `yours`; review `clean` / `→ /wa-validate`. Never claim a check nobody ran.

## Next

Last line of every skill: `→ next: /wa-code 42`. One command, at most one alternative (`… or /wa-feedback 42`).

## Report

End of a round: `/wa-code`, `/wa-feedback`, `/wa-validate`.

```
🟢 #42 · **Add Apple login** · Login refacto — to test
    Sign in with Apple on login screen

**Done**
- Apple button on login (`LoginView`)

**To test**
- [ ] Cancel sheet → stays on login

✅ agent: tap Apple → sheet → Home

branch: wa/42-add-apple-login — you're on it
build ✅ · tests ✅ · run ✅ · review → /wa-validate
→ next: test it, then /wa-feedback 42 or /wa-validate 42
```

- Header = **Task line** + summary. Feedback round → `· round <n>` + **Asked** (user's notes) above Done.
- **Done** — what changes for the app, ≤ 5 bullets, key file in backticks.
- **To test** — criteria the agent didn't prove + regression zones. All proven → `nothing required` + one optional smoke test. Never empty.
- **Review** — `/wa-validate` only, as **Findings**, above To test.
- `✅ agent:` — what the runtime check proved + screenshot path, one line. Omit when nothing.
- Then **Branch line**, **Status line**, **Next**. Full file list → saved report only.

## Landing

`/wa-close`. Plain text, no fence, nothing else.

```
`wa/42-add-apple-login` → `sprint/login-refacto`
PR #57 · **Add Apple login**
```

- PR line only with a PR; number once it exists. Failed step → one extra line.
- Code changed since the user's test → + **Warning** `⚠️ code changed since your test: <what>`, `ok?`.

## Batch report

`/wa-autopilot`, saved to `{reports}/autopilot-<date>.md`:

```
# Autopilot · 2026-09-18 · 🏁 Login refacto 2/3

#42 · 🟢 **Add Apple login** — to test
#44 · 🟡 **Add Apple onboarding** · ⛔ #42 · ⇡ #42 — to test
#45 · 🟢 **Add password reset** — blocked

test branch: wa/autopilot-2026-09-18-test = #42 · #44 — you're on it

---
<Report per delivered task>

---
⛔ #45 Add password reset
<Question>

→ next: /wa-validate 42
```

- Recap = **Task lines** + outcome: `to test`, `blocked` (open question), `skipped` (lock, blocker, state moved). Grouped by sprint when several.
- One **Report** per delivered task, one **Question** per blocked one.
