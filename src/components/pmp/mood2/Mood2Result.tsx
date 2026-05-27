'use client'

import { useState } from 'react'
import type { Mood2Result as Mood2ResultType, PMPQuestion } from '@/types/pmp'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  formatMmSs,
  getTimerColor,
  renderBoldHighlights,
  renderOptionSegments,
  type Mood2TranslatePayload,
} from './helpers'

interface Mood2ResultProps {
  question: PMPQuestion
  result: Mood2ResultType
  selectedOption: string
  elapsedSeconds: number
  onReset: () => void
}

function Spinner() {
  return (
    <span
      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-soft-gray border-t-pmp-accent"
      aria-hidden
    />
  )
}

export default function Mood2Result({
  result,
  selectedOption,
  elapsedSeconds,
  onReset,
}: Mood2ResultProps) {
  const [displayQuestion, setDisplayQuestion] = useState(result.original_highlighted)
  const [displayOptions, setDisplayOptions] = useState(result.options)
  const [displaySignal, setDisplaySignal] = useState(result.pmi_signal)
  const [displayTip, setDisplayTip] = useState(result.compression_tip)
  const [isTranslated, setIsTranslated] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateCache, setTranslateCache] = useState<Mood2TranslatePayload | null>(null)

  const isCorrect = selectedOption === result.correct_option
  const benchmark = 25
  const timerColor = getTimerColor(elapsedSeconds, benchmark)

  async function handleTranslateToggle() {
    if (isTranslated) {
      setDisplayQuestion(result.original_highlighted)
      setDisplayOptions(result.options)
      setDisplaySignal(result.pmi_signal)
      setDisplayTip(result.compression_tip)
      setIsTranslated(false)
      return
    }

    if (translateCache) {
      setDisplayQuestion(translateCache.question)
      setDisplayOptions(translateCache.options)
      setDisplaySignal(translateCache.pmi_signal)
      setDisplayTip(translateCache.compression_tip)
      setIsTranslated(true)
      return
    }

    setIsTranslating(true)
    try {
      const res = await fetch('/api/pmp/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: JSON.stringify({
            question: result.original_highlighted,
            options: result.options,
            pmi_signal: result.pmi_signal,
            compression_tip: result.compression_tip,
          }),
          mode: 'mood2',
        }),
      })

      const json = (await res.json()) as { data: Mood2TranslatePayload | null; error: string | null }
      if (json.error || !json.data) {
        console.error(json.error ?? 'Translation failed')
        return
      }

      setTranslateCache(json.data)
      setDisplayQuestion(json.data.question)
      setDisplayOptions(json.data.options)
      setDisplaySignal(json.data.pmi_signal)
      setDisplayTip(json.data.compression_tip)
      setIsTranslated(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsTranslating(false)
    }
  }

  const signalSegments = displaySignal.split(' → ').filter(Boolean)

  return (
    <section className="mx-auto max-w-[640px] px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="rounded-md bg-pmp-surface px-3 py-1 font-body text-body-sm font-bold text-pmp-accent">
          🔍 Mood 2
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          ← Câu mới
        </Button>
      </div>

      <div
        className={[
          'flex items-center gap-3 rounded-md p-4',
          isCorrect ? 'border border-success/20 bg-success/10' : 'border border-error/20 bg-error/10',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white-canvas',
            isCorrect ? 'bg-success' : 'bg-error',
          ].join(' ')}
        >
          {isCorrect ? '✓' : '✗'}
        </div>
        <p className="font-body text-body font-bold text-midnight-ink">
          {isCorrect
            ? 'Signal được capture đúng!'
            : 'Bị cognitive bias rồi — xem phân tích bên dưới.'}
        </p>
      </div>

      <div className="mt-1 inline-flex items-center gap-2">
        <span className="font-body text-body-sm font-semibold" style={{ color: timerColor.color }}>
          ⏱ {formatMmSs(elapsedSeconds)}
        </span>
        <span className="hidden font-body text-caption text-ash-text sm:inline">
          {timerColor.message}
        </span>
      </div>

      <div className="mt-4 rounded-md bg-white-canvas p-4 shadow-card">
        <p className="font-body text-body-sm leading-relaxed text-midnight-ink">
          {renderBoldHighlights(displayQuestion)}
        </p>
      </div>

      <div className="mt-4">
        <p className="mb-3 font-body text-body-sm font-bold text-midnight-ink">
          Phân tích các interpretation:
        </p>

        <div className="space-y-3">
          {Object.entries(displayOptions).map(([key, text]) => {
            const optionCorrect = key === result.correct_option
            const optionSelected = key === selectedOption
            const trap = result.traps[key]

            const cardClass = optionCorrect
              ? 'border-success/40 bg-success/5'
              : optionSelected
                ? 'border-error/40 bg-error/5'
                : 'border-soft-gray bg-white-canvas'

            const circleClass = optionCorrect
              ? 'bg-success text-white-canvas'
              : optionSelected
                ? 'bg-error text-white-canvas'
                : 'bg-soft-gray text-slate-text'

            return (
              <div key={key} className={`rounded-md border-2 p-3 ${cardClass}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-body-sm font-bold ${circleClass}`}
                    >
                      {key}
                    </div>
                    {optionCorrect ? (
                      <span className="font-body text-body-sm font-semibold text-success">
                        ✓ Signal đúng
                      </span>
                    ) : optionSelected ? (
                      <span className="font-body text-body-sm font-semibold text-error">
                        ✗ Cognitive bias
                      </span>
                    ) : (
                      <span className="font-body text-body-sm text-ash-text">✗</span>
                    )}
                  </div>
                  {optionSelected && <Badge variant="warning">Bạn chọn</Badge>}
                </div>

                <div className="mt-2 font-body text-body-sm">{renderOptionSegments(text)}</div>

                {!optionCorrect && trap && (
                  <>
                    <div className="mt-2 font-body text-caption font-bold uppercase tracking-widest text-ash-text">
                      {trap.bias}
                    </div>
                    <p className="mt-1 font-body text-body-sm text-slate-text">{trap.explanation}</p>
                  </>
                )}

                {optionCorrect && trap && (
                  <p className="mt-2 font-body text-body-sm text-slate-text">{trap.explanation}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-pmp-primary/20 bg-pmp-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-pmp-accent"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4" />
            <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12" />
          </svg>
          <span className="font-body text-body-sm font-bold text-pmp-primary">PMI Signal Chain</span>
        </div>

        <p className="font-body text-body-sm leading-relaxed text-midnight-ink">
          {signalSegments.map((segment, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-1 text-ash-text">→</span>}
              <span className="font-semibold text-pmp-primary">{segment.trim()}</span>
            </span>
          ))}
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-glow p-3">
        <span className="mt-0.5 shrink-0 text-base" aria-hidden>
          💡
        </span>
        <p className="font-body text-body-sm text-slate-text">{displayTip}</p>
      </div>

      <button
        type="button"
        onClick={() => void handleTranslateToggle()}
        className="fixed bottom-6 left-4 z-30 flex min-h-touch min-w-touch items-center gap-2 rounded-md border border-soft-gray bg-white-canvas px-4 py-2 font-body text-body-sm font-semibold text-midnight-ink shadow-modal transition-colors hover:bg-amber-glow"
      >
        {isTranslating ? (
          <>
            <Spinner />
            Đang dịch...
          </>
        ) : isTranslated ? (
          '🇬🇧 EN'
        ) : (
          '🇻🇳 VI'
        )}
      </button>
    </section>
  )
}
