'use client'

import type { Mood1Result } from '@/types/pmp'
import { Badge } from '@/components/ui/Badge'

interface TrapTabProps {
  trap: Mood1Result['trap']
}

const metadataPillClassName =
  'inline-flex items-center rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold text-[#6B7280]'

export default function TrapTab({ trap }: TrapTabProps) {
  const categoryLabel = trap.category.replace(' Trap', '')

  return (
    <div className="space-y-4">
      <h2 className="mb-4 font-display text-heading-sm font-bold text-midnight-ink">Trap Analysis</h2>

      <div className="rounded-md border border-warning/30 bg-amber-glow p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-display text-body font-bold text-midnight-ink">{trap.name}</div>
          <Badge variant="warning">{trap.category}</Badge>
        </div>

        <div className="mt-3">
          <div className="mb-1 font-body text-caption font-bold uppercase tracking-widest text-ash-text">
            NGHE CÓ VẺ ĐÚNG VÌ...
          </div>
          <div className="font-body text-body-sm text-slate-text italic">{trap.why_feels_right}</div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={metadataPillClassName}>{trap.domain}</span>
          <span className={metadataPillClassName}>{trap.approach}</span>
          <span className={metadataPillClassName}>{categoryLabel}</span>
        </div>

        <div className="mt-3 rounded-md bg-pmp-surface p-3 font-body text-body-sm text-pmp-primary">
          💡 Gặp lại bẫy này? Nhớ ngay Core Rule và dừng lại trước khi chọn.
        </div>
      </div>
    </div>
  )
}
