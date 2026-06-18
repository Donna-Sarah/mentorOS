const STT_PREFERENCE_KEY = 'hien-truong:stt-preference'

export type SttPreference = 'speech' | 'whisper'

export function hasSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(
    window.SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition,
  )
}

export function hasMediaRecorder(): boolean {
  return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined'
}

export function getSttPreference(): SttPreference {
  if (typeof window === 'undefined') return 'speech'
  try {
    return localStorage.getItem(STT_PREFERENCE_KEY) === 'whisper' ? 'whisper' : 'speech'
  } catch {
    return 'speech'
  }
}

export function markSttPreferenceWhisper(): void {
  try {
    localStorage.setItem(STT_PREFERENCE_KEY, 'whisper')
  } catch {
    // ignore storage errors
  }
}

/** Skip free SpeechRecognition only when unavailable or previously failed on this device. */
export function shouldSkipSpeechRecognition(): boolean {
  if (!hasSpeechRecognition()) return true
  return getSttPreference() === 'whisper'
}

export function pickRecorderMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ]

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }

  return ''
}

export function extensionForMime(mime: string): string {
  if (mime.includes('mp4')) return 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm'
}

export async function extractTextFromFile(
  file: File,
): Promise<{ text: string; kind: 'image' | 'audio' }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/hien-truong/extract', {
    method: 'POST',
    body: formData,
  })

  const payload = (await response.json()) as {
    data: { text: string; kind: 'image' | 'audio' } | null
    error: string | null
  }

  if (!response.ok || payload.error || !payload.data?.text) {
    throw new Error(payload.error ?? 'Extract failed')
  }

  return payload.data
}

export function mapMicError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'permission_denied'
    }
    if (error.name === 'NotFoundError') {
      return 'not_found'
    }
  }
  return 'generic'
}

const SPEECH_FALLBACK_ERRORS = new Set([
  'service-not-allowed',
  'network',
  'audio-capture',
  'language-not-supported',
])

export function shouldFallbackFromSpeechError(errorCode: string): boolean {
  return SPEECH_FALLBACK_ERRORS.has(errorCode)
}
