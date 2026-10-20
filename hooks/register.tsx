import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Board, BoardTask, MilestoneCount, SprintParent, TaskFocus } from '../types'
import type { FocusView, NamedTask, PullRequest, View, ViewRow, WaConfig, Worktree } from './board'
import {
  ALL_TAB,
  SIZE_ICON,
  STATUS_ORDER,
  activeGithubIds,
  activeLocalIds,
  branchTaskId,
  boardTitles,
  bricksComment,
  dirname,
  githubFocusView,
  githubView,
  joinPath,
  localFocusView,
  localView,
  nextCommand,
  parseBacklog,
  parseConfig,
  parseFields,
  parseTaskFile,
  parseWorktrees,
  sessionName,
  toTask,
  toTickets,
} from './board'

const PANE = 'wa-board'
const TITLE = 'Backlog'
const CONFIG = '.whackagent/config.md'
const TICK_MS = 2000
const SUGGEST_DELAY_MS = 300
const TAB_TITLE_LENGTH = 18
const NAME_TOOL = 'name_session'
const NAME_TOOL_CALL = 'mcp__whackagent__name_session'
const GITHUB_MARK = '<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"/></svg>'

const board = atom({ plugin: 'whackagent', key: 'board' } as const, { kind: 'loading' } as Board)
const filter = atom({ plugin: 'whackagent', key: 'filter' } as const, '')
const selectedTask = atom({ plugin: 'whackagent', key: 'task' } as const, '')
const boardHidden = atom({ plugin: 'whackagent', key: 'isBoardHidden' } as const, false)
const expandedStates = atom({ plugin: 'whackagent', key: 'expanded' } as const, [] as string[])
const openSprints = atom({ plugin: 'whackagent', key: 'openSprints' } as const, [] as string[])

let lastSignature = ''
let lastFocusStamp = ''
let focusFiles = new Map<string, string>()
let isRefreshing = false
let suggested = ''
let sessionTitle = ''

type Checkout = { root: string; mainRoot: string; branch: string; worktrees: Worktree[] }

const git = ($: EngineInterface, cwd: string, args: readonly string[]) =>
  $.process.run(['git', ...args], { cwd }).then(
    result => (result.exitCode === 0 ? result.stdout.trim() : ''),
    () => '',
  )

async function checkout($: EngineInterface, root: string): Promise<Checkout> {
  const [branch, commonDir, porcelain] = await Promise.all([
    git($, root, ['rev-parse', '--abbrev-ref', 'HEAD']),
    git($, root, ['rev-parse', '--path-format=absolute', '--git-common-dir']),
    git($, root, ['worktree', 'list', '--porcelain']),
  ])
  return {
    root,
    mainRoot: commonDir ? dirname(commonDir) : root,
    branch: branch === 'HEAD' ? '' : branch,
    worktrees: parseWorktrees(porcelain),
  }
}

function worktreesById(at: Checkout, config: WaConfig, provider: string) {
  const found = new Map<string, Worktree>()
  for (const tree of at.worktrees) {
    const id = branchTaskId(tree.branch, config.branchPrefix, provider)
    if (id && tree.path !== at.root) found.set(id, tree)
  }
  return found
}

const readText = ($: EngineInterface, path: string) => $.fs.read(path).catch(() => undefined)

const stamp = ($: EngineInterface, path: string) =>
  $.fs.stat(path).then(
    stat => `${path}@${stat.mtimeMs}`,
    () => `${path}@-`,
  )

// region Local provider

async function localSignature($: EngineInterface, configText: string, backlogPath: string, tasksPath: string) {
  const tasks = await $.fs.list(tasksPath).catch(() => [])
  const files = tasks.map(file => `${file.name}@${file.mtimeMs}@${file.size}`).join(',')
  return `local\n${configText}\n${await stamp($, backlogPath)}\n${files}`
}

async function readTasks($: EngineInterface, backlogPath: string): Promise<BoardTask[]> {
  const entries = parseBacklog(await $.fs.read(backlogPath))
  const tasks = await Promise.all(
    entries.map(async entry => {
      const text = await $.fs.read(joinPath(dirname(backlogPath), entry.path)).catch(() => '')
      return toTask(entry, parseFields(text))
    }),
  )
  return STATUS_ORDER.flatMap(status => tasks.filter(task => task.status === status))
}

async function loadLocal($: EngineInterface, at: Checkout, configText: string, config: WaConfig) {
  const backlogPath = joinPath(at.mainRoot, config.backlog)
  const tasksPath = joinPath(at.mainRoot, config.tasks)
  const branches = at.worktrees.map(tree => tree.branch).join(',')
  const signature = `${await localSignature($, configText, backlogPath, tasksPath)}\n${at.branch}\n${branches}`
  if (signature === lastSignature) return undefined
  const tasks = await readTasks($, backlogPath)
  const trees = worktreesById(at, config, 'local')
  const hereId = branchTaskId(at.branch, config.branchPrefix, 'local')
  const here = tasks.some(task => task.slug === hereId) ? hereId : ''
  const active = await Promise.all(
    activeLocalIds(tasks, here).map(async (id): Promise<TaskFocus> => {
      const text = await readText($, `${tasksPath}/${id}.md`)
      return { id, worktree: trees.get(id)?.path ?? '', file: text === undefined ? null : parseTaskFile(text), blockedBy: [], prUrl: '' }
    }),
  )
  const next: Board = { kind: 'local', tasks, milestones: config.milestones, tracks: config.tracks, active, here }
  return { next, signature }
}

// endregion

// region GitHub provider

async function runJson($: EngineInterface, argv: readonly string[], root: string, label: string): Promise<unknown> {
  const result = await $.process.run(argv, { cwd: root, timeoutMs: 60_000 })
  if (result.exitCode !== 0) {
    const reason = result.stderr.trim().split('\n').pop() || `exit ${result.exitCode}`
    throw new Error(`${label}: ${reason}`)
  }
  return JSON.parse(result.stdout)
}

async function ticketRefs($: EngineInterface, at: Checkout, prefix: string) {
  const refs = await git($, at.root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes/origin'])
  const found = new Map<string, { branch: string; ref: string }>()
  for (const ref of refs.split('\n')) {
    const branch = ref.replace(/^origin\//, '')
    const id = branchTaskId(branch, prefix, 'github')
    if (id && !found.has(id)) found.set(id, { branch, ref })
  }
  return found
}

async function githubFocus(
  $: EngineInterface,
  at: Checkout,
  config: WaConfig,
  script: string,
  pulls: readonly PullRequest[],
  id: string,
  source: { branch: string; path: string; ref: string } | undefined,
): Promise<TaskFocus> {
  const number = id.slice(1)
  const fileName = source ? `${config.tasks}/${source.branch.slice(config.branchPrefix.length)}.md` : ''
  const diskPath = source?.path ? joinPath(source.path, fileName) : ''
  if (diskPath) focusFiles.set(id, diskPath)
  const text = !source
    ? undefined
    : diskPath
      ? await readText($, diskPath)
      : (await git($, at.root, ['show', `${source.ref}:${fileName}`])) || undefined
  const file = text === undefined ? null : parseTaskFile(text)
  const ticket = (await runJson($, ['python3', script, 'get', number], at.root, 'wa-backlog get').catch(() => ({}))) as {
    blocked_by?: { number: number; state: string }[]
  }
  if (file && file.bricks.length === 0) {
    const issue = (await runJson($, ['gh', 'issue', 'view', number, '--json', 'comments'], at.root, 'gh issue view').catch(
      () => ({}),
    )) as { comments?: { body: string }[] }
    const posted = (issue.comments ?? []).map(comment => bricksComment(comment.body)).filter(bricks => bricks.length > 0)
    file.bricks = posted.pop() ?? []
  }
  return {
    id,
    worktree: source?.path && source.path !== at.root ? source.path : '',
    file,
    blockedBy: (ticket.blocked_by ?? []).map(blocker => ({ number: blocker.number, isOpen: blocker.state === 'open' })),
    prUrl: pulls.find(pull => pull.headRefName === source?.branch)?.url ?? '',
  }
}

async function refreshFocusFiles($: EngineInterface) {
  const current = await read($, board)
  if (current.kind !== 'github' || focusFiles.size === 0) return undefined
  const focusStamp = (await Promise.all([...focusFiles.values()].map(path => stamp($, path)))).join('\n')
  if (focusStamp === lastFocusStamp) return undefined
  lastFocusStamp = focusStamp
  const active = await Promise.all(
    current.active.map(async focus => {
      const path = focusFiles.get(focus.id)
      if (!path) return focus
      const text = await readText($, path)
      const file = text === undefined ? null : parseTaskFile(text)
      return { ...focus, file: file && { ...file, bricks: file.bricks.length > 0 ? file.bricks : (focus.file?.bricks ?? []) } }
    }),
  )
  const next: Board = { ...current, active }
  return { next, signature: `github\n${JSON.stringify(next)}` }
}

async function loadGithub($: EngineInterface, at: Checkout, config: WaConfig, isForced: boolean) {
  if (!isForced) return refreshFocusFiles($)
  const script = `${$.plugin.root}/providers/github/wa-backlog`
  const [rows, milestones, pulls, refs, sprints] = await Promise.all([
    runJson($, ['python3', script, 'list', '--all', '--owners'], at.root, 'wa-backlog list'),
    runJson($, ['python3', script, 'milestones'], at.root, 'wa-backlog milestones'),
    runJson($, ['gh', 'pr', 'list', '--json', 'number,headRefName,isDraft,url', '--limit', '200'], at.root, 'gh pr list').catch(
      () => [],
    ),
    ticketRefs($, at, config.branchPrefix),
    runJson($, ['gh', 'issue', 'list', '--label', 'wa-sprint', '--state', 'open', '--json', 'number,title,milestone', '--limit', '100'], at.root, 'gh issue list').catch(
      () => [],
    ),
  ])
  const { tickets, drafts } = toTickets(rows as Record<string, unknown>[], pulls as PullRequest[], config.branchPrefix)
  const counts = (milestones as { title: string; open: boolean; tickets: number; done: number }[]).map(
    (milestone): MilestoneCount => ({ title: milestone.title, isOpen: milestone.open, tickets: milestone.tickets, done: milestone.done }),
  )
  const trees = worktreesById(at, config, 'github')
  const here = branchTaskId(at.branch, config.branchPrefix, 'github')
  focusFiles = new Map()
  const active = await Promise.all(
    activeGithubIds(tickets, here).map(id => {
      const tree = trees.get(id)
      const source = id === here
        ? { branch: at.branch, path: at.root, ref: at.branch }
        : tree
          ? { branch: tree.branch, path: tree.path, ref: tree.branch }
          : refs.has(id)
            ? { ...refs.get(id)!, path: '' }
            : undefined
      return githubFocus($, at, config, script, pulls as PullRequest[], id, source)
    }),
  )
  const next: Board = {
    kind: 'github',
    tickets,
    drafts,
    milestones: counts,
    sprints: (Array.isArray(sprints) ? (sprints as { number: number; title: string; milestone: { title: string } | null }[]) : []).map(
      (parent): SprintParent => ({ number: parent.number, title: parent.title, milestone: parent.milestone?.title ?? '' }),
    ),
    tracks: config.tracks,
    active,
    here,
  }
  const signature = `github\n${JSON.stringify(next)}`
  return signature === lastSignature ? undefined : { next, signature }
}

// endregion

async function hasConfig($: EngineInterface) {
  const root = await $.session.root()
  return $.fs.read(`${root}/${CONFIG}`).then(
    () => true,
    () => false,
  )
}

async function load($: EngineInterface, isForced: boolean): Promise<{ next: Board; signature: string } | undefined> {
  const root = await $.session.root()
  const configText = await $.fs.read(`${root}/${CONFIG}`).catch(() => undefined)
  if (configText === undefined) {
    return lastSignature === 'no-config' ? undefined : { next: { kind: 'no-config' }, signature: 'no-config' }
  }
  const config = parseConfig(configText)
  const at = await checkout($, root)
  return config.provider === 'github' ? loadGithub($, at, config, isForced) : loadLocal($, at, configText, config)
}

async function refresh($: EngineInterface, isForced = false): Promise<Board> {
  if (isRefreshing) return read($, board)
  isRefreshing = true
  try {
    const loaded = await load($, isForced)
    if (!loaded) return await read($, board)
    lastSignature = loaded.signature
    await update($, board, () => loaded.next)
    return loaded.next
  } catch (error) {
    lastSignature = 'error'
    const failed: Board = { kind: 'error', message: error instanceof Error ? error.message : String(error) }
    await update($, board, () => failed)
    return failed
  } finally {
    isRefreshing = false
  }
}

function focusesOf(current: Board): FocusView[] {
  if (current.kind === 'local') return current.active.map(focus => localFocusView(current.tasks, focus, current.here))
  if (current.kind === 'github') return current.active.map(focus => githubFocusView(current.tickets, focus, current.here))
  return []
}

function viewOf(current: Board, milestone: string, expanded: readonly string[]): View | string {
  switch (current.kind) {
    case 'loading':
      return 'Reading backlog…'
    case 'no-config':
      return 'No .whackagent/config.md here — run /wa-setup.'
    case 'error':
      return `Backlog unreadable: ${current.message}`
    case 'local':
      return localView(current.tasks, current.milestones, current.tracks, milestone, expanded)
    case 'github':
      return githubView(current.tickets, current.drafts, current.milestones, current.tracks, milestone, expanded, current.sprints)
  }
}

const tabLabel = (focus: FocusView) => {
  if (!focus.id.startsWith('#') || !focus.row) return `${focus.icon} ${focus.id}`
  const title = focus.row.title
  return `${focus.icon} ${focus.id} ${title.length > TAB_TITLE_LENGTH ? `${title.slice(0, TAB_TITLE_LENGTH - 1)}…` : title}`
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'wa-pane', description: 'Show the whackagent backlog in a live pane' })
    $.clock.every(TICK_MS, () => void refresh($))
    if (options.rename_session !== false && (await hasConfig($))) {
      await $.tool.register({
        name: NAME_TOOL,
        description:
          'Names this session after the whackagent task(s) it works on: project, ticket number, short title. Call once the task is resolved.',
        inputSchema: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              description: 'Every task this run works on, in order.',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'GitHub issue number (#12), or the local task slug.' },
                  title: { type: 'string', description: 'The task\'s own short title, as on the board. Never the command, step or state.' },
                },
                required: ['id', 'title'],
              },
            },
          },
          required: ['tasks'],
        },
        isDeferred: false,
      })
    }
    if (options.auto_open === true) {
      void refresh($, true).then(current => {
        if (current.kind !== 'no-config') void $.ui.open({ id: PANE, title: TITLE })
      })
    }

    return next(e)
  })

  on('command.run', { command: 'wa-pane' }, async $ => {
    void refresh($, true)
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Backlog pane opened.' }
  })

  on('tool.call', { tool: NAME_TOOL_CALL }, async ($, e) => {
    const tasks = Array.isArray(e.tasks) ? (e.tasks as NamedTask[]) : []
    const { mainRoot } = await checkout($, await $.session.root())
    const current = await read($, board)
    const known = current.kind === 'local' || current.kind === 'github' ? current : await refresh($, true)
    const name = sessionName(mainRoot.split('/').pop() ?? '', tasks, boardTitles(known))
    if (name && name !== sessionTitle) {
      sessionTitle = name
      $.clock.after(0, () => void $.command.run({ command: 'rename', args: name }))
    }

    return { result: name ? `Session named "${name}".` : 'No task given: session name unchanged.' }
  }).catch(() => ({ result: 'Session name unchanged.' }))

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined && e.reason === 'answer' && (await hasConfig($))) {
      suggested = nextCommand(e.answer)
      if (suggested) $.clock.after(SUGGEST_DELAY_MS, () => void $.prompt.suggest({ text: suggested }))
    }

    return done
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    suggested = ''

    return next(e)
  })

  on('prompt.suggest', async ($, e, next) =>
    next(e.origin.kind === 'suggestion' && suggested ? { ...e, text: suggested } : e),
  )

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Link } = $.ui.resolve(e)
    const current = await read($, board)
    if (current.kind === 'loading') void refresh($, true)
    const view = viewOf(current, await read($, filter), await read($, expandedStates))
    const reload = () => void refresh($, true)

    if (typeof view === 'string') {
      return (
        <Box flexDirection="column">
          <Text dimColor={current.kind !== 'error'} color={current.kind === 'error' ? 'error' : undefined}>
            {view}
          </Text>
          {current.kind === 'error' && <Button label="↻ retry" onPress={reload} />}
        </Box>
      )
    }

    const surface = e.surface
    const logo =
      current.kind === 'github' && surface !== 'terminal'
        ? (() => {
            const { Svg } = $.ui.resolve({ ...e, surface })
            return <Svg source={GITHUB_MARK} alt="GitHub" width={16} height={16} />
          })()
        : undefined
    const focuses = focusesOf(current)
    const here = current.kind === 'local' || current.kind === 'github' ? current.here : ''
    const chosen = await read($, selectedTask)
    const focus = focuses.find(one => one.id === chosen) ?? focuses.find(one => one.id === here) ?? focuses[0]
    const fill = (command: string) => () => void $.prompt.fill({ text: command })
    const openPr = (url: string) => () =>
      void $.session.root().then(root => $.process.run(['gh', 'pr', 'view', url, '--web'], { cwd: root }))
    const prLink = (url: string, label: string, key: string) =>
      surface === 'terminal' || !url ? (
        <Button key={key} label={label} plain onPress={openPr(url || label.replace(/\D/g, ''))} />
      ) : (
        <Link key={key} href={url} label={label} />
      )
    const toneColor = (tone: string) => (tone === 'sprint' ? 'suggestion' : tone === 'warning' ? 'warning' : undefined)
    const rowNode = (row: ViewRow, label: string, isClosed: boolean) => (
      <Box key={row.key} flexDirection="column">
        <Box flexDirection="row">
          <Text dimColor={isClosed}>{`${label}${SIZE_ICON[row.size] ?? '·'} `}</Text>
          <Text bold={!isClosed} dimColor={isClosed} wrap="truncate-end">
            {row.title}
          </Text>
          {row.tags.map(tag =>
            tag.href ? (
              <Box key={`${row.key}-${tag.text}`} flexDirection="row">
                <Text dimColor> · </Text>
                {prLink(tag.href, tag.text, `pr-${row.key}`)}
              </Box>
            ) : (
              <Text dimColor={tag.tone === 'muted'} color={toneColor(tag.tone)}>
                {tag.text === '⚠' ? ' ⚠' : ` · ${tag.text}`}
              </Text>
            ),
          )}
        </Box>
        {row.summary !== '' && (
          <Box paddingLeft={4}>
            <Text dimColor wrap="truncate-end">
              {row.summary}
            </Text>
          </Box>
        )}
        {row.actions.length > 0 && (
          <Box paddingLeft={4} flexDirection="row" flexWrap="wrap" gap={1}>
            {row.actions.map(one => (
              <Button key={`${row.key}-${one.label}`} label={one.label} onPress={fill(one.command)} />
            ))}
          </Box>
        )}
      </Box>
    )
    const isBoardHidden = await read($, boardHidden)
    const sprintsOpen = await read($, openSprints)
    const openCount =
      current.kind === 'local'
        ? current.tasks.filter(task => task.status !== 'done' && task.status !== 'canceled').length
        : current.kind === 'github'
          ? current.tickets.filter(ticket => ticket.state !== 'done' && ticket.state !== 'canceled').length
          : 0
    let index = 0

    return (
      <Box flexDirection="column">
        <Box marginBottom={1} flexDirection="row" flexWrap="wrap" alignItems="center" gap={1}>
          <Button
            key="board-toggle"
            label={isBoardHidden ? 'show board' : 'hide board'}
            hotkey="b"
            onPress={() => void update($, boardHidden, isHidden => !isHidden)}
          />
          {logo ?? <Text dimColor>{`provider: ${current.kind}`}</Text>}
          {view.milestone !== '' && <Text dimColor>{`· milestone: ${view.milestone}`}</Text>}
        </Box>
        {isBoardHidden ? (
          <Text dimColor>{`${openCount} open task${openCount === 1 ? '' : 's'}`}</Text>
        ) : (
          <Box flexDirection="column">
            {view.tabs.length > 0 && (
              <Box flexDirection="row" flexWrap="wrap" gap={1} marginBottom={1}>
                {[...view.tabs, ''].map(tab => (
                  <Button
                    key={`tab-${tab}`}
                    label={`${tab === view.filter ? '● ' : ''}${tab || 'All'}`}
                    variant={tab === view.filter ? 'primary' : 'secondary'}
                    onPress={() => void update($, filter, () => tab || ALL_TAB)}
                  />
                ))}
              </Box>
            )}
            {view.sprints.length > 0 && (
              <Box flexDirection="column" marginBottom={1}>
                <Text bold>🏁 Sprints</Text>
                {view.sprints.map(row => {
                  const children = row.children ?? []
                  const isOpen = sprintsOpen.includes(row.key)
                  return (
                    <Box key={row.key} flexDirection="column">
                      {rowNode(row, '', false)}
                      {children.length > 0 && (
                        <Box paddingLeft={4}>
                          <Button
                            key={`toggle-${row.key}`}
                            label={isOpen ? '▾ hide tickets' : `▸ ${children.length} ticket${children.length === 1 ? '' : 's'}`}
                            plain
                            onPress={() =>
                              void update($, openSprints, keys =>
                                keys.includes(row.key) ? keys.filter(key => key !== row.key) : [...keys, row.key],
                              )
                            }
                          />
                        </Box>
                      )}
                      {isOpen && (
                        <Box flexDirection="column" paddingLeft={4}>
                          {children.map(child => rowNode(child, '', false))}
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
            )}
            {view.sections.length === 0 && <Text dimColor>Backlog empty.</Text>}
            {view.sections.map(section => (
              <Box key={section.title} flexDirection="column" marginBottom={1}>
                <Text bold>{`${section.icon} ${section.title}`}</Text>
                {section.rows.map(row => {
                  index += 1
                  return rowNode(row, `${index} · `, section.isClosed)
                })}
                {(section.hidden > 0 || section.isExpanded) && (
                  <Box paddingLeft={4}>
                    <Button
                      key={`more-${section.state}`}
                      label={section.isExpanded ? 'show less' : `+${section.hidden} more`}
                      plain
                      onPress={() =>
                        void update($, expandedStates, states =>
                          states.includes(section.state)
                            ? states.filter(state => state !== section.state)
                            : [...states, section.state],
                        )
                      }
                    />
                  </Box>
                )}
              </Box>
            ))}
            {view.legend !== '' && <Text dimColor>{view.legend}</Text>}
            {[...view.scopes, ...view.notes].map(line => (
              <Box key={line}>
                <Text dimColor>{line}</Text>
              </Box>
            ))}
            {view.ready.map(ready => (
              <Box key={ready.line} flexDirection="row" flexWrap="wrap" gap={1}>
                <Text color="success">{ready.line}</Text>
                <Button label={ready.action.label} onPress={fill(ready.action.command)} />
              </Box>
            ))}
          </Box>
        )}
        {current.kind === 'github' && (
          <Box marginTop={1}>
            <Button label="↻ refresh" onPress={reload} />
          </Box>
        )}
        {focus && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>{`Tasks in flight (${focuses.length})`}</Text>
            <Box flexDirection="row" flexWrap="wrap" gap={1} marginBottom={1}>
              {focuses.map(one => (
                <Button
                  key={`task-${one.id}`}
                  label={`${one.id === focus.id ? '● ' : ''}${tabLabel(one)}${one.id === here ? ' 📍' : ''}`}
                  variant={one.id === focus.id ? 'primary' : 'secondary'}
                  onPress={() => void update($, selectedTask, () => one.id)}
                />
              ))}
            </Box>
            {focus.row ? rowNode(focus.row, '', false) : <Text bold>{focus.id}</Text>}
            {focus.facts.map(fact => (
              <Box key={fact} paddingLeft={4}>
                <Text dimColor wrap="truncate-end">
                  {fact}
                </Text>
              </Box>
            ))}
            {focus.pr && (
              <Box paddingLeft={4} flexDirection="row" gap={1}>
                {prLink(focus.pr.url, `PR #${focus.pr.number}`, 'open-pr')}
                <Text dimColor>{focus.pr.isDraft ? '· 🧪 draft' : '· 🔀 ready'}</Text>
              </Box>
            )}
            {focus.blocks.map(block => (
              <Box key={block.title} flexDirection="column" marginTop={1}>
                <Text bold>{block.title}</Text>
                {block.lines.map((entry, position) => (
                  <Box key={`${block.title}-${position}`} flexDirection="row">
                    <Text dimColor>{`${entry.mark} `}</Text>
                    <Text
                      dimColor={entry.tone === 'muted'}
                      color={entry.tone === 'plain' ? undefined : toneColor(entry.tone)}
                      wrap="truncate-end"
                    >
                      {entry.text}
                    </Text>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    )
  })
}
