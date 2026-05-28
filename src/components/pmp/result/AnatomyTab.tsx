'use client'

import type { Mood1Result } from '@/types/pmp'

interface AnatomyTabProps {
  anatomy: Mood1Result['anatomy']
}

export default function AnatomyTab({ anatomy }: AnatomyTabProps) {
  return (
    <div className="space-y-3">
      <h2 className="mb-4 font-display text-heading-sm font-bold text-midnight-ink">Giải phẫu câu hỏi</h2>

      <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          VAI TRÒ
        </div>
        <div className="font-body text-[14px] leading-[1.65] text-[#111111]">{anatomy.role_anchor}</div>
      </div>

      <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          TÌNH HUỐNG CỐT LÕI
        </div>
        <div className="font-body text-[14px] leading-[1.65] text-[#111111]">{anatomy.situation}</div>
      </div>

      <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
        <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          TRIGGER WORD
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-amber-glow px-2 py-0.5 font-display text-body font-bold text-sunset-orange">
            {anatomy.trigger_word}
          </span>
          <span className="font-body text-[14px] leading-[1.65] text-[#111111]">
            — {anatomy.trigger_meaning}
          </span>
        </div>
      </div>

      <div className="rounded-md border border-[#EDE9FE] bg-[#F5F3FF] p-4">
        <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#7C3AED]">
          PMI THỰC SỰ TEST GÌ
        </div>
        <div className="font-body text-[14px] font-semibold leading-[1.6] text-[#4C1D95]">{anatomy.hidden_test}</div>
      </div>
    </div>
  )
}
