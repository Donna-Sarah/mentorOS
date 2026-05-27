import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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

export function ProductCard({
  name,
  tagline,
  badge,
  badgeVariant = 'product',
  cta,
  href,
  external = false,
  gradient,
  accentColor,
  surfaceColor,
}: ProductCardProps) {
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <Card className="shadow-card">
      <div className="flex flex-col">
        <div className="flex justify-start">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>

        <div
          className={cn(
            'mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-pill',
            surfaceColor,
          )}
          aria-hidden
        >
          <span
            className={cn('font-display text-xl font-bold', accentColor)}
          >
            {initial}
          </span>
        </div>

        <h3 className="mt-3 font-display text-heading-sm font-bold text-midnight-ink">
          {name}
        </h3>

        <p className="mt-1 mb-4 font-body text-body-sm text-slate-text">
          {tagline}
        </p>

        <Button
          variant="product"
          gradient={gradient}
          href={href}
          external={external}
          className="w-full"
        >
          {cta}
        </Button>
      </div>
    </Card>
  )
}
