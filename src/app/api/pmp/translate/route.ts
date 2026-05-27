import { NextRequest } from 'next/server'
import { analyzeWithClaude, translateWithClaude } from '@/lib/ai/provider'
import { PROMPT_TRANSLATE, PROMPT_M2_TRANSLATE } from '@/lib/ai/prompts/pmp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { text: string; mode: 'mood1' | 'mood2' }
    const { text, mode } = body

    if (!text || !mode) {
      return Response.json({ data: null, error: 'Missing text or mode' }, { status: 400 })
    }

    if (mode === 'mood1') {
      const result = await translateWithClaude(PROMPT_TRANSLATE, text)
      return Response.json({ data: result.data, error: result.error })
    }

    // mood2 — returns JSON
    const result = await analyzeWithClaude({
      systemPrompt: PROMPT_M2_TRANSLATE,
      userContent: text,
      maxTokens: 800,
    })

    if (result.error) {
      return Response.json({ data: null, error: result.error }, { status: 500 })
    }

    return Response.json({ data: result.data, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
