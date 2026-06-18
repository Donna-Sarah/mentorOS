import { getOpenAIApiKey } from '@/lib/ai/openai'
import { HIEN_TRUONG_ERRORS } from '@/lib/hien-truong/errors'

interface TranscribeInput {
  data: ArrayBuffer
  fileName: string
  mimeType: string
}

function whisperFileName(fileName: string, mimeType: string): string {
  const base = fileName.trim() || 'recording'
  if (/\.[a-z0-9]+$/i.test(base)) return base

  if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return `${base}.mp3`
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return `${base}.m4a`
  if (mimeType.includes('wav')) return `${base}.wav`
  if (mimeType.includes('ogg')) return `${base}.ogg`
  return `${base}.webm`
}

export async function transcribeWithWhisper(
  input: TranscribeInput,
): Promise<{ data: string | null; error: string | null }> {
  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    console.error('[hien-truong] OPENAI_API_KEY is missing at runtime')
    return {
      data: null,
      error: HIEN_TRUONG_ERRORS.AUDIO_NOT_CONFIGURED,
    }
  }

  try {
    const fileName = whisperFileName(input.fileName, input.mimeType)
    const mimeType = input.mimeType || 'application/octet-stream'
    const uploadFile = new File([input.data], fileName, { type: mimeType })

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('model', 'whisper-1')
    formData.append('language', 'vi')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    })

    const raw = await response.text()
    let payload: { text?: string; error?: { message?: string } } = {}

    try {
      payload = JSON.parse(raw) as typeof payload
    } catch {
      console.error('[hien-truong] Whisper non-JSON response:', raw.slice(0, 200))
      return {
        data: null,
        error: `Whisper failed (${response.status})`,
      }
    }

    if (!response.ok) {
      const message = payload.error?.message ?? `Whisper failed (${response.status})`
      console.error('[hien-truong] Whisper error:', message)
      return {
        data: null,
        error: message,
      }
    }

    const text = payload.text?.trim()
    if (!text) {
      return { data: null, error: 'Không nhận dạng được nội dung ghi âm' }
    }

    return { data: text, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[hien-truong] Whisper request failed:', message)
    return { data: null, error: message }
  }
}
