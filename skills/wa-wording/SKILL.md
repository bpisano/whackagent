---
name: wa-wording
description: Craft UI copy the way a senior UX writer would — short, native, on-mood, or no text at all when the UI can show it. Use whenever you write, edit or review any user-facing text in an interface (button labels, titles, subtitles, empty states, errors, alerts, confirmations, toasts, loading, onboarding, paywalls, permission prompts, localization catalogs), including while building a new screen or component even if the user never mentioned wording.
user-invocable: false
---

# Wording

Great interface copy is mostly **absent**. Every string must earn its place. UI shows; text only says what UI cannot.

No command. Loads by itself when you write UI outside the task flow. Inside it, `wa-implementer` and `wa-verifier` get the same rules from the `wording.md` convention module.

Reference pages: `${CLAUDE_PLUGIN_ROOT}/conventions/wording/` — called `wording/` below.

## 0. Load context

1. `.whackagent/config.md` exists → `{conventions}` from its `paths:` (**wa-board → Paths**), then read:
   - `{conventions}/wording.md` → **Project voice** (`languages`, `person`, `base`, `audience`, `situations`), **Voice**, validated examples.
   - `{conventions}/glossary.md` → one term per concept. **Glossary always wins.**
2. Neither file there:
   - Never interrupt, never ask.
   - Infer tone, person and language from existing strings in project.
   - Apply defaults: `base: neutral`, platform vocabulary.
   - UI project with whackagent set up → say once, one line, that `/wa-setup` adds the wording module.
3. Detect stack (SwiftUI, UIKit, web framework, Compose) and where strings live (inline, `.xcstrings`, `Localizable.strings`, i18n JSON, `strings.xml`).

## 1. Judge every string — the ladder

Go down in order, **stop at first rung that works**. Details + before/after: `wording/ladder.md`.

1. **Remove** — user understands without it? Title repeating button, subtitle repeating title, text explaining what UI already shows → delete.
2. **Show** — a visual can carry it? Icon, button state (disabled, spinner, checkmark), badge, color, haptic, animation, native empty-state component → replace. Rules: `wording/visuals.md`.
3. **Shorten** — text needed → minimum words. Buttons are verbs. No sentence where a word works.
4. **Tune** — apply base tone, or tone of detected situation (`wording/situations.md`, tones in `wording/tones.md`).

Then reject anything in `wording/blacklist.md`. Worst offenders:

- narrating what app did: "Your changes have been saved successfully"
- explaining how UI works: "Tap the button below to…"
- filler politeness, vague reassurance, dev jargon, repeating what user just did

**Text required** — never remove, never shorten past meaning:

- irreversible destructive action: name what is lost
- error: say what to do
- legal, consent, pricing

## 2. Write native, never translate

- Write directly in target language. Never draft in English and translate.
- Words target user says out loud, platform vocabulary.
- Common English loanwords over invented or stiff equivalents.
- Respect each language's typography. Rules per language: `wording/native.md`.
- French: before `? ! : ;` and inside `« »` the space is **non-breaking** — write it as escape (` ` in JSON/JS, `\u{202F}` in Swift), never a typed space.

## 3. Apply

- Apply ladder silently to strings you write. No report, no questions.
- Only strings that are part of what user asked. Never rewrite unrelated existing copy.
- Localization: `wording/i18n.md`.
- Replacing text with icon: **always keep text as accessibility label** (`accessibilityLabel`, `aria-label`, `contentDescription`).
- Structural change on existing UI (removing a string, text → icon, adding a UI element, removing a localization key) → propose first, one line each.

## 4. Learn

- User rejects a string and gives own wording (*"no, say Delete"*) → offer the `{conventions}/glossary.md` row in one line (term + rejected word in `Never`). Write only on yes.
- Term used consistently across codebase, missing from glossary → offer to add it.
- Tone or copy preference → **Voice** in `{conventions}/wording.md`, same rule: offer, write on yes.
- No whackagent setup → nothing to write to; apply the preference for this session.
