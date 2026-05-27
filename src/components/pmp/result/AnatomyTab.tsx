'use client'

import type { Mood1Result } from '@/types/pmp'

interface AnatomyTabProps {
  anatomy: Mood1Result['anatomy']
}

export default function AnatomyTab({ anatomy }: AnatomyTabProps) {
  return (
    <div className="space-y-3">
      <h2 className="mb-4 font-display text-heading-sm font-bold text-midnight-ink">Giải phẫu câu hỏi</h2>

      <div className="rounded-md bg-white-canvas p-4 shadow-subtle-2">
        <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-ash-text">VAI TRÒ</div>
        <div className="font-body text-body-sm text-midnight-ink">{anatomy.role_anchor}</div>
      </div>

      <div className="rounded-md bg-white-canvas p-4 shadow-subtle-2">
        <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-ash-text">TÌNH HUỐNG CỐT LÕI</div>
        <div className="font-body text-body-sm text-midnight-ink">{anatomy.situation}</div>
      </div>

      <div className="rounded-md bg-white-canvas p-4 shadow-subtle-2">
        <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-ash-text">TRIGGER WORD</div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-glow px-2 py-0.5 font-display text-body font-bold text-sunset-orange rounded-sm">
            {anatomy.trigger_word}
          </span>
          <span className="font-body text-body-sm text-slate-text">
            — {anatomy.trigger_meaning}
          </span>
        </div>
      </div>

      <div className="rounded-md border border-pmp-primary/20 bg-pmp-surface p-4">
        <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-ash-text">PMI THỰC SỰ TEST GÌ</div>
        <div className="font-body text-body-sm font-semibold text-pmp-primary">{anatomy.hidden_test}</div>
      </div>
    </div>
  )
}

