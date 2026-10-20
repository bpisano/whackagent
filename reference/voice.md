## Voice

Canonical, every whackagent skill. Applies to **screen output and `{reports}`**.

- **Telegraphic.** Fragments OK. No articles filler, no pleasantries, no hedging, no re-explaining the flow. One idea per line.
- **Tech terms stay English** — build, branch, merge, commit, review, worktree, emulator, endpoint, loading, fix… Never translate them, whatever `discussion_language` is.
- **Short common words.** `fix` not `apply a correction`, `test it` not `proceed to testing`.
- **Clarity beats brevity.** Fragment readable two ways → write the full sentence.
- **Task files are the exception** — `## Context / Decisions`, `## Acceptance criteria` in full simple sentences: verifier and user reread them months later, fragments there get misread.
- Screen headings and labels follow `discussion_language`. Task file section headings stay English always — skills look them up by name.

### Next line

Run ending on suggested command → **last line** starts with `→`: `→ next:` (label per `discussion_language`, arrow always) + recommended command **in backticks, complete**: real slug or `#`, never `<slug>` (`` → next: test it, then `/wa-validate 216` ``). Recommended command = **first** backticked one on line; alternatives after, backticked too (`` (or `/wa-feedback 216 <notes>`) ``). Text only user can write stays `<placeholder>`, at end. Backlog pane offers that first command as prompt suggestion (Tab takes it) — order and backticks matter.

### Titles and summaries

Title = **label**, not sentence. Names the thing + what is done to it. ≤ 5 words. Must read like a dev wrote it in a ticket.

- **Never a narrative sentence.** Subject-verb-object that tells a story = failed title. `The dashboard asks the questions instead of the commands` → `Prompts in dashboard`.
- **Never a metaphor or image.** `Tests turn red at random` means nothing to anyone → `Fix flaky CLI tests`.
- **Tech terms stay tech terms**, here too — flaky, job, watermark, toggle, prompt, scope, seed, dashboard, child process. Paraphrasing or translating them produces gibberish.
- **No elegant rewording.** User says `rework UI` → write `Rework UI`, not `A shared style for the screens`.

Summary = **the goal, plainly**, ≤ 8 words. What it gives once done. Not the mechanism, not the story, not the list of what disappears.

| ❌ | ✅ title | ✅ summary |
|---|---|---|
| After a purge, jobs don't replay | `Replay jobs after purge` | purge doesn't reset watermarks |
| Import the whole country, or just a region | `Configurable import scope` | DATA_SCOPE: region locally, country in prod |
| CLI tests turn red at random | `Fix flaky CLI tests` | 4 TUI tests fail in suite, pass isolated |
| A shared style for the CLI screens | `Rework CLI screens UI` | shared design system in tui/design/ |
| The dashboard asks the questions instead of the commands | `Prompts in dashboard` | commands take options, dashboard asks |
| Dashboard navigation follows the command tree | `Dashboard nav by group` | one tab = one group, no more MENU_* |
| The Data screen reads the backend job list | `Data screen reads GET /admin/jobs` | no more job catalog duplicated in CLI |
