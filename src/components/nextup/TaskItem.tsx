'use client'

import { useLanguage } from '@/lib/i18n'
import type { NextUpPriority, NextUpTask } from '@/types/nextup'

interface TaskItemProps {
  task: NextUpTask
  done: boolean
  onToggle: () => void
}

function priorityLabel(
  priority: NextUpPriority,
  t: ReturnType<typeof useLanguage>['t'],
): string {
  if (priority === 'high') return t.nextup.priority_high
  if (priority === 'medium') return t.nextup.priority_medium
  return t.nextup.priority_low
}

function priorityClass(priority: NextUpPriority): string {
  if (priority === 'high') return 'nu-priority-high'
  if (priority === 'medium') return 'nu-priority-medium'
  return 'nu-priority-low'
}

export function TaskItem({ task, done, onToggle }: TaskItemProps) {
  const { t } = useLanguage()

  return (
    <button
      type="button"
      onClick={onToggle}
      className="mb-2 flex w-full items-start gap-3.5 rounded-[var(--nu-radius)] border p-4 text-left transition-all"
      style={{
        opacity: done ? 0.38 : 1,
        borderColor: 'var(--nu-border)',
        backgroundColor: 'var(--nu-bg1)',
      }}
    >
      <span
        className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border text-[14px]"
        style={{
          borderColor: done ? 'var(--nu-green)' : 'var(--nu-border2)',
          backgroundColor: done ? 'var(--nu-green)' : 'transparent',
          color: done ? '#fff' : 'transparent',
        }}
        aria-hidden
      >
        {done ? '✓' : ''}
      </span>

      <span className="min-w-0 flex-1">
        <span className="mb-1.5 flex flex-wrap items-center gap-2">
          <span
            className="text-[14px] font-medium"
            style={{
              color: 'var(--nu-text)',
              textDecoration: done ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${priorityClass(task.priority)}`}
          >
            {priorityLabel(task.priority, t)}
          </span>
          {task.category ? (
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{
                borderColor: 'var(--nu-border)',
                backgroundColor: 'var(--nu-bg3)',
                color: 'var(--nu-text3)',
              }}
            >
              {task.category}
            </span>
          ) : null}
        </span>

        {task.detail ? (
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--nu-text3)' }}>
            {task.detail}
          </p>
        ) : null}

        {task.time ? (
          <p className="mt-1 text-[11px]" style={{ color: 'var(--nu-text3)' }}>
            ⏱ {task.time}
          </p>
        ) : null}
      </span>
    </button>
  )
}
