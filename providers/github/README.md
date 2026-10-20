# GitHub provider

`backlog.provider: github`. Backlog = GitHub Project (v2) + repo issues. Many agents, many worktrees, one board — claims atomic, state moved by repo events. Implements **providers/CONTRACT.md**.

## Pieces

| Piece | Where | Role |
|---|---|---|
| `wa-backlog` | `${CLAUDE_PLUGIN_ROOT}/providers/github/wa-backlog` | every contract verb. Python 3 stdlib + `gh`. Run from repo root. |
| board workflow | caller `whackagent-board.yml` → target repo `.github/workflows/`; logic = reusable `rlatapy-luna/whackagent/.github/workflows/board.yml@hooks-v2` | hooks: issue opened/edited, spec pushed, PR opened/edited/pushed/merged/closed, scheduled report-only check. Caller holds triggers, permissions, concurrency, passes secret. Logic updates itself: each release moves `hooks-v2` (`hooks-v1` frozen for callers ≤ v15) |
| board contract | `templates/BOARD.md` → project root `BOARD.md` + pointer blocks + PR template sections + CLI copy `.github/board/wa-backlog` | rules every agent and tool follows, whatever its work loop. Stamp `board-contract: <v>` shared by all board files and script `CONTRACT_VERSION`; CLI warns on mismatch |
| repo variables | `WA_PROJECT_OWNER`, `WA_PROJECT_NUMBER`, `WA_STATUS_FIELD`, `WA_SIZE_FIELD`, `WA_STATES`, `WA_TASKS_PATH`, `WA_BRANCH_PREFIX`, `WA_SPRINT_PREFIX` (`none` = sprints have no branch), `WA_STALE_AFTER_HOURS`, `WA_TRACKS` (JSON list of `branch.tracks` keys, never a default milestone) | single source for script + workflow. Written by `wa-backlog provision`. |
| secret | `WA_PROJECT_TOKEN` | classic PAT, scopes `project` + `repo`. Workflow Projects writes only — `GITHUB_TOKEN` can't reach Projects v2. **Blast radius:** `repo` scope reaches every repo its account can, and any collaborator with write access can read the secret from a workflow → create it on a dedicated bot account that only joins this repo + Project. |
| claims | refs `refs/wa-claims/<issue#>/<phase>` | lock. Ref points at empty commit whose message names agent. |

Local cache: `<git-common-dir>/whackagent/github-cache.json` (ids, shared by all worktrees of clone). Rebuilt automatically when repo variables change (fingerprint checked each run) or when board holds an option id cache doesn't know. `wa-backlog config --refresh` forces it.

## Mapping

| Contract | GitHub |
|---|---|
| ticket id | issue number |
| ticket branch | `wa/<n>-<slug>`, created by `gh issue develop` → linked in issue **Development**. Only branches GitHub creates can be linked — never `git checkout -b` + push |
| title / summary | issue title / first non-empty body line |
| state | Project `Status` single-select, options named per `WA_STATES` |
| priority | Project item position (top = next) |
| size | Project `Size` single-select: `quickwin`, `medium`, `large` |
| sprint | parent issue, label `wa-sprint`, sprint name = title in kebab-case (`AI setup` → `ai-setup`); tickets = its **sub-issues**. Created on first use, reopened when name reused. `split <n>` turns a split ticket into its sprint root: label added, card removed from board, number/history/milestone kept. Not a ticket: off board, `get`/`claim` exit 4. Ticket already under a non-sprint parent → `set-field sprint` exit 4 (one parent per issue) |
| milestone | release scope — `create` joins highest open milestone (version order of titles, then number), `--milestone ""` = none. Created by humans only. Closed by humans, or `close-milestone` from `/wa-release` on yes — never by hooks |
| reservation | issue **assignees**. Assigned to another account than the `gh` one → `reserved: true`, `claim` exit 3 with `assigned: true`. Unassigned or assigned to you → claimable. Winning `claim` assigns the `gh` account (trailer `assigned: <login>` in claim commit); `release` removes it only when that trailer says claim made it. Hooks never touch assignees |
| excluded | label `wa-ignore` |
| dependencies | issue **Relationships** (blocked by) — `depend`, read back in `get` → `blocked_by` |
| ticket PR | issue linked in PR **Development** by hooks, any base (GitHub alone links `Closes #<n>` only when base = default branch). No PR milestone: ticket carries it. `link-pr <n> <pr>` = manual repair |
| stacked PRs | GitHub stack (REST `repos/{repo}/stacks`) — `stack <pr> --on <blocker pr>` creates it or adds PR on top (PR base must = blocker branch, blocker must be top, both tickets in same sprint or same track milestone, else exit 4); `stack <pr>` reads it (base, PRs bottom → top with ticket) |
| ticket merge | `merge <pr> [--method squash\|merge]` — async merge API (`pulls/<pr>/merge-async`, head sha pinned), waits for the result. Only API that merges a stacked PR; open PR below it in stack, draft or closed → exit 4, GitHub refusal → exit 4 with reason. Never bypasses rules |
| PR screenshots | GitHub user-attachments via `gh pr edit --attach` (gh ≥ 2.102), else `gh image` (extension `drogers0/gh-image`), never a branch — `screenshots <pr> <files> [--sha <head>] [--keep]` uploads and rewrites only the body's `## Screenshots` section (UI changes only): singles in a row, `<caption>.before` / `<caption>.after` stems in a Before \| After table; `--sha` recorded in the section marker, `--keep` keeps images not re-shot; no file = print recorded sha + images. `<caption>=<url>` = image already uploaded (browser fallback when neither gets an upload token) |

Every issue = ticket (opt-out `wa-ignore`). Project draft items = not tickets: no number, no branch, no `Closes #`. `/wa-board` lists them to convert.

## Hooks — who moves what

| Event | Condition | Result |
|---|---|---|
| `issues: opened/edited` | no `wa-ignore` / `wa-sprint`; edited = body changed | add to Project, `todo`. Body holds non-empty `## Acceptance criteria`, state `todo`/`grilling`, editor can push → `grilled`, grilling claim deleted. Editor can't push → reported on issue, card stays |
| `push` to `wa/**` | branch `wa/<n>-…`, `{tasks}/<n>-*.md` with `issue: <n>` + non-empty `## Acceptance criteria`, state `todo`/`grilling` | `grilled`, grilling claim deleted |
| PR → ticket | every `pull_request` row | head `<WA_SPRINT_PREFIX>…` → none (sprint PR). Else the one issue **of this repo** PR links (`closingIssuesReferences`), else the one `Closes #n` in body, else head `wa/<n>-…`; open PR found by body or branch → Development link added. Sprint parents, `wa-ignore` never. Several → reported on PR, board untouched |
| `pull_request: opened/reopened` | ticket found, same repo, not `done` — **draft or not** | `review`, claims deleted; card watched ~30 s, taken back from built-in workflow's column |
| `pull_request: edited` | ticket found late, card in `todo`/`grilled` | `review`, coding claim deleted. Never from `coding` (round live) |
| `pull_request: ready_for_review/converted_to_draft` | — | nothing moves, claim untouched (agent mid-round may flip it) — draft = human tests, ready = human merges (GitHub UI or `/wa-close`) |
| `pull_request: synchronize` | coding claim exists | `review`, claim deleted (agent round over); `## Feedback` rounds new since previous head linked (line permalink, embedded snippet) on ticket and PR |
| `pull_request: synchronize` | no coding claim, not `done`, head not a GitHub web merge | reported on PR (push without claim), board untouched |
| `pull_request: closed`, merged | any base — stacked PR: landed on stack base (`pull_request.stack.base.ref`), not its parent branch | `done`, issue closed, claims deleted. Sprint without branch + last sub-issue closed → sprint parent closed |
| `pull_request: closed`, merged, head `<WA_SPRINT_PREFIX><name>` | — | sprint parent `<name>` closed (sprint landed) |
| `pull_request: closed`, unmerged | not `done`, no coding claim, no other open PR for ticket | `grilled`, coding claim deleted |
| `schedule` (`17 6 * * 1-5`, weekdays 06:17 UTC) / `workflow_dispatch` | — | **report-only check**: per ticket, card vs repo data (lock column without claim, claim with nothing new for `WA_STALE_AFTER_HOURS`, `review` without open PR, PR open but card `todo`/`grilled`, merged but not `done`, `grilled` without spec, criteria in body but `todo`, `done` but issue open, closed but lock column, closed as completed but not `done`). One comment per problem (marker `<!-- board-check:<kind> -->`), flipped to resolved once cleared; job summary table. Never moves cards |

**`coding` is transient.** Held only while an agent works: every agent round (`/wa-code`, `/wa-autopilot`, `/wa-feedback`, `/wa-validate`, `/wa-close`) claims from `grilled`/`review` and ends with a push — first delivery opens the draft PR (`opened`), later rounds push to it (`synchronize`). Either way hook releases claim, ticket waits for humans in `review`. Draft vs ready tells who looks next: draft = test it, ready = merge it (`/wa-validate` clean marks ready; `/wa-close` merges on user's yes). Loop stopped before PR (local commits, branch pushed without PR) → ticket stays `coding` under claim; scheduled check comments after `WA_STALE_AFTER_HOURS`.

**Conflicting PR = no hook.** GitHub skips `pull_request` workflows when PR merge ref conflicts: push to conflicting PR moves nothing, claim stays. Round end checks `mergeable`, rebases ticket range when `CONFLICTING`.

Logic always = `hooks-v2`, whatever ref runs caller. Caller runs from default branch for `issues` and `schedule`, from pushed branch for `push`, from PR merge ref for `pull_request` (= base's caller unless PR edits it) — so it must be merged on default branch **and** on every base PRs target (sprint, track branches forked after merge carry it).

Custom `branch.prefix` → edit `branches:` filter in workflow to match.

## Setup (`/wa-setup`, provider step)

1. `gh auth status` shows scope `project`. Missing → user runs `! gh auth refresh -h github.com -s project` (browser device flow — can't be done for them).
2. `wa-backlog provision --title "<name>"` (new), `--title "<name>" --template [<owner>/]<n>` (copy of a Project template — views, fields, workflows; `wa-backlog templates` lists owner's) or `--project <n>` (adopt). Copy or existing Project: never rewrites columns — adds missing state options keeping existing ids, or maps states onto existing names with `--state grilled="Ready for dev"`. New board without template: Status options = exactly six states, lifecycle order (GitHub's default `In Progress` dropped). `--prune-status` does same on copy or existing Project: drops options no state maps to and no card sits on, reorders, keeps ids (cards keep Status); option holding a card stays, listed in `status_options_held`. Reports `status_options_removed`, `status_options_extra` (left in place). Creates `Size` if missing. Links repo. Writes variables. Reports `conflicting_workflows`: built-in Project workflows that set Status behind hooks (*Pull request linked to issue*) → human switches them off in Project settings.
3. Secret (before board PR: first hook runs need it): user creates PAT — `https://github.com/settings/tokens/new?scopes=project,repo&description=whackagent-board` — then `! pbpaste | gh secret set WA_PROJECT_TOKEN -R <repo>` (clipboard, token never in chat). `provision` output `secret_WA_PROJECT_TOKEN` confirms.
4. Board PR on branch `wa-setup/board-hooks` — never push default branch directly: caller → `.github/workflows/whackagent-board.yml`, `BOARD.md` (placeholders filled), CLI copy `.github/board/wa-backlog`, pointer blocks (`AGENTS.md`, `CLAUDE.md`, Copilot, Cursor), PR template sections. Live once merged. Older caller (no `uses:` line, or template version < 16) or board file behind plugin's contract stamp → same PR refreshes all of them together.
5. Offer (ask): import open issues as `todo` — `wa-backlog get <n>` per issue adds it. Offer (ask): smoke test — `create` → `claim grilling` → `release --reset-to todo` → close issue.

## Known behavior

- **Project item list lags** writes by 1–3 min (GitHub indexing). `list` may miss brand-new tickets; `get`/`claim` read through issue — always current.
- Claim race: N agents claim same ticket → exactly one exit 0, rest exit 3 with owner (tested 6-way). Only `Reference already exists` counts as taken; any other ref error surfaces as-is.
- Columns outside the six states (board's own `Blocked`, default `In Progress`) are kept by provision (unless `--prune-status` and empty) with their colors/descriptions, and left alone by script and hooks: `state: null`, `column: <name>`, not claimable.
- Closed issues (canceled) hidden from `list`, never claimable. Split parent = sprint root, off board.
- Right after someone moves a card by hand, a read may see previous column for a second or two (GitHub replica lag).
- Organization project: works with same PAT scopes; GitHub App path (not tied to one person) not built yet.
