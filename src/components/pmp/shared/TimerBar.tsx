'use client'

import { useEffect, useRef, useState } from 'react'

interface TimerBarProps {
  benchmark: number
  isActive: boolean
  onTick?: (seconds: number) => void
}

interface TimerVisualState {
  color: string
  message: string
}

function getTimerState(seconds: number, benchmark: number): TimerVisualState {
  const greenEnd = benchmark * 0.52
  const amberEnd = benchmark
  const orangeEnd = benchmark * 1.56

  if (seconds <= greenEnd) {
    return { color: '#10B981', message: 'Trong thời gian lý tưởng' }
  }
  if (seconds <= amberEnd) {
    return { color: '#F59E0B', message: 'Sắp hết thời gian khuyến nghị' }
  }
  if (seconds <= orangeEnd) {
    return { color: '#F97316', message: 'Đã vượt thời gian khuyến nghị' }
  }
  return { color: '#EF4444', message: 'Đang mất rất nhiều thời gian' }
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TimerBar({ benchmark, isActive, onTick }: TimerBarProps) {
  const [seconds, setSeconds] = useState(0)
  const onTickRef = useRef(onTick)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  onTickRef.current = onTick

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    setSeconds(0)
    onTickRef.current?.(0)

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1
        onTickRef.current?.(next)
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive])

  const { color, message } = getTimerState(seconds, benchmark)
  const fillPercent = Math.min((seconds / (benchmark * 1.56)) * 100, 100)

  return (
    <div className="flex w-full items-center gap-3">
      <span
        className="font-body text-body-sm font-bold tabular-nums"
        style={{ color }}
      >
        {formatElapsed(seconds)}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft-gray">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${fillPercent}%`, backgroundColor: color }}
        />
      </div>
      <span className="hidden font-body text-caption text-ash-text md:block">
        {message}
      </span>
    </div>
  )
}
