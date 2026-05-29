'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useLanguage } from '@/lib/i18n'
import { formatLogTime, todayKey } from '@/lib/nextup/dates'
import type { NextUpLog } from '@/types/nextup'

interface LogSectionProps {
  logs: NextUpLog[]
  disabled?: boolean
  onAddLog: (log: NextUpLog) => void
  onRemoveLog: (index: number) => void
}

export function LogSection({
  logs,
  disabled = false,
  onAddLog,
  onRemoveLog,
}: LogSectionProps) {
  const { t } = useLanguage()
  const [input, setInput] = useState('')

  const submitLog = (): void => {
    const text = input.trim()
    if (!text) return
    onAddLog({ t: text, tm: formatLogTime() })
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitLog()
    }
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    submitLog()
  }

  return (
    <section
      className="mb-4 rounded-[var(--nu-radius)] border p-5 transition-colors md:px-6"
      style={{ borderColor: 'var(--nu-border)', backgroundColor: 'var(--nu-bg1)' }}
    >
      <h2
        className="mb-4 text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--nu-text3)' }}
      >
        ✎ {t.nextup.log_section_title}
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.nextup.log_placeholder}
          className="min-h-touch flex-1 rounded-[var(--nu-radius-sm)] border px-3.5 outline-none transition-colors"
          style={{
            fontSize: '16px',
            borderColor: 'var(--nu-border)',
            backgroundColor: 'var(--nu-bg2)',
            color: 'var(--nu-text)',
          }}
        />
        <button
          type="submit"
          disabled={disabled}
          className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-[var(--nu-radius-sm)] border px-4 text-[18px] font-normal disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: 'var(--nu-gold)',
            backgroundColor: 'var(--nu-gold)',
            color: 'var(--nu-bg)',
          }}
          aria-label="+"
        >
          +
        </button>
      </form>

      <ul className="mt-2.5">
        {logs.length === 0 ? (
          <li className="py-2 text-[13px]" style={{ color: 'var(--nu-text3)' }}>
            {t.nextup.no_logs}
          </li>
        ) : (
          logs.map((log, index) => (
            <li
              key={`${todayKey()}-${log.tm}-${index}`}
              className="flex items-center gap-2.5 border-b py-1.5 text-[13px] last:border-b-0"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <span
                className="min-w-[38px] shrink-0 text-[11px] font-medium tabular-nums"
                style={{ color: 'var(--nu-text3)' }}
              >
                {log.tm}
              </span>
              <span className="min-w-0 flex-1" style={{ color: 'var(--nu-text)' }}>
                {log.t}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveLog(index)}
                className="min-h-touch min-w-touch shrink-0 border-none bg-transparent p-1 text-base leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{ color: 'var(--nu-text3)' }}
                aria-label={t.common.close}
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
