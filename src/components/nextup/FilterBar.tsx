'use client'

import { useLanguage } from '@/lib/i18n'
import type {
  NextUpFilterPriority,
  NextUpFilterStatus,
} from '@/types/nextup'

interface FilterBarProps {
  filterStatus: NextUpFilterStatus
  filterPriority: NextUpFilterPriority
  searchQuery: string
  onFilterStatusChange: (status: NextUpFilterStatus) => void
  onFilterPriorityChange: (priority: NextUpFilterPriority) => void
  onSearchChange: (query: string) => void
  onExport: () => void
}

function Chip({
  active,
  activeVariant,
  onClick,
  children,
}: {
  active: boolean
  activeVariant?: 'gold' | 'high' | 'medium' | 'low'
  onClick: () => void
  children: React.ReactNode
}) {
  let activeStyle: React.CSSProperties = {}
  if (active) {
    if (activeVariant === 'high') {
      activeStyle = {
        backgroundColor: 'var(--nu-red-bg)',
        borderColor: 'rgba(224, 82, 82, 0.3)',
        color: 'var(--nu-red)',
      }
    } else if (activeVariant === 'medium') {
      activeStyle = {
        backgroundColor: 'var(--nu-amber-bg)',
        borderColor: 'rgba(232, 162, 58, 0.3)',
        color: 'var(--nu-amber)',
      }
    } else if (activeVariant === 'low') {
      activeStyle = {
        backgroundColor: 'var(--nu-green-bg)',
        borderColor: 'rgba(76, 175, 125, 0.3)',
        color: 'var(--nu-green)',
      }
    } else {
      activeStyle = {
        backgroundColor: 'var(--nu-gold-dim)',
        borderColor: 'rgba(201, 168, 76, 0.3)',
        color: 'var(--nu-gold)',
      }
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[32px] whitespace-nowrap rounded-full border px-3 py-1 text-[12px] transition-all"
      style={{
        borderColor: active ? activeStyle.borderColor : 'var(--nu-border)',
        backgroundColor: active ? activeStyle.backgroundColor : 'transparent',
        color: active ? activeStyle.color : 'var(--nu-text3)',
      }}
    >
      {children}
    </button>
  )
}

export function FilterBar({
  filterStatus,
  filterPriority,
  searchQuery,
  onFilterStatusChange,
  onFilterPriorityChange,
  onSearchChange,
  onExport,
}: FilterBarProps) {
  const { t } = useLanguage()

  return (
    <div
      className="nextup-animate-fade-in mb-4 flex flex-wrap items-center gap-1.5 rounded-[10px] border p-2.5 md:px-3.5"
      style={{ borderColor: 'var(--nu-border)', backgroundColor: 'var(--nu-bg1)' }}
    >
      <Chip
        active={filterStatus === 'all'}
        onClick={() => onFilterStatusChange('all')}
      >
        {t.nextup.filter_all}
      </Chip>
      <Chip
        active={filterStatus === 'pending'}
        onClick={() => onFilterStatusChange('pending')}
      >
        {t.nextup.filter_pending}
      </Chip>
      <Chip
        active={filterStatus === 'done'}
        onClick={() => onFilterStatusChange('done')}
      >
        {t.nextup.filter_done}
      </Chip>

      <span
        className="mx-0.5 h-4 w-px shrink-0"
        style={{ backgroundColor: 'var(--nu-border2)' }}
        aria-hidden
      />

      <Chip
        active={filterPriority === 'all'}
        onClick={() => onFilterPriorityChange('all')}
      >
        {t.nextup.filter_priority_all}
      </Chip>
      <Chip
        active={filterPriority === 'high'}
        activeVariant="high"
        onClick={() => onFilterPriorityChange('high')}
      >
        {t.nextup.filter_high}
      </Chip>
      <Chip
        active={filterPriority === 'medium'}
        activeVariant="medium"
        onClick={() => onFilterPriorityChange('medium')}
      >
        {t.nextup.filter_medium}
      </Chip>
      <Chip
        active={filterPriority === 'low'}
        activeVariant="low"
        onClick={() => onFilterPriorityChange('low')}
      >
        {t.nextup.filter_low}
      </Chip>

      <span
        className="mx-0.5 hidden h-4 w-px shrink-0 sm:block"
        style={{ backgroundColor: 'var(--nu-border2)' }}
        aria-hidden
      />

      <input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t.nextup.search_placeholder}
        className="min-h-[32px] min-w-[100px] flex-1 rounded-full border px-2.5 text-[12px] outline-none"
        style={{
          fontSize: '16px',
          borderColor: 'var(--nu-border)',
          backgroundColor: 'var(--nu-bg2)',
          color: 'var(--nu-text)',
        }}
      />

      <button
        type="button"
        onClick={onExport}
        className="min-h-touch shrink-0 rounded-[var(--nu-radius-sm)] border px-3 py-1 text-[12px] transition-all"
        style={{
          borderColor: 'var(--nu-border2)',
          backgroundColor: 'var(--nu-bg2)',
          color: 'var(--nu-text2)',
        }}
      >
        ↓ {t.nextup.export_btn}
      </button>
    </div>
  )
}
