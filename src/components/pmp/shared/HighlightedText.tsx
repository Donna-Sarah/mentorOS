'use client'

import { Fragment, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  buildGlossaryHighlightPattern,
  buildGlossaryTermList,
} from './glossaryTerms'

interface HighlightedTextProps {
  text: string
  onTermClick: (term: string, entryIndex: number, rect: DOMRect) => void
  className?: string
}

interface TextSegment {
  type: 'text' | 'term'
  value: string
  entryIndex?: number
}

function splitIntoSegments(
  text: string,
  pattern: RegExp,
  terms: ReturnType<typeof buildGlossaryTermList>,
): TextSegment[] {
  const termToIndex = new Map(
    terms.map(({ term, entryIndex }) => [term.toLowerCase(), entryIndex]),
  )

  const segments: TextSegment[] = []
  let lastIndex = 0
  const flags = pattern.flags
  const globalPattern = new RegExp(pattern.source, flags.includes('g') ? flags : `${flags}g`)

  let match: RegExpExecArray | null
  while ((match = globalPattern.exec(text)) !== null) {
    const matched = match[0]
    if (!matched) break

    const start = match.index ?? 0

    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) })
    }

    const entryIndex = termToIndex.get(matched.toLowerCase())
    if (entryIndex !== undefined) {
      segments.push({ type: 'term', value: matched, entryIndex })
    } else {
      segments.push({ type: 'text', value: matched })
    }

    lastIndex = start + matched.length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }]
}

export default function HighlightedText({
  text,
  onTermClick,
  className,
}: HighlightedTextProps) {
  const terms = useMemo(() => buildGlossaryTermList(), [])
  const pattern = useMemo(() => buildGlossaryHighlightPattern(terms), [terms])

  const segments = useMemo(() => {
    if (!pattern) return [{ type: 'text' as const, value: text }]
    return splitIntoSegments(text, pattern, terms)
  }, [pattern, terms, text])

  return (
    <span className={cn('inline whitespace-pre-wrap', className)}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Fragment key={`text-${index}`}>{segment.value}</Fragment>
        }

        return (
          <button
            key={`term-${index}-${segment.value}`}
            type="button"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              onTermClick(segment.value, segment.entryIndex!, rect)
            }}
            style={{ display: 'inline' }}
            className="cursor-pointer border-none bg-transparent p-0 font-inherit text-inherit text-[#2563EB] underline decoration-[#2563EB] decoration-dotted underline-offset-2 transition-colors hover:text-[#7C3AED]"
          >
            {segment.value}
          </button>
        )
      })}
    </span>
  )
}
