'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { copyText } from '@/lib/askbetter/utils'
import type { Round1Result } from '@/types/askbetter'
import { AnalysisCard } from './AnalysisCard'
import { ClarityBar } from './ClarityBar'

interface Round1CardsProps {
  result: Round1Result
  refineInput: string
  refineLoading: boolean
  onRefineChange: (value: string) => void
  onRefineSubmit: () => void
}

export function Round1Cards({
  result,
  refineInput,
  refineLoading,
  onRefineChange,
  onRefineSubmit,
}: Round1CardsProps): React.ReactElement {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopy = (): void => {
    if (copyText(result.better_request)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefineSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onRefineSubmit()
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <AnalysisCard
        icon="🔍"
        title={t.askbetter.card_problem}
        headerBg="#FFF7ED"
        iconBg="#FED7AA"
        titleColor="#C2410C"
        delayMs={0}
        footer={<ClarityBar score={result.clarity_score} />}
      >
        <p className="text-body text-midnight-ink">{result.problem}</p>
      </AnalysisCard>

      <AnalysisCard
        icon="❓"
        title={t.askbetter.card_missing}
        headerBg="#EFF6FF"
        iconBg="#BFDBFE"
        titleColor="#1D4ED8"
        delayMs={80}
      >
        <div className="mb-5 flex flex-col gap-3">
          {result.missing.map((item) => (
            <span
              key={item}
              className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 font-body text-body-sm leading-[1.55] text-[#1D4ED8]"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="font-body text-body-sm leading-[1.65] text-slate-text">
          {result.missing_detail}
        </p>
      </AnalysisCard>

      <AnalysisCard
        icon="🗺️"
        title={t.askbetter.card_workflow}
        headerBg="#F0F9FF"
        iconBg="#BAE6FD"
        titleColor="#0369A1"
        delayMs={160}
      >
        <ol className="list-decimal space-y-3 pl-5 font-body text-body-sm leading-[1.65] text-midnight-ink">
          {result.workflow.map((step) => (
            <li key={step} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </AnalysisCard>

      <AnalysisCard
        icon="🤖"
        title={t.askbetter.card_tools}
        headerBg="#FAF5FF"
        iconBg="#E9D5FF"
        titleColor="#7C3AED"
        delayMs={240}
      >
        <ul className="space-y-4">
          {result.tools.map((tool) => (
            <li key={tool.name} className="font-body text-body-sm leading-[1.65]">
              <span className="font-semibold text-midnight-ink">{tool.name}</span>
              <span className="text-slate-text"> — {tool.reason}</span>
            </li>
          ))}
        </ul>
      </AnalysisCard>

      <AnalysisCard
        icon="✨"
        title={t.askbetter.card_better}
        headerStyle={{ background: 'var(--ab-grad-soft)' }}
        iconBg="#DBEAFE"
        titleColor="#2563EB"
        delayMs={320}
        footer={
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-touch w-full items-center justify-center rounded-md px-5 py-3 font-body text-[13px] font-semibold text-white-canvas transition-opacity hover:opacity-90"
            style={{ background: 'var(--ab-grad)' }}
          >
            {copied ? t.askbetter.copy_done : t.askbetter.copy_btn}
          </button>
        }
      >
        <div
          className="rounded-md px-5 py-5 font-body text-body leading-[1.65] text-midnight-ink md:px-6 md:py-6"
          style={{ background: 'var(--ab-grad-soft)' }}
        >
          {result.better_request}
        </div>
      </AnalysisCard>

      <AnalysisCard
        icon="✏️"
        title={t.askbetter.card_refine}
        headerBg="#FAFAF9"
        iconBg="#E7E5E4"
        titleColor="#44403C"
        delayMs={400}
        footer={
          <form onSubmit={handleRefineSubmit}>
            <button
              type="submit"
              disabled={refineLoading || !refineInput.trim()}
              className="flex min-h-touch w-full items-center justify-center rounded-md px-5 py-3 font-body text-[14px] font-semibold text-white-canvas transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--ab-grad)' }}
            >
              {refineLoading ? t.askbetter.analyzing : t.askbetter.refine_btn}
            </button>
          </form>
        }
      >
        <textarea
          value={refineInput}
          onChange={(e) => onRefineChange(e.target.value)}
          placeholder={t.askbetter.refine_placeholder}
          rows={5}
          disabled={refineLoading}
          className="w-full resize-y rounded-md border border-soft-gray bg-[var(--ab-bg)] px-4 py-4 font-body outline-none transition-colors focus:border-[#2563EB]/40"
          style={{ fontSize: '16px', color: 'var(--ab-text)' }}
        />
      </AnalysisCard>
    </div>
  )
}
