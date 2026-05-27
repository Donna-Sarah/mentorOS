'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { GlossaryEntry } from '@/types/pmp'
import { cn } from '@/lib/utils/cn'
import glossaryData from '../../../public/data/glossary.json'

interface GlossaryPanelProps {
  onClose: () => void
  scrollToIndex?: number | null
}

const glossaryEntries = glossaryData as GlossaryEntry[]

function WarningIcon() {
  return (
    <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2L14.5 13H1.5L8 2Z"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6.5V9" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="#F59E0B" />
    </svg>
  )
}

export default function GlossaryPanel({ onClose, scrollToIndex = null }: GlossaryPanelProps) {
  const [search, setSearch] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const entryRefs = useRef<(HTMLDivElement | null)[]>([])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return glossaryEntries
      .map((entry, originalIndex) => ({ entry, originalIndex }))
      .filter(({ entry }) => {
        if (search === '') return true
        return (
          entry.pair.some((t) => t.toLowerCase().includes(query)) ||
          entry.diff.toLowerCase().includes(query)
        )
      })
  }, [search])

  useEffect(() => {
    if (scrollToIndex == null) return
    setExpandedIndex(scrollToIndex)
    const timer = setTimeout(() => {
      entryRefs.current[scrollToIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => clearTimeout(timer)
  }, [scrollToIndex])

  return (
    <div className="fixed inset-0 z-modal flex flex-col bg-white-canvas">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-soft-gray bg-white-canvas px-4 py-3">
        <h2 className="font-display text-heading-sm font-bold text-midnight-ink">📖 Glossary</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-md text-slate-text transition-colors hover:bg-soft-gray/60 hover:text-midnight-ink"
          aria-label="Đóng glossary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 3L13 13M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="border-b border-soft-gray px-4 py-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm thuật ngữ... (Risk, QA, EVM...)"
          className="w-full rounded-md border border-soft-gray bg-white-canvas p-3 font-body text-body-sm text-midnight-ink transition-colors focus:border-pmp-primary focus:outline-none"
          style={{ fontSize: '16px' }}
        />
      </div>

      <p className="px-4 py-2 font-body text-caption text-ash-text">{filtered.length} thuật ngữ</p>

      <div className="scroll-container flex-1 space-y-2 overflow-y-auto px-4 pb-8">
        {filtered.map(({ entry, originalIndex }) => {
          const expanded = expandedIndex === originalIndex
          const detailHalves = entry.detail.split('\n\n').filter(Boolean)
          const [firstHalf = entry.detail, secondHalf = ''] = detailHalves

          return (
            <div
              key={originalIndex}
              ref={(el) => {
                entryRefs.current[originalIndex] = el
              }}
              className={cn(
                'overflow-hidden rounded-md border border-soft-gray',
                expanded && 'shadow-card',
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(expanded ? null : originalIndex)}
                className="flex min-h-touch w-full items-center justify-between p-4 text-left transition-colors hover:bg-pmp-surface/30"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-body text-body-sm font-bold text-midnight-ink">
                      {entry.pair[0]}
                    </span>
                    <span className="font-body text-caption text-ash-text">vs</span>
                    <span className="font-body text-body-sm font-bold text-midnight-ink">
                      {entry.pair[1]}
                    </span>
                  </div>
                  <p className="mt-0.5 font-body text-caption text-slate-text">{entry.diff}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={cn('shrink-0 transition-transform', expanded && 'rotate-180')}
                  aria-hidden
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {expanded && (
                <div className="space-y-3 border-t border-soft-gray px-4 pb-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-md bg-pmp-surface/50 p-3">
                      <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-pmp-primary">
                        {entry.pair[0]}
                      </div>
                      <p className="font-body text-body-sm text-midnight-ink">{firstHalf}</p>
                    </div>
                    <div className="rounded-md bg-soft-gray/20 p-3">
                      <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-pmp-primary">
                        {entry.pair[1]}
                      </div>
                      <p className="font-body text-body-sm text-midnight-ink">{secondHalf}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-md bg-amber-glow p-3">
                    <WarningIcon />
                    <p className="font-body text-body-sm text-slate-text">{entry.trap}</p>
                  </div>

                  <p className="rounded-md border border-soft-gray bg-white-canvas p-3 font-body text-body-sm text-slate-text italic">
                    {entry.example}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
