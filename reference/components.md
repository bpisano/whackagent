# Components

Every shape shown to the user. Labels follow **voice → Language**.

## Task ref

A task inside a sentence: `#42 Add Apple login` (`files`: `3 Add Apple login`).

## Task line

```
#42 · 🟢 **Add Apple login** · Login refacto · ⛔ #12 · 🔒 alice@mbp 2h — to test
```

- `<id> · <size> **<title>**`, then what applies, in order:
  - `· <sprint>` — dropped when the view is that sprint
  - `· ⛔ #12` — open blockers
  - `· 🔒 <owner> <age>` — lock held; stale → `🔒⏳`
  - `· ⇡ #42` — stacked on #42 (+ `⛔ #42` while open)
  - `— <outcome>` — only in **Batch report**
- Id: `files` → display index `3 ·` (never `3.`), `github` → `#42 ·`.
- Size: 🟢 quickwin · 🟡 medium · 🔴 large.

## Task list

N tasks. Never a table.

```
### Todo

1 · 🟢 **Add Apple login** · Login refacto
    Sign in with Apple on login screen

🟢 quick win · 🟡 medium · 🔴 large
🏁 Login refacto — 0/1 (1 todo)
```

- **Task line** + `summary` indented 4 spaces. Never the body.
- One section per non-empty state, lifecycle order (**tasks → States**). Done: recent few.
- Priority order per section; indexes run on. Legend once, below.
- One 🏁 line per sprint in play: `🏁 <sprint> — <done>/<total> (<n> <state>, …)` minus canceled. Sprint view → that line on top.

## Question

```
**Where does the token live?**
→ **Keychain** (recommended) — survives relaunch; UserDefaults lands in backups.
  Alt: memory only — safer, re-login every cold start.
```

- One at a time. Recommendation always, one-line why, grounded. Real alternative → `Alt:`.
- No basis → pick the cheapest to undo, flag it as a guess.
- Choice between named options → numbered list, recommended first.

## Warning

`⛔ blocked by #12 Add Apple login (todo) — code it first?` + `ok?`

- `⚠️` / `⛔` / `🔒` + what + consequence. `ok?` only if the user decides.

## Plan

```
project : whackagent board (new)
hook    : .github/workflows/whackagent-board.yml
ok? [y/n]
```

- One `<label> : <value>` row per change. Yes → run all.
- Batch waves: `wave 1 (∥): #42 · #43` / `wave 2: #44 ⇡ #42` / `skipped: #48 ⛔ #12`.

## Glossary rows

```
+ Screen · Login screen — email + password · `LoginView`
~ Concept · Inbox → Boîte de réception (Never: Inbox)
ok?
```

- `+` add, `~` change: `<section> · <term> — <means> · <code>`. One `ok?` a batch.

## Progress

One line mid-run: `⏳ #42 verify — round 2`.

## Findings

Review results, severity first:

```
🔴 AuthStore.swift:42 — token in UserDefaults → Keychain
🟠 LoginView.swift:18 — [style] force unwrap → guard
```

- 🔴 critical · 🟠 major · 🟡 minor. ≤ 12 words a line. Clean → `✅ review clean`.
- User decides → line ends with the pick: `fix` / `accept` / `→ /wa-task`.

## Branch line

Where the user stands now. Always in a **Report**.

- `branch: wa/42-add-apple-login — you're on it`
- `test branch: sprint/login-refacto-test = sprint + #42 · #43 — you're on it`
- Missing piece → `⚠️ #45 not in — conflicts with #42 (AuthStore.swift)`
- Not built → `⚠️ test branch not built — dirty tree` (or `uncommitted`)
- Couldn't switch → `⚠️ still on <branch> — dirty tree · git checkout <branch>`
- Batch report → task's own branch (`github`: + draft PR)

## Status line

`build ✅ · tests ✅ · run ✅ · review → /wa-validate`

- Check `✅` / `❌` / `yours`; review `clean` / `→ /wa-validate`. Never claim an unrun check.

## Next

Last line of every skill: `→ next: /wa-code 42`. One command, ≤ one alt (`… or /wa-feedback 42`).

## Report

Round end: `/wa-code`, `/wa-feedback`, `/wa-validate`.

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

- Header = **Task line** + summary. Feedback round → `· round <n>` + **Asked** above Done.
- **Done** — app changes, ≤ 5 bullets, key file in backticks.
- **To test** — criteria not proven + regression zones. All proven → `nothing required` + one smoke test. Never empty.
- **Review** — `/wa-validate` only, as **Findings**, above To test.
- `✅ agent:` — what the runtime check proved + screenshot path, if any.
- Then **Shots**, **Branch line**, **Status line**, **Next**. Full file list → saved report only.

## Shots

PR screenshots, in **Report** / **Landing**:

```
📸 Login screen · new · 2
⚠️ Map screen · error — needs a real login
```

- Line = screen · kind · count. Skip or fail → `⚠️` + reason.

## Landing

`/wa-close`. Plain text, no fence.

```
`wa/42-add-apple-login` → `sprint/login-refacto`
PR #57 · **Add Apple login**
```

- PR line only with a PR. Failed step → one extra line.
- Code changed since the user's test → **Warning** + `ok?`.

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

- Recap = **Task lines** + outcome: `to test`, `blocked`, `skipped` (lock, blocker, state moved). By sprint if several.
- One **Report** per delivered task, one **Question** per blocked one.
