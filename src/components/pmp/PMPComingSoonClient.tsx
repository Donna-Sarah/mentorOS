'use client'

import { ProductComingSoonShell } from '@/components/shared/ProductComingSoonShell'
import { useLanguage } from '@/hooks/useLanguage'

export function PMPComingSoonClient() {
  const { t } = useLanguage()

  return (
    <ProductComingSoonShell
      productName={t.products.pmp.name}
      accentTextClass="text-pmp-accent"
      accentDotClass="bg-pmp-accent"
      surfaceClass="bg-pmp-surface"
      gradientClass="bg-gradient-pmp"
      progressPercent={60}
      features={[
        t.products.pmp.features.f1,
        t.products.pmp.features.f2,
        t.products.pmp.features.f3,
        t.products.pmp.features.f4,
      ]}
      label={t.coming_soon.label}
      title={t.coming_soon.title}
      body={t.coming_soon.body}
      buildingMvp={t.coming_soon.building_mvp}
      backLabel={t.coming_soon.back}
    />
  )
}
