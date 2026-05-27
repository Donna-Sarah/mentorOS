import { cn } from '@/lib/utils/cn'

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'product'
  size?: 'default' | 'sm'
  gradient?: string
  href?: string
  external?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const baseStyles =
  'font-semibold font-body rounded-md inline-flex items-center justify-center gap-2 min-h-touch min-w-touch'

const variantStyles = {
  primary:
    'bg-obsidian text-white-canvas hover:opacity-90 transition-opacity',
  ghost:
    'bg-transparent text-midnight-ink border border-midnight-ink hover:bg-midnight-ink/5 transition-colors',
  product: 'text-white-canvas hover:opacity-90 transition-opacity',
} as const

function getPaddingStyles(
  variant: NonNullable<ButtonProps['variant']>,
  size: NonNullable<ButtonProps['size']>,
): string {
  if (size === 'sm') return 'px-2 py-1.5 text-xs'
  if (variant === 'ghost') return 'px-4 py-2 text-sm'
  return 'px-3 py-2 text-sm'
}

const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none'

export function Button({
  variant = 'primary',
  size = 'default',
  gradient,
  href,
  external = false,
  disabled = false,
  className,
  children,
  onClick,
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    getPaddingStyles(variant, size),
    variant === 'product' && gradient,
    disabled && disabledStyles,
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled || undefined}
        {...(external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
