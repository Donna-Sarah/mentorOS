'use client'

const headerButtonClassName =
  'inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 font-body text-[13px] font-semibold text-[#374151] transition-colors hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CA3AF]/30 focus-visible:ring-offset-2'

interface PMPHeaderProps {
  onOpenGlossary: () => void
  onOpenEVM: () => void
}

export default function PMPHeader({ onOpenGlossary, onOpenEVM }: PMPHeaderProps) {
  return (
    <header className="sticky top-[56px] z-navbar w-full border-b border-[#F3F4F6] bg-white md:top-[64px]">
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-between px-4 py-2 md:px-6">
        <span className="font-body text-[13px] font-semibold text-[#374151]">PMP Thinking Coach</span>
        <div className="flex items-center gap-2">
          <button type="button" className={headerButtonClassName} onClick={onOpenGlossary}>
            Glossary
          </button>
          <button type="button" className={headerButtonClassName} onClick={onOpenEVM}>
            EVM
          </button>
        </div>
      </div>
    </header>
  )
}
