'use client'

import { useLanguage } from '@/lib/i18n'
import type { NextUpTask } from '@/types/nextup'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: NextUpTask[]
  tabDone: Record<number, boolean> | undefined
  onToggleDone: (taskId: number) => void
  showEmpty?: boolean
  showNoMatch?: boolean
  completedCount?: { done: number; total: number }
  generatedAt?: string
}

export function TaskList({
  tasks,
  tabDone,
  onToggleDone,
  showEmpty,
  showNoMatch,
  completedCount,
  generatedAt,
}: TaskListProps) {
  const { t } = useLanguage()

  if (showEmpty) {
    return (
      <div className="py-12 text-center">
        <p className="text-[15px]" style={{ color: 'var(--nu-text2)' }}>
          {t.nextup.empty_state}
        </p>
        <p className="mt-2 text-[13px]" style={{ color: 'var(--nu-text3)' }}>
          {t.nextup.empty_hint}
        </p>
      </div>
    )
  }

  return (
    <div className="nextup-animate-fade-in">
      {generatedAt ? (
        <p className="mb-3.5 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--nu-text3)' }}>
          {t.nextup.generated_at}: {generatedAt}
        </p>
      ) : null}

      {showNoMatch ? (
        <div className="py-8 text-center text-[13px]" style={{ color: 'var(--nu-text3)' }}>
          {t.nextup.no_match}
        </div>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            done={Boolean(tabDone?.[task.id])}
            onToggle={() => onToggleDone(task.id)}
          />
        ))
      )}

      {completedCount && completedCount.total > 0 ? (
        <p
          className="mt-3 border-t pt-3 text-center text-[12px]"
          style={{ borderColor: 'var(--nu-border)', color: 'var(--nu-text3)' }}
        >
          {t.nextup.completed_count
            .replace('{done}', String(completedCount.done))
            .replace('{total}', String(completedCount.total))}
        </p>
      ) : null}
    </div>
  )
}
