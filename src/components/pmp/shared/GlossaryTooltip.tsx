'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
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
  anchorRect?: DOMRect | null
}

const TOOLTIP_WIDTH = 320
const TOOLTIP_MAX_HEIGHT = 400
const MARGIN = 12

function computeTooltipPosition(anchorRect: DOMRect | null | undefined): {
  top: number
  left: number
  width: number
  centered: boolean
} {
  if (!anchorRect || typeof window === 'undefined') {
    return { top: 0, left: 0, width: TOOLTIP_WIDTH, centered: true }
  }

  const viewportW = window.innerWidth
  const viewportH = window.innerHeight
  const width = Math.min(TOOLTIP_WIDTH, viewportW - MARGIN * 2)

  let top = anchorRect.bottom + MARGIN
  let left = anchorRect.left

  if (left + width > viewportW - MARGIN) {
    left = viewportW - width - MARGIN
  }

  if (top + TOOLTIP_MAX_HEIGHT > viewportH - MARGIN) {
    top = anchorRect.top - TOOLTIP_MAX_HEIGHT - MARGIN
  }

  top = Math.max(MARGIN, top)
  left = Math.max(MARGIN, left)

  if (top + TOOLTIP_MAX_HEIGHT > viewportH - MARGIN) {
    top = Math.max(MARGIN, viewportH - TOOLTIP_MAX_HEIGHT - MARGIN)
  }

  return { top, left, width, centered: false }
}

function TrapIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0"
      width="15"
      height="15"
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
      <path d="M8 6.5V9" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="#F59E0B" />
    </svg>
  )
}

export default function GlossaryTooltip({
  term,
  entryIndex,
  onClose,
  onViewFull,
  anchorRect = null,
}: GlossaryTooltipProps) {
  const [expanded, setExpanded] = useState(false)
  const entry = glossaryEntries[entryIndex]

  const position = useMemo(() => computeTooltipPosition(anchorRect), [anchorRect])

  useEffect(() => {
    setExpanded(false)
  }, [term, entryIndex])

  if (!entry) return null

  const otherTerm = getOtherPairTerm(entry, term)
  const detailHalves = getOrderedDetailHalves(entry, term)
  const clickedDefinition = detailHalves[0] ?? entry.detail
  const otherDefinition = detailHalves[1] ?? null

  function handleClose() {
    setExpanded(false)
    onClose()
  }

  const panelClassName = cn(
    'fixed z-modal animate-fade-up rounded-md border border-[#F3F4F6] bg-white p-5 shadow-modal',
    position.centered
      ? 'top-1/2 left-1/2 w-[320px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2'
      : 'max-h-[400px] overflow-y-auto',
  )

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-overlay cursor-default bg-transparent"
        aria-label="Đóng glossary"
        onClick={handleClose}
      />
      <div
        className={panelClassName}
        style={
          position.centered
            ? undefined
            : { top: position.top, left: position.left, width: position.width }
        }
        role="dialog"
        aria-labelledby="glossary-tooltip-title"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              id="glossary-tooltip-title"
              className="font-display text-[17px] font-bold leading-tight tracking-[-0.02em] text-[#111111]"
            >
              {term}
            </h3>
            {otherTerm ? (
              <p className="mt-1 font-body text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                vs {otherTerm}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]"
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

        <p className="mt-3 font-body text-[13px] font-semibold leading-snug text-[#374151]">{entry.diff}</p>

        <div className="mt-3 border-t border-[#F3F4F6] pt-3">
          <p className="font-body text-[14px] leading-[1.65] text-[#666666]">{clickedDefinition}</p>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            {otherDefinition ? (
              <div className="mt-3 border-t border-[#F3F4F6] pt-3">
                <p className="font-body text-[14px] leading-[1.65] text-[#666666]">{otherDefinition}</p>
              </div>
            ) : null}

            <p className="mt-3 rounded-md bg-[#FFF6EC] px-3 py-2.5 font-body text-[13px] italic leading-[1.6] text-[#666666]">
              {entry.example}
            </p>

            <div className="mt-3 flex items-start gap-2 rounded-md bg-[#FFFBEB] px-3 py-2.5">
              <TrapIcon />
              <p className="font-body text-[13px] leading-[1.6] text-[#666666]">{entry.trap}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F3F4F6] pt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="font-body text-[12px] font-semibold text-[#6B7280] transition-colors hover:text-[#111111]"
          >
            {expanded ? 'Thu gọn ↑' : 'Xem thêm ↓'}
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-0 min-w-0 px-2 py-1 text-[12px]"
            onClick={() => {
              setExpanded(false)
              onViewFull(entryIndex)
            }}
          >
            Xem đầy đủ →
          </Button>
        </div>
      </div>
    </>
  )
}
