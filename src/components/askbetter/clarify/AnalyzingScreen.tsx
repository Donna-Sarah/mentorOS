'use client'

import { useEffect, useState, type ReactElement } from 'react'
import { useLanguage } from '@/lib/i18n'

export type AskBetterAnalyzingMode = 'round1' | 'round2'

interface AnalyzingScreenProps {
  mode: AskBetterAnalyzingMode
}

const STEPS: Record<AskBetterAnalyzingMode, string[]> = {
  round1: [
    'Đọc yêu cầu của bạn...',
    'Phát hiện điểm còn thiếu...',
    'Đánh giá mức độ rõ ràng...',
    'Xây dựng workflow tốt hơn...',
    'Soạn yêu cầu đã cải thiện...',
  ],
  round2: [
    'Đọc yêu cầu đã viết lại...',
    'So sánh với phiên bản trước...',
    'Đánh giá điểm đã cải thiện...',
    'Kiểm tra điểm còn thiếu...',
    'Tổng hợp feedback coaching...',
  ],
}

const STEP_INTERVAL_MS = 700

function stripTrailingEllipsis(text: string): string {
  return text.replace(/\.\.\.$/, '')
}

function BlinkingDots(): ReactElement {
  return (
    <span aria-hidden className="inline-flex">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            animation: 'nu-dot-blink 1.2s ease-in-out infinite',
            animationDelay: `${i * 200}ms`,
          }}
        >
          .
        </span>
      ))}
    </span>
  )
}

export function AnalyzingScreen({ mode }: AnalyzingScreenProps): ReactElement {
  const { t } = useLanguage()
  const steps = STEPS[mode]
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    setCurrentStep(0)
  }, [mode])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }, STEP_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [steps.length, mode])

  return (
    <section
      className="w-full rounded-md bg-white-canvas py-14 shadow-card md:py-16"
      aria-live="polite"
      aria-busy
      aria-label={t.askbetter.analyzing}
    >
      <div className="flex flex-col items-center px-4">
        <span
          className="mb-8 text-[40px] leading-none"
          style={{
            color: 'var(--ab-blue)',
            animation: 'nu-pulse 1.4s ease-in-out infinite',
          }}
          aria-hidden
        >
          ✦
        </span>

        <ul className="flex w-full max-w-[320px] flex-col gap-3">
          {steps.map((step, index) => {
            if (index > currentStep) return null

            const isDone = index < currentStep
            const isActive = index === currentStep
            const label = stripTrailingEllipsis(step)

            return (
              <li
                key={`${mode}-${index}`}
                className="flex items-start gap-2 text-[14px] leading-snug"
                style={{
                  animation: 'nu-step-in 400ms ease forwards',
                  color: isDone ? 'var(--ab-muted)' : 'var(--ab-text)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {isDone ? (
                  <span className="shrink-0" style={{ color: 'var(--ab-muted)' }} aria-hidden>
                    ✓
                  </span>
                ) : (
                  <span className="w-[14px] shrink-0" aria-hidden />
                )}
                <span>
                  {label}
                  {isActive ? <BlinkingDots /> : null}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
