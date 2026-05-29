import { NextRequest } from 'next/server'
import { analyzeWithClaude } from '@/lib/ai/provider'
import {
  NEXTUP_PARSE_PLAN_SYSTEM,
  buildParsePlanPrompt,
} from '@/lib/ai/prompts/nextup'
import type {
  NextUpParsePlanResponse,
  NextUpStructGroup,
} from '@/types/nextup'

function mapParseResponse(parsed: NextUpParsePlanResponse): NextUpStructGroup[] {
  return (parsed.groups ?? []).map((g) => ({
    g: g.name,
    icon: g.icon ?? '',
    items: (g.items ?? []).map((it) => ({
      l: it.label ?? '',
      v: it.value ?? '',
    })),
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string }
    const text = body.text?.trim()

    if (!text) {
      return Response.json(
        { struct: null, error: 'Missing text' },
        { status: 400 },
      )
    }

    const result = await analyzeWithClaude({
      systemPrompt: NEXTUP_PARSE_PLAN_SYSTEM,
      userContent: buildParsePlanPrompt(text),
      maxTokens: 4000,
    })

    if (result.error || !result.data) {
      console.error('NextUp parse-plan error:', result.error)
      return Response.json(
        { struct: null, error: result.error ?? 'AI failed' },
        { status: 500 },
      )
    }

    const parsed = result.data as NextUpParsePlanResponse
    const struct = mapParseResponse(parsed)

    return Response.json({ struct, error: null })
  } catch (err) {
    console.error('NextUp parse-plan route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ struct: null, error: message }, { status: 500 })
  }
}
