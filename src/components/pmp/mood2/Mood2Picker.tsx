'use client'

import { useEffect, useState } from 'react'
import type { Mood2Result, Mood2ResultV2, PMPQuestion } from '@/types/pmp'
import { mood2V2ToV1 } from '@/lib/pmp/v2-adapters'
import { Button } from '@/components/ui/Button'
import { TimerBar } from '@/components/pmp/shared'
import {
  formatQuestionForAnalyze,
  renderOptionSegments,
  renderWithTriggers,
} from './helpers'

interface Mood2PickerProps {
  question: PMPQuestion
  onSubmit: (
    selectedOption: string,
    seconds: number,
    aiResult: Mood2Result,
    aiResultV2: Mood2ResultV2,
  ) => void
  onSwitchMood: () => void
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

export default function Mood2Picker({ question, onSubmit, onSwitchMood }: Mood2PickerProps) {
  const steps = [
    'Đang đọc câu hỏi...',
    'Xác định PMI signal chain...',
    'Tạo interpretation options...',
    'Hoàn thiện...',
  ]

  const [subPhase, setSubPhase] = useState<SubPhase>('loading')
  const [aiResult, setAiResult] = useState<Mood2Result | null>(null)
  const [aiResultV2, setAiResultV2] = useState<Mood2ResultV2 | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [optionsReady, setOptionsReady] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (subPhase === 'loading') {
      setLoadStep(0)
      setDots('')
    }
  }, [subPhase])

  useEffect(() => {
    if (subPhase !== 'loading') return

    const interval = setInterval(() => {
      setLoadStep((prev) => Math.min(prev + 1, steps.length - 1))
    }, 4000)

    return () => clearInterval(interval)
  }, [subPhase, steps.length])

  useEffect(() => {
    if (subPhase !== 'loading') return

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`))
    }, 500)

    return () => clearInterval(interval)
  }, [subPhase])

  useEffect(() => {
    let cancelled = false

    async function fetchOptions() {
      setSubPhase('loading')
      setLoadError(null)
      setOptionsReady(false)

      try {
        const res = await fetch('/api/pmp/analyze?v=2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: formatQuestionForAnalyze(question),
            mood: 'mood2',
          }),
        })

        const json = (await res.json()) as { data: Mood2ResultV2 | null; error: string | null }

        if (cancelled) return

        if (json.error || !json.data) {
          setLoadError(json.error ?? 'Không thể tạo interpretation options.')
          return
        }

        setAiResultV2(json.data)
        setAiResult(mood2V2ToV1(json.data))
        setOptionsReady(true)
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

  if (subPhase === 'loading') {
    const progressPercent = ((loadStep + 1) / steps.length) * 100

    return (
      <div className="mx-auto max-w-[640px] px-4 py-8 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onSwitchMood}>
            Chuyển sang Mood 1
          </Button>
          <span className="rounded-md bg-pmp-surface px-3 py-1 font-body text-[12px] font-bold text-pmp-accent">
            🔍 Mood 2
          </span>
        </div>

        <div className="flex min-h-[360px] flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-[#EFF6FF]">
            <span className="text-2xl" aria-hidden>
              🔍
            </span>
          </div>

          <p className="mb-2 min-h-[28px] font-body text-[15px] font-semibold text-[#111111]">
            {steps[loadStep]}
            {dots}
          </p>

          <div className="mx-auto mt-4 h-1 w-full max-w-[240px] overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
              style={{
                width: `${progressPercent}%`,
                transition: 'width 4s ease-in-out',
              }}
            />
          </div>

          <p className="mx-auto mt-6 max-w-[260px] font-body text-[13px] leading-[1.6] text-[#9CA3AF]">
            Mood 2 luyện kỹ năng đọc đề — không phải chọn đáp án đúng, mà nhận ra PMI đang hỏi gì.
          </p>

          {loadError ? (
            <div className="mt-6 max-w-[320px] rounded-md border border-error/20 bg-error/10 p-3 font-body text-[13px] text-error">
              {loadError}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-[640px] px-4 py-8 md:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onSwitchMood}>
          Chuyển sang Mood 1
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
        isActive={optionsReady && !isSubmitting}
        onTick={(s) => setElapsedSeconds(s)}
      />

      <div className="mt-4 rounded-md bg-white-canvas p-4 shadow-card">
        <p className="font-body text-body leading-relaxed text-midnight-ink">
          {renderWithTriggers(question.text)}
        </p>
      </div>

      {aiResult && (
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
                    'flex w-full min-h-touch items-start gap-3 rounded-md border-2 px-4 py-3 text-left transition-all',
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
              if (!selected || !aiResult || !aiResultV2) return
              setIsSubmitting(true)
              onSubmit(selected, elapsedSeconds, aiResult, aiResultV2)
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
