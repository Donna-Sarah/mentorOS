import { hasOpenAIApiKey } from '@/lib/ai/openai'

export const HIEN_TRUONG_ERRORS = {
  AUDIO_NOT_CONFIGURED: 'AUDIO_NOT_CONFIGURED',
  AMR_UNSUPPORTED: 'AMR_UNSUPPORTED',
} as const

export function isAudioNotConfiguredError(error: string | null | undefined): boolean {
  if (!error) return false
  return error === HIEN_TRUONG_ERRORS.AUDIO_NOT_CONFIGURED
}

export function isAmrUnsupportedError(error: string | null | undefined): boolean {
  if (!error) return false
  return error === HIEN_TRUONG_ERRORS.AMR_UNSUPPORTED
}

export function mapAudioErrorMessage(
  error: string | null | undefined,
  messages: {
    notConfigured: string
    invalidKey: string
    quotaExceeded: string
    amrUnsupported: string
    invalidFormat: string
    generic: string
  },
): string {
  if (!error) return messages.generic
  if (isAudioNotConfiguredError(error)) return messages.notConfigured
  if (isAmrUnsupportedError(error)) return messages.amrUnsupported

  const lower = error.toLowerCase()
  if (
    lower.includes('quota') ||
    lower.includes('billing') ||
    lower.includes('insufficient')
  ) {
    return messages.quotaExceeded
  }
  if (
    lower.includes('incorrect api key') ||
    lower.includes('invalid api key')
  ) {
    return messages.invalidKey
  }
  if (lower.includes('invalid file format') || lower.includes('unsupported file')) {
    return messages.invalidFormat
  }

  return error.length > 120 ? messages.generic : error
}

export function getHienTruongServiceStatus() {
  return {
    audio: hasOpenAIApiKey(),
    image: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
  }
}
