'use client'

import type { CSSProperties, ReactElement, ReactNode } from 'react'

export interface AnalysisCardProps {
  icon: string
  title: string
  iconBg: string
  titleColor: string
  headerBg?: string
  headerStyle?: CSSProperties
  delayMs?: number
  children: ReactNode
  footer?: ReactNode
}

export function AnalysisCard({
  icon,
  title,
  iconBg,
  titleColor,
  headerBg,
  headerStyle,
  delayMs = 0,
  children,
  footer,
}: AnalysisCardProps): ReactElement {
  const headerMergedStyle: CSSProperties = {
    backgroundColor: headerBg ?? 'transparent',
    ...headerStyle,
  }

  return (
    <article
      className="ab-fade-up overflow-hidden rounded-md bg-white-canvas shadow-card"
      style={{
        animationDelay: `${delayMs}ms`,
        opacity: 0,
      }}
    >
      <div
        className="flex items-center gap-3 border-b border-soft-gray px-6 py-4 md:px-7"
        style={headerMergedStyle}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg"
          style={{ backgroundColor: iconBg }}
          aria-hidden
        >
          {icon}
        </span>
        <h3
          className="askbetter-heading text-[15px] font-bold leading-snug tracking-[-0.01em] md:text-[16px]"
          style={{ color: titleColor }}
        >
          {title}
        </h3>
      </div>

      <div className="px-6 py-6 font-body text-body-sm leading-[1.65] text-midnight-ink md:px-7 md:py-7">
        {children}
      </div>

      {footer ? (
        <div className="border-t border-soft-gray bg-white-canvas px-6 py-5 md:px-7 md:py-6">
          {footer}
        </div>
      ) : null}
    </article>
  )
}
