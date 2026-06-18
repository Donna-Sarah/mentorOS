import { hasOpenAIApiKey } from '@/lib/ai/openai'

export const HIEN_TRUONG_ERRORS = {
  AUDIO_NOT_CONFIGURED: 'AUDIO_NOT_CONFIGURED',
} as const

export function isAudioNotConfiguredError(error: string | null | undefined): boolean {
  if (!error) return false
  return error === HIEN_TRUONG_ERRORS.AUDIO_NOT_CONFIGURED
}

export function mapAudioErrorMessage(
  error: string | null | undefined,
  messages: {
    notConfigured: string
    invalidKey: string
    quotaExceeded: string
    generic: string
  },
): string {
  if (!error) return messages.generic
  if (isAudioNotConfiguredError(error)) return messages.notConfigured

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

  return error.length > 120 ? messages.generic : error
}

export function getHienTruongServiceStatus() {
  return {
    audio: hasOpenAIApiKey(),
    image: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
  }
}
