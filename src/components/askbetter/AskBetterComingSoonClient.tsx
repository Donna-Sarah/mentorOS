'use client'

import { ProductComingSoonShell } from '@/components/shared/ProductComingSoonShell'
import { useLanguage } from '@/hooks/useLanguage'

export function AskBetterComingSoonClient() {
  const { t } = useLanguage()

  return (
    <ProductComingSoonShell
      productName={t.products.askbetter.name}
      accentTextClass="text-askbetter-accent"
      accentDotClass="bg-askbetter-accent"
      surfaceClass="bg-askbetter-surface"
      gradientClass="bg-gradient-askbetter"
      progressPercent={50}
      features={[
        t.products.askbetter.features.f1,
        t.products.askbetter.features.f2,
        t.products.askbetter.features.f3,
        t.products.askbetter.features.f4,
      ]}
      label={t.coming_soon.label}
      title={t.coming_soon.title}
      body={t.coming_soon.body}
      buildingMvp={t.coming_soon.building_mvp}
      backLabel={t.coming_soon.back}
    />
  )
}
