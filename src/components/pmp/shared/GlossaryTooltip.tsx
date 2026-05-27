'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  getOrderedDetailHalves,
  getOtherPairTerm,
  glossaryEntries,
} from './glossaryTerms'

interface GlossaryTooltipProps {
  term: string
  entryIndex: number
  onClose: () => void
  onViewFull: (index: number) => void
}

export default function GlossaryTooltip({
  term,
  entryIndex,
  onClose,
  onViewFull,
}: GlossaryTooltipProps) {
  const entry = glossaryEntries[entryIndex]
  if (!entry) return null

  const otherTerm = getOtherPairTerm(entry, term)
  const detailHalves = getOrderedDetailHalves(entry, term)

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-overlay cursor-default bg-transparent"
        aria-label="Đóng glossary"
        onClick={onClose}
      />
      <div
        className="fixed bottom-24 left-1/2 z-modal mx-auto w-[calc(100%-32px)] max-w-[340px] -translate-x-1/2 animate-fade-up rounded-md bg-white-canvas p-4 shadow-modal"
        role="dialog"
        aria-labelledby="glossary-tooltip-title"
      >
        <div className="flex items-start justify-between gap-2">
          <h3
            id="glossary-tooltip-title"
            className="font-display text-heading-sm font-bold text-midnight-ink"
          >
            {term}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-md text-midnight-ink transition-colors hover:bg-soft-gray/60"
            aria-label="Đóng"
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
        </div>

        {otherTerm && (
          <Badge variant="default" className="mt-1">
            vs {otherTerm}
          </Badge>
        )}

        <p className="mt-3 font-body text-body-sm font-semibold text-midnight-ink">
          {entry.diff}
        </p>

        <div className="mt-2 space-y-2">
          {detailHalves.map((half, index) => (
            <p key={index} className="font-body text-body-sm text-slate-text">
              {half}
            </p>
          ))}
        </div>

        <p className="mt-2 rounded-md bg-amber-glow p-3 font-body text-body-sm text-slate-text italic">
          {entry.example}
        </p>

        <div className="mt-2 flex items-start gap-2">
          <svg
            className="mt-0.5 shrink-0"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 2L14.5 13H1.5L8 2Z"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M8 6.5V9"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="11" r="0.75" fill="#F59E0B" />
          </svg>
          <p className="font-body text-body-sm text-slate-text">{entry.trap}</p>
        </div>

        <div className="mt-4 flex justify-end border-t border-soft-gray pt-3">
          <Button variant="ghost" size="sm" onClick={() => onViewFull(entryIndex)}>
            Xem đầy đủ trong Glossary →
          </Button>
        </div>
      </div>
    </>
  )
}
