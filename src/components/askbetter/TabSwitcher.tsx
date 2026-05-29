'use client'

import { useLanguage } from '@/lib/i18n'
import type { AskBetterTab } from '@/types/askbetter'

interface TabSwitcherProps {
  activeTab: AskBetterTab
  onTabChange: (tab: AskBetterTab) => void
}

export function TabSwitcher({
  activeTab,
  onTabChange,
}: TabSwitcherProps): React.ReactElement {
  const { t } = useLanguage()

  const tabs: { id: AskBetterTab; label: string }[] = [
    { id: 'clarify', label: t.askbetter.tab_clarify },
    { id: 'library', label: t.askbetter.tab_library },
  ]

  return (
    <div
      className="mb-6 flex gap-2 rounded-[var(--ab-radius)] border p-1"
      style={{ borderColor: 'var(--ab-border)', backgroundColor: 'var(--ab-surface)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="min-h-touch flex-1 rounded-[12px] px-3 py-2.5 text-[13px] font-medium transition-all md:text-[14px]"
            style={{
              background: isActive ? 'var(--ab-grad)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--ab-muted)',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
