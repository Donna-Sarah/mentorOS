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

export interface SampleAnswerV2Entry {
  sampleIndex: number
  tag: string
  analysisV2: Mood1ResultV2
  /** Pre-generated user_answer_reason keyed by norm answer (e.g. "B" or "A,D") */
  wrong_answer_reasons?: Record<string, string>
  generatedAt: string
}

export type SampleAnswersV2Cache = Record<string, SampleAnswerV2Entry>

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

// ============================================================
// V2 Types — Trap Taxonomy + Core Rule Library
// ============================================================

export type TrapDimension =
  | 'mindset'
  | 'reasoning'
  | 'reading'
  | 'process'
  | 'terminology'
  | 'internal'

export type TrapSubtype = 'neglected' | 'conflated' | 'negative_logic' | null

export type TrapId =
  | 'premature_escalation'
  | 'action_before_analysis'
  | 'trigger_word_error'
  | 'stakeholder_appeasement'
  | 'process_bypass'
  | 'role_confusion'
  | 'agile_command_reflex'
  | 'terminology_confusion'
  | 'conflict_avoidance'
  | 'unclear_or_mixed'

export type CoreRuleId =
  | 'resolve_lowest_level'
  | 'understand_before_act'
  | 'trigger_defines_logic'
  | 'first_is_sequence'
  | 'protect_the_process'
  | 'right_process_matters'
  | 'right_role_right_action'
  | 'enable_before_direct'
  | 'match_pmi_term'
  | 'address_conflict_directly'

export interface TrapEntry {
  trap_id: TrapId
  name_en: string
  name_vi: string
  dimension: TrapDimension
  subtypes: TrapSubtype[] | null
  standard_explanation_vi: string
  vn_context: string
  core_rule_id: CoreRuleId | null
}

export interface CoreRuleEntry {
  core_rule_id: CoreRuleId
  trap_id: TrapId
  trap_subtype: TrapSubtype
  rule_en: string
  rule_vi: string
}

export interface TrapTaxonomyFile {
  traps: TrapEntry[]
}

export interface CoreRuleFile {
  core_rules: CoreRuleEntry[]
}

// V2 Mood 1 AI output schema
// AI chỉ return IDs — frontend pull text từ trap-taxonomy.json và core-rules.json
export interface Mood1ResultV2 {
  is_correct: boolean
  response_type: ResponseType
  selected_answer: string
  correct_answer: string
  correct_answers: string[]
  trap_id: TrapId
  trap_subtype: TrapSubtype
  core_rule_id: CoreRuleId | null  // null khi trap_id = "unclear_or_mixed"
  trigger_signal: string       // VD: "NEXT + informal resolution failed"
  hidden_test: string          // VD: "PMI test escalation path, không phải conflict technique"
  user_answer_reason: string   // empty string "" khi is_correct = true
  correct_answer_reason: string
  vn_vs_pmi_one_line: string   // 1 câu contrast duy nhất
  contextual_note: string      // 1 câu AI generate gắn với context câu hỏi cụ thể
}

// V2 Mood 2 AI output schema
export interface Mood2ResultV2 {
  original_highlighted: string
  correct_option: string
  options: Record<string, string>
  trap_ids: Record<string, TrapId | 'correct'>
  trap_subtypes: Record<string, TrapSubtype>
  correct_parse: string        // VD: "Risk gap → NEXT → complete missing artifact first"
  why_trap_attractive: Record<string, string>  // Chỉ cho wrong options
  pmi_signal: string
  compression_tip: string
}
