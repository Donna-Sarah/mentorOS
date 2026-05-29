'use client'

import { useLanguage } from '@/lib/i18n'

interface InputCompactProps {
  value: string
  onChange: (value: string) => void
  onReset: () => void
  onOpenLibrary: () => void
}

export function InputCompact({
  value,
  onChange,
  onReset,
  onOpenLibrary,
}: InputCompactProps): React.ReactElement {
  const { t } = useLanguage()

  return (
    <div className="mb-8 rounded-md bg-white-canvas p-4 shadow-card md:flex md:items-center md:gap-4 md:p-5">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-touch w-full rounded-md border border-soft-gray bg-[var(--ab-bg)] px-4 py-3 font-body outline-none transition-colors focus:border-[#2563EB]/40 md:flex-1"
        style={{
          fontSize: '16px',
          color: 'var(--ab-text)',
        }}
      />
      <div className="mt-3 flex shrink-0 gap-3 md:mt-0">
        <button
          type="button"
          onClick={onReset}
          className="min-h-touch flex-1 rounded-md border border-soft-gray bg-white-canvas px-4 py-2.5 font-body text-[13px] font-medium text-slate-text transition-colors hover:bg-[#FAFAFA] md:flex-none"
        >
          {t.askbetter.reset_btn}
        </button>
        <button
          type="button"
          onClick={onOpenLibrary}
          className="min-h-touch flex-1 rounded-md border border-soft-gray bg-white-canvas px-4 py-2.5 font-body text-[13px] font-medium text-slate-text transition-colors hover:bg-[#FAFAFA] md:flex-none"
        >
          {t.askbetter.library_btn}
        </button>
      </div>
    </div>
  )
}
