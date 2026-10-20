## Milestones

Milestone = **release scope** (iteration, version): what ships together. Not sprint — sprint groups one feature's tasks and owns a branch; milestone groups whatever ships in one release, owns nothing. Task carries both, either, or none. Canonical rules, every skill refers here; provider side in `providers/CONTRACT.md` → *Milestones*.

- **Humans own the list.** Local: `backlog.milestones` in config, oldest first. GitHub: repo milestones. Agent never adds or renames one — user asks → tell them where (config line / GitHub). Closes one only through `/wa-release`, flow finished, on yes.
- **New task joins highest open milestone** (version order of titles: `0.3.0` over `0.2.1`, whatever opened last) — provider does it on `create`, skill passes nothing. Why: current and past milestones are committed scope; new idea never grows them silently. Echo where it landed: `→ milestone 0.3.0`. **Track milestones never picked** (**reference/tracks.md**): new work lands on base.
- **Override only on user's word** — they name one (`create --milestone 0.2.0`, or `set-field <id> milestone 0.2.0` later), or they say none (`--milestone ""`). Unknown title → provider exit 2: list `milestones`, ask.
- **Split child inherits parent's milestone** (`--milestone <parent's>`): split replaces parent inside its scope, adds no new scope.
- **Truth**: local = task file `milestone:`; GitHub = issue milestone. Never echoed in `{backlog}`.
- **No milestone open** → tasks get none, nothing shown. Feature costs nothing until user opens one.
- **Resolving a name** (`/wa-board <name>`, `/wa-autopilot <name>`): task slug first, then sprint, then milestone title (exact, then unique case-insensitive). Clash → say which one you took.
- **Not a status, never `done`, no branch.** Shipping a milestone = `/wa-release <milestone>`, following project's documented release flow. Exception: track milestone owns its trunk and never ships as release (**reference/tracks.md**).
