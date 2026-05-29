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
    <>
      <div
        className="fixed inset-0 z-modal bg-obsidian/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-modal flex items-stretch md:items-start md:justify-center md:p-8">
        <div
          className="relative flex h-full w-full flex-col overflow-hidden bg-white-canvas pointer-events-auto md:h-[calc(100vh-64px)] md:max-w-[720px] md:rounded-md md:shadow-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="glossary-panel-title"
        >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-soft-gray bg-white-canvas px-5 py-5 md:px-8">
        <h2 id="glossary-panel-title" className="font-display text-[24px] font-bold tracking-[-0.02em] text-midnight-ink md:text-[26px]">
          📖 Glossary
        </h2>
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

      <div className="border-b border-soft-gray px-5 py-4 md:px-8">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm thuật ngữ... (Risk, QA, EVM...)"
          className="w-full rounded-md border border-soft-gray bg-white-canvas p-4 font-body text-[15px] text-midnight-ink transition-colors focus:border-pmp-primary focus:outline-none"
          style={{ fontSize: '16px' }}
        />
      </div>

      <p className="px-5 py-3 font-body text-[13px] text-ash-text md:px-8">
        {filtered.length} thuật ngữ
      </p>

      <div className="scroll-container flex-1 space-y-3 overflow-y-auto px-5 pb-10 md:px-8">
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
                'overflow-hidden rounded-md border bg-white-canvas',
                expanded ? 'border-pmp-primary/30 shadow-card' : 'border-soft-gray',
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(expanded ? null : originalIndex)}
                className="flex min-h-[52px] w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-pmp-surface/20"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-[16px] font-bold text-midnight-ink">
                        {entry.pair[0]}
                      </span>
                      <span className="mx-1 font-body text-[12px] text-ash-text">vs</span>
                      <span className="font-body text-[16px] font-bold text-midnight-ink">
                        {entry.pair[1]}
                      </span>
                    </div>
                    <p className="mt-1 font-body text-[14px] leading-[1.55] text-slate-text">
                      {entry.diff}
                    </p>
                  </div>
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
                <div className="space-y-5 border-t border-soft-gray px-5 pb-6 pt-5 md:px-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-md bg-pmp-surface/60 p-4">
                      <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-widest text-pmp-primary">
                        {entry.pair[0]}
                      </div>
                      <p className="font-body text-[15px] leading-[1.7] text-midnight-ink">{firstHalf}</p>
                    </div>
                    <div className="rounded-md bg-soft-gray/30 p-4">
                      <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-widest text-slate-text">
                        {entry.pair[1]}
                      </div>
                      <p className="font-body text-[15px] leading-[1.7] text-midnight-ink">{secondHalf}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-md bg-amber-glow p-4">
                    <WarningIcon />
                    <p className="font-body text-[14px] leading-[1.65] text-slate-text">{entry.trap}</p>
                  </div>

                  <p className="rounded-md border border-soft-gray bg-white-canvas p-4 font-body text-[14px] leading-[1.65] text-slate-text italic">
                    {entry.example}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
        </div>
      </div>
    </>
  )
}
