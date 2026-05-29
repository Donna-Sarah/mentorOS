'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'

interface ExportModalProps {
  open: boolean
  jsonText: string
  onClose: () => void
}

export function ExportModal({ open, jsonText, onClose }: ExportModalProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback ignored for MVP
    }
  }

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[var(--z-index-modal)] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal
      aria-labelledby="nextup-export-title"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-[520px] flex-col gap-3.5 rounded-[var(--nu-radius)] border p-6"
        style={{
          borderColor: 'var(--nu-border2)',
          backgroundColor: 'var(--nu-bg2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            id="nextup-export-title"
            className="text-[14px] font-semibold"
            style={{ color: 'var(--nu-text)' }}
          >
            ↓ {t.nextup.export_title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-touch min-w-touch border-none bg-transparent text-[22px] leading-none"
            style={{ color: 'var(--nu-text3)' }}
            aria-label={t.common.close}
          >
            ×
          </button>
        </div>

        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--nu-text3)' }}>
          {t.nextup.export_hint}
        </p>

        <textarea
          readOnly
          value={jsonText}
          className="min-h-[240px] w-full flex-1 resize-none rounded-[var(--nu-radius-sm)] border p-3 font-mono text-[11px] outline-none"
          style={{
            borderColor: 'var(--nu-border)',
            backgroundColor: 'var(--nu-bg)',
            color: 'var(--nu-text2)',
          }}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex min-h-touch flex-1 items-center justify-center rounded-[var(--nu-radius-sm)] border font-semibold"
            style={{
              borderColor: 'var(--nu-gold)',
              backgroundColor: 'var(--nu-gold)',
              color: 'var(--nu-bg)',
            }}
          >
            {copied ? t.nextup.copy_done : t.nextup.copy_btn}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-touch rounded-[var(--nu-radius-sm)] border px-4 text-[13px]"
            style={{
              borderColor: 'var(--nu-border2)',
              backgroundColor: 'var(--nu-bg2)',
              color: 'var(--nu-text3)',
            }}
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  )
}
