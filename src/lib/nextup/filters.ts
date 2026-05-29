import type {
  NextUpFilterPriority,
  NextUpFilterStatus,
  NextUpTask,
} from '@/types/nextup'

export function filterTasks(
  tasks: NextUpTask[],
  tabDone: Record<number, boolean> | undefined,
  filterStatus: NextUpFilterStatus,
  filterPriority: NextUpFilterPriority,
  searchQuery: string,
): NextUpTask[] {
  const q = searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const isDone = Boolean(tabDone?.[task.id])

    if (filterStatus === 'pending' && isDone) return false
    if (filterStatus === 'done' && !isDone) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false
    }

    if (q) {
      const haystack = [
        task.title,
        task.detail,
        task.category,
        task.time,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }

    return true
  })
}
