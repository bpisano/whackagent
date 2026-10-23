# Store — plane

`tasks.backend: plane`. Tasks on one Plane project (cloud or self-hosted); code, branches, PRs, locks on GitHub. Id shown `APP-42` (project identifier + number). Input: `42`, `APP-42`.

Read `store-github.md` too: this file overrides it.

**Task file is still the truth**: `{tasks}/<n>-<slug>.md` on the task branch, from the end of the grill. The work item holds title, summary (first description line), size (estimate), type (label), sprint (module), blockers — never the file.

## Helper

`board <verb>` = `${CLAUDE_PLUGIN_ROOT}/scripts/plane-board <verb>`, from repo root. Same verbs, JSON and exits as **store-github → Helper**, plus `key` (`APP-42`) on every row. Differences:

| op | plane |
|---|---|
| fields | size → estimate value · type → one label · sprint → module (created on first use, reopened, never deleted; `""` clears) |
| task branch | `develop` creates it on GitHub, links it from the item |
| PR link | `link-pr <n> <pr>` adds the PR as an item link |
| cancel | state Canceled, claims dropped |
| lock | `claim <n> coding` assigns the key's owner |

## Reconcile

**store-github → Reconcile**, same triggers and log. Differences:

| what happened last | item |
|---|---|
| created in Plane | `draft` (project default state) |
| PR merged (any base) | `done`, module completed when nothing left in it |

- Runs on your machine: Plane reachable from it, no GitHub Actions.

## Rounds

**store-github → Rounds**, with `--label <type>` dropped from `gh pr create`.

## Locks

**store-github → Locks**. Exit 3 → `🔒 APP-42 grilling — alice@mbp 2h`.

## Upkeep

`/wa-update`:
- `config --refresh` differs → refresh.
- `provision --url <tasks.project>`: missing states, estimate values, labels → added. `states_extra` → name, ask, `--prune-states` on yes.

## Other

- Env `WA_PLANE_TOKEN` (personal Plane API key) on every machine: comments and assignee are its owner. Missing → `! export WA_PLANE_TOKEN=…` in the shell profile, stop. Never in config. Never fall back to `files`.
- `gh` needed too (refs, branches, PRs, variables). No `project` scope.
- 60 Plane calls / min per key: the helper waits once. Avoid loops of `get`; one `list` instead.
- Comments = trail only. Task content lives in the file.
- `{backlog}` unused, other paths stay in the repo.
- Label `wa-ignore` opts an item out.
- PR body: closing line = the item URL (`APP-42 https://…`), never `Closes #<n>`. Sprint PR: one line per task.
- Older self-hosted Plane (no estimates or relations API) → helper says so: upgrade Plane.
