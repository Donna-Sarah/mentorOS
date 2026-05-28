'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PMPMood } from '@/types/pmp'

interface AnalyzingScreenProps {
  mood: PMPMood | null
}

const mood1Steps = [
  'Đang đọc câu hỏi...',
  'Phân tích trigger word và intent...',
  'So sánh PMI mindset vs VN reflex...',
  'Xác định bẫy tư duy...',
  'Tổng hợp Core Rule...',
  'Hoàn thiện phân tích...',
]

const mood2Steps = [
  'Đang đọc câu hỏi...',
  'Tạo mental compression options...',
  'Xác định PMI signal chain...',
  'Hoàn thiện...',
]

export default function AnalyzingScreen({ mood }: AnalyzingScreenProps) {
  const [step, setStep] = useState(0)
  const [dots, setDots] = useState('')

  const steps = useMemo(() => (mood === 'mood2' ? mood2Steps : mood1Steps), [mood])
  const icon = mood === 'mood2' ? '🔍' : '🧠'
  const progressPercent = ((step + 1) / steps.length) * 100

  useEffect(() => {
    setStep(0)
  }, [steps])

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, steps.length - 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [steps.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="mx-auto flex min-h-[calc(100vh-180px)] max-w-[640px] flex-col items-center justify-center px-4 py-12 md:px-6">
      <div className="mb-8 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-pmp-surface">
        <span className="text-3xl" aria-hidden>
          {icon}
        </span>
      </div>

      <p className="min-h-[28px] text-center font-body text-body font-semibold text-midnight-ink">
        {steps[step]}
        {dots}
      </p>

      <div className="mt-6 h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-soft-gray">
        <div
          className="h-full rounded-full bg-gradient-pmp"
          style={{
            width: `${progressPercent}%`,
            transition: 'width 5s ease-in-out',
          }}
        />
      </div>

      <p className="mt-8 max-w-[280px] text-center font-body text-body-sm text-ash-text">
        PMP AI Mentor đang phân tích theo logic PMI thật sự — không chỉ giải thích đáp án.
      </p>
    </section>
  )
}
