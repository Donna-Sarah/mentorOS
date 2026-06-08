import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithClaude } from '@/lib/ai/provider'
import { PROMPT_M1, PROMPT_M2, PROMPT_M1_V2, PROMPT_M2_V2 } from '@/lib/ai/prompts/pmp'
import type { Mood1ResultV2, Mood2ResultV2 } from '@/types/pmp'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const version = searchParams.get('v') ?? '1'
    const useV2 = version === '2'

    const body = await request.json() as {
      question: string
      mood: 'mood1' | 'mood2'
      selectedAnswer?: string
      isCorrect?: boolean
    }
    const { question, mood, selectedAnswer, isCorrect } = body

    if (!question || !mood) {
      return Response.json({ data: null, error: 'Missing question or mood' }, { status: 400 })
    }

    let systemPrompt: string
    if (mood === 'mood2') {
      systemPrompt = useV2 ? PROMPT_M2_V2 : PROMPT_M2
    } else {
      systemPrompt = useV2 ? PROMPT_M1_V2 : PROMPT_M1
    }

    // V2 output schema nhỏ hơn V1 đáng kể — không cần nhiều tokens
    const maxTokens = useV2
      ? mood === 'mood1'
        ? 800
        : 600
      : mood === 'mood1'
        ? 1500
        : 1000

    const userContent =
      useV2 && mood === 'mood1' && selectedAnswer
        ? `${question}\n\nUser selected answer: ${selectedAnswer}\n\n${
            typeof isCorrect === 'boolean'
              ? `Analyze why this answer is ${isCorrect ? 'correct' : 'incorrect'} according to PMI.`
              : 'Determine if this selection is correct according to PMI. user_answer_reason must explain why THIS selected option is wrong if incorrect.'
          }`
        : question

    const result = await analyzeWithClaude({ systemPrompt, userContent, maxTokens })

    if (result.error) {
      console.error('AI result error:', result.error)
      return Response.json({ data: null, error: result.error }, { status: 500 })
    }

    if (useV2) {
      if (mood === 'mood2') {
        return NextResponse.json({ data: result.data as Mood2ResultV2, error: null })
      }
      return NextResponse.json({ data: result.data as Mood1ResultV2, error: null })
    }

    return Response.json({ data: result.data, error: null })
  } catch (err) {
    console.error('PMP analyze error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
