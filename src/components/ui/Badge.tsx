import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  variant?: 'default' | 'product' | 'warning'
  className?: string
  children: React.ReactNode
}

const variantStyles = {
  default: 'bg-soft-gray text-midnight-ink',
  product: 'bg-obsidian text-white-canvas',
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
        'inline-flex items-center rounded-sm px-2 py-0.5 text-caption font-body font-bold uppercase tracking-wide',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
