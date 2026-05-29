'use client'

import { useCallback, useRef, useState, type ReactElement } from 'react'
import { AB_SYSTEM_V1, AB_SYSTEM_V2 } from '@/lib/ai/prompts/askbetter'
import { safeParse } from '@/lib/askbetter/utils'
import { useLanguage } from '@/lib/i18n'
import type {
  AskBetterTab,
  Round1Result,
  Round2Result,
} from '@/types/askbetter'
import { AskBetterHeader } from './AskBetterHeader'
import { TabSwitcher } from './TabSwitcher'
import { AnalyzingScreen, type AskBetterAnalyzingMode } from './clarify/AnalyzingScreen'
import { CoachingCard } from './clarify/CoachingCard'
import { InputCard } from './clarify/InputCard'
import { InputCompact } from './clarify/InputCompact'
import { QuickExamples } from './clarify/QuickExamples'
import { Round1Cards } from './clarify/Round1Cards'
import { TaskLibrary } from './library/TaskLibrary'

function parseRound1(data: unknown): Round1Result | null {
  if (data && typeof data === 'object' && 'clarity_score' in data) {
    return data as Round1Result
  }
  if (typeof data === 'string') return safeParse<Round1Result>(data)
  return null
}

function parseRound2(data: unknown): Round2Result | null {
  if (data && typeof data === 'object' && 'is_ready' in data) {
    return data as Round2Result
  }
  if (typeof data === 'string') return safeParse<Round2Result>(data)
  return null
}

export function AskBetterClient(): ReactElement {
  const { t } = useLanguage()
  const resultRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<AskBetterTab>('clarify')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzingMode, setAnalyzingMode] = useState<AskBetterAnalyzingMode | null>(
    null,
  )
  const [result, setResult] = useState<Round1Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refineInput, setRefineInput] = useState('')
  const [refineLoading, setRefineLoading] = useState(false)
  const [refineResult, setRefineResult] = useState<Round2Result | null>(null)

  const resetAll = useCallback((): void => {
    setInput('')
    setLoading(false)
    setAnalyzingMode(null)
    setResult(null)
    setError(null)
    setRefineInput('')
    setRefineLoading(false)
    setRefineResult(null)
  }, [])

  const scrollToResult = useCallback((): void => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const handleAnalyze = useCallback(async (): Promise<void> => {
    const query = input.trim()
    if (!query || loading || analyzingMode) return

    setLoading(true)
    setAnalyzingMode('round1')
    setError(null)
    setResult(null)
    setRefineResult(null)

    try {
      const res = await fetch('/api/askbetter/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, systemPrompt: AB_SYSTEM_V1 }),
      })

      const json = (await res.json()) as {
        data: unknown
        error: string | null
      }

      if (json.error || !json.data) {
        setError(json.error ?? t.common.error)
        return
      }

      const parsed = parseRound1(json.data)
      if (!parsed) {
        setError(t.common.error)
        return
      }

      setResult(parsed)
      scrollToResult()
    } catch {
      setError(t.common.error)
    } finally {
      setAnalyzingMode(null)
      setLoading(false)
    }
  }, [input, loading, analyzingMode, scrollToResult, t.common.error])

  const handleRefine = useCallback(async (): Promise<void> => {
    const query = refineInput.trim()
    if (!query || refineLoading || analyzingMode) return

    setRefineLoading(true)
    setAnalyzingMode('round2')
    setError(null)

    try {
      const res = await fetch('/api/askbetter/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, systemPrompt: AB_SYSTEM_V2 }),
      })

      const json = (await res.json()) as {
        data: unknown
        error: string | null
      }

      if (json.error || !json.data) {
        setError(json.error ?? t.common.error)
        return
      }

      const parsed = parseRound2(json.data)
      if (!parsed) {
        setError(t.common.error)
        return
      }

      setRefineResult(parsed)
      scrollToResult()
    } catch {
      setError(t.common.error)
    } finally {
      setAnalyzingMode(null)
      setRefineLoading(false)
    }
  }, [refineInput, refineLoading, analyzingMode, scrollToResult, t.common.error])

  const handleTryTask = useCallback((example: string): void => {
    resetAll()
    setInput(example)
    setActiveTab('clarify')
  }, [resetAll])

  const handleOpenLibrary = useCallback((): void => {
    resetAll()
    setActiveTab('library')
  }, [resetAll])

  const showClarifyResults = result !== null && analyzingMode === null

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <AskBetterHeader />

      {activeTab === 'clarify' ? (
        <>
          {result === null ? <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} /> : null}

          {result !== null ? (
            <InputCompact
              value={input}
              onChange={setInput}
              onReset={resetAll}
              onOpenLibrary={handleOpenLibrary}
            />
          ) : (
            <>
              <InputCard
                value={input}
                loading={loading}
                onChange={setInput}
                onSubmit={() => void handleAnalyze()}
              />
              <QuickExamples onSelect={setInput} />
            </>
          )}

          {error ? (
            <p
              className="mt-4 rounded-md border px-4 py-3 text-[13px]"
              style={{
                borderColor: '#FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
              }}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div ref={resultRef} className="mt-8">
            {analyzingMode === 'round1' ? (
              <AnalyzingScreen mode="round1" />
            ) : null}

            {showClarifyResults ? (
              <>
                <Round1Cards
                  result={result}
                  refineInput={refineInput}
                  refineLoading={refineLoading}
                  onRefineChange={setRefineInput}
                  onRefineSubmit={() => void handleRefine()}
                />
                {analyzingMode === 'round2' ? (
                  <AnalyzingScreen mode="round2" />
                ) : null}
                {refineResult && analyzingMode !== 'round2' ? (
                  <CoachingCard
                    result={refineResult}
                    round1Score={result.clarity_score}
                    refineInput={refineInput}
                  />
                ) : null}
              </>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
          <TaskLibrary onTryTask={handleTryTask} />
        </>
      )}
    </div>
  )
}
