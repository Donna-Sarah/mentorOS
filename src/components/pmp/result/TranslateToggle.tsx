'use client'

import { useState } from 'react'

interface TranslateToggleProps {
  questionText: string
  onTranslated: (translated: string) => void
  isTranslated: boolean
  setIsTranslated: (v: boolean) => void
}

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
      className="fixed bottom-6 left-4 z-30 flex min-h-touch min-w-touch items-center gap-2 rounded-md border border-soft-gray bg-white-canvas px-4 py-2 font-body text-body-sm font-semibold text-midnight-ink shadow-modal hover:bg-amber-glow transition-colors"
    >
      {isLoading ? (
        <>
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-soft-gray border-t-pmp-accent"
            aria-hidden
          />
          Đang dịch...
        </>
      ) : isTranslated ? (
        <>🇬🇧 EN</>
      ) : (
        <>🇻🇳 VI</>
      )}
    </button>
  )
}

