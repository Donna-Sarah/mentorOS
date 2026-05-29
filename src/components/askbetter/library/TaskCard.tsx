'use client'

import { useLanguage } from '@/lib/i18n'
import type { AskBetterTask } from '@/types/askbetter'

const CAT_STYLES: Record<
  AskBetterTask['cat'],
  { accent: string; surface: string }
> = {
  write: { accent: '#2563EB', surface: '#EFF6FF' },
  analyze: { accent: '#7C3AED', surface: '#F5F3FF' },
  comms: { accent: '#0891B2', surface: '#ECFEFF' },
  plan: { accent: '#059669', surface: '#ECFDF5' },
  learn: { accent: '#D97706', surface: '#FFFBEB' },
}

interface TaskCardProps {
  task: AskBetterTask
  categoryLabel: string
  onTry: (example: string) => void
}

export function TaskCard({
  task,
  categoryLabel,
  onTry,
}: TaskCardProps): React.ReactElement {
  const { t } = useLanguage()
  const catStyle = CAT_STYLES[task.cat]

  return (
    <article className="flex h-full flex-col rounded-md bg-white-canvas p-6 shadow-card transition-shadow duration-200 hover:shadow-modal md:p-7">
      <div className="flex flex-1 flex-col">
        <span
          className="mb-5 inline-flex w-fit items-center rounded-sm px-2.5 py-1 font-body text-[11px] font-semibold tracking-wide"
          style={{
            color: catStyle.accent,
            backgroundColor: catStyle.surface,
          }}
        >
          {categoryLabel}
        </span>

        <h3 className="askbetter-heading mb-3 text-[17px] font-bold leading-snug tracking-[-0.01em] text-midnight-ink">
          {task.title}
        </h3>

        <p className="flex-1 font-body text-body-sm leading-[1.65] text-slate-text">
          {task.desc}
        </p>
      </div>

      <div className="mt-6 border-t border-soft-gray pt-5">
        <button
          type="button"
          onClick={() => onTry(task.example)}
          className="flex min-h-touch w-full items-center justify-center rounded-md px-5 py-3 font-body text-[13px] font-semibold text-white-canvas transition-opacity hover:opacity-90"
          style={{ background: 'var(--ab-grad)' }}
        >
          {t.askbetter.try_with}
        </button>
      </div>
    </article>
  )
}
