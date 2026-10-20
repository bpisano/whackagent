# Swift — Apple references

> whackagent convention module · lens: **correctness**, **elegance** (see *Reviewing*). Present only when `/wa-setup` exported Xcode's own skill pages into `apple/`, next to this file.

Apple-written guidance, exported from installed Xcode (`xcrun agent skills export`, Xcode 27+). Lives in `apple/<skill>/`: one `SKILL.md` index + `references/*.md`. Reference library, not rules. Not written by this project, never edited by hand — `/wa-setup` replaces folder whole after Xcode update.

`apple/` absent (gitignored, teammate without Xcode 27) → this module points at nothing: skip it.

## Read on demand, never whole

Thousands of lines in there. Read all = context blown for ten-line diff.

1. Read each `apple/*/SKILL.md` — short index, one line per reference saying when it applies.
2. Open `references/*.md` **only** when code you write or judge touches its topic: `ForEach` identity → `foreach.md`, `@Environment` → `environment.md`, API new in this SDK → matching `whats-new` reference. Nothing matches → open nothing.
3. Reference above ~400 lines → `Grep -n` the API name, then ranged read.

## Who wins

- **API facts** — what exists, signatures, overloads, availability, deprecations, performance behavior → Apple reference wins over training memory. Never invent API a reference doesn't document.
- **Project shape** — member order, file layout, naming, view init style, previews, comments → project modules win. Apple sample code ≠ house style: take the API, write it per `style.md` / `swiftui.md`.
- Real contradiction between the two → say so (implementer `NOTES:`, verifier finding). Never pick side silently.

## Reviewing

Finding backed by reference cites it, so fix round opens same page:

```
Views/UserList.swift:42: 🟠 major: [correctness] ForEach id: \.self on non-stable values, rows lose state. Use stable id — apple/swiftui-specialist/references/foreach.md.
```

Lens: API misuse that breaks behavior or performance → `correctness`. Soft-deprecated or non-idiomatic API → `elegance`. Soft-deprecated API in code diff doesn't touch → not finding.

## Scope

Those `SKILL.md` talk to interactive assistant: scan whole codebase, offer user choices, split work. Ignore that part. Implementer builds one brick, verifier judges one diff.
