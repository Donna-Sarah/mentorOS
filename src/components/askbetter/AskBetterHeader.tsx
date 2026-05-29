'use client'

import type { ReactElement } from 'react'
import { useLanguage } from '@/lib/i18n'

export function AskBetterHeader(): ReactElement {
  const { t } = useLanguage()

  return (
    <header className="mb-8 text-center md:mb-10">
      <h1
        className="askbetter-heading text-[28px] font-extrabold tracking-tight md:text-[36px]"
        style={{
          background: 'var(--ab-grad)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {t.askbetter.page_title}
      </h1>
      <p className="mt-2 text-[15px] md:text-[16px]" style={{ color: 'var(--ab-muted)' }}>
        {t.askbetter.tagline}
      </p>
    </header>
  )
}
