# Swift — Apple references

> whackagent convention module · reviewer: **conventions**. Only present when `/wa-setup` exported Xcode's own skills into `apple/`.

Apple-written guidance, exported from Xcode installed at setup (`xcrun agent skills export`). Sits in `apple/<skill>/`, next to this file: one `SKILL.md` index + `references/*.md`. Not written by this project, never edited by hand — `/wa-setup` refresh it after Xcode update.

## Read on demand, never whole

Thousands of lines in there. Read all = context blown for ten-line diff.

1. Read each `apple/*/SKILL.md` — short index, one line per reference saying when it apply.
2. Open `references/*.md` **only** when code you write or judge touch its topic: `ForEach` identity → `foreach.md`, `@Environment` → `environment.md`, API new this SDK → matching `whats-new` reference. Nothing match → open nothing.
3. Reference above ~400 lines → `Grep -n` the API name, then ranged read. Read budget still apply.

## Who wins

- **API facts** — what exist, signatures, overloads, availability, deprecations, performance behavior → Apple reference win over training memory. Never invent API a reference don't document.
- **Project shape** — member order, file layout, naming, view init style, previews, comment discipline → project modules win. Apple sample code not house style: take the API, write it per `style.md` / `swiftui.md`.
- Real contradiction between the two → say so (implementer `NOTES:`, verifier finding). Don't pick side silently.

## Reviewing

Finding backed by reference cite it, so fix round open same page:

```
Views/UserList.swift:42: 🟠 major: [correctness] ForEach id: \.self on non-stable values, rows lose state. Use stable id — apple/swiftui-specialist/references/foreach.md.
```

Lens: API misuse that break behavior or performance → `correctness`. Soft-deprecated or non-idiomatic API → `elegance`. Soft-deprecated API in code diff don't touch → not finding.

## Scope

Those `SKILL.md` talk to interactive assistant: scan whole codebase, offer user choices, split work over agents. Ignore that part. You implement one brick or judge one diff.
