'use client'

import { useState } from 'react'

interface TranslateToggleProps {
  questionText: string
  onTranslated: (translated: string) => void
  isTranslated: boolean
  setIsTranslated: (v: boolean) => void
}

const inlineButtonClassName =
  'inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CA3AF]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export default function TranslateToggle({
  questionText,
  onTranslated,
  isTranslated,
  setIsTranslated,
}: TranslateToggleProps) {
  const [cachedTranslation, setCachedTranslation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    if (isTranslated) {
      setIsTranslated(false)
      return
    }

    if (cachedTranslation) {
      onTranslated(cachedTranslation)
      setIsTranslated(true)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/pmp/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questionText, mode: 'mood1' }),
      })

      const json = (await res.json()) as { data: string | null; error: string | null }
      if (json.error || !json.data) {
        console.error(json.error ?? 'Translation failed')
        return
      }

      setCachedTranslation(json.data)
      onTranslated(json.data)
      setIsTranslated(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={isLoading}
      className={inlineButtonClassName}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-pmp-accent"
            aria-hidden
          />
          Đang dịch...
        </>
      ) : isTranslated ? (
        '🇬🇧 EN'
      ) : (
        '🇻🇳 VI'
      )}
    </button>
  )
}
