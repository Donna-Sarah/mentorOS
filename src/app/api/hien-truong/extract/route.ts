import { NextRequest } from 'next/server'
import { PROMPT_OCR_HIEN_TRUONG } from '@/lib/ai/prompts/hien-truong'
import { ocrWithClaude } from '@/lib/ai/provider'
import { transcribeWithWhisper } from '@/lib/ai/transcribe'
import {
  getHienTruongFileKind,
  getMaxBytesForKind,
  guessAudioMimeType,
} from '@/lib/hien-truong/file-types'
import { resolveWhisperUploadMeta } from '@/lib/hien-truong/whisper-upload'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ data: null, error: 'No file provided' }, { status: 400 })
    }

    const kind = getHienTruongFileKind(file)
    if (!kind) {
      return Response.json(
        { data: null, error: 'Unsupported file type' },
        { status: 400 },
      )
    }

    const maxBytes = getMaxBytesForKind(kind)
    if (file.size > maxBytes) {
      return Response.json(
        {
          data: null,
          error:
            kind === 'image'
              ? 'Image too large (max 5MB)'
              : 'Audio too large (max 25MB)',
        },
        { status: 400 },
      )
    }

    let text = ''

    if (kind === 'image') {
      const arrayBuffer = await file.arrayBuffer()
      const base64Image = Buffer.from(arrayBuffer).toString('base64')
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        return Response.json({ data: null, error: 'Invalid image type' }, { status: 400 })
      }

      text = await ocrWithClaude({
        base64Image,
        mediaType,
        prompt: PROMPT_OCR_HIEN_TRUONG,
      })
    } else {
      const arrayBuffer = await file.arrayBuffer()
      const guessedMime = guessAudioMimeType(file.name, file.type)
      const resolved = resolveWhisperUploadMeta(file.name, guessedMime, arrayBuffer)

      if ('error' in resolved) {
        return Response.json({ data: null, error: resolved.error }, { status: 400 })
      }

      const result = await transcribeWithWhisper({
        data: arrayBuffer,
        fileName: resolved.fileName,
        mimeType: resolved.mimeType,
      })

      if (result.error || !result.data) {
        return Response.json(
          { data: null, error: result.error ?? 'Transcription failed' },
          { status: 500 },
        )
      }
      text = result.data
    }

    const trimmed = text.trim()
    if (!trimmed) {
      return Response.json(
        { data: null, error: 'No text extracted from file' },
        { status: 500 },
      )
    }

    return Response.json({ data: { text: trimmed, kind }, error: null })
  } catch (err) {
    console.error('HienTruong extract route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
