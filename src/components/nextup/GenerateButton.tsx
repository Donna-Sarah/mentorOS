'use client'

import { useLanguage } from '@/lib/i18n'
import type { NextUpTab } from '@/types/nextup'

interface GenerateButtonProps {
  tab: NextUpTab
  loading: boolean
  disabled?: boolean
  onGenerate: () => void
}

export function GenerateButton({
  tab,
  loading,
  disabled = false,
  onGenerate,
}: GenerateButtonProps) {
  const { t } = useLanguage()

  const labelByTab: Record<NextUpTab, string> = {
    today: t.nextup.generate_today,
    tom: t.nextup.generate_tomorrow,
    week: t.nextup.generate_week,
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onGenerate}
      className="mb-4 flex w-full min-h-touch items-center justify-center gap-2 rounded-[var(--nu-radius)] border-none px-4 py-3.5 text-[14px] font-semibold tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, var(--nu-gold), #b8923e)',
        color: 'var(--nu-bg)',
        boxShadow: '0 4px 24px rgba(201, 168, 76, 0.2)',
      }}
    >
      <span className={loading ? 'nextup-spin' : ''} aria-hidden>
        {loading ? '◌' : '✦'}
      </span>
      <span>{loading ? t.nextup.generating : labelByTab[tab]}</span>
    </button>
  )
}
