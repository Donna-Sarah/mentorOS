'use client'

import { useLanguage } from '@/lib/i18n'
import { formatDate } from '@/lib/nextup/dates'
import type { NextUpPriority, NextUpWeekDay } from '@/types/nextup'

interface WeekViewProps {
  days: NextUpWeekDay[]
  generatedAt?: string
}

function dotClass(priority: NextUpPriority): string {
  if (priority === 'high') return 'nu-week-dot-high'
  if (priority === 'medium') return 'nu-week-dot-medium'
  return 'nu-week-dot-low'
}

export function WeekView({ days, generatedAt }: WeekViewProps) {
  const { t } = useLanguage()

  if (!days.length) return null

  return (
    <div className="nextup-animate-fade-in">
      {generatedAt ? (
        <p className="mb-3.5 text-[11px]" style={{ color: 'var(--nu-text3)' }}>
          {t.nextup.generated_at}: {generatedAt}
        </p>
      ) : null}

      {days.map((day) => (
        <div
          key={day.date}
          className="mb-2.5 overflow-hidden rounded-[var(--nu-radius)] border"
          style={{ borderColor: 'var(--nu-border)', backgroundColor: 'var(--nu-bg1)' }}
        >
          <div
            className="border-b px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              borderColor: 'var(--nu-border)',
              backgroundColor: 'var(--nu-bg2)',
              color: 'var(--nu-text3)',
            }}
          >
            {formatDate(day.date)}
          </div>
          {day.tasks.map((task) => (
            <div
              key={`${day.date}-${task.id}`}
              className="flex items-center gap-2.5 border-b px-4 py-2 text-[13px] last:border-b-0"
              style={{
                borderColor: 'rgba(255,255,255,0.04)',
                color: 'var(--nu-text2)',
              }}
            >
              <span
                className={`h-[5px] w-[5px] shrink-0 rounded-full ${dotClass(task.priority)}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">{task.title}</span>
              {task.category ? (
                <span className="text-[11px]" style={{ color: 'var(--nu-text3)' }}>
                  {task.category}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
