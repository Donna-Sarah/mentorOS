'use client'

import { useState } from 'react'
import type { PMPMood, PMPQuestion } from '@/types/pmp'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { GlossaryTooltip, HighlightedText } from '@/components/pmp/shared'

interface MoodSelectScreenProps {
  question: PMPQuestion
  onSelect: (mood: PMPMood) => void
  onBack: () => void
  onOpenGlossary: (index: number) => void
}

export default function MoodSelectScreen({
  question,
  onSelect,
  onBack,
  onOpenGlossary,
}: MoodSelectScreenProps) {
  const [tooltipTerm, setTooltipTerm] = useState<{ term: string; idx: number } | null>(null)

  return (
    <section className="mx-auto max-w-[640px] px-4 py-8 md:px-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← Câu hỏi khác
      </Button>

      <div className="mt-4 rounded-md bg-white-canvas p-4 shadow-card">
        {question.tag && (
          <div className="mb-2">
            <Badge variant="default">{question.tag}</Badge>
          </div>
        )}

        <HighlightedText
          text={question.text}
          onTermClick={(term, idx) => setTooltipTerm({ term, idx })}
          className="font-body text-body text-midnight-ink leading-relaxed"
        />

        {Object.keys(question.options ?? {}).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(question.options).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <div className="w-5 shrink-0 font-body text-body-sm font-bold text-pmp-primary">
                  {key}
                </div>
                <div className="min-w-0 flex-1 font-body text-body-sm text-slate-text">
                  <HighlightedText
                    text={value}
                    onTermClick={(term, idx) => setTooltipTerm({ term, idx })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      <div className="mt-8">
        <p className="mb-4 font-body text-body-sm font-bold text-midnight-ink">
          Chọn chế độ luyện tập:
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelect('mood1')}
            className="w-full min-h-touch rounded-md border-2 border-soft-gray p-4 text-left transition-all hover:border-pmp-primary hover:bg-pmp-surface/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-body text-body font-bold text-midnight-ink">🧠 Mood 1</div>
              <Badge variant="product">Answer Thinking</Badge>
            </div>
            <p className="mt-2 font-body text-body-sm text-slate-text">
              Chọn đáp án, nhận phân tích đầy đủ: tại sao đúng, tại sao sai, bẫy tư duy và Core Rule.
            </p>
            <p className="mt-3 font-body text-caption text-ash-text">⏱ Benchmark: 77 giây</p>
          </button>

          <button
            type="button"
            onClick={() => onSelect('mood2')}
            className="w-full min-h-touch rounded-md border-2 border-soft-gray p-4 text-left transition-all hover:border-pmp-primary hover:bg-pmp-surface/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-body text-body font-bold text-midnight-ink">🔍 Mood 2</div>
              <Badge variant="product">Reading Decode</Badge>
            </div>
            <p className="mt-2 font-body text-body-sm text-slate-text">
              Luyện đọc đề nhanh — tìm PMI signal đúng trong 25 giây trước khi chọn đáp án.
            </p>
            <p className="mt-3 font-body text-caption text-ash-text">⏱ Benchmark: 25 giây</p>
          </button>
        </div>
      </div>
    </section>
  )
}

