'use client'

import { useEffect, useState } from 'react'
import type { Mood2Result, PMPQuestion } from '@/types/pmp'
import { Button } from '@/components/ui/Button'
import { TimerBar } from '@/components/pmp/shared'
import {
  formatQuestionForAnalyze,
  renderOptionSegments,
  renderWithTriggers,
} from './helpers'

interface Mood2PickerProps {
  question: PMPQuestion
  onSubmit: (selectedOption: string, seconds: number, aiResult: Mood2Result) => void
  onBack: () => void
}

type SubPhase = 'loading' | 'picking'

function Spinner() {
  return (
    <svg className="h-8 w-8 animate-spin text-pmp-accent" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function Mood2Picker({ question, onSubmit, onBack }: Mood2PickerProps) {
  const [subPhase, setSubPhase] = useState<SubPhase>('loading')
  const [aiResult, setAiResult] = useState<Mood2Result | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchOptions() {
      setSubPhase('loading')
      setLoadError(null)

      try {
        const res = await fetch('/api/pmp/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: formatQuestionForAnalyze(question),
            mood: 'mood2',
          }),
        })

        const json = (await res.json()) as { data: Mood2Result | null; error: string | null }

        if (cancelled) return

        if (json.error || !json.data) {
          setLoadError(json.error ?? 'Không thể tạo interpretation options.')
          return
        }

        setAiResult(json.data)
        setSubPhase('picking')
      } catch {
        if (!cancelled) {
          setLoadError('Không thể tạo interpretation options.')
        }
      }
    }

    void fetchOptions()

    return () => {
      cancelled = true
    }
  }, [question])

  return (
    <section className="mx-auto max-w-[640px] px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Đổi chế độ
        </Button>
        <div className="rounded-md bg-pmp-surface px-3 py-1 font-body text-body-sm font-bold text-pmp-accent">
          🔍 Mood 2
        </div>
      </div>

      <div className="mb-4 rounded-md bg-amber-glow p-3 font-body text-body-sm text-slate-text">
        Đọc câu hỏi và chọn cách diễn giải nắm bắt đúng PMI signal nhất. Không cần chọn đáp án — chỉ
        cần hiểu câu hỏi đang test gì.
      </div>

      <TimerBar
        benchmark={25}
        isActive={!isSubmitting}
        onTick={(s) => setElapsedSeconds(s)}
      />

      <div className="mt-4 rounded-md bg-white-canvas p-4 shadow-card">
        <p className="font-body text-body text-midnight-ink leading-relaxed">
          {renderWithTriggers(question.text)}
        </p>
      </div>

      {subPhase === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Spinner />
          <p className="font-body text-body-sm text-slate-text">Đang tạo interpretation options...</p>
        </div>
      )}

      {loadError && subPhase === 'loading' && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3 font-body text-body-sm text-error">
          {loadError}
        </div>
      )}

      {subPhase === 'picking' && aiResult && (
        <div className="mt-6">
          <p className="mb-3 font-body text-body-sm font-semibold text-midnight-ink">
            Interpretation nào nắm đúng PMI signal?
          </p>

          <div className="space-y-3">
            {Object.entries(aiResult.options).map(([key, text]) => {
              const isSelected = selected === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={[
                    'flex w-full min-h-touch items-start gap-3 rounded-md border-2 p-4 text-left transition-all',
                    isSelected
                      ? 'border-pmp-primary bg-pmp-surface'
                      : 'border-soft-gray hover:border-pmp-primary/50',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-body-sm font-bold',
                      isSelected
                        ? 'bg-pmp-primary text-white-canvas'
                        : 'bg-soft-gray text-slate-text',
                    ].join(' ')}
                  >
                    {key}
                  </div>
                  <div className="min-w-0 flex-1 font-body text-body-sm">
                    {renderOptionSegments(text)}
                  </div>
                </button>
              )
            })}
          </div>

          <Button
            variant="product"
            gradient="bg-gradient-pmp"
            className="mt-6 w-full"
            disabled={!selected || isSubmitting}
            onClick={() => {
              if (!selected || !aiResult) return
              setIsSubmitting(true)
              onSubmit(selected, elapsedSeconds, aiResult)
            }}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Đang phân tích...
              </>
            ) : (
              'Xem kết quả →'
            )}
          </Button>
        </div>
      )}
    </section>
  )
}
