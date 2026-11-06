# Components

Every shape shown to the user. Labels follow **voice → Language**.

## Task ref

In a sentence: `#42 Add Apple login` (`files`: `3 Add Apple login`).

## Task line

```
#42 · 🟢 **Add Apple login** · Login refacto · ⛔ #12 · 🔒 alice@mbp 2h — to test
```

- `<id> · <size> **<title>**`, then what applies, in order:
  - `· <sprint>` — dropped in its sprint view
  - `· ⛔ #12` — open blockers
  - `· 🔒 <owner> <age>` — lock held; stale → `🔒⏳`
  - `· ⇡ #42` — stacked on #42 (+ `⛔ #42` while open)
  - `— <outcome>` — only in **Batch report**
- Id: `files` → `3 ·` (never `3.`), `board` → store id `#42 ·`.
- Size: 🟢 quickwin · 🟡 medium · 🔴 large.

## Task list

N tasks.

```
### Todo

1 · 🟢 **Add Apple login** · Login refacto
    Sign in with Apple on login screen

🟢 quick win · 🟡 medium · 🔴 large
🏁 Login refacto — 0/1 (1 todo)
```

- **Task line** + `summary` indented 4 spaces. Never the body.
- One section per non-empty state, lifecycle order. Done: recent few.
- Priority order; indexes run on. Legend once, below.
- One 🏁 line per sprint in play: `🏁 <sprint> — <done>/<total> (<n> <state>, …)` minus canceled. Sprint view → that line on top.

## Question

```
**Where does the token live?**
→ **Keychain** (recommended) — survives relaunch; UserDefaults lands in backups.
  Alt: memory only — safer, re-login every cold start.
```

- Recommendation always, one-line grounded why. Real alternative → `Alt:`.
- No basis → cheapest to undo, flagged as a guess.
- Choice between named options → numbered list, recommended first.
- Options differ by mechanism → **Sketch** under each.

## Sketch

`Sync : headers → save → bodies → save`

- Flow → arrow line. Branches, states → ASCII (`─│└▶`), ≤ 8 lines, no emoji.
- Logic → pseudo-code. Contract → real code from the diff, cut → `…`. ≤ 6 lines.
- Names: real types or glossary terms.
- Terminal: never mermaid. PR → **how-it-works**.

## Warning

`⛔ blocked by #12 Add Apple login (todo) — code it first?` + `ok?`

- Icon + what + consequence. `ok?` only if the user decides.

## Plan

```
project : whackagent board (new)
size    : field added
ok? [y/n]
```

- One row per change. Yes → run all.
- Batch waves: `wave 1 (∥): #42 · #43` / `wave 2: #44 ⇡ #42` / `skipped: #48 ⛔ #12`.

## Glossary rows

```
+ Screen · Login screen — email + password · `LoginView`
~ Concept · Inbox → Boîte de réception (Never: Inbox)
ok?
```

- `+` add, `~` change. One `ok?` a batch.

## Progress

One line mid-run: `⏳ #42 verify — round 2`.

## Findings

```
🔴 AuthStore.swift:42 — token in UserDefaults → Keychain
🟠 LoginView.swift:18 — [style] force unwrap → guard
```

- Severity first: 🔴 critical · 🟠 major · 🟡 minor. ≤ 12 words. Clean → `✅ review clean`.
- User decides → line ends with the pick: `fix` / `accept` / `→ /wa-task`.

## Branch line

Always in a **Report**.

- `branch: wa/42-add-apple-login — you're on it`
- `test branch: sprint/login-refacto-test = sprint + #42 · #43 — you're on it`
- Problem → `⚠️` + what + why: `#45 not in — conflicts with #42`, `test branch not built — dirty tree`.
- Batch report → task's own branch.

## Status line

`build ✅ · tests ✅ · run ✅ · review → /wa-validate`

- `✅` / `❌` / `yours`. Never claim an unrun check.

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

build ✅ · tests ✅ · run ✅ · review → /wa-validate
→ next: test it, then /wa-feedback 42 or /wa-validate 42
```

- Header = **Task line** + summary. Feedback → `· round <n>` + **Asked** above Done.
- **Done**: app changes, ≤ 5 bullets.
- **To test**: unproven criteria + regression zones. All proven → `nothing required` + one smoke test.
- **Review**: `/wa-validate` only, as **Findings**, above To test.
- `✅ agent:` what the runtime check proved.
- Then **Shots**, **Branch line**, **Status line**, **Next**. Files → saved report only.

## Shots

PR screenshots, in **Report**. **Landing**: `⚠️` lines only.

```
📸 Login screen · new · 2
⚠️ Map screen · error — needs a real login
```

- Line = screen · kind · count. Skip or fail → `⚠️` + reason.

## Landing

`/wa-close`, at the end. No fence. Blank line between blocks.

```
✅ #42 **Add Apple login**
PR #57 `wa/42-add-apple-login` → `main`

⚠️ before release: enable Sign in with Apple in App Store Connect

→ next: merge https://github.com/acme/app/pull/57
```

- No PR → branch → target only.
- `⚠️` = user must act: code changed since their test, failed step or shot, action outside the code. None → block dropped.
- What went fine → never shown.
- PR URL raw, in **Next** only.

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
<Question per blocked task>

→ next: /wa-validate 42
```

- Recap = **Task lines** + outcome: `to test`, `blocked`, `skipped`. By sprint if several.
