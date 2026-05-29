'use client'

import { useLanguage } from '@/lib/i18n'
import { getScoreColor } from '@/lib/askbetter/utils'

interface ClarityBarProps {
  score: number
  previousScore?: number
  className?: string
}

export function ClarityBar({
  score,
  previousScore,
  className = '',
}: ClarityBarProps): React.ReactElement {
  const { t } = useLanguage()

  const label =
    score < 40
      ? t.askbetter.score_vague
      : score < 65
        ? t.askbetter.score_improving
        : score < 85
          ? t.askbetter.score_clear
          : t.askbetter.score_ready

  const color = getScoreColor(score)
  const delta =
    previousScore !== undefined && score > previousScore
      ? score - previousScore
      : null

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-body text-body-sm font-medium" style={{ color }}>
          {label}
        </span>
        <span
          className="flex items-center gap-2 font-body text-body-sm font-semibold tabular-nums"
          style={{ color }}
        >
          {score}
          {delta !== null ? (
            <span className="text-[12px] font-semibold" style={{ color: '#059669' }}>
              +{delta}
            </span>
          ) : null}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-soft-gray">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, score))}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
