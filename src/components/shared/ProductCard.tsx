'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ProductCardProps {
  name: string
  tagline: string
  badge: string
  badgeVariant?: 'default' | 'product' | 'warning'
  cta: string
  href: string
  external?: boolean
  gradient: string
  accentColor: string
  surfaceColor: string
}

const ctaClassName =
  'inline-flex min-h-[36px] items-center justify-center rounded-md bg-[#111111] px-5 py-2 font-body text-[13px] font-semibold text-white transition-colors hover:bg-[#333333]'

function getBadgeClasses(variant: ProductCardProps['badgeVariant']) {
  if (variant === 'product') return 'bg-[#111111] text-white'
  if (variant === 'warning') return 'bg-amber-glow text-sunset-orange'
  return 'bg-[#F3F4F6] text-[#6B7280]'
}

export default function ProductCard({
  name,
  tagline,
  badge,
  badgeVariant = 'default',
  cta,
  href,
  external = false,
  accentColor,
  surfaceColor,
}: ProductCardProps) {
  const initial = name.charAt(0)
  const isExternal = external || href.startsWith('http')

  return (
    <div className="flex h-full flex-col rounded-md bg-white p-6 shadow-card transition-shadow duration-200 hover:shadow-modal">
      <div className="flex flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              surfaceColor,
            )}
            aria-hidden
          >
            <span className={cn('font-display text-[15px] font-bold', accentColor)}>{initial}</span>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-sm px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide',
              getBadgeClasses(badgeVariant),
            )}
          >
            {badge}
          </span>
        </div>

        <h3 className="mb-2 font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-[#111111]">
          {name}
        </h3>

        <p className="flex-1 font-body text-[13px] leading-[1.65] text-[#6B7280]">{tagline}</p>
      </div>

      <div className="mt-5 border-t border-[#F3F4F6] pt-4">
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClassName}
          >
            {cta}
            <span className="ml-1.5 text-[#9CA3AF]">→</span>
          </a>
        ) : (
          <Link href={href} className={ctaClassName}>
            {cta}
            <span className="ml-1.5 text-[#9CA3AF]">→</span>
          </Link>
        )}
      </div>
    </div>
  )
}
