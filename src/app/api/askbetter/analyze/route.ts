import { NextRequest } from 'next/server'
import { analyzeWithClaude } from '@/lib/ai/provider'

interface AnalyzeRequestBody {
  query?: string
  systemPrompt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    const { query, systemPrompt } = body

    if (!query?.trim() || !systemPrompt?.trim()) {
      return Response.json(
        { data: null, error: 'Missing query or systemPrompt' },
        { status: 400 },
      )
    }

    const result = await analyzeWithClaude({
      systemPrompt,
      userContent: query.trim(),
      maxTokens: 1024,
    })

    if (result.error || !result.data) {
      console.error('AskBetter analyze error:', result.error)
      return Response.json(
        { data: null, error: result.error ?? 'AI failed' },
        { status: 500 },
      )
    }

    return Response.json({ data: result.data, error: null })
  } catch (err) {
    console.error('AskBetter analyze route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
