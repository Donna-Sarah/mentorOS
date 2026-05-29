'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { copyText } from '@/lib/askbetter/utils'
import type { Round2Result } from '@/types/askbetter'
import { AnalysisCard } from './AnalysisCard'
import { ClarityBar } from './ClarityBar'

interface CoachingCardProps {
  result: Round2Result
  round1Score: number
  refineInput: string
}

export function CoachingCard({
  result,
  round1Score,
  refineInput,
}: CoachingCardProps): React.ReactElement {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleCopy = (): void => {
    if (copyText(refineInput)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mt-6 md:mt-8">
      <AnalysisCard
        icon="🎯"
        title={t.askbetter.coaching_title}
        headerStyle={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        }}
        iconBg="#A7F3D0"
        titleColor="#065F46"
        delayMs={0}
        footer={
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-touch w-full items-center justify-center rounded-md border border-soft-gray bg-white-canvas px-5 py-3 font-body text-[13px] font-semibold text-midnight-ink transition-colors hover:bg-[#FAFAFA]"
          >
            📋 {copied ? t.askbetter.copy_done : t.askbetter.copy_your_request}
          </button>
        }
      >
        <div className="space-y-6">
          {result.is_ready ? (
            <div className="rounded-md border border-[#A7F3D0] bg-[#F0FDF4] px-5 py-4 text-center font-body text-body-sm font-semibold text-[#065F46]">
              🎉 {t.askbetter.coaching_ready}
            </div>
          ) : null}

          {result.improved.length > 0 ? (
            <div>
              <p className="mb-3 font-body text-body-sm font-semibold text-midnight-ink">
                ✅ {t.askbetter.coaching_improved}
              </p>
              <ul className="list-disc space-y-2 pl-5 font-body text-body-sm leading-[1.65] text-slate-text">
                {result.improved.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.still_vague.length > 0 ? (
            <div>
              <p className="mb-3 font-body text-body-sm font-semibold text-midnight-ink">
                ⚠️ {t.askbetter.coaching_vague}
              </p>
              <ul className="list-disc space-y-2 pl-5 font-body text-body-sm leading-[1.65] text-slate-text">
                {result.still_vague.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {!result.is_ready && result.next_suggestion ? (
            <div>
              <p className="mb-3 font-body text-body-sm font-semibold text-midnight-ink">
                💡 {t.askbetter.coaching_next}
              </p>
              <p className="font-body text-body-sm leading-[1.65] text-slate-text">
                {result.next_suggestion}
              </p>
            </div>
          ) : null}

          <ClarityBar score={result.clarity_score} previousScore={round1Score} />
        </div>
      </AnalysisCard>
    </div>
  )
}
