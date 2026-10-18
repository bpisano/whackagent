# Store — files

`tasks.backend: files`. Every task read or write goes through these operations.

| op | how |
|---|---|
| list | `{backlog}` lines, order = priority, + each task file |
| read | `{tasks}/<slug>.md` |
| write sections | edit the file |
| set state | frontmatter `status:` + move the backlog line to its section |
| create | file from template + backlog line |
| reorder | backlog line order |
| sprint / size / type / blockers | `sprint:` (+ `· <Sprint>` on the backlog line) · `size:` · `type:` · `blocked_by:` |

- Task file and backlog disagree → task file wins, fix the line.

## Legacy

Old states (`in-progress`, `review`, `validated`), a `grilled:` field, or French headings (`## Contexte / Décisions`…) → don't guess, don't alias. → `→ next: /wa-update`, stop.
