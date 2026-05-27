'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PMPMood, PMPQuestion, ResponseType } from '@/types/pmp'
import { Button } from '@/components/ui/Button'
import { GlossaryTooltip, HighlightedText, TimerBar } from '@/components/pmp/shared'

interface AnswerPickerProps {
  question: PMPQuestion
  mood: PMPMood
  onSubmit: (answers: string[], seconds: number) => void
  onBack: () => void
  onOpenGlossary: (index: number) => void
}

function detectResponseType(questionText: string): ResponseType {
  const t = questionText.toLowerCase()
  const signals = [
    'which two',
    'select two',
    'which three',
    'select all that apply',
    'which of the following are',
  ]
  return signals.some((s) => t.includes(s)) ? 'multiple' : 'single'
}

function Spinner() {
  return (
    <svg className="mr-2 inline h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function AnswerPicker({
  question,
  mood,
  onSubmit,
  onBack,
  onOpenGlossary,
}: AnswerPickerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [responseType, setResponseType] = useState<ResponseType>('single')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tooltipTerm, setTooltipTerm] = useState<{ term: string; idx: number } | null>(null)

  useEffect(() => {
    setResponseType(detectResponseType(question.text))
  }, [question.text])

  const options = useMemo(() => Object.entries(question.options ?? {}), [question.options])
  const benchmark = mood === 'mood1' ? 77 : 25

  const canSubmit =
    responseType === 'single'
      ? selectedAnswers.length >= 1
      : selectedAnswers.length >= 2

  function toggleAnswer(key: string) {
    setSelectedAnswers((prev) => {
      if (responseType === 'single') return [key]
      return prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    })
  }

  return (
    <section className="mx-auto max-w-[640px] px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Đổi chế độ
        </Button>
        <div className="rounded-md bg-pmp-surface px-3 py-1 font-body text-body-sm font-bold text-pmp-accent">
          {mood === 'mood1' ? '🧠 Mood 1' : '🔍 Mood 2'}
        </div>
      </div>

      <TimerBar
        benchmark={benchmark}
        isActive={!isSubmitting}
        onTick={(s) => setElapsedSeconds(s)}
      />

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setResponseType('single')
            setSelectedAnswers((prev) => (prev.length ? [prev[0]] : []))
          }}
          className={[
            'min-h-touch rounded-sm border px-2 py-1 font-body text-caption',
            responseType === 'single'
              ? 'border-pmp-primary bg-pmp-surface text-pmp-accent'
              : 'border-soft-gray bg-transparent text-ash-text',
          ].join(' ')}
        >
          1 đáp án
        </button>
        <button
          type="button"
          onClick={() => setResponseType('multiple')}
          className={[
            'min-h-touch rounded-sm border px-2 py-1 font-body text-caption',
            responseType === 'multiple'
              ? 'border-pmp-primary bg-pmp-surface text-pmp-accent'
              : 'border-soft-gray bg-transparent text-ash-text',
          ].join(' ')}
        >
          Nhiều đáp án
        </button>
      </div>

      <div className="mt-4 rounded-md bg-white-canvas p-4 shadow-card">
        <HighlightedText
          text={question.text}
          onTermClick={(term, idx) => setTooltipTerm({ term, idx })}
          className="font-body text-body text-midnight-ink leading-relaxed"
        />
      </div>

      <div className="mt-3 space-y-2">
        {options.map(([key, value]) => {
          const selected = selectedAnswers.includes(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleAnswer(key)}
              className={[
                'flex w-full min-h-touch items-start gap-3 rounded-md border-2 p-3 text-left transition-all',
                selected ? 'border-pmp-primary bg-pmp-surface' : 'border-soft-gray hover:border-pmp-primary/50',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-body-sm font-bold',
                  selected ? 'bg-pmp-primary text-white-canvas' : 'bg-soft-gray text-slate-text',
                ].join(' ')}
              >
                {responseType === 'multiple' && selected ? '✓' : key}
              </div>
              <div className="min-w-0 flex-1 font-body text-body-sm text-midnight-ink">
                <HighlightedText
                  text={value}
                  onTermClick={(term, idx) => setTooltipTerm({ term, idx })}
                />
              </div>
            </button>
          )
        })}
      </div>

      {responseType === 'multiple' && (
        <p className="mt-2 font-body text-body-sm text-slate-text">
          {selectedAnswers.length === 0
            ? 'Chọn tất cả đáp án đúng'
            : `Đã chọn ${selectedAnswers.length} đáp án`}
        </p>
      )}

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

      <Button
        variant="product"
        gradient="bg-gradient-pmp"
        className="mt-6 w-full"
        disabled={!canSubmit || isSubmitting}
        onClick={() => {
          setIsSubmitting(true)
          onSubmit(selectedAnswers, elapsedSeconds)
        }}
      >
        {isSubmitting ? (
          <>
            <Spinner />
            Đang phân tích...
          </>
        ) : (
          <>{mood === 'mood1' ? 'Phân tích ngay →' : 'Decode ngay →'}</>
        )}
      </Button>
    </section>
  )
}

