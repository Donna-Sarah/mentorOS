export interface NextUpLog {
  t: string
  tm: string
}

export interface NextUpStructItem {
  l: string
  v: string
}

export interface NextUpStructGroup {
  g: string
  icon: string
  items: NextUpStructItem[]
}

export type NextUpTab = 'today' | 'tom' | 'week'

export type NextUpPriority = 'high' | 'medium' | 'low'

export type NextUpFilterStatus = 'all' | 'pending' | 'done'

export type NextUpFilterPriority = 'all' | 'high' | 'medium' | 'low'

export interface NextUpTask {
  id: number
  title: string
  detail?: string
  priority: NextUpPriority
  category?: string
  time?: string
}

export interface NextUpWeekDay {
  date: string
  tasks: NextUpTask[]
}

export interface NextUpGenResult {
  data: { tasks?: NextUpTask[]; days?: NextUpWeekDay[] }
  at: string
}

export interface NextUpState {
  plan: string
  struct: NextUpStructGroup[] | null
  logs: Record<string, NextUpLog[]>
  gen: Partial<Record<NextUpTab, NextUpGenResult>>
  done: Partial<Record<NextUpTab, Record<number, boolean>>>
  tab: NextUpTab
  loading: boolean
  planMode: 'text' | 'upload'
  filterStatus: NextUpFilterStatus
  filterPriority: NextUpFilterPriority
  searchQuery: string
}

export const NEXTUP_STORAGE_KEYS = {
  plan: 'nu_plan',
  struct: 'nu_struct',
  logs: 'nu_logs',
  gen: 'nu_gen',
  done: 'nu_done',
} as const

export const DEFAULT_NEXTUP_STATE: NextUpState = {
  plan: '',
  struct: null,
  logs: {},
  gen: {},
  done: {},
  tab: 'today',
  loading: false,
  planMode: 'text',
  filterStatus: 'all',
  filterPriority: 'all',
  searchQuery: '',
}

/** AI parse-plan response shape */
export interface NextUpParsePlanResponse {
  groups: {
    name: string
    icon?: string
    items: { label?: string; value?: string }[]
  }[]
}

/** AI generate response shapes */
export interface NextUpGenerateTasksResponse {
  tasks: NextUpTask[]
}

export interface NextUpGenerateWeekResponse {
  days: NextUpWeekDay[]
}
