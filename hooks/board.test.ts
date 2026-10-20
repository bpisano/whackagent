import { expect, test } from 'claude-code/testing'

import type { Board } from '../types'

import {
  ALL_TAB,
  activeGithubIds,
  boardTitles,
  githubSprintRows,
  localSprintRows,
  githubReleases,
  localReleases,
  activeLocalIds,
  branchTaskId,
  parseWorktrees,
  bricksComment,
  githubFocusView,
  githubView,
  localFocusView,
  parseTaskFile,
  localView,
  nextCommand,
  taskActions,
  ticketActions,
  joinPath,
  toTickets,
  milestoneLines,
  parseBacklog,
  parseConfig,
  parseFields,
  sessionName,
  toTask,
} from './board'

const CONFIG = `---
discussion_language: en
paths:                         # comment
  backlog: docs/BACKLOG.md     # where
  tasks: docs/tasks
  wiki: .whackagent/wiki

backlog:
  provider: local              # local | github
  milestones: [0.2.0, "0.10.0"]

branch:
  tracks:                      # {server: develop_synchro} in a comment
    server: develop_synchro
---

# Project config
`

const BACKLOG = `# Backlog

## In progress

<!-- - [Ghost](tasks/ghost.md) -->

## Todo

<!-- multi-line
- [Ghost two](tasks/ghost-two.md)
-->
- [Login Apple](tasks/login-apple.md) · login-refacto — not grilled
- [Sync offline](tasks/sync-offline.md)

## Review

- [Export CSV](tasks/export-csv.md)
`

const task = (fields: Record<string, string>, status = 'todo') =>
  toTask({ title: 'Fallback', path: `tasks/${fields.slug ?? 'x'}.md`, status: undefined }, { status, ...fields })

test('config reads paths, provider, milestones and tracks', async () => {
  expect(parseConfig(CONFIG)).toEqual({
    backlog: 'docs/BACKLOG.md',
    tasks: 'docs/tasks',
    provider: 'local',
    milestones: ['0.2.0', '0.10.0'],
    tracks: ['server'],
    branchPrefix: 'wa/',
  })
})

test('missing config keys fall back to defaults', async () => {
  expect(parseConfig('---\nyagni: strict\n---\n').backlog).toBe('.whackagent/BACKLOG.md')
})

test('backlog skips commented lines and keeps section status', async () => {
  expect(parseBacklog(BACKLOG)).toEqual([
    { title: 'Login Apple', path: 'tasks/login-apple.md', status: 'todo' },
    { title: 'Sync offline', path: 'tasks/sync-offline.md', status: 'todo' },
    { title: 'Export CSV', path: 'tasks/export-csv.md', status: 'review' },
  ])
})

test('task frontmatter wins over backlog section, comments stripped', async () => {
  const fields = parseFields(`---
title: Fix #12 crash    # label
summary: Stop crash on launch
size: quickwin
status: in-progress
grilled: true
---
body`)
  const parsed = toTask({ title: 'Other', path: 'tasks/fix-crash.md', status: 'todo' }, fields)
  expect(parsed).toEqual({
    slug: 'fix-crash',
    title: 'Fix #12 crash',
    summary: 'Stop crash on launch',
    size: 'quickwin',
    sprint: '',
    milestone: '',
    status: 'in-progress',
    isGrilled: true,
  })
})

test('paths resolve relative to the backlog folder', async () => {
  expect(joinPath('/repo/docs', 'tasks/a.md')).toBe('/repo/docs/tasks/a.md')
  expect(joinPath('/repo/docs', '../other/./b.md')).toBe('/repo/other/b.md')
})

test('sprint and milestone lines count done over total, newest open marked', async () => {
  const tasks = [
    task({ slug: 'a', sprint: 's1', milestone: '0.10.0' }, 'done'),
    task({ slug: 'b', sprint: 's1', milestone: '0.10.0' }, 'review'),
    task({ slug: 'c', milestone: '0.2.0' }),
    task({ slug: 'd', milestone: 'server' }),
  ]
  expect(localSprintRows(tasks).map(sprint => [sprint.title, sprint.summary])).toEqual([['s1', '1/2 done (1 in review)']])
  expect(localSprintRows(tasks, '0.2.0')).toEqual([])
  expect(milestoneLines(tasks, ['0.2.0', '0.10.0', 'server'], ['server'])).toEqual([
    '🎯 0.10.0 — 1/2 (1 in review) ← new tasks',
    '🎯 0.2.0 — 0/1 (1 todo)',
    '🎯 server — 0/1 (1 todo)',
  ])
})


const row = (fields: Record<string, unknown>) => ({
  number: 1,
  title: 'T',
  summary: 'S',
  state: 'todo',
  size: 'medium',
  sprint: null,
  milestone: null,
  closed: false,
  ignored: false,
  assignees: [],
  reserved: false,
  claims: [],
  ...fields,
})

test('github rows map claims, reservations, PRs, drafts; drop ignored and canceled', async () => {
  const { tickets, drafts } = toTickets(
    [
      row({ number: 12, state: 'coding', claims: [{ phase: 'coding', agent: 'mac:/src/app-worktrees/12-login', since: 'x' }] }),
      row({ number: 13, state: 'review' }),
      row({ number: 14, state: 'grilled', reserved: true, assignees: ['bob'] }),
      row({ number: 15, state: 'todo', ignored: true }),
      row({ number: 16, state: 'todo', closed: true }),
      { draft: true, title: 'Idea', item_id: 'x' },
    ],
    [{ number: 40, headRefName: 'wa/13-export', isDraft: true, url: 'https://x/pull/40' }],
    'wa/',
  )
  expect(drafts).toEqual(['Idea'])
  expect(tickets.map(ticket => [ticket.number, ticket.claimedBy, ticket.reservedBy, ticket.pr])).toEqual([
    [12, '12-login', '', null],
    [13, '', '', { number: 40, isDraft: true, url: 'https://x/pull/40' }],
    [14, '', 'bob', null],
  ])
})

test('github view orders by contract state', async () => {
  const { tickets, drafts } = toTickets(
    [
      row({ number: 2, state: 'todo', sprint: 'login', milestone: '0.5.0' }),
      row({ number: 3, state: 'review', milestone: '0.5.0' }),
      row({ number: 4, state: 'grilled' }),
      row({ number: 5, state: 'done', sprint: 'login', milestone: '0.5.0', closed: true }),
    ],
    [{ number: 9, headRefName: 'wa/3-x', isDraft: true }],
    'wa/',
  )
  const view = githubView(tickets, drafts, [{ title: '0.5.0', isOpen: true, tickets: 3, done: 1 }], [], ALL_TAB)
  expect(view.sections.map(section => `${section.icon} ${section.title}`)).toEqual(['📥 Todo', '📐 Grilled', '👀 Review', '🎉 Done'])
  expect(view.sections[2]?.rows[0]?.tags.map(tag => tag.text)).toEqual(['#3', '🧪 draft #9'])
  expect(view.sections[2]?.rows[0]?.tags[1]?.href).toBeUndefined()
  expect(view.sections[0]?.rows[0]?.tags.map(tag => tag.text)).toEqual(['#2', 'login', '⚠'])
  expect(view.scopes).toEqual(['🎯 0.5.0 — 1/3 (1 todo, 1 in review) ← new tasks'])
  expect(view.sprints.map(sprint => [sprint.title, sprint.summary])).toEqual([['login', '1/2 done (1 todo)']])
  expect(view.milestone).toBe('0.5.0')
})

test('lowest milestone tab is the default, All comes last', async () => {
  const tasks = [
    task({ slug: 'a', milestone: '0.3.0' }, 'review'),
    task({ slug: 'b', milestone: '0.2.0', sprint: 's1' }),
    task({ slug: 'c' }),
  ]
  const lowest = localView(tasks, ['0.2.0', '0.3.0'], [])
  expect(lowest.tabs).toEqual(['0.2.0', '0.3.0'])
  expect(lowest.filter).toBe('0.2.0')
  expect(lowest.sections.flatMap(section => section.rows.map(row => row.key))).toEqual(['b'])
  expect(lowest.scopes).toEqual(['🎯 0.2.0 — 0/1 (1 todo)'])
  expect(localView(tasks, ['0.2.0', '0.3.0'], [], '0.3.0').sections.flatMap(section => section.rows.map(row => row.key))).toEqual(['a'])
  expect(localView(tasks, ['0.2.0', '0.3.0'], [], 'gone').filter).toBe('0.2.0')
  const all = localView(tasks, ['0.2.0', '0.3.0'], [], ALL_TAB)
  expect(all.filter).toBe('')
  expect(all.sections.flatMap(section => section.rows.map(row => row.key)).sort()).toEqual(['a', 'b', 'c'])
  expect(localView([task({ slug: 'c' })], [], []).filter).toBe('')
  const dropped = [...tasks, task({ slug: 'x', milestone: '0.2.0' }, 'canceled')]
  expect(localView(dropped, ['0.2.0', '0.3.0'], [], ALL_TAB).sections.map(section => section.title)).not.toContain('Canceled')
  expect(localView(dropped, ['0.2.0', '0.3.0'], [], '0.2.0').sections.map(section => section.title)).toContain('Canceled')
})

test('row actions follow the task state', async () => {
  const labels = (actions: { label: string }[]) => actions.map(one => one.label)
  expect(labels(taskActions(task({ slug: 'a' })))).toEqual(['grill', 'autopilot'])
  expect(labels(taskActions(task({ slug: 'a', size: 'quickwin' })))).toEqual(['grill', 'code', 'autopilot'])
  expect(taskActions(task({ slug: 'a', grilled: 'true' }))).toEqual([
    { label: 'code', command: '/wa-code a' },
    { label: 'autopilot', command: '/wa-autopilot a' },
  ])
  expect(taskActions(task({ slug: 'a' }, 'review'))).toEqual([
    { label: 'feedback', command: '/wa-feedback a ' },
    { label: 'validate', command: '/wa-validate a' },
    { label: 'autopilot', command: '/wa-autopilot a' },
  ])
  expect(labels(taskActions(task({ slug: 'a' }, 'validated')))).toEqual(['close', 'feedback', 'autopilot'])
  expect(labels(taskActions(task({ slug: 'a' }, 'in-progress')))).toEqual(['code', 'autopilot'])
  expect(taskActions(task({ slug: 'a' }, 'canceled'))).toEqual([])
  expect(taskActions(task({ slug: 'a' }, 'done'))).toEqual([])
  const [free, claimed, ready, validated, readyUnreviewed] = toTickets(
    [
      row({ number: 7, state: 'review' }),
      row({ number: 8, state: 'grilled', claims: [{ agent: 'x' }] }),
      row({ number: 9, state: 'review' }),
      row({ number: 10, state: 'review', phase: 'validated' }),
      row({ number: 11, state: 'review', phase: 'review' }),
    ],
    [
      { number: 30, headRefName: 'wa/9-x', isDraft: false },
      { number: 31, headRefName: 'wa/11-y', isDraft: false },
    ],
    'wa/',
  ).tickets
  expect(validated!.phase).toBe('validated')
  expect(labels(ticketActions(readyUnreviewed!))).toEqual(['feedback', 'validate', 'autopilot'])
  expect(labels(ticketActions(free!))).toEqual(['feedback', 'validate', 'autopilot'])
  expect(labels(ticketActions(validated!))).toEqual(['feedback', 'validate', 'autopilot'])
  expect(ticketActions(claimed!)).toEqual([])
  expect(labels(ticketActions({ ...claimed!, claimedBy: '' }))).toEqual(['code', 'autopilot'])
  expect(ticketActions(ready!)).toEqual([
    { label: 'merge', command: '/wa-close 9' },
    { label: 'feedback', command: '/wa-feedback 9 ' },
    { label: 'autopilot', command: '/wa-autopilot 9' },
  ])
})

const TASK_FILE = `---
issue: 177
phase: validated
created: 2026-10-03
---

## Context / Decisions

<!-- comment -->
Menu on group rows.

## Acceptance criteria

1. A **long press** opens a menu.
2. Delete all entries asks for confirmation.
3. Labels read in English and French.

## Implementation

Three bricks, one implementer.

1. **Storage and sync.** \`AiEntry.unlinked\`
2. **Group menu.** \`DropdownMenu\`

## Review

### code — 2026-10-02
- Round 1: 2 findings.

### validation (autopilot) — 2026-10-03
- Round 1, 9 minor findings, all fixed.
- Round 2: clean.

## Verification

- ✅ AC1: long-click opens the menu.
- ❌ AC2: confirmation missing.
- ✅ AC3 (EN): labels on screen.
- Not run: iOS simulator.

## Feedback

### Round 1 — 2026-10-04
- Asked: secondary button style.
- Changed: LoginView.
`

test('branch maps to a task id per provider', async () => {
  expect(branchTaskId('wa/login-apple', 'wa/', 'local')).toBe('login-apple')
  expect(branchTaskId('wa/177-ai-group-menu', 'wa/', 'github')).toBe('#177')
  expect(branchTaskId('wa/notes', 'wa/', 'github')).toBe('')
  expect(branchTaskId('main', 'wa/', 'local')).toBe('')
  expect(branchTaskId('wa/', 'wa/', 'local')).toBe('')
})

test('task file sections parse into criteria, bricks, last review round, checks and feedback', async () => {
  expect(parseTaskFile(TASK_FILE)).toEqual({
    phase: 'validated',
    criteria: ['A long press opens a menu.', 'Delete all entries asks for confirmation.', 'Labels read in English and French.'],
    bricks: ['Storage and sync. `AiEntry.unlinked`', 'Group menu. `DropdownMenu`'],
    review: { heading: 'validation (autopilot) — 2026-10-03', lines: ['Round 1, 9 minor findings, all fixed.', 'Round 2: clean.'] },
    verification: ['✅ AC1: long-click opens the menu.', '❌ AC2: confirmation missing.', '✅ AC3 (EN): labels on screen.', 'Not run: iOS simulator.'],
    feedback: [{ heading: 'Round 1 — 2026-10-04', lines: ['Asked: secondary button style.', 'Changed: LoginView.'] }],
  })
  expect(bricksComment('🧱 2 bricks\n1. Auth provider — `AuthService`\n2. Button')).toEqual(['Auth provider — `AuthService`', 'Button'])
  expect(bricksComment('LGTM')).toEqual([])
})

test('github focus marks criteria from verification, lists sprint siblings and open blockers', async () => {
  const { tickets } = toTickets(
    [
      row({ number: 177, state: 'review', sprint: 'menus', milestone: '0.4.1' }),
      row({ number: 176, state: 'done', sprint: 'menus', title: 'Base menu' }),
    ],
    [{ number: 40, headRefName: 'wa/177-ai-group-menu', isDraft: true }],
    'wa/',
  )
  const view = githubFocusView(tickets, {
    id: '#177',
    worktree: '/src/app-worktrees/177-ai-group-menu',
    file: parseTaskFile(TASK_FILE),
    blockedBy: [
      { number: 10, isOpen: true },
      { number: 11, isOpen: false },
    ],
    prUrl: 'https://x/pull/40',
  })
  expect(view.facts).toEqual(['👀 review · phase: validated · milestone 0.4.1', '⛔ blocked by #10', '🌳 /src/app-worktrees/177-ai-group-menu'])
  expect(view.pr).toEqual({ number: 40, isDraft: true, url: 'https://x/pull/40' })
  expect(view.row?.actions.map(one => one.label)).toEqual(['feedback', 'validate', 'autopilot'])
  // no task file checked out here: the phase comes from the board row
  const remote = githubFocusView(
    toTickets([row({ number: 177, state: 'review', phase: 'validated' })], [{ number: 40, headRefName: 'wa/177-x', isDraft: false }], 'wa/').tickets,
    { id: '#177', worktree: '', file: null, blockedBy: [], prUrl: '' },
  )
  expect(remote.facts[0]).toBe('👀 review · phase: validated')
  expect(remote.row?.actions.map(one => one.label)).toEqual(['merge', 'feedback', 'autopilot'])
  expect(view.blocks.map(block => block.title)).toEqual([
    '🏁 menus — 1/2',
    'Acceptance criteria (3)',
    'Bricks (2)',
    'Review — validation (autopilot) — 2026-10-03',
    'Verification ✅ 2 ❌ 1',
    'Feedback (1 round)',
  ])
  expect(view.blocks[0]?.lines.map(one => one.mark)).toEqual(['→', '✓'])
  expect(view.blocks[1]?.lines.map(one => one.mark)).toEqual(['✅', '❌', '✅'])
  expect(view.blocks[4]?.lines.map(one => one.text)).toEqual(['❌ AC2: confirmation missing.', 'Not run: iOS simulator.'])
})

test('local focus without a task file section still shows the task', async () => {
  const view = localFocusView([task({ slug: 'a', sprint: 's', grilled: 'true' }, 'in-progress')], {
    id: 'a',
    worktree: '',
    file: parseTaskFile('---\nstatus: in-progress\n---\n\n## Acceptance criteria\n\n## Feedback\n'),
    blockedBy: [],
    prUrl: '',
  }, 'a')
  expect(view.facts).toEqual(['🔨 in-progress · grilled', '📍 checked out here'])
  expect(view.blocks.map(block => block.title)).toEqual(['🏁 s — 0/1'])
  expect(localFocusView([], { id: 'gone', worktree: '', file: null, blockedBy: [], prUrl: '' }).facts).toEqual(['not in the backlog'])
})

test('worktree list parses into path and branch, detached heads skipped', async () => {
  const porcelain = [
    'worktree /src/app\nHEAD abc\nbranch refs/heads/main',
    'worktree /src/app-worktrees/12-login\nHEAD def\nbranch refs/heads/wa/12-login',
    'worktree /src/app-worktrees/tmp\nHEAD 123\ndetached',
  ].join('\n\n')
  expect(parseWorktrees(porcelain)).toEqual([
    { path: '/src/app', branch: 'main' },
    { path: '/src/app-worktrees/12-login', branch: 'wa/12-login' },
  ])
})

test('tasks in flight: grilling and coding only, checked-out task first', async () => {
  const tasks = [
    task({ slug: 'idea' }),
    task({ slug: 'tree' }),
    task({ slug: 'coding' }, 'in-progress'),
    task({ slug: 'testing' }, 'review'),
    task({ slug: 'shipped' }, 'done'),
  ]
  expect(activeLocalIds([...tasks, task({ slug: 'here' }, 'in-progress')], 'here')).toEqual(['here', 'coding'])
  expect(activeLocalIds(tasks, 'testing')).toEqual(['coding'])
  const { tickets } = toTickets(
    [
      row({ number: 1, state: 'coding', assignees: ['me'] }),
      row({ number: 2, state: 'coding', assignees: ['bob'], reserved: true }),
      row({ number: 3, state: 'todo', assignees: ['me'] }),
      row({ number: 4, state: 'grilling', assignees: ['me'] }),
      row({ number: 5, state: 'review', assignees: ['me'] }),
    ],
    [],
    'wa/',
  )
  expect(activeGithubIds(tickets, '#4')).toEqual(['#4', '#1'])
})


test('github: closed as not planned is canceled, not done, wherever its column', async () => {
  const { tickets } = toTickets(
    [
      row({ number: 1, state: 'done', closed: true }),
      row({ number: 2, state: 'done', closed: true, not_planned: true, sprint: 's', milestone: 'm' }),
      row({ number: 3, state: 'todo', closed: true, not_planned: true }),
      row({ number: 4, state: 'todo', closed: true }),
      row({ number: 5, state: 'coding', sprint: 's', milestone: 'm' }),
    ],
    [],
    'wa/',
  )
  expect(tickets.map(ticket => [ticket.number, ticket.state])).toEqual([
    [1, 'done'],
    [2, 'canceled'],
    [3, 'canceled'],
    [5, 'coding'],
  ])
  const milestones = [{ title: 'm', isOpen: true, tickets: 2, done: 1 }]
  const view = githubView(tickets, [], milestones, [], ALL_TAB)
  expect(view.sections.map(section => `${section.icon} ${section.title}`)).toEqual(['🔨 Coding', '🎉 Done'])
  expect(githubView(tickets, [], milestones, [], 'm').sections.map(section => section.title)).toEqual(['Coding', 'Canceled'])
  expect(view.scopes).toEqual(['🎯 m — 1/2 (1 coding) ← new tasks'])
  expect(view.sprints.map(sprint => sprint.summary)).toEqual(['0/2 done (1 coding)'])
  expect(ticketActions(tickets[1]!)).toEqual([])
})

test('a complete open milestone offers a release; 0/0, all canceled, live, closed and tracks do not', async () => {
  const tasks = [
    task({ slug: 'a', milestone: '0.3.0' }, 'done'),
    task({ slug: 'b', milestone: '0.3.0' }, 'canceled'),
    task({ slug: 'c', milestone: '0.4.0' }, 'canceled'),
    task({ slug: 'd', milestone: '0.5.0' }, 'review'),
    task({ slug: 'e', milestone: 'server' }, 'done'),
    task({ slug: 'f', milestone: '0.2.0' }, 'done'),
  ]
  expect(localReleases(tasks, ['0.3.0', '0.4.0', '0.5.0', '0.6.0', 'server'], ['server'])).toEqual([
    { name: '0.3.0', line: '🎯 0.3.0 — 1/2 · ready to ship', action: { label: 'release', command: '/wa-release 0.3.0' } },
  ])
  expect(localView(tasks, ['0.3.0', '0.5.0'], [], '0.5.0').ready).toEqual([])
  const { tickets } = toTickets(
    [
      row({ number: 1, state: 'done', closed: true, milestone: '1.0' }),
      row({ number: 2, state: 'todo', milestone: '1.1' }),
      row({ number: 3, state: 'done', closed: true, milestone: '1.0-sprint' }),
    ],
    [],
    'wa/',
  )
  expect(
    githubReleases(
      tickets,
      [
        { title: '1.1', isOpen: true, tickets: 1, done: 0 },
        { title: '1.0', isOpen: true, tickets: 1, done: 1 },
        { title: '0.9', isOpen: true, tickets: 0, done: 0 },
        { title: '0.8', isOpen: false, tickets: 2, done: 2 },
        { title: '1.0-sprint', isOpen: true, tickets: 3, done: 1 },
      ],
      [],
    ).map(ready => ready.action.command),
  ).toEqual(['/wa-release 1.0', '/wa-release 1.0-sprint'])
})

test('a closed section shows its 3 most recent, all once expanded', async () => {
  const done = ['a', 'b', 'c', 'd', 'e'].map(slug => task({ slug }, 'done'))
  const collapsed = localView(done, [], []).sections[0]!
  expect([collapsed.rows.map(one => one.key), collapsed.hidden, collapsed.isExpanded]).toEqual([['c', 'd', 'e'], 2, false])
  const open = localView(done, [], [], '', ['done']).sections[0]!
  expect([open.rows.length, open.hidden, open.isExpanded]).toEqual([5, 0, true])
  expect(localView(done.slice(0, 2), [], [], '', ['done']).sections[0]?.isExpanded).toBe(false)
})

test('github: every open sprint parent is a row; all tickets closed offers close; milestone tab keeps its sprints', async () => {
  const { tickets } = toTickets(
    [
      row({ number: 1, state: 'done', closed: true, sprint: 'smarter-report' }),
      row({ number: 2, state: 'done', closed: true, not_planned: true, sprint: 'smarter-report' }),
      row({ number: 3, state: 'coding', sprint: 'login-refacto' }),
    ],
    [],
    'wa/',
  )
  const parents = [
    { number: 183, title: 'Smarter report', milestone: '0.5.0' },
    { number: 90, title: 'Login refacto', milestone: '' },
    { number: 91, title: 'Empty sprint', milestone: '' },
  ]
  expect(
    githubSprintRows(tickets, parents).map(sprint => [
      sprint.title,
      sprint.tags.map(tag => tag.text),
      sprint.summary,
      sprint.actions.map(one => one.command),
      (sprint.children ?? []).map(child => child.key),
    ]),
  ).toEqual([
    [
      'Smarter report',
      ['#183', '0.5.0'],
      '1/2 done · complete',
      ['/wa-close smarter-report'],
      ['1', '2'],
    ],
    ['Login refacto', ['#90'], '0/1 done (1 coding)', [], ['3']],
    ['Empty sprint', ['#91'], 'no ticket yet', [], []],
  ])
  expect(githubSprintRows(tickets, parents, '0.5.0').map(sprint => sprint.title)).toEqual(['Smarter report'])
  const view = githubView(tickets, [], [], [], '', [], parents)
  expect(view.scopes).toEqual([])
  expect(view.ready).toEqual([])
})

test('a milestone ready to ship drops its progress line', async () => {
  const { tickets } = toTickets([row({ number: 1, state: 'done', closed: true, milestone: '0.5.0' })], [], 'wa/')
  const view = githubView(tickets, [], [{ title: '0.5.0', isOpen: true, tickets: 2, done: 1 }], [], ALL_TAB)
  expect(view.scopes).toEqual([])
  expect(view.ready.map(ready => ready.line)).toEqual(['🎯 0.5.0 — 1/1 · ready to ship'])
})

test('next command: first backticked /wa- command on the last → line, placeholders dropped', async () => {
  expect(nextCommand('done\n→ next: test it, then `/wa-validate 216` (or `/wa-feedback 216 <notes>`)')).toBe('/wa-validate 216')
  expect(nextCommand('→ suite : `/wa-feedback 216 <notes>`')).toBe('/wa-feedback 216 ')
  expect(nextCommand('**→ next:** `/wa-code 12`\n\nbuild ✅')).toBe('/wa-code 12')
  expect(nextCommand('→ next: `/wa-grill login`\nrun `/wa-board` first')).toBe('/wa-grill login')
  expect(nextCommand('run `/wa-board` first')).toBe('')
  expect(nextCommand('next: /wa-code 12 without backticks')).toBe('')
  expect(nextCommand('')).toBe('')
})

test('session name: project, ticket numbers and short titles; titles dropped past two tasks', async () => {
  expect(sessionName('shop', [{ id: '#12', title: 'Login Apple' }])).toBe('shop · #12 Login Apple')
  expect(sessionName('shop', [{ id: '12', title: 'Login Apple' }, { id: '#14', title: 'Export CSV' }])).toBe(
    'shop · #12 Login Apple · #14 Export CSV',
  )
  expect(sessionName('shop', [{ id: 'login-apple', title: 'Login Apple' }])).toBe('shop · Login Apple')
  expect(sessionName('shop', [{ id: '#1', title: '' }, { id: '#2', title: '' }, { id: '#3', title: '' }])).toBe('shop · #1 · #2 · #3')
  expect(sessionName('shop', [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: '#3', title: 'C' }])).toBe('shop · A · B · #3')
  expect(sessionName('shop', [{ id: 'sync', title: 'Offline queue with conflict resolution' }])).toBe(
    'shop · Offline queue with conflict r…',
  )
  expect(sessionName('shop', [{ id: 'sync', title: '' }])).toBe('shop · sync')
  expect(sessionName('shop', [])).toBe('')
})

test('session name: board titles win over the title the agent names', async () => {
  const github = { kind: 'github', tickets: [{ number: 324, title: 'Offline sync' }] } as unknown as Board
  const local = { kind: 'local', tasks: [{ slug: 'login-apple', title: 'Login Apple' }] } as unknown as Board
  expect(sessionName('shop', [{ id: '324', title: 'validate' }], boardTitles(github))).toBe('shop · #324 Offline sync')
  expect(sessionName('shop', [{ id: 'login-apple', title: 'review' }], boardTitles(local))).toBe('shop · Login Apple')
  expect(sessionName('shop', [{ id: '#9', title: 'Export CSV' }], boardTitles(github))).toBe('shop · #9 Export CSV')
  expect(boardTitles({ kind: 'loading' }).size).toBe(0)
})
