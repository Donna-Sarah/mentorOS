'use client'

import { useMemo, useState } from 'react'
import type { Mood1Result, PMPQuestion } from '@/types/pmp'
import { Badge } from '@/components/ui/Badge'
import { HighlightedText, GlossaryTooltip } from '@/components/pmp/shared'

interface VerdictTabProps {
  question: PMPQuestion
  result: Mood1Result
  userAnswers: string[]
  elapsedSeconds: number
  onOpenGlossary: (index: number) => void
}

function formatMmSs(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getTimerColor(seconds: number, benchmark: number): { color: string; message: string } {
  const greenEnd = benchmark * 0.52
  const amberEnd = benchmark
  const orangeEnd = benchmark * 1.56

  if (seconds <= greenEnd) return { color: '#10B981', message: 'Trong thời gian lý tưởng' }
  if (seconds <= amberEnd) return { color: '#F59E0B', message: 'Sắp hết thời gian khuyến nghị' }
  if (seconds <= orangeEnd) return { color: '#F97316', message: 'Đã vượt thời gian khuyến nghị' }
  return { color: '#EF4444', message: 'Đang mất rất nhiều thời gian' }
}

export default function VerdictTab({
  result,
  userAnswers,
  elapsedSeconds,
  onOpenGlossary,
}: VerdictTabProps) {
  const [tooltipTerm, setTooltipTerm] = useState<{ term: string; idx: number } | null>(null)

  const benchmark = 77
  const timerColor = getTimerColor(elapsedSeconds, benchmark)

  const isCorrect = useMemo(() => {
    if (userAnswers.length !== result.correct_answers.length) return false
    const correctSet = new Set(result.correct_answers)
    return userAnswers.every((a) => correctSet.has(a))
  }, [result.correct_answers, userAnswers])

  const chosenSet = useMemo(() => new Set(userAnswers), [userAnswers])
  const correctSet = useMemo(() => new Set(result.correct_answers), [result.correct_answers])

  return (
    <div className="space-y-4">
      <div
        className={[
          'flex items-center gap-3 rounded-md p-4',
          isCorrect ? 'border border-success/20 bg-success/10' : 'border border-error/20 bg-error/10',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full font-bold',
            isCorrect ? 'bg-success text-white-canvas' : 'bg-error text-white-canvas',
          ].join(' ')}
        >
          {isCorrect ? '✓' : '✗'}
        </div>

        <p className="font-body text-body-sm font-bold text-midnight-ink">
          {isCorrect ? `Chính xác! Đáp án đúng là ${result.correct_answers.join(', ')}` : `Chưa đúng. Đáp án đúng là ${result.correct_answers.join(', ')}`}
        </p>
      </div>

      <div className="mt-1 inline-flex items-center gap-2">
        <span className="font-body text-body-sm font-semibold" style={{ color: timerColor.color }}>
          ⏱ {formatMmSs(elapsedSeconds)}
        </span>
        <span className="font-body text-caption text-ash-text hidden sm:inline">{timerColor.message}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(result.answer_verdict).map(([key, verdict]) => {
          const isCorrectAnswer = correctSet.has(key)
          const isUserPicked = chosenSet.has(key)
          const rowBg = isCorrectAnswer
            ? 'bg-success/10 border-success/20 border'
            : isUserPicked
              ? 'bg-error/10 border-error/20 border'
              : 'bg-white-canvas border border-soft-gray'

          const iconBg = isCorrectAnswer
            ? 'bg-success text-white-canvas'
            : isUserPicked
              ? 'bg-error text-white-canvas'
              : 'bg-soft-gray text-slate-text'

          return (
            <div key={key} className={`flex items-start gap-3 rounded-md p-3 ${rowBg}`}>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-body-sm font-bold ${iconBg}`}
              >
                {key}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-body text-body-sm font-semibold">
                    {verdict.correct ? '✓ Đúng' : '✗ Sai'}
                  </div>
                  {isUserPicked && (
                    <Badge variant="warning" className="min-h-touch">
                      Bạn chọn
                    </Badge>
                  )}
                </div>

                <div className="mt-1 font-body text-body-sm text-slate-text">
                  <HighlightedText
                    text={verdict.explanation}
                    onTermClick={(term, idx) => setTooltipTerm({ term, idx })}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {tooltipTerm && (
        <GlossaryTooltip
          term={tooltipTerm.term}
          entryIndex={tooltipTerm.idx}
          onClose={() => setTooltipTerm(null)}
          onViewFull={(idx) => {
            setTooltipTerm(null)
            onOpenGlossary(idx)
          }}
        />
      )}
    </div>
  )
}

