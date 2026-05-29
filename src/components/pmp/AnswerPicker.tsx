'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PMPMood, PMPQuestion, ResponseType } from '@/types/pmp'
import { Button } from '@/components/ui/Button'
import {
  GlossaryTooltip,
  HighlightedText,
  LangToggle,
  TimerBar,
  formatFullQuestionText,
  parseTranslation,
} from '@/components/pmp/shared'
import { cn } from '@/lib/utils/cn'

interface AnswerPickerProps {
  question: PMPQuestion
  mood: PMPMood
  onSubmit: (answers: string[], seconds: number) => void
  onSwitchMood: () => void
  onReset: () => void
  onOpenGlossary: (index: number) => void
  cachedTranslation?: string | null
}

const headerButtonClassName =
  'inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 font-body text-[13px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB]'

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 7a6 6 0 1 0 1.5-3.9M1 3v3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  onSwitchMood,
  onReset,
  onOpenGlossary,
  cachedTranslation = null,
}: AnswerPickerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [responseType, setResponseType] = useState<ResponseType>('single')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tooltipTerm, setTooltipTerm] = useState<{
    term: string
    idx: number
    rect: DOMRect
  } | null>(null)
  const [isTranslated, setIsTranslated] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translateCache, setTranslateCache] = useState<string | null>(null)

  useEffect(() => {
    setResponseType(detectResponseType(question.text))
  }, [question.text])

  useEffect(() => {
    setIsTranslated(false)
    setTranslatedText(null)
    setTranslateCache(null)
    setIsTranslating(false)
  }, [question])

  const displayContent = useMemo(() => {
    if (!isTranslated || !translatedText) {
      return { questionText: question.text, options: question.options ?? {} }
    }
    const parsed = parseTranslation(translatedText, question.options ?? {})
    return { questionText: parsed.question, options: parsed.options }
  }, [isTranslated, translatedText, question.text, question.options])

  const options = useMemo(
    () => Object.entries(displayContent.options),
    [displayContent.options],
  )
  const benchmark = mood === 'mood1' ? 77 : 25

  const canSubmit =
    responseType === 'single'
      ? selectedAnswers.length >= 1
      : selectedAnswers.length >= 2

  async function handleTranslate() {
    if (isTranslating) return

    if (isTranslated) {
      setIsTranslated(false)
      setTranslatedText(null)
      return
    }

    if (cachedTranslation) {
      setTranslatedText(cachedTranslation)
      setIsTranslated(true)
      return
    }

    if (translateCache) {
      setTranslatedText(translateCache)
      setIsTranslated(true)
      return
    }

    setIsTranslating(true)
    try {
      const fullText = formatFullQuestionText(question.text, question.options ?? {})
      const res = await fetch('/api/pmp/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, mode: 'mood1' }),
      })
      const json = (await res.json()) as { data: string | null }
      if (json.data) {
        setTranslateCache(json.data)
        setTranslatedText(json.data)
        setIsTranslated(true)
      }
    } catch (err) {
      console.error('Translation failed:', err)
    } finally {
      setIsTranslating(false)
    }
  }

  function toggleAnswer(key: string) {
    setSelectedAnswers((prev) => {
      if (responseType === 'single') return [key]
      return prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    })
  }

  return (
    <section className="mx-auto max-w-[640px] px-5 py-10 md:px-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset} className={headerButtonClassName}>
            <RefreshIcon />
            Câu hỏi mới
          </button>
          <button type="button" onClick={onSwitchMood} className={headerButtonClassName}>
            {mood === 'mood1' ? 'Chuyển sang Mood 2' : 'Chuyển sang Mood 1'}
          </button>
        </div>

        <span className="rounded-md bg-pmp-surface px-3 py-1.5 font-body text-[12px] font-bold text-pmp-accent">
          {mood === 'mood1' ? '🧠 Mood 1' : '🔍 Mood 2'}
        </span>
      </div>

      <TimerBar
        benchmark={benchmark}
        isActive={!isSubmitting}
        onTick={(s) => setElapsedSeconds(s)}
      />

      <div className="mt-6 rounded-md bg-white p-6 shadow-card md:p-7">
        {question.tag ? (
          <div className="mb-4">
            <span className="font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              {question.tag}
            </span>
          </div>
        ) : null}

        <HighlightedText
          text={displayContent.questionText}
          onTermClick={(term, idx, rect) => setTooltipTerm({ term, idx, rect })}
          className="font-body text-[16px] text-midnight-ink leading-[1.75] md:text-[17px]"
        />

        <div className="mt-4 flex justify-end">
          <LangToggle
            isVI={isTranslated}
            onToggle={() => void handleTranslate()}
            isLoading={isTranslating}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {options.map(([key, value]) => {
          const selected = selectedAnswers.includes(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleAnswer(key)}
              className={[
                'flex w-full min-h-[56px] items-start gap-4 rounded-md border-2 px-5 py-4 text-left transition-all',
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
              <div className="min-w-0 flex-1 font-body text-[15px] leading-[1.65] text-midnight-ink">
                <HighlightedText
                  text={value}
                  onTermClick={(term, idx, rect) => setTooltipTerm({ term, idx, rect })}
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
          anchorRect={tooltipTerm.rect}
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
        className="mt-8 min-h-[52px] w-full text-[16px] font-semibold"
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
