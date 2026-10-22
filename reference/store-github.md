# Store — github

`tasks.backend: github`. Id shown `#42`.

**Task file is still the truth**: `{tasks}/<n>-<slug>.md` on the task branch, from the end of the grill. Summary = first issue body line. Size = Project field, type = label, sprint = milestone.

## Helper

`board <verb>` = `${CLAUDE_PLUGIN_ROOT}/scripts/github-board <verb>`, from repo root. JSON out. Exit 0 ok · 1 error · 2 usage · **3 lock taken** · **4 wrong state** (3 and 4 are outcomes, not failures).

| op | how |
|---|---|
| list | `list [--state s,…] [--sprint x] [--type t] [--all] [--owners]` — priority order, done/canceled only with `--all` |
| read | `get <n>` (state, size, type, sprint, claims, `branch`, `blocked_by`) + `git show origin/<branch>:{tasks}/<n>-<slug>.md`. No branch (`draft`) → issue body = idea note |
| create | `create --title … --summary … [--size] [--type] [--sprint] [--note …]` → `draft`, bottom |
| title, summary | `edit <n> [--title …] [--body …]` |
| task branch | `develop <n> --name <prefix><n>-<slug> --base <base>`. Never `git checkout -b` + push |
| write sections / status | edit the task file on the task branch; lands at next push |
| lock | `claim <n> grilling\|coding` · review: `claim <n> coding --keep-state`. Coding claim assigns you (`@me`) |
| release | `release <n> <phase> --reset-to <state> [--unassign me\|all]` |
| cancel | `cancel <n> --reason …` → Canceled, issue closed not planned |
| reorder | `move <n> --top\|--bottom\|--before m\|--after m` |
| fields | `set-field <n> size\|type\|sprint <v>` — one type label; milestone created on first use, never deleted, `""` clears |
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

- **Never set `todo` / `to-test` / `to-close` / `done` yourself.** Write `status:`, push.
- Needs secret `WA_PROJECT_TOKEN` (classic PAT, `project` + `repo`), workflow on default and base branches. Set by `/wa-setup`.

## Rounds

- **Every round ends with commit + push** on the task branch. That push releases the lock. **No push mid-round.**
- First coding round opens a draft PR: `gh pr create --draft --base <base> --head <branch> --label <type> --assignee @me`, then `link-pr`. Title + body → **pr**.
- Every later round → body rewritten (**pr → Body**), `gh pr edit <pr> --body-file`.
- PR ready + new round → `gh pr ready --undo` first.
- After the push, `get <n>` (up to ~1 min):
  - still `Coding` or locked → hook never ran. `gh run list --branch <branch> --workflow whackagent-board.yml --limit 1`: none = workflow missing on branch, failed = secret. Repair: `release <n> coding --reset-to <file status>`.
- Then `gh pr view --json mergeable`. `CONFLICTING` → rebase on base, rebuild, `push --force-with-lease` (own task branch only). Design call needed → stop, name files.
- Always `git fetch` + pull first.
- Subagents get the task file path only.

## Locks

- `claim grilling` from `draft`. `claim coding` from `todo`, `to-test`, `to-close`. Atomic, one winner.
- Review round → `--keep-state`: card stays put. Plain claim there = bug.
- Exit 3 → `🔒 #42 grilling — alice@mbp 2h`, stop. Never retry, never steal.
- Exit 4 → say state + right command.
- Abort: grill → `--reset-to draft`; coding before any push → the state it came from, + `--unassign me` if `todo`; review → `release <n> coding` alone.
- No expiry. `claims` flags `stale` (no push past `WA_STALE_AFTER_HOURS`); `/wa-task release` frees it.

## Upkeep

`/wa-update`:
- Hook on default branch, `template version:` < `${CLAUDE_PLUGIN_ROOT}/templates/github-board.yml` → PR per **wa-setup → GitHub scaffold** 3.
- `WA_PROJECT_TOKEN` not in `gh secret list` → **wa-setup → GitHub scaffold** 4.
- `config --refresh` differs → refresh.
- `provision --project <n>`: missing states → add. Extras → name, ask, `--prune-status` on yes.

## Other

- `gh` needs `project` scope. Missing → `! gh auth refresh -h github.com -s project`, stop. Never fall back to `files`.
- Comments = trail only. Task content lives in the file.
- `{backlog}` unused, other paths stay in the repo.
- New issues land as `draft`; label `wa-ignore` opts out. Project draft items → board lists them, suggests converting.
- `list` lags 1–3 min.
- PR closes issues: `Closes #<n>` + `link-pr` (base ≠ default branch → `Closes` alone links nothing). Sprint PR: one `Closes` per task, `--milestone "<Sprint>"`.

## Legacy

Content in the issue body or `size:*` labels → pre-0.13: `→ next: /wa-update`, stop.
