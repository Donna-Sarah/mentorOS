import { NextRequest } from 'next/server'
import { ocrWithClaude } from '@/lib/ai/provider'
import { PROMPT_OCR } from '@/lib/ai/prompts/pmp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return Response.json({ data: null, error: 'No image provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ data: null, error: 'Invalid image type' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const text = await ocrWithClaude({ base64Image, mediaType, prompt: PROMPT_OCR })

    return Response.json({ data: { text }, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
