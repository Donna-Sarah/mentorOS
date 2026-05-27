import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface AIAnalyzeParams {
  systemPrompt: string
  userContent: string
  maxTokens?: number
}

export interface AIAnalyzeResult {
  data: unknown
  error: string | null
}

export interface AIOCRParams {
  base64Image: string
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
  prompt: string
}

export async function analyzeWithClaude(params: AIAnalyzeParams): Promise<AIAnalyzeResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: params.maxTokens ?? 1500,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userContent }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    if (!clean.startsWith('{') && !clean.startsWith('[')) {
      console.error('AI response is not JSON:', clean.slice(0, 200))
      return { data: null, error: 'AI response was not valid JSON' }
    }

    const data = JSON.parse(clean)
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { data: null, error: message }
  }
}

export async function translateWithClaude(
  systemPrompt: string,
  userContent: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return { data: text.trim(), error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { data: null, error: message }
  }
}

export async function ocrWithClaude(params: AIOCRParams): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: params.mediaType,
            data: params.base64Image,
          },
        },
        { type: 'text', text: params.prompt },
      ],
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export { anthropic }
