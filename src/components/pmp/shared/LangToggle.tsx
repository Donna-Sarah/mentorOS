'use client'

import { cn } from '@/lib/utils/cn'

interface LangToggleProps {
  isVI: boolean
  onToggle: () => void
  isLoading?: boolean
  className?: string
}

function LoadingSpinner() {
  return (
    <svg className="h-2.5 w-2.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function LangToggle({ isVI, onToggle, isLoading = false, className }: LangToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isLoading}
      className={cn(
        'inline-flex h-[26px] shrink-0 items-center overflow-hidden rounded-sm border border-[#E5E7EB] bg-white font-body text-[10px] font-semibold leading-none transition-all duration-150',
        isLoading ? 'cursor-wait opacity-60' : 'cursor-pointer',
        className,
      )}
      aria-label={isVI ? 'Chuyển sang tiếng Anh' : 'Chuyển sang tiếng Việt'}
    >
      <span
        className={cn(
          'inline-flex h-full items-center gap-0.5 px-2 transition-colors',
          !isVI
            ? 'bg-[#111111] text-white'
            : 'bg-transparent text-[#9CA3AF] hover:text-[#6B7280]',
        )}
      >
        <span className="text-[11px] leading-none" aria-hidden>
          🇬🇧
        </span>
        <span>EN</span>
      </span>

      <span className="w-px self-stretch bg-[#E5E7EB]" aria-hidden />

      <span
        className={cn(
          'inline-flex h-full items-center gap-0.5 px-2 transition-colors',
          isVI
            ? 'bg-[#111111] text-white'
            : 'bg-transparent text-[#9CA3AF] hover:text-[#6B7280]',
        )}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <span className="text-[11px] leading-none" aria-hidden>
            🇻🇳
          </span>
        )}
        <span>VI</span>
      </span>
    </button>
  )
}
