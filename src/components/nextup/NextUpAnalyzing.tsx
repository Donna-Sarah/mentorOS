'use client'

import { useEffect, useState, type ReactElement } from 'react'
import type { NextUpTab } from '@/types/nextup'

export type NextUpAnalyzingMode = 'today' | 'tomorrow' | 'week' | 'plan'

export interface NextUpAnalyzingProps {
  mode: NextUpAnalyzingMode
}

const STEPS: Record<NextUpAnalyzingMode, string[]> = {
  today: [
    'Đọc kế hoạch tổng thể...',
    'Lọc việc có deadline hôm nay...',
    'Kiểm tra việc đã cập nhật...',
    'Xác định mức độ ưu tiên...',
    'Tổng hợp danh sách hôm nay...',
  ],
  tomorrow: [
    'Đọc kế hoạch tổng thể...',
    'Lọc việc có deadline ngày mai...',
    'Kiểm tra việc hôm nay chưa xong...',
    'Xác định mức độ ưu tiên...',
    'Tổng hợp danh sách ngày mai...',
  ],
  week: [
    'Đọc kế hoạch tổng thể...',
    'Phân tích nhật ký gần đây...',
    'Xác định việc có deadline trong tuần...',
    'Sắp xếp theo ngày...',
    'Tổng hợp kế hoạch tuần...',
  ],
  plan: [
    'Đọc nội dung kế hoạch...',
    'Phân tích các hạng mục...',
    'Nhóm theo chủ đề...',
    'Tạo cấu trúc phân loại...',
    'Hoàn tất kế hoạch tổng thể...',
  ],
}

const ICON_BY_MODE: Record<NextUpAnalyzingMode, string> = {
  today: '✦',
  tomorrow: '✦',
  week: '◈',
  plan: '❋',
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

export function tabToAnalyzingMode(tab: NextUpTab): NextUpAnalyzingMode {
  if (tab === 'tom') return 'tomorrow'
  if (tab === 'week') return 'week'
  return 'today'
}

export function NextUpAnalyzing({ mode }: NextUpAnalyzingProps): ReactElement {
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
      className="w-full px-4"
      style={{ backgroundColor: 'var(--nu-bg)' }}
      aria-live="polite"
      aria-busy
    >
      <div
        className="flex flex-col items-center"
        style={{ paddingTop: 80, paddingBottom: 80 }}
      >
        <span
          className="mb-8 text-[40px] leading-none"
          style={{
            color: 'var(--nu-gold)',
            animation: 'nu-pulse 1.4s ease-in-out infinite',
          }}
          aria-hidden
        >
          {ICON_BY_MODE[mode]}
        </span>

        <ul className="flex w-full max-w-[320px] flex-col gap-3">
          {steps.map((step, index) => {
            if (index > currentStep) return null

            const isDone = index < currentStep
            const isActive = index === currentStep
            const label = stripTrailingEllipsis(step)

            return (
              <li
                key={`${mode}-step-${index}`}
                className="flex items-start gap-2 text-[14px] leading-snug"
                style={{
                  animation: 'nu-step-in 400ms ease forwards',
                  color: isDone ? 'var(--nu-text3)' : 'var(--nu-text)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {isDone ? (
                  <span className="shrink-0" style={{ color: 'var(--nu-text3)' }} aria-hidden>
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
