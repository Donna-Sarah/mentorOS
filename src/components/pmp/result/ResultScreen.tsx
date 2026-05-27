'use client'

import { useState } from 'react'
import type { Mood1Result, PMPQuestion } from '@/types/pmp'
import { Button } from '@/components/ui/Button'
import { GlossaryTooltip, HighlightedText } from '@/components/pmp/shared'
import TranslateToggle from './TranslateToggle'
import VerdictTab from './VerdictTab'
import AnatomyTab from './AnatomyTab'
import MindsetTab from './MindsetTab'
import CoreRuleTab from './CoreRuleTab'
import TrapTab from './TrapTab'

interface ResultScreenProps {
  question: PMPQuestion
  result: Mood1Result
  userAnswers: string[]
  elapsedSeconds: number
  onReset: () => void
  onOpenGlossary: (index: number) => void
}

type ResultTab = 'verdict' | 'anatomy' | 'mindset' | 'core_rule' | 'trap'

export default function ResultScreen({
  question,
  result,
  userAnswers,
  elapsedSeconds,
  onReset,
  onOpenGlossary,
}: ResultScreenProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>('verdict')
  const [displayText, setDisplayText] = useState<string>(question.text)
  const [isTranslated, setIsTranslated] = useState(false)
  const [tooltipTerm, setTooltipTerm] = useState<{ term: string; idx: number } | null>(null)

  return (
    <section className="mx-auto max-w-[640px] px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="rounded-md bg-pmp-surface px-3 py-1 font-body text-body-sm font-bold text-pmp-accent">
          🧠 Mood 1
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          ← Câu mới
        </Button>
      </div>

      <div className="mb-4 rounded-md bg-white-canvas p-4 shadow-card">
        <HighlightedText
          text={displayText}
          onTermClick={(term, idx) => setTooltipTerm({ term, idx })}
          className="font-body text-body-sm text-midnight-ink leading-relaxed"
        />
      </div>

      <div className="mb-4">
        <div className="scroll-hidden mb-4 flex gap-1 overflow-x-auto border-b border-soft-gray pb-1">
          {([
            { key: 'verdict', label: 'Kết quả' },
            { key: 'anatomy', label: 'Giải phẫu' },
            { key: 'mindset', label: 'VN vs PMI' },
            { key: 'core_rule', label: 'Core Rule' },
            { key: 'trap', label: 'Trap' },
          ] as const).map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'min-h-touch whitespace-nowrap px-4 py-2 font-body text-body-sm font-semibold transition-colors',
                  'border-b-2',
                  active
                    ? 'border-pmp-primary text-pmp-primary -mb-px'
                    : 'border-transparent text-slate-text hover:text-midnight-ink',
                ].join(' ')}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-2">
        {activeTab === 'verdict' && (
          <VerdictTab
            question={question}
            result={result}
            userAnswers={userAnswers}
            elapsedSeconds={elapsedSeconds}
            onOpenGlossary={onOpenGlossary}
          />
        )}
        {activeTab === 'anatomy' && <AnatomyTab anatomy={result.anatomy} />}
        {activeTab === 'mindset' && <MindsetTab mindset={result.mindset} />}
        {activeTab === 'core_rule' && (
          <CoreRuleTab coreRule={result.core_rule} trapName={result.trap.name} />
        )}
        {activeTab === 'trap' && <TrapTab trap={result.trap} />}
      </div>

      <TranslateToggle
        questionText={question.text}
        onTranslated={(t) => setDisplayText(t)}
        isTranslated={isTranslated}
        setIsTranslated={(v) => {
          setIsTranslated(v)
          if (!v) setDisplayText(question.text)
        }}
      />

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
    </section>
  )
}

