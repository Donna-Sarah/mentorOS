import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  variant?: 'default' | 'product' | 'warning'
  className?: string
  children: React.ReactNode
}

const variantStyles = {
  default: 'bg-[#F3F4F6] text-[#6B7280]',
  product: 'bg-[#111111] text-white',
  warning: 'bg-amber-glow text-sunset-orange',
} as const

export function Badge({
  variant = 'default',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
