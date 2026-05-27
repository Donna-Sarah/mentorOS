import type { ReactNode } from 'react'
import type { PMPQuestion } from '@/types/pmp'

const TRIGGER_WORDS = ['FIRST', 'NEXT', 'BEST', 'EXCEPT', 'LAST', 'LEAST', 'MOST'] as const

export function formatQuestionForAnalyze(question: PMPQuestion): string {
  const optionsText = Object.entries(question.options ?? {})
    .map(([k, v]) => `${k}. ${v}`)
    .join('\n')
  return optionsText ? `${question.text}\n${optionsText}` : question.text
}

export function renderWithTriggers(text: string): ReactNode[] {
  const pattern = new RegExp(`\\b(${TRIGGER_WORDS.join('|')})\\b`, 'g')
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index ?? 0
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start))
    }
    nodes.push(
      <mark
        key={`trigger-${key++}`}
        className="rounded-sm bg-amber-glow px-0.5 font-bold text-sunset-orange not-italic"
      >
        {match[0]}
      </mark>,
    )
    lastIndex = start + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

export function renderBoldHighlights(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    const match = part.match(/^\*\*(.+)\*\*$/)
    if (match) {
      return (
        <strong
          key={`bold-${index}`}
          className="rounded-sm bg-amber-glow px-0.5 text-sunset-orange"
        >
          {match[1]}
        </strong>
      )
    }
    return <span key={`text-${index}`}>{part}</span>
  })
}

export function renderOptionSegments(text: string): ReactNode {
  const segments = text.split(' · ')
  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={index === 0 ? 'text-midnight-ink' : 'text-slate-text'}
        >
          {index > 0 && <span className="text-ash-text"> · </span>}
          {segment}
        </span>
      ))}
    </>
  )
}

export function formatMmSs(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getTimerColor(
  seconds: number,
  benchmark: number,
): { color: string; message: string } {
  const greenEnd = benchmark * 0.52
  const amberEnd = benchmark
  const orangeEnd = benchmark * 1.56

  if (seconds <= greenEnd) return { color: '#10B981', message: 'Trong thời gian lý tưởng' }
  if (seconds <= amberEnd) return { color: '#F59E0B', message: 'Sắp hết thời gian khuyến nghị' }
  if (seconds <= orangeEnd) return { color: '#F97316', message: 'Đã vượt thời gian khuyến nghị' }
  return { color: '#EF4444', message: 'Đang mất rất nhiều thời gian' }
}

export interface Mood2TranslatePayload {
  question: string
  options: Record<string, string>
  pmi_signal: string
  compression_tip: string
}
