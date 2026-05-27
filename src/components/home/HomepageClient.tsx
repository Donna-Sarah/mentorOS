'use client'

import { ProductCard } from '@/components/shared/ProductCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/hooks/useLanguage'

export function HomepageClient() {
  const { t } = useLanguage()

  return (
    <>
      <section className="bg-amber-glow py-16 md:py-[113px]">
        <div className="mx-auto max-w-narrow px-4 text-center md:px-6">
          <div className="mb-4 flex justify-center">
            <Badge variant="default">{t.home.hero_badge}</Badge>
          </div>

          <h1 className="font-display font-bold tracking-[-0.03em] text-midnight-ink text-[40px] leading-[1.1] md:text-[72px] md:leading-[1] md:tracking-[-0.045em]">
            <span className="block">{t.home.hero_title}</span>
            <span className="block">{t.home.hero_title_2}</span>
            <span className="block text-sunset-orange">{t.home.hero_title_3}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-reading font-body text-body text-slate-text md:text-subheading">
            {t.home.hero_sub}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" href="/askbetter">
              {t.home.cta_primary}
            </Button>
            <Button variant="ghost" href="/pmp">
              {t.home.cta_secondary}
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white-canvas py-16 md:py-[113px]">
        <div className="mx-auto max-w-content px-4 md:px-6">
          <header className="mb-12 text-center">
            <h2 className="font-display text-[32px] font-bold tracking-[-0.025em] text-midnight-ink md:text-[52px] md:tracking-[-0.035em]">
              {t.home.products_title}
            </h2>
            <p className="mx-auto mt-3 max-w-reading text-center font-body text-body-sm text-slate-text md:text-body">
              {t.home.products_sub}
            </p>
          </header>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            <ProductCard
              name={t.products.pmp.name}
              tagline={t.products.pmp.tagline}
              badge={t.products.pmp.badge}
              badgeVariant="product"
              cta={t.products.pmp.cta}
              href="/pmp"
              gradient="bg-gradient-pmp"
              accentColor="text-pmp-accent"
              surfaceColor="bg-pmp-surface"
            />
            <ProductCard
              name={t.products.askbetter.name}
              tagline={t.products.askbetter.tagline}
              badge={t.products.askbetter.badge}
              badgeVariant="default"
              cta={t.products.askbetter.cta}
              href="/askbetter"
              gradient="bg-gradient-askbetter"
              accentColor="text-askbetter-accent"
              surfaceColor="bg-askbetter-surface"
            />
            <ProductCard
              name={t.products.nextup.name}
              tagline={t.products.nextup.tagline}
              badge={t.products.nextup.badge}
              badgeVariant="default"
              cta={t.products.nextup.cta}
              href="/nextup"
              gradient="bg-gradient-nextup"
              accentColor="text-nextup-accent"
              surfaceColor="bg-nextup-surface"
            />
            <ProductCard
              name={t.products.bidmentor.name}
              tagline={t.products.bidmentor.tagline}
              badge={t.products.bidmentor.badge}
              badgeVariant="product"
              cta={t.products.bidmentor.cta}
              href="https://bidmentor.vercel.app"
              external
              gradient="bg-gradient-bidmentor"
              accentColor="text-bidmentor-accent"
              surfaceColor="bg-bidmentor-surface"
            />
          </div>
        </div>
      </section>

      <section className="bg-amber-glow py-16 md:py-[113px]">
        <div className="mx-auto max-w-narrow px-4 text-center md:px-6">
          <p className="mb-4 font-body text-caption font-bold uppercase tracking-widest text-sunset-orange">
            {t.home.philosophy_label}
          </p>
          <h2 className="mt-2 font-display text-[32px] font-bold tracking-[-0.025em] text-midnight-ink md:text-[52px] md:tracking-[-0.035em]">
            {t.home.philosophy_title}
          </h2>
          <p className="mx-auto mt-6 max-w-reading font-body text-body text-slate-text md:text-subheading">
            {t.home.philosophy_body}
          </p>
        </div>
      </section>

      <section className="border-t border-soft-gray bg-white-canvas py-12 md:py-16">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <div className="text-center md:text-left">
            <h2 className="font-display text-[22px] font-bold text-midnight-ink md:text-[32px]">
              {t.home.cta_strip_title}
            </h2>
            <p className="mt-1 font-body text-body-sm text-slate-text">
              {t.home.cta_strip_sub}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button variant="primary" href="/askbetter">
              {t.home.cta_primary}
            </Button>
            <Button variant="ghost" href="/pmp">
              {t.home.cta_secondary}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
