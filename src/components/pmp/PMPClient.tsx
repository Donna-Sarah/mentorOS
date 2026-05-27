'use client'

import { useCallback, useState } from 'react'
import type { Mood1Result, Mood2Result, PMPMood, PMPQuestion } from '@/types/pmp'
import { AnswerPicker, InputScreen, MoodSelectScreen } from '@/components/pmp'
import GlossaryPanel from './GlossaryPanel'
import EVMCalculator from './EVMCalculator'
import PMPHeader from './PMPHeader'
import { ResultScreen } from './result'
import { Mood2Picker, Mood2Result as Mood2ResultScreen } from './mood2'

type PMPPhase = 'input' | 'mood_select' | 'answer' | 'result'

export default function PMPClient() {
  const [phase, setPhase] = useState<PMPPhase>('input')
  const [question, setQuestion] = useState<PMPQuestion | null>(null)
  const [selectedMood, setSelectedMood] = useState<PMPMood | null>(null)
  const [mood1Result, setMood1Result] = useState<Mood1Result | null>(null)
  const [mood2Result, setMood2Result] = useState<Mood2Result | null>(null)
  const [mood2SelectedOption, setMood2SelectedOption] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [glossaryScrollTo, setGlossaryScrollTo] = useState<number | null>(null)
  const [showEVM, setShowEVM] = useState(false)

  const handleOpenGlossary = useCallback((index?: number) => {
    setGlossaryScrollTo(index ?? null)
    setShowGlossary(true)
  }, [])

  const resetToInput = useCallback(() => {
    setPhase('input')
    setQuestion(null)
    setSelectedMood(null)
    setMood1Result(null)
    setMood2Result(null)
    setMood2SelectedOption(null)
    setUserAnswers([])
    setElapsedSeconds(0)
    setIsAnalyzing(false)
  }, [])

  async function handleAnswerSubmit(answers: string[], seconds: number) {
    setIsAnalyzing(true)
    setElapsedSeconds(seconds)

    try {
      const res = await fetch('/api/pmp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question:
            (question?.text ?? '') +
            '\n' +
            Object.entries(question?.options ?? {})
              .map(([k, v]) => `${k}. ${v}`)
              .join('\n'),
          mood: 'mood1',
        }),
      })

      const json = (await res.json()) as { data: Mood1Result | null; error: string | null }
      if (json.error || !json.data) throw new Error(json.error ?? 'No data')

      setUserAnswers(answers)
      setMood1Result(json.data)
      setPhase('result')
    } catch {
      setIsAnalyzing(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function renderPhase() {
    if (phase === 'input') {
      return (
        <InputScreen
          onConfirm={(q) => {
            setQuestion(q)
            setSelectedMood(null)
            setMood1Result(null)
            setMood2Result(null)
            setMood2SelectedOption(null)
            setUserAnswers([])
            setPhase('mood_select')
          }}
        />
      )
    }

    if (phase === 'mood_select' && question) {
      return (
        <MoodSelectScreen
          question={question}
          onBack={resetToInput}
          onOpenGlossary={handleOpenGlossary}
          onSelect={(mood) => {
            setSelectedMood(mood)
            setMood1Result(null)
            setMood2Result(null)
            setMood2SelectedOption(null)
            setUserAnswers([])
            setElapsedSeconds(0)
            setPhase('answer')
          }}
        />
      )
    }

    if (phase === 'answer' && question && selectedMood === 'mood2') {
      return (
        <Mood2Picker
          question={question}
          onBack={() => {
            setPhase('mood_select')
            setMood2Result(null)
            setMood2SelectedOption(null)
            setElapsedSeconds(0)
          }}
          onSubmit={(option, seconds, aiResult) => {
            setMood2SelectedOption(option)
            setMood2Result(aiResult)
            setElapsedSeconds(seconds)
            setPhase('result')
          }}
        />
      )
    }

    if (phase === 'answer' && question && selectedMood === 'mood1') {
      return (
        <AnswerPicker
          question={question}
          mood="mood1"
          onBack={() => {
            setPhase('mood_select')
            setUserAnswers([])
            setElapsedSeconds(0)
          }}
          onOpenGlossary={handleOpenGlossary}
          onSubmit={(answers, seconds) => handleAnswerSubmit(answers, seconds)}
        />
      )
    }

    if (phase === 'result' && question && selectedMood === 'mood2' && mood2Result && mood2SelectedOption) {
      return (
        <Mood2ResultScreen
          question={question}
          result={mood2Result}
          selectedOption={mood2SelectedOption}
          elapsedSeconds={elapsedSeconds}
          onReset={resetToInput}
        />
      )
    }

    if (phase === 'result' && mood1Result && question && selectedMood === 'mood1') {
      return (
        <ResultScreen
          question={question}
          result={mood1Result}
          userAnswers={userAnswers}
          elapsedSeconds={elapsedSeconds}
          onReset={resetToInput}
          onOpenGlossary={handleOpenGlossary}
        />
      )
    }

    return (
      <div className="mx-auto max-w-[640px] px-4 py-8">
        <p className="mb-4 font-body text-body text-slate-text">Đang tải...</p>
        <button
          type="button"
          onClick={resetToInput}
          className="min-h-touch font-body text-body-sm text-pmp-primary underline"
        >
          ← Câu hỏi mới
        </button>
        {isAnalyzing && <p className="mt-3 font-body text-body-sm text-ash-text">Đang phân tích...</p>}
      </div>
    )
  }

  return (
    <>
      <PMPHeader
        onOpenGlossary={() => handleOpenGlossary()}
        onOpenEVM={() => setShowEVM(true)}
      />

      {renderPhase()}

      {showGlossary && (
        <GlossaryPanel
          onClose={() => {
            setShowGlossary(false)
            setGlossaryScrollTo(null)
          }}
          scrollToIndex={glossaryScrollTo}
        />
      )}

      {showEVM && (
        <div
          className="fixed inset-0 z-modal bg-obsidian/40"
          role="presentation"
          onClick={() => setShowEVM(false)}
        >
          <div
            className="scroll-container fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-white-canvas shadow-modal md:inset-x-auto md:bottom-auto md:left-1/2 md:top-[80px] md:w-full md:max-w-[640px] md:-translate-x-1/2 md:rounded-md"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-soft-gray bg-white-canvas px-4 py-3">
              <span className="font-display text-heading-sm font-bold text-midnight-ink">
                📊 EVM Calculator
              </span>
              <button
                type="button"
                onClick={() => setShowEVM(false)}
                className="flex h-11 w-11 items-center justify-center text-slate-text transition-colors hover:text-midnight-ink"
                aria-label="Đóng EVM Calculator"
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
            <EVMCalculator />
          </div>
        </div>
      )}
    </>
  )
}
