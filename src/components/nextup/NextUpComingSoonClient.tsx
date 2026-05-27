'use client'

import { ProductComingSoonShell } from '@/components/shared/ProductComingSoonShell'
import { useLanguage } from '@/hooks/useLanguage'

export function NextUpComingSoonClient() {
  const { t } = useLanguage()

  return (
    <ProductComingSoonShell
      productName={t.products.nextup.name}
      accentTextClass="text-nextup-accent"
      accentDotClass="bg-nextup-accent"
      surfaceClass="bg-nextup-surface"
      gradientClass="bg-gradient-nextup"
      progressPercent={45}
      features={[
        t.products.nextup.features.f1,
        t.products.nextup.features.f2,
        t.products.nextup.features.f3,
        t.products.nextup.features.f4,
      ]}
      label={t.coming_soon.label}
      title={t.coming_soon.title}
      body={t.coming_soon.body}
      buildingMvp={t.coming_soon.building_mvp}
      backLabel={t.coming_soon.back}
    />
  )
}
