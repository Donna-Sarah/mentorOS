'use client'

import type { Mood1Result } from '@/types/pmp'
import { Badge } from '@/components/ui/Badge'

interface TrapTabProps {
  trap: Mood1Result['trap']
}

const getCategoryIcon = (category: Mood1Result['trap']['category']): string => {
  if (category === 'Mindset Trap') return '🧠'
  if (category === 'Terminology Trap') return '📖'
  if (category === 'Technical Trap') return '⚙️'
  return '🔤'
}

export default function TrapTab({ trap }: TrapTabProps) {
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

        <div className="mt-2 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-sm border border-soft-gray bg-white-canvas px-2 py-1 text-caption font-body text-slate-text">
            📌 {trap.domain}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-sm border border-soft-gray bg-white-canvas px-2 py-1 text-caption font-body text-slate-text">
            {trap.approach}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-sm border border-soft-gray bg-white-canvas px-2 py-1 text-caption font-body text-slate-text">
            {getCategoryIcon(trap.category)} {trap.category.replace(' Trap', '')}
          </div>
        </div>

        <div className="mt-3 rounded-md bg-pmp-surface p-3 font-body text-body-sm text-pmp-primary">
          💡 Gặp lại bẫy này? Nhớ ngay Core Rule và dừng lại trước khi chọn.
        </div>
      </div>
    </div>
  )
}

