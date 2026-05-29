'use client'

import { useLanguage } from '@/lib/i18n'
import type { NextUpTab } from '@/types/nextup'

interface TabBarProps {
  activeTab: NextUpTab
  disabled?: boolean
  onTabChange: (tab: NextUpTab) => void
}

const TABS: { id: NextUpTab; icon: string }[] = [
  { id: 'today', icon: '☀' },
  { id: 'tom', icon: '☽' },
  { id: 'week', icon: '📅' },
]

export function TabBar({ activeTab, disabled = false, onTabChange }: TabBarProps) {
  const { t } = useLanguage()

  const labels: Record<NextUpTab, string> = {
    today: t.nextup.tab_today,
    tom: t.nextup.tab_tomorrow,
    week: t.nextup.tab_week,
  }

  return (
    <div
      className="mb-4 grid grid-cols-3 gap-1.5"
      style={
        disabled
          ? { pointerEvents: 'none', opacity: 0.4 }
          : undefined
      }
    >
      {TABS.map(({ id, icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onTabChange(id)}
            className="flex min-h-touch items-center justify-center gap-1.5 rounded-[var(--nu-radius-sm)] border px-2 py-2.5 text-[13px] transition-all"
            style={{
              borderColor: isActive
                ? 'rgba(201, 168, 76, 0.3)'
                : 'var(--nu-border)',
              backgroundColor: isActive ? 'var(--nu-gold-dim)' : 'transparent',
              color: isActive ? 'var(--nu-gold)' : 'var(--nu-text3)',
              fontWeight: isActive ? 500 : 400,
            }}
          >
            <span aria-hidden>{icon}</span>
            {labels[id]}
          </button>
        )
      })}
    </div>
  )
}
