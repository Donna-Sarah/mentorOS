export interface Round1Result {
  clarity_score: number
  problem: string
  missing: string[]
  missing_detail: string
  workflow: string[]
  tools: { name: string; reason: string }[]
  better_request: string
}

export interface Round2Result {
  clarity_score: number
  improved: string[]
  still_vague: string[]
  next_suggestion: string
  is_ready: boolean
}

export interface AskBetterTask {
  id: number
  cat: 'write' | 'analyze' | 'comms' | 'plan' | 'learn'
  title: string
  desc: string
  example: string
}

export interface AskBetterCategory {
  id: 'all' | 'write' | 'analyze' | 'comms' | 'plan' | 'learn'
  label: string
}

export type AskBetterTab = 'clarify' | 'library'
