## Display format

Canonical way tasks shown anywhere in flow (here, `/wa-task` prioritization pass, `/wa-autopilot` recap). **List, never table.** One section per non-empty status, tasks priority order, two lines per task:

```
### 📥 Todo

1 · 🟢 **Login Apple** · `login-refacto`
    Sign in with Apple on login screen
2 · 🟡 **Login layout** · `login-refacto`
    Login form redesign
3 · 🔴 **Sync offline** ⚠
    Offline queue + conflicts

### 🔨 In progress

4 · 🟡 **Export CSV**
    Export reports as CSV

🟢 quick win · 🟡 medium · 🔴 large · ⚠ not grilled
🏁 login-refacto — 0/2 (2 todo)
🎯 0.3.0 — 0/3 (3 todo) ← new tasks
🎯 0.2.0 — 0/1 (1 in progress)
```

Rules:

- **Section heading** = state emoji + name: 📥 Todo · 🔨 In progress · 👀 Review · 👍 Validated · 🎉 Done · 🚫 Canceled. Same emoji wherever state named (pane, recaps).
- **Line 1** = `<#> · <size> **<title>**`, then `` · `<sprint>` `` when task has one, then ` ⚠` when `grilled: false`.
- **Line 2** = task `summary`, indented 4 spaces. Never dump task body.
- **#** = display index, written `2 ·` — never `2.`: markdown list syntax gets renumbered by renderer. Number **continuously across sections**, top to bottom in render order (Todo → In progress → Review → Validated → Done → Canceled — lifecycle order). **Review** = coded, wait your test. **Validated** = you said it match spec, verifier passed, wait your retest to close. Never restart per section — index must be unique in render so user cite it without ambiguity.
- **Size** maps `size`: 🟢 `quickwin` · 🟡 `medium` · 🔴 `large`.
- **⚠** only on non-grilled tasks. Grilled = nothing — no ✅ on every line.
- **Sprint tag** only on tasks that have one. Filtered run (`/wa-board <sprint>`) drops it — every task is that sprint.
- Skip empty sections. Show only few recent under **Done**.
- Legend once below list; `⚠ not grilled` only when a ⚠ is on screen.
- At least one sprint in play → one **progress line per sprint** under legend, done+canceled excluded from numerator only:
  `🏁 login-refacto — 2/5 (1 in review, 2 todo)`. Filtered run → that single line, above list.
- One **milestone line** per milestone from `milestones` holding live tasks, highest first, same counting, below sprint lines. Highest open one marked `← new tasks`:
  `🎯 0.3.0 — 0/3 (3 todo) ← new tasks`. No tag on task lines — milestone is scope, not identity. Filtered run → that single line, above list.
- **Track milestone** (key of `branch.tracks`, **reference/tracks.md**) → same line, never `← new tasks`, plus drift when trunk lags base: `🎯 server — 2/6 (2 in review, 4 todo) · 30 behind develop` (`git rev-list --count <track branch>..<branch.base>`, fetched). Drift > 0 → mention sync as option (**reference/tracks.md**, *Sync*), never as the one next action.

## Task indexes

Index is **display-only**, derived from current backlog order. Never written into `{backlog}` or task files — order alone carry priority, so index shifts when order shifts.

Any skill taking task can take indexes instead of slugs: `/wa-code 3`, `/wa-autopilot 2,4,5`, `/wa-autopilot 2-5`, `/wa-grill 3`. Resolve by re-reading `{backlog}` and re-deriving same numbering (rules above), then:

- Echo resolved mapping (`2 → login-apple`, `3 → sync-offline`) before work, so user catch stale index.
- Index out of range or pointing at section that make no sense for command → say so, stop, don't guess neighbour.
- Ambiguous input (slug that look like number) → treat as slug if task file match, else index.
