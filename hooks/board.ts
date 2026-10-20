import type { BoardTask, GithubState, GithubTicket, MilestoneCount, SprintParent, TaskFile, TaskFocus, TaskStatus } from '../types'

export type WaConfig = {
  backlog: string
  tasks: string
  provider: string
  milestones: string[]
  tracks: string[]
  branchPrefix: string
}

export type BacklogEntry = { title: string; path: string; status: TaskStatus | undefined }

export type Tone = 'sprint' | 'warning' | 'muted'
export type Action = { label: string; command: string }
export type ViewRow = {
  key: string
  size: string
  title: string
  tags: { text: string; tone: Tone; href?: string }[]
  summary: string
  actions: Action[]
  children?: ViewRow[]
}
export type ViewSection = {
  state: string
  icon: string
  title: string
  rows: ViewRow[]
  hidden: number
  isClosed: boolean
  isExpanded: boolean
}
export type FocusLine = { mark: string; text: string; tone: Tone | 'plain' }
export type FocusBlock = { title: string; lines: FocusLine[] }
export type FocusPr = { number: number; isDraft: boolean; url: string }
export type FocusView = {
  id: string
  icon: string
  row: ViewRow | null
  facts: string[]
  pr: FocusPr | null
  blocks: FocusBlock[]
}

export type Release = { name: string; line: string; action: Action }
export type View = {
  sections: ViewSection[]
  legend: string
  scopes: string[]
  sprints: ViewRow[]
  ready: Release[]
  notes: string[]
  milestone: string
  tabs: string[]
  filter: string
}

type Scope = { name: string; line: string }

export type PullRequest = { number: number; headRefName: string; isDraft: boolean; url?: string }

export const STATUS_ORDER: readonly TaskStatus[] = ['todo', 'in-progress', 'review', 'validated', 'done', 'canceled']
const GITHUB_ORDER: readonly GithubState[] = ['todo', 'grilling', 'grilled', 'coding', 'review', 'done', 'canceled']
const isOpenTicket = (ticket: GithubTicket) => ticket.state !== 'done' && ticket.state !== 'canceled'

const LOCAL_TITLE: Record<TaskStatus, string> = {
  'in-progress': 'In progress',
  todo: 'Todo',
  review: 'Review',
  validated: 'Validated',
  done: 'Done',
  canceled: 'Canceled',
}
const GITHUB_TITLE: Record<GithubState, string> = {
  coding: 'Coding',
  review: 'Review',
  grilled: 'Grilled',
  grilling: 'Grilling',
  todo: 'Todo',
  done: 'Done',
  canceled: 'Canceled',
}
const LOCAL_LABEL: Partial<Record<string, string>> = {
  'in-progress': 'in progress',
  todo: 'todo',
  review: 'in review',
  validated: 'validated',
}
export const STATE_ICON: Partial<Record<string, string>> = {
  todo: '📥',
  grilling: '🔥',
  grilled: '📐',
  'in-progress': '🔨',
  coding: '🔨',
  review: '👀',
  validated: '👍',
  done: '🎉',
  canceled: '🚫',
}
const withIcon = (state: string) => `${STATE_ICON[state] ?? '·'} ${state}`

const GITHUB_LABEL: Partial<Record<string, string>> = {
  coding: 'coding',
  review: 'in review',
  grilled: 'grilled',
  grilling: 'grilling',
  todo: 'todo',
}

export const SIZE_ICON: Partial<Record<string, string>> = { quickwin: '🟢', medium: '🟡', large: '🔴' }
const SIZE_NAME: Record<string, string> = { quickwin: 'quick win', medium: 'medium', large: 'large' }
const CLOSED_SHOWN = 3
const NOT_GRILLED = '⚠'
const BLOCKED = '⛔'

const unquote = (value: string) => value.replace(/^["']|["']$/g, '')
const valueOf = (raw: string) => unquote(raw.replace(/\s+#(\s.*)?$/, '').trim())
const inlineList = (value: string) =>
  value.replace(/^\[|\]$/g, '').split(',').map(item => unquote(item.trim())).filter(Boolean)
const inlineMapKeys = (value: string) =>
  value
    .replace(/^\{|\}$/g, '')
    .split(',')
    .map(pair => unquote((pair.split(':')[0] ?? '').trim()))
    .filter(Boolean)

export const isLive = (task: BoardTask) => task.status !== 'done' && task.status !== 'canceled'

// region Parsing

function frontmatter(text: string): string[] {
  const lines = text.split(/\r?\n/)
  if (lines[0]?.trim() !== '---') return []
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---')
  return lines.slice(1, end < 0 ? lines.length : end)
}

export function parseConfig(text: string): WaConfig {
  const config: WaConfig = {
    backlog: '.whackagent/BACKLOG.md',
    tasks: '.whackagent/tasks',
    provider: 'local',
    milestones: [],
    tracks: [],
    branchPrefix: 'wa/',
  }
  let block = ''
  let blockList: 'milestones' | 'tracks' | '' = ''
  for (const line of frontmatter(text)) {
    const top = line.match(/^([\w-]+):(.*)$/)
    if (top) {
      block = top[1] ?? ''
      blockList = ''
      continue
    }
    const nested = line.match(/^ {2}([\w-]+):(.*)$/)
    if (nested) {
      const [, key, rest = ''] = nested
      const value = valueOf(rest)
      blockList = ''
      if (block === 'paths' && key === 'backlog' && value) config.backlog = value
      else if (block === 'paths' && key === 'tasks' && value) config.tasks = value
      else if (block === 'backlog' && key === 'provider' && value) config.provider = value
      else if (block === 'branch' && key === 'prefix') config.branchPrefix = value
      else if (block === 'backlog' && key === 'milestones') {
        if (value) config.milestones = inlineList(value)
        else blockList = 'milestones'
      } else if (block === 'branch' && key === 'tracks') {
        if (value) config.tracks = inlineMapKeys(value)
        else blockList = 'tracks'
      }
      continue
    }
    const item = line.match(/^ {4}-\s*(.+)$/)
    if (item && blockList === 'milestones') config.milestones.push(valueOf(item[1] ?? ''))
    const entry = line.match(/^ {4}([^\s#-][^:]*):/)
    if (entry && blockList === 'tracks') config.tracks.push(unquote((entry[1] ?? '').trim()))
  }
  return config
}

export function parseFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const line of frontmatter(text)) {
    const field = line.match(/^([\w-]+):(.*)$/)
    if (field?.[1]) fields[field[1]] = valueOf(field[2] ?? '')
  }
  return fields
}

function uncommented(lines: readonly string[]): string[] {
  const out: string[] = []
  let isInComment = false
  for (const raw of lines) {
    let line = raw
    if (isInComment) {
      const end = line.indexOf('-->')
      if (end < 0) continue
      line = line.slice(end + 3)
      isInComment = false
    }
    line = line.replace(/<!--.*?-->/g, '')
    const open = line.indexOf('<!--')
    if (open >= 0) {
      line = line.slice(0, open)
      isInComment = true
    }
    out.push(line)
  }
  return out
}

export function parseBacklog(text: string): BacklogEntry[] {
  const sectionStatus = Object.fromEntries(
    Object.entries(LOCAL_TITLE).map(([status, title]) => [title.toLowerCase(), status as TaskStatus]),
  )
  const entries: BacklogEntry[] = []
  let status: TaskStatus | undefined
  for (const line of uncommented(text.split(/\r?\n/))) {
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      status = sectionStatus[(heading[1] ?? '').toLowerCase()]
      continue
    }
    const link = line.match(/^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)/)
    if (link) entries.push({ title: link[1] ?? '', path: link[2] ?? '', status })
  }
  return entries
}

export const dirname = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf('/')))

export function joinPath(dir: string, relative: string): string {
  if (relative.startsWith('/')) return relative
  const out: string[] = []
  for (const part of `${dir}/${relative}`.split('/')) {
    if (part === '..') out.pop()
    else if (part !== '.' && (part !== '' || out.length === 0)) out.push(part)
  }
  return out.join('/')
}

export function toTask(entry: BacklogEntry, fields: Record<string, string>): BoardTask {
  const declared = STATUS_ORDER.find(status => status === fields.status)
  return {
    slug: (entry.path.split('/').pop() ?? entry.path).replace(/\.md$/, ''),
    title: fields.title || entry.title,
    summary: fields.summary ?? '',
    size: fields.size ?? '',
    sprint: fields.sprint ?? '',
    milestone: fields.milestone ?? '',
    status: declared ?? entry.status ?? 'todo',
    isGrilled: fields.grilled === 'true',
    type: fields.type ?? '',
    blockedBy: inlineList(fields.blocked_by ?? ''),
  }
}

type RawRow = Record<string, unknown>
const text = (value: unknown) => (typeof value === 'string' ? value : '')

export function toTickets(
  rows: readonly RawRow[],
  pulls: readonly PullRequest[],
  branchPrefix: string,
): { tickets: GithubTicket[]; drafts: string[] } {
  const tickets: GithubTicket[] = []
  const drafts: string[] = []
  for (const row of rows) {
    if (row.draft === true) {
      drafts.push(text(row.title))
      continue
    }
    const listed = GITHUB_ORDER.find(one => one === row.state)
    const state = row.not_planned === true ? 'canceled' : listed
    if (!state || row.ignored === true || (row.closed === true && state === listed && state !== 'done')) continue
    const number = Number(row.number)
    const claims = Array.isArray(row.claims) ? (row.claims as RawRow[]) : []
    const assignees = Array.isArray(row.assignees) ? row.assignees.map(text) : []
    const pull = pulls.find(one => one.headRefName.startsWith(`${branchPrefix}${number}-`))
    tickets.push({
      number,
      title: text(row.title),
      summary: text(row.summary),
      size: text(row.size),
      sprint: text(row.sprint),
      milestone: text(row.milestone),
      state,
      claimedBy: claims.length > 0 ? (text(claims[0]?.agent).split(/[/\\]/).pop() ?? '') || '?' : '',
      reservedBy: row.reserved === true ? (assignees[0] ?? '?') : '',
      isMine: assignees.length > 0 && row.reserved !== true,
      phase: text(row.phase),
      pr: pull ? { number: pull.number, isDraft: pull.isDraft, url: pull.url ?? '' } : null,
    })
  }
  return { tickets, drafts }
}

// endregion

// region Counting

function breakdown(states: readonly string[], order: readonly string[], labels: Partial<Record<string, string>>) {
  return order.flatMap(state => {
    const count = states.filter(one => one === state).length
    const label = labels[state]
    return count > 0 && label ? [`${count} ${label}`] : []
  })
}

const scopeLine = (icon: string, name: string, done: number, total: number, parts: readonly string[]) =>
  `${icon} ${name} — ${done}/${total}${parts.length > 0 ? ` (${parts.join(', ')})` : ''}`

export function compareVersions(a: string, b: string): number {
  const numbers = (value: string) => value.split(/[^0-9]+/).filter(Boolean).map(Number)
  const [left, right] = [numbers(a), numbers(b)]
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0)
    if (delta !== 0) return delta
  }
  return a.localeCompare(b)
}

export const newestMilestone = (milestones: readonly string[], tracks: readonly string[]) =>
  milestones.filter(name => !tracks.includes(name)).sort(compareVersions).pop() ?? ''

export const newestGithubMilestone = (milestones: readonly MilestoneCount[], tracks: readonly string[]) =>
  milestones.find(milestone => milestone.isOpen && !tracks.includes(milestone.title))?.title ?? ''

export const milestoneLines = (tasks: readonly BoardTask[], milestones: readonly string[], tracks: readonly string[]) =>
  milestoneScopes(tasks, milestones, tracks).map(scope => scope.line)

function milestoneScopes(tasks: readonly BoardTask[], milestones: readonly string[], tracks: readonly string[]): Scope[] {
  const newest = newestMilestone(milestones, tracks)
  const names = [...new Set([...milestones, ...tasks.map(task => task.milestone).filter(Boolean)])]
  return names
    .sort((a, b) => compareVersions(b, a))
    .flatMap(name => {
      const members = tasks.filter(task => task.milestone === name)
      if (!members.some(isLive)) return []
      const done = members.filter(task => task.status === 'done').length
      const parts = breakdown(members.map(task => task.status), STATUS_ORDER, LOCAL_LABEL)
      return [{ name, line: `${scopeLine('🎯', name, done, members.length, parts)}${name === newest ? ' ← new tasks' : ''}` }]
    })
}

export const sprintName = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const sprintSummary = (done: number, total: number, parts: readonly string[], isComplete: boolean) =>
  `${done}/${total} done${parts.length > 0 ? ` (${parts.join(', ')})` : ''}${isComplete ? ' · complete' : ''}`

export function localSprintRows(tasks: readonly BoardTask[], filter = ''): ViewRow[] {
  const sprints = [...new Set(tasks.map(task => task.sprint).filter(Boolean))]
  return sprints.flatMap(sprint => {
    const members = tasks.filter(task => task.sprint === sprint)
    if (!members.some(isLive) || (filter && !members.some(task => task.milestone === filter))) return []
    const done = members.filter(task => task.status === 'done').length
    const parts = breakdown(members.map(task => task.status), STATUS_ORDER, LOCAL_LABEL)
    return [
      {
        key: `sprint-${sprint}`,
        size: '',
        title: sprint,
        tags: [],
        summary: sprintSummary(done, members.length, parts, false),
        actions: [],
        children: STATUS_ORDER.flatMap(status => members.filter(task => task.status === status)).map(task => localRow(task, tasks)),
      },
    ]
  })
}

export function githubSprintRows(tickets: readonly GithubTicket[], parents: readonly SprintParent[], filter = ''): ViewRow[] {
  const known = new Set(parents.map(parent => sprintName(parent.title)))
  const orphans = [...new Set(tickets.filter(ticket => ticket.sprint && isOpenTicket(ticket) && !known.has(ticket.sprint)).map(ticket => ticket.sprint))]
  const entries = [
    ...parents.map(parent => ({ sprint: sprintName(parent.title), title: parent.title, number: parent.number, milestone: parent.milestone })),
    ...orphans.map(sprint => ({ sprint, title: sprint, number: 0, milestone: '' })),
  ]
  return entries.flatMap(entry => {
    const members = tickets.filter(ticket => ticket.sprint === entry.sprint)
    if (filter && entry.milestone !== filter && !members.some(ticket => ticket.milestone === filter)) return []
    const done = members.filter(ticket => ticket.state === 'done').length
    const isComplete = members.length > 0 && !members.some(isOpenTicket)
    const parts = breakdown(members.map(ticket => ticket.state), GITHUB_ORDER, GITHUB_LABEL)
    return [
      {
        key: `sprint-${entry.sprint}`,
        size: '',
        title: entry.title,
        tags: [
          ...(entry.number ? [{ text: `#${entry.number}`, tone: 'muted' as const }] : []),
          ...(entry.milestone ? [{ text: entry.milestone, tone: 'muted' as const }] : []),
        ],
        summary: members.length === 0 ? 'no ticket yet' : sprintSummary(done, members.length, parts, isComplete),
        actions: isComplete ? [action('close', `/wa-close ${entry.sprint}`)] : [],
        children: GITHUB_ORDER.flatMap(state => members.filter(ticket => ticket.state === state)).map(ticket => githubRow(ticket)),
      },
    ]
  })
}

const release = (name: string, done: number, total: number): Release => ({
  name,
  line: `${scopeLine('🎯', name, done, total, [])} · ready to ship`,
  action: { label: 'release', command: `/wa-release ${name}` },
})

export function localReleases(tasks: readonly BoardTask[], milestones: readonly string[], tracks: readonly string[]): Release[] {
  return milestones
    .filter(name => !tracks.includes(name))
    .sort((a, b) => compareVersions(b, a))
    .flatMap(name => {
      const members = tasks.filter(task => task.milestone === name)
      const done = members.filter(task => task.status === 'done').length
      return done > 0 && !members.some(isLive) ? [release(name, done, members.length)] : []
    })
}

export function githubReleases(
  tickets: readonly GithubTicket[],
  milestones: readonly MilestoneCount[],
  tracks: readonly string[],
): Release[] {
  return milestones.flatMap(milestone => {
    if (!milestone.isOpen || tracks.includes(milestone.title)) return []
    const members = tickets.filter(ticket => ticket.milestone === milestone.title)
    const done = members.filter(ticket => ticket.state === 'done').length
    return done > 0 && !members.some(isOpenTicket) ? [release(milestone.title, done, members.length)] : []
  })
}

function githubMilestoneScopes(
  tickets: readonly GithubTicket[],
  milestones: readonly MilestoneCount[],
  tracks: readonly string[],
): Scope[] {
  const newest = newestGithubMilestone(milestones, tracks)
  return milestones.flatMap(milestone => {
    if (milestone.tickets === milestone.done) return []
    const live = tickets.filter(ticket => ticket.milestone === milestone.title && isOpenTicket(ticket))
    const parts = breakdown(live.map(ticket => ticket.state), GITHUB_ORDER, GITHUB_LABEL)
    const line = scopeLine('🎯', milestone.title, milestone.done, milestone.tickets, parts)
    return [{ name: milestone.title, line: `${line}${milestone.title === newest ? ' ← new tasks' : ''}` }]
  })
}

// endregion

// region Next command

const COMMAND = /`(\/wa-[a-z]+[^`\n]*)`/
const NEXT_LINE = /^\s*(\*\*)?→/

export function nextCommand(answer: string): string {
  const line = answer.split('\n').reverse().find(one => NEXT_LINE.test(one) && COMMAND.test(one))
  const command = line?.match(COMMAND)?.[1]?.trim() ?? ''
  const placeholder = command.search(/\s<[^>]*>/)
  return placeholder < 0 ? command : `${command.slice(0, placeholder)} `
}

// endregion

// region Session name

export type NamedTask = { id: string; title: string }

const NAME_TITLE_LENGTH = 30
const NAME_TITLES_UP_TO = 2

const shortTitle = (title: string) =>
  title.length > NAME_TITLE_LENGTH ? `${title.slice(0, NAME_TITLE_LENGTH - 1).trimEnd()}…` : title

export function sessionName(project: string, tasks: readonly NamedTask[]): string {
  const withTitles = tasks.length <= NAME_TITLES_UP_TO
  const labels = tasks.flatMap(task => {
    const id = task.id.trim().replace(/^(\d+)$/, '#$1')
    const number = id.startsWith('#') ? id : ''
    const title = shortTitle(task.title.trim())
    const label = (withTitles ? [number, title].filter(Boolean).join(' ') : number || title) || id
    return label ? [label] : []
  })
  return labels.length === 0 ? '' : [project, ...labels].join(' · ')
}

// endregion

// region Row actions

const action = (label: string, command: string): Action => ({ label, command })

function stepActions(task: BoardTask): Action[] {
  const { slug } = task
  switch (task.status) {
    case 'todo':
      return [
        ...(task.isGrilled ? [] : [action('grill', `/wa-grill ${slug}`)]),
        ...(task.isGrilled || task.size === 'quickwin' ? [action('code', `/wa-code ${slug}`)] : []),
      ]
    case 'in-progress':
      return [action('code', `/wa-code ${slug}`)]
    case 'review':
      return [action('feedback', `/wa-feedback ${slug} `), action('validate', `/wa-validate ${slug}`)]
    case 'validated':
      return [action('close', `/wa-close ${slug}`), action('feedback', `/wa-feedback ${slug} `)]
    default:
      return []
  }
}

export const taskActions = (task: BoardTask): Action[] =>
  isLive(task) ? [...stepActions(task), action('autopilot', `/wa-autopilot ${task.slug}`)] : []

// Blocked task (reference/blockers.md): never coded or autopiloted before its blocker lands, so the first
// blocker's next step comes first, then what the blocked task still allows (grill, feedback, validate, close).
export function blockedActions(task: BoardTask, blockers: readonly string[], tasks: readonly BoardTask[]): Action[] {
  const blocker = tasks.find(one => one.slug === blockers[0])
  const first = blocker ? stepActions(blocker).slice(0, 1) : []
  return [
    ...first.map(one => action(`${one.label} ${blocker?.slug}`, one.command)),
    ...stepActions(task).filter(one => one.label !== 'code'),
  ]
}

// Draft PR → test it, then feedback or validate (a clean /wa-validate marks it ready, even when `phase` already
// says validated). Ready PR → test it, then merge: /wa-close merges on the user's yes. A ready PR whose task file
// still says `review` (marked ready by hand) goes through /wa-validate first; no phase = another work loop's PR.
function ticketStepActions(ticket: GithubTicket): Action[] {
  const { number } = ticket
  if (ticket.state === 'todo') return [action('grill', `/wa-grill ${number}`)]
  if (ticket.state === 'grilled') return [action('code', `/wa-code ${number}`)]
  if (ticket.state !== 'review') return []
  return ticket.pr?.isDraft === false && ticket.phase !== 'review'
    ? [action('merge', `/wa-close ${number}`), action('feedback', `/wa-feedback ${number} `)]
    : [action('feedback', `/wa-feedback ${number} `), action('validate', `/wa-validate ${number}`)]
}

export function ticketActions(ticket: GithubTicket): Action[] {
  if (ticket.reservedBy !== '' || ticket.claimedBy !== '' || !isOpenTicket(ticket)) return []
  return [...ticketStepActions(ticket), action('autopilot', `/wa-autopilot ${ticket.number}`)]
}

// endregion

// region View

function sections<T>(
  items: readonly T[],
  order: readonly string[],
  stateOf: (item: T) => string,
  titles: Record<string, string>,
  closedStates: readonly string[],
  toRow: (item: T) => ViewRow,
  expanded: readonly string[] = [],
): ViewSection[] {
  return order.flatMap(state => {
    const members = items.filter(item => stateOf(item) === state)
    if (members.length === 0) return []
    const isClosed = closedStates.includes(state)
    const isExpanded = isClosed && expanded.includes(state) && members.length > CLOSED_SHOWN
    const shown = isClosed && !isExpanded ? members.slice(-CLOSED_SHOWN) : members
    return [
      {
        state,
        icon: STATE_ICON[state] ?? '·',
        title: titles[state] ?? state,
        rows: shown.map(toRow),
        hidden: members.length - shown.length,
        isClosed,
        isExpanded,
      },
    ]
  })
}

export const ALL_TAB = '*'

function scoped<T extends { milestone: string }>(items: readonly T[], milestoneScopes: readonly Scope[], filter: string) {
  const tabs = milestoneScopes.map(scope => scope.name).reverse()
  const active = filter === ALL_TAB ? '' : tabs.includes(filter) ? filter : (tabs[0] ?? '')
  return {
    tabs,
    filter: active,
    shown: active ? items.filter(item => item.milestone === active) : items,
    scopes: milestoneScopes.filter(scope => !active || scope.name === active).map(scope => scope.line),
  }
}

// Open blocker = known task not done or canceled (reference/blockers.md); unknown slugs block nothing.
const openBlockersOf = (task: BoardTask, tasks: readonly BoardTask[]) =>
  isLive(task) ? task.blockedBy.filter(slug => tasks.some(one => one.slug === slug && isLive(one))) : []

const localRow = (task: BoardTask, tasks: readonly BoardTask[]): ViewRow => {
  const blockers = openBlockersOf(task, tasks)
  return {
    key: task.slug,
    size: task.size,
    title: task.title,
    tags: [
      ...(task.sprint ? [{ text: task.sprint, tone: 'sprint' as const }] : []),
      ...(!task.isGrilled && isLive(task) ? [{ text: NOT_GRILLED, tone: 'warning' as const }] : []),
      ...(blockers.length > 0 ? [{ text: `${BLOCKED} ${blockers.join(', ')}`, tone: 'warning' as const }] : []),
    ],
    summary: task.summary,
    actions: blockers.length > 0 ? blockedActions(task, blockers, tasks) : taskActions(task),
  }
}

const githubRow = (ticket: GithubTicket): ViewRow => ({
  key: String(ticket.number),
  size: ticket.size,
  title: ticket.title,
  tags: [
    { text: `#${ticket.number}`, tone: 'muted' as const },
    ...(ticket.sprint ? [{ text: ticket.sprint, tone: 'sprint' as const }] : []),
    ...(ticket.claimedBy ? [{ text: `🔒 ${ticket.claimedBy}`, tone: 'muted' as const }] : []),
    ...(ticket.reservedBy ? [{ text: `👤 @${ticket.reservedBy}`, tone: 'muted' as const }] : []),
    ...(ticket.state === 'review' && ticket.pr
      ? [
          {
            text: ticket.pr.isDraft ? `🧪 draft #${ticket.pr.number}` : `🔀 ready #${ticket.pr.number}`,
            tone: 'muted' as const,
            ...(ticket.pr.url ? { href: ticket.pr.url } : {}),
          },
        ]
      : []),
    ...(ticket.state === 'todo' ? [{ text: NOT_GRILLED, tone: 'warning' as const }] : []),
  ],
  summary: ticket.summary,
  actions: ticketActions(ticket),
})

function legendOf(parts: readonly ViewSection[]): string {
  const rows = parts.flatMap(section => section.rows)
  const sizes = Object.keys(SIZE_NAME).filter(size => rows.some(row => row.size === size))
  const hasUngrilled = rows.some(row => row.tags.some(tag => tag.text === NOT_GRILLED))
  const hasBlocked = rows.some(row => row.tags.some(tag => tag.text.startsWith(`${BLOCKED} `)))
  return [
    ...sizes.map(size => `${SIZE_ICON[size]} ${SIZE_NAME[size]}`),
    ...(hasUngrilled ? [`${NOT_GRILLED} not grilled`] : []),
    ...(hasBlocked ? [`${BLOCKED} blocked`] : []),
  ].join(' · ')
}

export function localView(
  tasks: readonly BoardTask[],
  milestones: readonly string[],
  tracks: readonly string[],
  filter = '',
  expanded: readonly string[] = [],
): View {
  const scope = scoped(tasks, milestoneScopes(tasks, milestones, tracks), filter)
  const order = scope.filter ? STATUS_ORDER : STATUS_ORDER.filter(status => status !== 'canceled')
  const parts = sections(scope.shown, order, task => task.status, LOCAL_TITLE, ['done', 'canceled'], task => localRow(task, tasks), expanded)
  return {
    sections: parts,
    legend: legendOf(parts),
    scopes: scope.scopes,
    sprints: localSprintRows(tasks, scope.filter),
    ready: scope.filter ? [] : localReleases(tasks, milestones, tracks),
    notes: [],
    milestone: newestMilestone(milestones, tracks),
    tabs: scope.tabs,
    filter: scope.filter,
  }
}

export function githubView(
  tickets: readonly GithubTicket[],
  drafts: readonly string[],
  milestones: readonly MilestoneCount[],
  tracks: readonly string[],
  filter = '',
  expanded: readonly string[] = [],
  sprints: readonly SprintParent[] = [],
): View {
  const scope = scoped(tickets, githubMilestoneScopes(tickets, milestones, tracks), filter)
  const order = scope.filter ? GITHUB_ORDER : GITHUB_ORDER.filter(state => state !== 'canceled')
  const parts = sections(scope.shown, order, ticket => ticket.state, GITHUB_TITLE, ['done', 'canceled'], ticket => githubRow(ticket), expanded)
  const releases = githubReleases(tickets, milestones, tracks)
  return {
    sections: parts,
    legend: legendOf(parts),
    scopes: scope.scopes.filter(line => !releases.some(ready => line.startsWith(`🎯 ${ready.name} — `))),
    sprints: githubSprintRows(tickets, sprints, scope.filter),
    ready: scope.filter ? [] : releases,
    notes: !scope.filter && drafts.length > 0 ? [`📝 ${drafts.length} draft${drafts.length > 1 ? 's' : ''} — convert to issue on GitHub`] : [],
    milestone: newestGithubMilestone(milestones, tracks),
    tabs: scope.tabs,
    filter: scope.filter,
  }
}

// endregion

// region Task focus

export type Worktree = { path: string; branch: string }

export function parseWorktrees(porcelain: string): Worktree[] {
  return porcelain
    .split(/\n\s*\n/)
    .flatMap(entry => {
      const path = entry.match(/^worktree (.+)$/m)?.[1]
      const branch = entry.match(/^branch refs\/heads\/(.+)$/m)?.[1]
      return path && branch ? [{ path, branch }] : []
    })
}

const GITHUB_ACTIVE: readonly GithubState[] = ['grilling', 'coding']
const hereFirst = (ids: readonly string[], here: string) => [...ids.filter(id => id === here), ...ids.filter(id => id !== here)]

export const activeLocalIds = (tasks: readonly BoardTask[], here: string) =>
  hereFirst(
    tasks.filter(task => task.status === 'in-progress').map(task => task.slug),
    here,
  )

export const activeGithubIds = (tickets: readonly GithubTicket[], here: string) =>
  hereFirst(
    tickets.filter(ticket => ticket.isMine && GITHUB_ACTIVE.includes(ticket.state)).map(ticket => `#${ticket.number}`),
    here,
  )

export function branchTaskId(branch: string, prefix: string, provider: string): string {
  if (!branch.startsWith(prefix) || branch === prefix) return ''
  const rest = branch.slice(prefix.length)
  if (provider !== 'github') return rest
  return /^\d+-/.test(rest) ? `#${rest.split('-')[0]}` : ''
}

const clean = (line: string) => line.replace(/\*\*/g, '').replace(/^\s*[-*]\s+/, '').trim()

function bodySections(text: string): Record<string, string[]> {
  const lines = text.split(/\r?\n/)
  const end = lines[0]?.trim() === '---' ? lines.findIndex((line, index) => index > 0 && line.trim() === '---') : -1
  const found: Record<string, string[]> = {}
  let current: string[] | undefined
  for (const line of uncommented(lines.slice(end + 1))) {
    const heading = line.match(/^##\s+(.+?)\s*$/)
    if (heading) {
      current = found[heading[1] ?? ''] = []
      continue
    }
    current?.push(line)
  }
  return found
}

function rounds(lines: readonly string[]): { heading: string; lines: string[] }[] {
  const found: { heading: string; lines: string[] }[] = []
  for (const line of lines) {
    const heading = line.match(/^###\s+(.+?)\s*$/)
    if (heading) found.push({ heading: heading[1] ?? '', lines: [] })
    else if (line.trim() !== '') found[found.length - 1]?.lines.push(clean(line))
  }
  return found
}

const listItems = (lines: readonly string[], pattern: RegExp) =>
  lines.flatMap(line => {
    const item = line.match(pattern)
    return item ? [clean(item[1] ?? '')] : []
  })

export function parseTaskFile(text: string): TaskFile {
  const body = bodySections(text)
  const fields = parseFields(text)
  const verification = (body.Verification ?? []).filter(line => /^\s*[-*]\s+/.test(line)).map(clean)
  return {
    phase: fields.phase ?? '',
    type: fields.type ?? '',
    criteria: listItems(body['Acceptance criteria'] ?? [], /^(?:\d+\.|[-*])\s+(?:\[[ xX]\]\s+)?(.+)$/),
    bricks: listItems(body.Implementation ?? [], /^\d+\.\s+(.+)$/),
    review: rounds(body.Review ?? []).pop() ?? { heading: '', lines: [] },
    verification,
    feedback: rounds(body.Feedback ?? []),
  }
}

export const bricksComment = (body: string) =>
  body.trimStart().startsWith('🧱') ? listItems(body.split(/\r?\n/), /^\d+\.\s+(.+)$/) : []

const focusLine = (mark: string, text: string, tone: Tone | 'plain' = 'plain'): FocusLine => ({ mark, text, tone })

function fileBlocks(file: TaskFile | null): FocusBlock[] {
  if (!file) return []
  const checks = new Map<number, string>()
  for (const entry of file.verification) {
    const check = entry.match(/^(✅|❌)\s*AC\s*(\d+)/)
    if (check) checks.set(Number(check[2]), check[1] ?? '')
  }
  const passed = file.verification.filter(entry => entry.startsWith('✅')).length
  const failed = file.verification.filter(entry => entry.startsWith('❌')).length
  const others = file.verification.filter(entry => !entry.startsWith('✅'))
  const blocks: FocusBlock[] = [
    {
      title: `Acceptance criteria (${file.criteria.length})`,
      lines: file.criteria.map((criterion, index) => {
        const mark = checks.get(index + 1) ?? '·'
        return focusLine(mark, criterion, mark === '❌' ? 'warning' : 'plain')
      }),
    },
    { title: `Bricks (${file.bricks.length})`, lines: file.bricks.map((brick, index) => focusLine(`${index + 1}.`, brick)) },
    {
      title: file.review.heading ? `Review — ${file.review.heading}` : 'Review',
      lines: file.review.lines.map(entry => focusLine('·', entry)),
    },
    {
      title: passed + failed > 0 ? `Verification ✅ ${passed} ❌ ${failed}` : 'Verification',
      lines: others.map(entry => focusLine('·', entry, entry.startsWith('❌') ? 'warning' : 'muted')),
    },
    {
      title: `Feedback (${file.feedback.length} round${file.feedback.length === 1 ? '' : 's'})`,
      lines: file.feedback.map(round => focusLine('·', `${round.heading}${round.lines[0] ? ` — ${round.lines[0]}` : ''}`)),
    },
  ]
  return blocks.filter(block => block.lines.length > 0 || (block.title.startsWith('Verification') && passed + failed > 0))
}

function sprintBlock<T>(
  sprint: string,
  members: readonly T[],
  isCurrent: (item: T) => boolean,
  describe: (item: T) => { id: string; title: string; state: string; isDone: boolean },
): FocusBlock[] {
  if (!sprint || members.length === 0) return []
  const rows = members.map(item => ({ ...describe(item), isCurrent: isCurrent(item) }))
  const done = rows.filter(row => row.isDone).length
  return [
    {
      title: `🏁 ${sprint} — ${done}/${rows.length}`,
      lines: rows.map(row =>
        focusLine(row.isCurrent ? '→' : row.isDone ? '✓' : '·', `${row.id} ${row.title} · ${withIcon(row.state)}`, row.isDone ? 'muted' : 'plain'),
      ),
    },
  ]
}

const whereLine = (focus: TaskFocus, here: string) =>
  focus.id === here ? ['📍 checked out here'] : focus.worktree ? [`🌳 ${focus.worktree}`] : []

export function localFocusView(tasks: readonly BoardTask[], focus: TaskFocus, here = ''): FocusView {
  const task = tasks.find(one => one.slug === focus.id)
  if (!task) {
    return {
      id: focus.id,
      icon: '·',
      row: null,
      facts: ['not in the backlog', ...whereLine(focus, here)],
      pr: null,
      blocks: fileBlocks(focus.file),
    }
  }
  const type = task.type || focus.file?.type
  const blockers = openBlockersOf(task, tasks)
  const facts = [
    [
      withIcon(task.status),
      task.isGrilled ? 'grilled' : 'not grilled',
      type ? `type: ${type}` : '',
      task.milestone ? `milestone ${task.milestone}` : '',
    ]
      .filter(Boolean)
      .join(' · '),
    ...(blockers.length > 0 ? [`${BLOCKED} blocked by ${blockers.join(', ')}`] : []),
    ...whereLine(focus, here),
  ]
  const members = tasks.filter(one => one.sprint !== '' && one.sprint === task.sprint)
  return {
    id: task.slug,
    icon: STATE_ICON[task.status] ?? '·',
    row: localRow(task, tasks),
    pr: null,
    facts,
    blocks: [
      ...sprintBlock(task.sprint, members, one => one.slug === task.slug, one => ({
        id: one.slug,
        title: one.title,
        state: one.status,
        isDone: !isLive(one),
      })),
      ...fileBlocks(focus.file),
    ],
  }
}

export function githubFocusView(tickets: readonly GithubTicket[], focus: TaskFocus, here = ''): FocusView {
  const ticket = tickets.find(one => `#${one.number}` === focus.id)
  if (!ticket) {
    return {
      id: focus.id,
      icon: '·',
      row: null,
      facts: ['not on the board yet', ...whereLine(focus, here)],
      pr: null,
      blocks: fileBlocks(focus.file),
    }
  }
  const phase = focus.file?.phase || ticket.phase
  const openBlockers = focus.blockedBy.filter(blocker => blocker.isOpen).map(blocker => `#${blocker.number}`)
  const facts = [
    [
      withIcon(ticket.state),
      phase ? `phase: ${phase}` : '',
      focus.file?.type ? `type: ${focus.file.type}` : '',
      ticket.milestone ? `milestone ${ticket.milestone}` : '',
    ]
      .filter(Boolean)
      .join(' · '),
    ...(openBlockers.length > 0 ? [`${BLOCKED} blocked by ${openBlockers.join(', ')}`] : []),
    ...whereLine(focus, here),
  ]
  const members = tickets.filter(one => one.sprint !== '' && one.sprint === ticket.sprint)
  return {
    id: focus.id,
    icon: STATE_ICON[ticket.state] ?? '·',
    row: githubRow(ticket),
    pr: ticket.pr && { ...ticket.pr, url: ticket.pr.url || focus.prUrl },
    facts,
    blocks: [
      ...sprintBlock(ticket.sprint, members, one => one.number === ticket.number, one => ({
        id: `#${one.number}`,
        title: one.title,
        state: one.state,
        isDone: !isOpenTicket(one),
      })),
      ...fileBlocks(focus.file),
    ],
  }
}

// endregion
