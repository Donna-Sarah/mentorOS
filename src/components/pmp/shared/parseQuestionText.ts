export function formatFullQuestionText(
  questionText: string,
  options: Record<string, string>,
): string {
  const optionLines = Object.entries(options).map(([key, value]) => `${key}. ${value}`)
  if (optionLines.length === 0) return questionText
  return `${questionText}\n${optionLines.join('\n')}`
}

export function parseTranslation(
  text: string,
  fallbackOptions: Record<string, string>,
): { question: string; options: Record<string, string> } {
  const lines = text.split('\n')
  const optionLines = lines.filter((line) => /^[A-D][.)]\s/.test(line.trim()))
  const questionLines = lines.filter((line) => !/^[A-D][.)]\s/.test(line.trim()) && line.trim())
  const options: Record<string, string> = {}

  optionLines.forEach((line) => {
    const match = line.trim().match(/^([A-D])[.)]\s(.+)/)
    if (match) options[match[1]] = match[2]
  })

  return {
    question: questionLines.join(' ').trim() || text,
    options: Object.keys(options).length > 0 ? options : fallbackOptions,
  }
}
