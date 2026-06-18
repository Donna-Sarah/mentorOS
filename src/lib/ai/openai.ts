function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, '')
}

export function getOpenAIApiKey(): string | null {
  const candidates = [
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_KEY,
  ]

  for (const raw of candidates) {
    if (!raw) continue
    const key = stripQuotes(raw.trim())
    if (!key || key === 'undefined' || key === 'null') continue
    return key
  }

  return null
}

export function hasOpenAIApiKey(): boolean {
  return Boolean(getOpenAIApiKey())
}
