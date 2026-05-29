'use client'

import { cn } from '@/lib/utils/cn'
import { GLOSSARY_PAIR_COUNT, GLOSSARY_TERM_COUNT } from '@/components/pmp/shared/glossaryTerms'

interface PMPSidebarProps {
  activeItem: 'mood1' | 'mood2' | 'upload' | 'glossary' | 'evm' | null
  onSelectMood1: () => void
  onSelectMood2: () => void
  onScrollToUpload: () => void
  onOpenGlossary: () => void
  onOpenEVM: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 12L6 8l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M8 12L3 7l5-5M3 7h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface NavItemProps {
  icon: string
  label: string
  subLabel: string
  isActive: boolean
  isCollapsed: boolean
  title: string
  onClick?: () => void
  disabled?: boolean
}

function NavItem({
  icon,
  label,
  subLabel,
  isActive,
  isCollapsed,
  title,
  onClick,
  disabled = false,
}: NavItemProps) {
  const content = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-base" aria-hidden>
        {icon}
      </span>
      <span
        className={cn(
          'min-w-0 transition-all duration-200',
          isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100',
        )}
      >
        <span className="block font-body text-[13px] font-semibold leading-tight">{label}</span>
        <span className="block font-body text-[11px] text-[#9CA3AF]">{subLabel}</span>
      </span>
    </>
  )

  const className = cn(
    'flex w-full min-h-[40px] items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
    disabled
      ? 'cursor-default opacity-50'
      : isActive
        ? 'bg-[#F5F3FF] text-[#7C3AED]'
        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]',
  )

  if (disabled) {
    return (
      <div className={className} title={isCollapsed ? title : undefined}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      title={isCollapsed ? title : undefined}
      onClick={onClick}
    >
      {content}
    </button>
  )
}

export default function PMPSidebar({
  activeItem,
  onSelectMood1,
  onSelectMood2,
  onScrollToUpload,
  onOpenGlossary,
  onOpenEVM,
  isCollapsed,
  onToggleCollapse,
}: PMPSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[#F3F4F6] bg-white transition-all duration-200',
        isCollapsed ? 'w-[56px]' : 'w-[220px]',
      )}
    >
      <div
        className={cn(
          'flex items-center border-b border-[#F3F4F6] px-4 py-5',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!isCollapsed ? (
          <span className="font-body text-[13px] font-bold text-[#374151]">PMP Thinking Coach</span>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F9FAFB] hover:text-[#374151]"
          aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-hidden px-2 py-4">
        <NavItem
          icon="🧠"
          label="Mood 1"
          subLabel="Thinking Analysis"
          isActive={activeItem === 'mood1'}
          isCollapsed={isCollapsed}
          title="Mood 1 — Thinking Analysis"
          onClick={onSelectMood1}
        />
        <NavItem
          icon="🔍"
          label="Mood 2"
          subLabel="Reading Decode"
          isActive={activeItem === 'mood2'}
          isCollapsed={isCollapsed}
          title="Mood 2 — Reading Decode"
          onClick={onSelectMood2}
        />
        <NavItem
          icon="📤"
          label="Tải đề lên"
          subLabel="Dán đề hoặc upload ảnh"
          isActive={activeItem === 'upload'}
          isCollapsed={isCollapsed}
          title="Tải đề lên — Dán đề hoặc upload ảnh"
          onClick={onScrollToUpload}
        />

        <div className="mx-3 my-2 border-t border-[#F3F4F6]" aria-hidden />

        <NavItem
          icon="📖"
          label="Glossary"
          subLabel={`${GLOSSARY_TERM_COUNT} thuật ngữ · ${GLOSSARY_PAIR_COUNT} cặp`}
          isActive={activeItem === 'glossary'}
          isCollapsed={isCollapsed}
          title={`Glossary — ${GLOSSARY_TERM_COUNT} thuật ngữ · ${GLOSSARY_PAIR_COUNT} cặp`}
          onClick={onOpenGlossary}
        />
        <NavItem
          icon="📊"
          label="EVM"
          subLabel="Calculator"
          isActive={activeItem === 'evm'}
          isCollapsed={isCollapsed}
          title="EVM — Calculator"
          onClick={onOpenEVM}
        />

        <div className="mx-3 my-2 border-t border-[#F3F4F6]" aria-hidden />

        <NavItem
          icon="📋"
          label="Lịch sử"
          subLabel="Sắp ra mắt"
          isActive={false}
          isCollapsed={isCollapsed}
          title="Lịch sử — Sắp ra mắt"
          disabled
        />
        <NavItem
          icon="📈"
          label="Phân tích"
          subLabel="Sắp ra mắt"
          isActive={false}
          isCollapsed={isCollapsed}
          title="Phân tích — Sắp ra mắt"
          disabled
        />
      </nav>

      <div className="mt-auto border-t border-[#F3F4F6] px-2 pb-4 pt-3">
        <button
          type="button"
          onClick={() => {
            window.location.href = '/'
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[#9CA3AF] transition-colors hover:bg-[#F9FAFB] hover:text-[#374151]"
          title={isCollapsed ? 'mentorOS' : undefined}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <BackIcon />
          </span>
          <span
            className={cn(
              'font-body text-[13px] font-semibold transition-all duration-200',
              isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'opacity-100',
            )}
          >
            mentorOS
          </span>
        </button>
      </div>
    </aside>
  )
}
