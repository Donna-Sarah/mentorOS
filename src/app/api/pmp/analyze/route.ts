import { NextRequest } from 'next/server'
import { analyzeWithClaude } from '@/lib/ai/provider'
import { PROMPT_M1, PROMPT_M2 } from '@/lib/ai/prompts/pmp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { question: string; mood: 'mood1' | 'mood2' }
    const { question, mood } = body

    if (!question || !mood) {
      return Response.json({ data: null, error: 'Missing question or mood' }, { status: 400 })
    }

    const systemPrompt = mood === 'mood1' ? PROMPT_M1 : PROMPT_M2
    const maxTokens = mood === 'mood1' ? 1500 : 1000

    const result = await analyzeWithClaude({ systemPrompt, userContent: question, maxTokens })

    if (result.error) {
      console.error('AI result error:', result.error)
      return Response.json({ data: null, error: result.error }, { status: 500 })
    }

    return Response.json({ data: result.data, error: null })
  } catch (err) {
    console.error('PMP analyze error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
