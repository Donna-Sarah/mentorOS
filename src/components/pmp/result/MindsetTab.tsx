'use client'

import type { Mood1Result } from '@/types/pmp'

interface MindsetTabProps {
  mindset: Mood1Result['mindset']
}

export default function MindsetTab({ mindset }: MindsetTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4 font-display text-heading-sm font-bold text-midnight-ink">VN Reflex vs PMI Thinking</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex h-full flex-col rounded-md border border-error/20 bg-error/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🇻🇳
            </span>
            <span className="font-body text-body-sm font-bold text-midnight-ink">Phản xạ thực tế VN</span>
          </div>

          <div className="font-body text-body-sm font-semibold text-midnight-ink">{mindset.vn_thinking}</div>
          <div className="mt-2 font-body text-body-sm text-slate-text italic">{mindset.vn_reason}</div>
        </div>

        <div className="flex h-full flex-col rounded-md border border-success/20 bg-success/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🎯
            </span>
            <span className="font-body text-body-sm font-bold text-midnight-ink">PMI Mindset</span>
          </div>

          <div className="font-body text-body-sm font-semibold text-midnight-ink">{mindset.pmi_thinking}</div>
          <div className="mt-2 font-body text-body-sm text-slate-text italic">{mindset.pmi_reason}</div>
        </div>
      </div>
    </div>
  )
}

