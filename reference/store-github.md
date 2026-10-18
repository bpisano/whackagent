# Store — github

`tasks.backend: github`. Every task read or write goes through these operations.

**Task file is still the truth**: `{tasks}/<n>-<slug>.md` on the task branch, from the end of the grill. The issue holds title, summary (first body line), size (Project field), type (label), sprint (milestone), blockers — never the file.

## Helper

`${CLAUDE_PLUGIN_ROOT}/scripts/github-board <verb>`, from repo root. JSON out. Exit 0 ok · 1 error · 2 usage · **3 lock taken** · **4 wrong state** (3 and 4 are outcomes, not failures).

| op | how |
|---|---|
| list | `list [--state s,…] [--sprint x] [--type t] [--all] [--owners]` — priority order, done/canceled only with `--all` |
| read | `get <n>` (state, size, type, sprint, claims, `branch`, `blocked_by`) + `git show origin/<branch>:{tasks}/<n>-<slug>.md`. No branch (`draft`) → issue body = idea note |
| create | `create --title … --summary … [--size] [--type] [--sprint] [--note …]` → `draft`, bottom |
| write sections / status | edit the task file on the task branch; lands at next push |
| lock | `claim <n> grilling\|coding` · review: `claim <n> coding --keep-state` |
| release | `release <n> <phase> --reset-to <state>` |
| cancel | `cancel <n> --reason …` → Canceled, issue closed not planned |
| reorder | `move <n> --top\|--bottom\|--before m\|--after m` |
| fields | `set-field <n> size <s>` · `set-field <n> type <t>` (one type label, others dropped) · `set-field <n> sprint "<Sprint>"` (milestone created on first use, never deleted; `""` clears) |
| blockers | `depend <n> --on <x>[,<y>]` |
| PR link | `link-pr <n> <pr>` right after `gh pr create` |

`set-state` = setup and repair only.

## Hook

`.github/workflows/whackagent-board.yml` moves every other card:

| event | card |
|---|---|
| issue opened | `draft` |
| push to `wa/<n>-…` with a task file (`issue: <n>`, criteria filled) | file `status:`, locks released |
| PR merged (any base) | `done`, issue closed, empty milestone closed |
| PR closed unmerged | `todo` |

- **Never set `todo` / `to-test` / `to-close` / `done` yourself.** Write `status:`, push. Hook slow → wait.
- Needs secret `WA_PROJECT_TOKEN` (classic PAT, `project` + `repo`), and the workflow on default and base branches. `/wa-setup` sets both.

## Rounds

- Branch created at the grill: `gh issue develop <n> --name <prefix><n>-<slug> --base <base>`. Never `git checkout -b` + push.
- **Every round ends with commit + push** on the task branch (grill, code, feedback, validate, autopilot). That push releases the lock. **No push mid-round.**
- First coding round opens a draft PR: `gh pr create --draft --base <base> --head <branch> --label <type>`, then `link-pr`. Title + body → **pr**.
- Every later round → body rewritten (**pr → Body**), `gh pr edit <pr> --body-file`.
- PR ready + new round → `gh pr ready --undo` first.
- After the push, `get <n>` (up to ~1 min):
  - card still `Coding` or lock held → hook never ran. Cause from `gh run list --branch <branch> --workflow whackagent-board.yml --limit 1`: no run = workflow missing on the branch, failed = secret. Repair: `release <n> coding --reset-to <file status>`.
- Then `gh pr view --json mergeable`. `CONFLICTING` → rebase on base, rebuild, `push --force-with-lease` (own task branch only). Design call needed → stop, name files.
- Always `git fetch` + pull first: the last round may come from another machine.
- Subagents get the task file path. They never read config or write the task.

## Locks

- `claim grilling` from `draft`. `claim coding` from `todo`, `to-test`, `to-close`. Atomic, one winner.
- Review round → `--keep-state`: card stays put. Plain claim there = bug.
- Exit 3 → `🔒 #42 grilling — alice@mbp 2h`, stop. Never retry, never steal.
- Exit 4 → say the state, point to the right command.
- Abort: grill → `--reset-to draft`; coding before any push → the state it came from; review → `release <n> coding` alone.
- No expiry. `claims` flags `stale` (no push past `WA_STALE_AFTER_HOURS`); `/wa-task release <n>` clears one, human only.

## Other

- `gh` needs `project` scope. Missing → `! gh auth refresh -h github.com -s project`, stop. Never fall back to `files`.
- Comments = trail only. Task content lives in the file, never in comments or issue body.
- `{backlog}` unused. `{reports}`, `{wiki}`, `{conventions}` stay in the repo.
- Every new issue lands as `draft`; label `wa-ignore` opts out. Project draft items → board lists them, suggests converting.
- `list` lags 1–3 min; `get` / `claim` are current.
- PR closes issues: `Closes #<n>` + `link-pr` (base ≠ default branch → `Closes` alone links nothing). Sprint PR: one `Closes` per task + milestone.

## Legacy

Content in the issue body (no task file on branch) or `size:*` labels → pre-0.13 layout. → `→ next: /wa-update`, stop.
