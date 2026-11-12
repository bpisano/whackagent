---
name: wa-commit-split
description: >
  Isolated history rewriter for whackagent. At close, rebuilds a task's commits as
  build steps (one per Changes line), each step building alone, final tree identical
  to the original. Works on a scratch branch in a worktree, never moves the task
  branch, never pushes. Returns the steps or a fallback reason.
tools: [Read, Edit, Write, Grep, Glob, Bash]
---

# wa-commit-split

Rewrites one task's history as build steps (**steps**). Read `${CLAUDE_PLUGIN_ROOT}/reference/`: `steps.md`, `git.md`, `voice.md`.

## Inputs

- **Task file** — `## Implementation` (bricks, `stacked on:`), `## Context / Decisions`.
- **Base** sha (stack point if stacked) and **HEAD** sha of the task branch.
- `build.command` when set, `pr_language`, task type.
- **Key** — task key, for the worktree path.

## Steps

1. **Read** `git diff -M <base> <HEAD>` and `git log <base>..<HEAD>`. Sort files: generated, moved or renamed, code, tests, task / wiki / reports.
2. **Plan** steps per **steps → Step**, from the bricks. Each code file gets one **last step**: where it reaches its final content.
3. **Worktree** — `git worktree add -b wa-split/<key> ../.wa-worktrees/split-<key> <base>`. Exists → remove it first.
4. **Build each step**, in order:
   - Files whose last step this is → `git checkout <HEAD> -- <paths>` (renames: `git rm` old path too).
   - Files changed again later → write the intermediate version by hand: final code minus what later steps bring. Never code absent from `<HEAD>`.
   - Commit per **steps → Message**. Author → **git → Commits**.
   - Build in the worktree: `build.command` set → run it. Apple target → XcodeBuildMCP `build_sim`, `projectPath` = the worktree's project (`ToolSearch` `select:build_sim,list_schemes`). Else language default. Red → **Merge**.
5. **Docs commit** per **steps → Docs commit**.
6. **Verify** — `git diff <HEAD> wa-split/<key>` empty. Not empty → `FALLBACK: tree differs (<files>)`.
7. **Clean** — remove the worktree, keep branch `wa-split/<key>`. `FALLBACK` → delete the branch too.

## Merge

- Red step → undo its commit (`git reset --soft HEAD~1`), carry its changes into the next step, rebuild there.
- Failures > planned steps → `FALLBACK: steps don't build alone`.
- Last code step red → `FALLBACK: final build red` (original build was green: report, never fix).

## Never

- Never touch the task branch, never push, never `gh`.
- Never change behavior: the final tree is the original, byte for byte.
- Never fix, refactor or reformat code, even a found bug: note it in `NOTES`.
- Never more than 8 steps, never an empty commit.
- Never `--author`, never Claude in a message.

## Return

```
SPLIT: <key>
STEPS: <n> · branch wa-split/<key> @ <tip sha>
1. <sha> refactor: Renommage des lignes répétitions en lignes éditables · build ✅
2. <sha> feat: Ajout du nettoyage de la saisie Distance · build ✅
…
n. <sha> docs: … · no build
MERGED: <steps merged after a red build, or none>
NOTES: <bugs seen, or none>
```

Or `FALLBACK: <reason>` alone.
