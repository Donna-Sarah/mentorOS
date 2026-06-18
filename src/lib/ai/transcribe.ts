import OpenAI, { toFile } from 'openai'
import { getOpenAIApiKey } from '@/lib/ai/openai'
import { HIEN_TRUONG_ERRORS } from '@/lib/hien-truong/errors'
import {
  isInvalidFormatWhisperError,
  resolveWhisperUploadMeta,
  whisperUploadAttempts,
} from '@/lib/hien-truong/whisper-upload'

interface TranscribeInput {
  data: ArrayBuffer
  fileName: string
  mimeType: string
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = getOpenAIApiKey()
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function transcribeWithWhisper(
  input: TranscribeInput,
): Promise<{ data: string | null; error: string | null }> {
  const client = getOpenAIClient()
  if (!client) {
    console.error('[hien-truong] OPENAI_API_KEY is missing at runtime')
    return {
      data: null,
      error: HIEN_TRUONG_ERRORS.AUDIO_NOT_CONFIGURED,
    }
  }

  if (!input.data.byteLength) {
    return { data: null, error: 'File ghi âm trống' }
  }

  const resolved = resolveWhisperUploadMeta(input.fileName, input.mimeType, input.data)
  if ('error' in resolved) {
    return { data: null, error: resolved.error }
  }

  const buffer = Buffer.from(input.data)
  const attempts = whisperUploadAttempts(resolved)
  let lastError = 'Transcription failed'

  for (const attempt of attempts) {
    try {
      const file = await toFile(buffer, attempt.fileName, { type: attempt.mimeType })
      const result = await client.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'vi',
      })

      const text = result.text?.trim()
      if (!text) {
        return { data: null, error: 'Không nhận dạng được nội dung ghi âm' }
      }

      return { data: text, error: null }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Unknown error'

      lastError = message
      console.error('[hien-truong] Whisper attempt failed:', attempt.fileName, message)

      if (!isInvalidFormatWhisperError(message)) {
        break
      }
    }
  }

  return { data: null, error: lastError }
}
