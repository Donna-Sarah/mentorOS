'use client'

import { useLanguage } from '@/lib/i18n'
import { QUICK_EXAMPLES } from '@/lib/askbetter/tasks'

interface QuickExamplesProps {
  onSelect: (example: string) => void
}

export function QuickExamples({ onSelect }: QuickExamplesProps): React.ReactElement {
  const { t } = useLanguage()

  return (
    <div className="mt-6">
      <p className="text-[13px] font-semibold" style={{ color: 'var(--ab-text)' }}>
        {t.askbetter.examples_label}
      </p>
      <p className="mt-1 text-[12px]" style={{ color: 'var(--ab-muted)' }}>
        {t.askbetter.examples_sub}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onSelect(example)}
            className="min-h-touch rounded-full border px-3 py-2 text-[12px] transition-colors"
            style={{
              borderColor: 'var(--ab-border)',
              backgroundColor: 'var(--ab-surface)',
              color: 'var(--ab-muted)',
            }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
