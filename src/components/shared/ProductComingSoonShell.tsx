import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface ProductComingSoonShellProps {
  productName: string
  accentTextClass: string
  accentDotClass: string
  surfaceClass: string
  gradientClass: string
  progressPercent: number
  features: [string, string, string, string]
  label: string
  title: string
  body: string
  buildingMvp: string
  backLabel: string
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      width={16}
      height={16}
      aria-hidden
    >
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProductComingSoonShell({
  productName,
  accentTextClass,
  accentDotClass,
  surfaceClass,
  gradientClass,
  progressPercent,
  features,
  label,
  title,
  body,
  buildingMvp,
  backLabel,
}: ProductComingSoonShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white-canvas px-4 py-16">
      <div className="flex w-full max-w-content flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', accentDotClass)} />
          <span
            className={cn(
              'font-body text-body-sm font-semibold uppercase tracking-widest',
              accentTextClass,
            )}
          >
            {productName}
          </span>
        </div>

        <Badge variant="default" className="mb-4">
          {label}
        </Badge>

        <h1 className="mt-2 text-center font-display text-[32px] font-bold tracking-[-0.025em] text-midnight-ink md:text-[52px] md:tracking-[-0.035em]">
          {title}
        </h1>

        <p className="mt-4 max-w-reading text-center font-body text-body text-slate-text">
          {body}
        </p>

        <div className="mt-8 w-full max-w-[280px]">
          <div className="mb-2 flex justify-between">
            <span className="font-body text-body-sm text-ash-text">
              {buildingMvp}
            </span>
            <span
              className={cn(
                'font-body text-body-sm font-semibold',
                accentTextClass,
              )}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-soft-gray">
            <div
              className={cn('h-full rounded-full', gradientClass)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ul className="mt-10 grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-3 rounded-md bg-white-canvas p-3 shadow-subtle-2"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md',
                  surfaceClass,
                )}
              >
                <CheckIcon className={cn('h-4 w-4', accentTextClass)} />
              </div>
              <span className="font-body text-body-sm text-midnight-ink">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button variant="ghost" href="/">
            {backLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
