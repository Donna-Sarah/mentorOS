export type PMPMood = 'mood1' | 'mood2'
export type ResponseType = 'single' | 'multiple'
export type QuestionSource = 'sample' | 'uploaded' | 'manual'
export type TrapCategory = 'Mindset Trap' | 'Terminology Trap' | 'Technical Trap' | 'Language Trap'
export type PMPDomain = 'People' | 'Process' | 'Business Environment'
export type PMPApproach = 'Agile' | 'Predictive' | 'Hybrid' | 'All'

export interface PMPQuestion {
  text: string
  options: Record<string, string>  // { A: '...', B: '...', C: '...', D: '...' }
  source: QuestionSource
  sampleId?: number
  tag?: string
}

export interface AnswerVerdict {
  correct: boolean
  explanation: string
}

export interface Mood1Result {
  response_type: ResponseType
  correct_count: number
  correct_answer: string
  correct_answers: string[]
  answer_verdict: Record<string, AnswerVerdict>
  anatomy: {
    role_anchor: string
    situation: string
    trigger_word: string
    trigger_meaning: string
    hidden_test: string
  }
  mindset: {
    vn_thinking: string
    vn_reason: string
    pmi_thinking: string
    pmi_reason: string
  }
  core_rule: string
  trap: {
    category: TrapCategory
    name: string
    why_feels_right: string
    domain: PMPDomain
    approach: PMPApproach
  }
}

export interface Mood2Option {
  bias: string
  explanation: string
}

export interface Mood2Result {
  original_highlighted: string
  correct_option: string
  options: Record<string, string>
  traps: Record<string, Mood2Option>
  pmi_signal: string
  compression_tip: string
}

export interface GlossaryEntry {
  id?: number
  pair: [string, string]
  diff: string
  trap: string
  detail: string
  example: string
}

export interface SampleQuestion {
  id?: number
  tag: string
  domain: string
  approach: string
  trap_type: string
  response_type: ResponseType
  question: string
  options: Record<string, string>
  full_text: string
}

export interface SampleAnswerEntry {
  sampleIndex: number
  tag: string
  analysis: Mood1Result
  translation: string
  generatedAt: string
}

export type SampleAnswersCache = Record<string, SampleAnswerEntry>

export interface PMPSession {
  id?: string
  user_id?: string
  question_text: string
  question_tag?: string
  question_source: QuestionSource
  sample_question_id?: number
  mood: PMPMood
  response_type: ResponseType
  user_answers: string[]
  correct_answers: string[]
  is_correct: boolean
  time_seconds: number
  ai_response: Mood1Result | Mood2Result
  trap_name?: string
  trap_category?: string
  trap_domain?: string
  trap_approach?: string
  core_rule?: string
  pmi_signal?: string
}

export interface TimerState {
  seconds: number
  isActive: boolean
  color: 'green' | 'amber' | 'orange' | 'red'
  message: string
}
