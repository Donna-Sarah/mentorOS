'use client'

import { Button } from '@/components/ui/Button'

interface PMPHeaderProps {
  onOpenGlossary: () => void
  onOpenEVM: () => void
}

export default function PMPHeader({ onOpenGlossary, onOpenEVM }: PMPHeaderProps) {
  return (
    <header className="sticky top-[56px] z-navbar w-full border-b border-soft-gray bg-white-canvas md:top-[64px]">
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-between px-4 py-2 md:px-6">
        <span className="font-body text-body-sm font-bold text-midnight-ink">⚡ PMP Thinking Coach</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenGlossary}>
            📖 Glossary
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenEVM}>
            📊 EVM
          </Button>
        </div>
      </div>
    </header>
  )
}
