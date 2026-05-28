'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PMPMood, PMPQuestion, ResponseType } from '@/types/pmp'
import { Button } from '@/components/ui/Button'
import { GlossaryTooltip, HighlightedText, TimerBar } from '@/components/pmp/shared'
import { cn } from '@/lib/utils/cn'

interface AnswerPickerProps {
  question: PMPQuestion
  mood: PMPMood
  onSubmit: (answers: string[], seconds: number) => void
  onBack: () => void
  onReset: () => void
  onOpenGlossary: (index: number) => void
  cachedTranslation?: string | null
}

const headerButtonClassName =
  'inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB]'

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

function parseTranslation(
  text: string,
  fallbackOptions: Record<string, string>,
): {
  question: string
  options: Record<string, string>
} {
  const lines = text.split('\n')
  const optionLines = lines.filter((l) => /^[A-D][.)]\s/.test(l.trim()))
  const questionLines = lines.filter((l) => !/^[A-D][.)]\s/.test(l.trim()) && l.trim())
  const options: Record<string, string> = {}
  optionLines.forEach((l) => {
    const match = l.trim().match(/^([A-D])[.)]\s(.+)/)
    if (match) options[match[1]] = match[2]
  })
  return {
    question: questionLines.join(' ').trim() || text,
    options: Object.keys(options).length > 0 ? options : fallbackOptions,
  }
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
  onBack,
  onReset,
  onOpenGlossary,
  cachedTranslation = null,
}: AnswerPickerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [responseType, setResponseType] = useState<ResponseType>('single')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tooltipTerm, setTooltipTerm] = useState<{ term: string; idx: number } | null>(null)
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
      const fullText =
        question.text +
        '\n' +
        Object.entries(question.options ?? {})
          .map(([k, v]) => `${k}. ${v}`)
          .join('\n')
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
    <section className="mx-auto max-w-[640px] px-4 py-8 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset} className={headerButtonClassName}>
            <RefreshIcon />
            Câu hỏi mới
          </button>
          <button type="button" onClick={onBack} className={headerButtonClassName}>
            Đổi mood
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

      <div className="mt-4 rounded-md bg-white p-4 shadow-card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {question.tag ? (
              <span className="font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                {question.tag}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void handleTranslate()}
            disabled={isTranslating}
            className={cn(
              'inline-flex min-h-[30px] shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-body text-[12px] font-semibold transition-all duration-150 disabled:opacity-60',
              isTranslated
                ? 'border-2 border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]'
                : 'border-2 border-[#E5E7EB] bg-white text-[#374151] hover:border-[#7C3AED] hover:text-[#7C3AED]',
            )}
          >
            {isTranslating ? '...' : isTranslated ? '🇬🇧 EN' : '🇻🇳 VI'}
          </button>
        </div>

        <HighlightedText
          text={displayContent.questionText}
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
                'flex w-full min-h-touch items-start gap-3 rounded-md border-2 px-4 py-3 text-left transition-all',
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
