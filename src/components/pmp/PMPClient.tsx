'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import type {
  Mood1Result,
  Mood1ResultV2,
  Mood2Result,
  Mood2ResultV2,
  PMPSession,
  PMPMood,
  PMPQuestion,
  SampleAnswersCache,
  SampleAnswerV2Entry,
  SampleAnswersV2Cache,
  SampleQuestion,
} from '@/types/pmp'
import { getCoreRuleText, getTrap, getTrapDisplayName } from '@/lib/pmp/taxonomy'
import { mood1V2ToV1Stub } from '@/lib/pmp/v2-adapters'
import { AnswerPicker, InputScreen, MoodSelectScreen } from '@/components/pmp'
import GlossaryPanel from './GlossaryPanel'
import EVMCalculator from './EVMCalculator'
import PMPHeader from './PMPHeader'
import { LessonScreen } from './result'
import { Mood2Picker, Mood2Result as Mood2ResultScreen } from './mood2'
import AnalyzingScreen from './AnalyzingScreen'
import samplesData from '../../../public/data/samples.json'
import sampleAnswersV2Data from '../../../public/data/sample-answers-v2.json'

export type PMPPhase = 'input' | 'mood_select' | 'answer' | 'result'

export interface PMPClientHandle {
  startWithMood: (mood: PMPMood) => void
  scrollToUpload: () => void
  openGlossary: () => void
  openEVM: () => void
}

interface PMPClientProps {
  onPhaseChange?: (phase: PMPPhase) => void
  onReturnToInput?: () => void
}

const samples = samplesData as SampleQuestion[]
const sampleCacheV2 = sampleAnswersV2Data as SampleAnswersV2Cache

function normAnswerKey(answers: string[] | string): string {
  const list = Array.isArray(answers)
    ? answers
    : answers.split(',').map((s) => s.trim())
  return [...list].sort().join(',')
}

function formatSelectedAnswer(answers: string[]): string {
  return answers.length === 1 ? answers[0]! : [...answers].sort().join(',')
}

function lookupWrongAnswerReason(
  entry: SampleAnswerV2Entry,
  answers: string[],
): string {
  const key = normAnswerKey(answers)
  const reasons = entry.wrong_answer_reasons
  if (reasons?.[key]) return reasons[key]

  // Legacy cache: single pre-generated reason on analysisV2
  if (key === normAnswerKey(entry.analysisV2.selected_answer)) {
    return entry.analysisV2.user_answer_reason
  }

  return ''
}

function applyUserAnswersToV2Cache(
  entry: SampleAnswerV2Entry,
  answers: string[],
): Mood1ResultV2 {
  const base = entry.analysisV2
  const userCorrect = normAnswerKey(answers) === normAnswerKey(base.correct_answers)

  return {
    ...base,
    selected_answer: formatSelectedAnswer(answers),
    is_correct: userCorrect,
    user_answer_reason: userCorrect ? '' : lookupWrongAnswerReason(entry, answers),
  }
}

async function fetchMood1V2Analysis(
  questionText: string,
  options: Record<string, string>,
  answers: string[],
): Promise<Mood1ResultV2> {
  const res = await fetch('/api/pmp/analyze?v=2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question:
        questionText +
        '\n' +
        Object.entries(options)
          .map(([k, v]) => `${k}. ${v}`)
          .join('\n'),
      mood: 'mood1',
      selectedAnswer: formatSelectedAnswer(answers),
    }),
  })

  const json = (await res.json()) as { data: Mood1ResultV2 | null; error: string | null }
  if (json.error || !json.data) throw new Error(json.error ?? 'No data')
  return json.data
}

async function persistSession(
  mood: PMPMood,
  questionText: string,
  questionSource: PMPQuestion['source'],
  questionTag: string | undefined,
  sampleQuestionId: number | undefined,
  userAnswers: string[],
  correctAnswers: string[],
  isCorrect: boolean,
  timeSeconds: number,
  v2Result: Mood1ResultV2 | Mood2ResultV2,
): Promise<void> {
  try {
    const isMood1 = mood === 'mood1'
    const m1 = isMood1 ? (v2Result as Mood1ResultV2) : null
    const m2 = !isMood1 ? (v2Result as Mood2ResultV2) : null

    const payload: Omit<PMPSession, 'id'> = {
      question_text: questionText,
      question_tag: questionTag,
      question_source: questionSource,
      sample_question_id: sampleQuestionId,
      mood,
      response_type: isMood1 ? m1!.response_type : 'single',
      user_answers: userAnswers,
      correct_answers: correctAnswers,
      is_correct: isCorrect,
      time_seconds: timeSeconds,
      ai_response: v2Result as unknown as PMPSession['ai_response'],
      trap_name: m1 ? getTrapDisplayName(m1.trap_id, 'en') : undefined,
      trap_category: m1 ? getTrap(m1.trap_id)?.dimension : undefined,
      trap_domain: m1 ? getTrap(m1.trap_id)?.dimension : undefined,
      trap_approach: undefined,
      core_rule:
        m1 && m1.core_rule_id
          ? getCoreRuleText(m1.core_rule_id, 'vi', m1.trap_subtype ?? undefined)
          : undefined,
      pmi_signal: m2 ? m2.pmi_signal : undefined,
    }

    await fetch('/api/pmp/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn('[PMP] Session persist failed (non-blocking):', error)
  }
}

const PMPClient = forwardRef<PMPClientHandle, PMPClientProps>(function PMPClient(
  { onPhaseChange, onReturnToInput },
  ref,
) {
  const [phase, setPhase] = useState<PMPPhase>('input')
  const [question, setQuestion] = useState<PMPQuestion | null>(null)
  const [selectedMood, setSelectedMood] = useState<PMPMood | null>(null)
  const [mood1Result, setMood1Result] = useState<Mood1Result | null>(null)
  const [mood1ResultV2, setMood1ResultV2] = useState<Mood1ResultV2 | null>(null)
  const [mood2Result, setMood2Result] = useState<Mood2Result | null>(null)
  const [mood2ResultV2, setMood2ResultV2] = useState<Mood2ResultV2 | null>(null)
  const [mood2SelectedOption, setMood2SelectedOption] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [glossaryScrollTo, setGlossaryScrollTo] = useState<number | null>(null)
  const [showEVM, setShowEVM] = useState(false)
  const [sampleCache, setSampleCache] = useState<SampleAnswersCache | null>(null)
  const [cachedTranslation, setCachedTranslation] = useState<string | null>(null)

  const [shouldScrollToCards, setShouldScrollToCards] = useState(false)
  const [shouldScrollToInput, setShouldScrollToInput] = useState(false)

  function returnToInputScreen(options?: { scrollToCards?: boolean; scrollToInput?: boolean }) {
    setPhase('input')
    setQuestion(null)
    setSelectedMood(null)
    setMood1Result(null)
    setMood1ResultV2(null)
    setMood2Result(null)
    setMood2ResultV2(null)
    setMood2SelectedOption(null)
    setUserAnswers([])
    setElapsedSeconds(0)
    setIsAnalyzing(false)
    setCachedTranslation(null)
    setShowGlossary(false)
    setShowEVM(false)
    setShouldScrollToCards(options?.scrollToCards ?? false)
    setShouldScrollToInput(options?.scrollToInput ?? false)
  }

  useEffect(() => {
    fetch('/data/sample-answers.json')
      .then((r) => r.json())
      .then((data: SampleAnswersCache) => setSampleCache(data))
      .catch(() => {
        console.log('Sample cache not available, using live API')
      })
  }, [])

  useEffect(() => {
    onPhaseChange?.(phase)
  }, [phase, onPhaseChange])

  const handleOpenGlossary = useCallback((index?: number) => {
    setGlossaryScrollTo(index ?? null)
    setShowGlossary(true)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      startWithMood(mood: PMPMood) {
        const randomIndex = Math.floor(Math.random() * samples.length)
        const sample = samples[randomIndex]
        const nextQuestion: PMPQuestion = {
          text: sample.question,
          options: sample.options,
          source: 'sample',
          sampleId: randomIndex,
          tag: sample.tag,
        }

        setQuestion(nextQuestion)
        setSelectedMood(mood)
        setMood1Result(null)
        setMood1ResultV2(null)
        setMood2Result(null)
        setMood2ResultV2(null)
        setMood2SelectedOption(null)
        setUserAnswers([])
        setElapsedSeconds(0)
        setIsAnalyzing(false)
        setCachedTranslation(null)

        if (sampleCache) {
          const cached = sampleCache[String(randomIndex)]
          if (cached) setCachedTranslation(cached.translation)
        }

        setPhase('answer')
      },
      scrollToUpload() {
        returnToInputScreen({ scrollToInput: true })
      },
      openGlossary() {
        setGlossaryScrollTo(null)
        setShowGlossary(true)
      },
      openEVM() {
        setShowEVM(true)
      },
    }),
    [sampleCache],
  )

  const resetToInput = useCallback(() => {
    returnToInputScreen({ scrollToCards: true })
    onReturnToInput?.()
  }, [onReturnToInput])

  function handleSwitchMood() {
    const newMood: PMPMood = selectedMood === 'mood1' ? 'mood2' : 'mood1'
    setSelectedMood(newMood)
    setUserAnswers([])
    setMood1Result(null)
    setMood1ResultV2(null)
    setMood2Result(null)
    setMood2ResultV2(null)
    setMood2SelectedOption(null)
    setElapsedSeconds(0)
    setPhase('answer')
  }

  const handleConfirm = useCallback((q: PMPQuestion) => {
    setQuestion(q)
    setSelectedMood(null)
    setMood1Result(null)
    setMood1ResultV2(null)
    setMood2Result(null)
    setMood2ResultV2(null)
    setMood2SelectedOption(null)
    setUserAnswers([])
    setElapsedSeconds(0)
    setCachedTranslation(null)
    setPhase('mood_select')
  }, [])

  const handleConfirmWithMood = useCallback(
    (q: PMPQuestion, mood: PMPMood) => {
      setQuestion(q)
      setSelectedMood(mood)
      setMood1Result(null)
      setMood1ResultV2(null)
      setMood2Result(null)
      setMood2ResultV2(null)
      setMood2SelectedOption(null)
      setUserAnswers([])
      setElapsedSeconds(0)
      setCachedTranslation(null)

      if (q.source === 'sample' && q.sampleId !== undefined && sampleCache) {
        const cached = sampleCache[String(q.sampleId)]
        if (cached) setCachedTranslation(cached.translation)
      }

      setPhase('answer')
    },
    [sampleCache],
  )

  async function handleAnswerSubmit(answers: string[], seconds: number) {
    setUserAnswers(answers)
    setElapsedSeconds(seconds)

    if (!question) return

    const questionText = question.text
    const v2Entry =
      question.source === 'sample' && question.sampleId !== undefined
        ? sampleCacheV2[String(question.sampleId)]
        : undefined

    if (v2Entry?.analysisV2) {
      const mood1V2Result = applyUserAnswersToV2Cache(v2Entry, answers)
      setMood1ResultV2(mood1V2Result)
      setMood1Result(mood1V2ToV1Stub(mood1V2Result))

      if (sampleCache) {
        const cached = sampleCache[String(question.sampleId)]
        if (cached) setCachedTranslation(cached.translation)
      }

      setPhase('result')

      void persistSession(
        'mood1',
        questionText,
        question.source,
        question.tag,
        question.sampleId,
        answers,
        mood1V2Result.correct_answers,
        mood1V2Result.is_correct,
        seconds,
        mood1V2Result,
      )

      return
    }

    setIsAnalyzing(true)

    try {
      const mood1V2Result = await fetchMood1V2Analysis(
        questionText,
        question.options ?? {},
        answers,
      )
      setMood1ResultV2(mood1V2Result)
      setMood1Result(mood1V2ToV1Stub(mood1V2Result))

      if (question.source === 'sample' && question.sampleId !== undefined && sampleCache) {
        const cached = sampleCache[String(question.sampleId)]
        if (cached) setCachedTranslation(cached.translation)
      }

      setPhase('result')

      void persistSession(
        'mood1',
        questionText,
        question.source,
        question.tag,
        question.sampleId,
        answers,
        mood1V2Result.correct_answers,
        mood1V2Result.is_correct,
        seconds,
        mood1V2Result,
      )
    } catch {
      setIsAnalyzing(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function renderPhase() {
    if (isAnalyzing) {
      return <AnalyzingScreen mood={selectedMood} />
    }

    if (phase === 'input' || (phase === 'mood_select' && !question)) {
      return (
        <InputScreen
          onConfirm={handleConfirm}
          onConfirmWithMood={handleConfirmWithMood}
          onOpenGlossary={() => handleOpenGlossary()}
          autoScrollToCards={shouldScrollToCards}
          autoScrollToInput={shouldScrollToInput}
          onScrollComplete={() => {
            setShouldScrollToCards(false)
            setShouldScrollToInput(false)
          }}
        />
      )
    }

    if (phase === 'mood_select' && question) {
      return (
        <MoodSelectScreen
          onSelect={(mood) => {
            setSelectedMood(mood)
            setMood1Result(null)
            setMood1ResultV2(null)
            setMood2Result(null)
            setMood2ResultV2(null)
            setMood2SelectedOption(null)
            setUserAnswers([])
            setElapsedSeconds(0)
            setPhase('answer')
          }}
          onBack={() => {
            setPhase('input')
            setQuestion(null)
            setSelectedMood(null)
            setCachedTranslation(null)
          }}
        />
      )
    }

    if (phase === 'answer' && question && selectedMood === 'mood2') {
      return (
        <Mood2Picker
          question={question}
          onSwitchMood={handleSwitchMood}
          onSubmit={(option, seconds, aiResult, aiResultV2) => {
            setMood2SelectedOption(option)
            setMood2Result(aiResult)
            setMood2ResultV2(aiResultV2)
            setElapsedSeconds(seconds)
            setPhase('result')

            if (question) {
              void persistSession(
                'mood2',
                question.text,
                question.source,
                question.tag,
                question.sampleId,
                [option],
                [aiResultV2.correct_option],
                option === aiResultV2.correct_option,
                seconds,
                aiResultV2,
              )
            }
          }}
        />
      )
    }

    if (phase === 'answer' && question && selectedMood === 'mood1') {
      return (
        <AnswerPicker
          question={question}
          mood="mood1"
          cachedTranslation={cachedTranslation}
          onReset={resetToInput}
          onSwitchMood={handleSwitchMood}
          onOpenGlossary={handleOpenGlossary}
          onSubmit={(answers, seconds) => handleAnswerSubmit(answers, seconds)}
        />
      )
    }

    if (
      phase === 'result' &&
      question &&
      selectedMood === 'mood2' &&
      mood2Result &&
      mood2ResultV2 &&
      mood2SelectedOption
    ) {
      return (
        <Mood2ResultScreen
          question={question}
          result={mood2Result}
          resultV2={mood2ResultV2}
          selectedOption={mood2SelectedOption}
          elapsedSeconds={elapsedSeconds}
          onReset={resetToInput}
        />
      )
    }

    if (phase === 'result' && mood1Result && mood1ResultV2 && question && selectedMood === 'mood1') {
      return (
        <LessonScreen
          question={question}
          result={mood1Result}
          resultV2={mood1ResultV2}
          userAnswers={userAnswers}
          elapsedSeconds={elapsedSeconds}
          onReset={resetToInput}
          onBack={handleSwitchMood}
          onOpenGlossary={handleOpenGlossary}
          cachedTranslation={cachedTranslation}
        />
      )
    }

    return (
      <div className="mx-auto max-w-[640px] px-4 py-8 md:px-6">
        <p className="mb-4 font-body text-body text-slate-text">Đang tải...</p>
        <button
          type="button"
          onClick={resetToInput}
          className="min-h-touch font-body text-body-sm text-pmp-primary underline"
        >
          ← Câu hỏi mới
        </button>
      </div>
    )
  }

  return (
    <>
      {phase !== 'input' && (
        <PMPHeader
          onOpenGlossary={() => handleOpenGlossary()}
          onOpenEVM={() => setShowEVM(true)}
        />
      )}

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
})

export default PMPClient
