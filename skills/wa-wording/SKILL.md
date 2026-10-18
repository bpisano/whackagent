---
name: wa-wording
description: Craft UI copy the way a senior UX writer would — short, native, on-mood, or no text at all when the UI can show it. Use whenever you write, edit or review any user-facing text in an interface (button labels, titles, subtitles, empty states, errors, alerts, confirmations, toasts, loading, onboarding, paywalls, permission prompts, localization catalogs), including while building a new screen or component even if the user never mentioned wording.
user-invocable: false
---

# /wa-wording

Auto-loads on UI copy outside the task flow. Best copy is absent: text says only what UI cannot show.

Read: voice, components, tasks

- Inside the flow, `wa-implementer` and `wa-verifier` get these rules from the `wording.md` module.
- `wording/` = `${CLAUDE_PLUGIN_ROOT}/conventions/wording/`.

## Steps

1. **Load context.**
   - Config exists → `{conventions}` per **tasks → Config and paths**. Read:
     - `{conventions}/wording.md` → **Project voice** (`languages`, `person`, `base`, `audience`, `situations`), **Voice**, **Validated examples** (before `wording/tones.md`).
     - `{conventions}/glossary.md` → **Concepts** terms per UI language. Glossary always wins.
   - Neither file → never stop, never ask:
     - infer tone, person, language from existing strings
     - defaults: `base: neutral`, platform vocabulary
     - UI project with whackagent set up → say once, one line: `/wa-setup` adds the wording module.
   - Detect stack (SwiftUI, UIKit, web, Compose) and string location (inline, `.xcstrings`, `Localizable.strings`, i18n JSON, `strings.xml`).
2. **Ladder** each string, in order, stop at first rung that works (`wording/ladder.md`):
   1. **Remove** — understood without it? Title repeating button, subtitle repeating title, text explaining visible UI → delete.
   2. **Show** — visual carries it? Icon, button state (disabled, spinner, checkmark), badge, color, haptic, animation, native empty state (`wording/visuals.md`).
   3. **Shorten** — minimum words. Buttons are verbs. Word over sentence.
   4. **Tune** — base tone, or detected situation's tone (`wording/situations.md`, `wording/tones.md`).
   - Then reject `wording/blacklist.md`: narrating what app did, explaining UI, filler politeness, vague reassurance, dev jargon, echoing the user's action.
3. **Write native** (`wording/native.md`).
   - Words the user says aloud, platform vocabulary.
   - Common English loanwords over invented or stiff equivalents.
   - Respect each language's typography.
   - French: space before `? ! : ;` and inside `« »` is non-breaking, written as escape (`\u202F` in JSON/JS, `\u{202F}` in Swift).
4. **Apply** silently to strings you write: no report, no questions.
   - Localization → `wording/i18n.md`.
   - Text → icon → keep text as accessibility label (`accessibilityLabel`, `aria-label`, `contentDescription`).
   - Structural change on existing UI (remove string, text → icon, add element, remove localization key) → propose first, one line each.
5. **Learn** → **voice → Learning**: rewritten strings, tone fixes, other words for listed terms.
   - Term used consistently in code, missing from glossary → `+` row.

## Never

- Never remove or shorten past meaning: irreversible destructive action (name what is lost), error (say what to do), legal, consent, pricing.
- Never draft in English and translate.
- Never rewrite existing copy outside what the user asked.
