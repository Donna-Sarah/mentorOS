import type { Mood1Result, Mood1ResultV2, Mood2Result, Mood2ResultV2 } from '@/types/pmp'
import { getCoreRuleText, getTrapDisplayName } from '@/lib/pmp/taxonomy'

export function mood1V2ToV1Stub(v2: Mood1ResultV2): Mood1Result {
  return {
    response_type: v2.response_type,
    correct_count: v2.correct_answers.length,
    correct_answer: v2.correct_answer,
    correct_answers: v2.correct_answers,
    answer_verdict: {},
    anatomy: {
      role_anchor: '',
      situation: '',
      trigger_word: '',
      trigger_meaning: '',
      hidden_test: v2.hidden_test,
    },
    mindset: {
      vn_thinking: '',
      vn_reason: '',
      pmi_thinking: '',
      pmi_reason: '',
    },
    core_rule: getCoreRuleText(v2.core_rule_id, 'vi', v2.trap_subtype ?? undefined),
    trap: {
      category: 'Mindset Trap',
      name: getTrapDisplayName(v2.trap_id, 'en'),
      why_feels_right: '',
      domain: 'People',
      approach: 'All',
    },
  }
}

export function mood2V2ToV1(v2: Mood2ResultV2): Mood2Result {
  const traps: Mood2Result['traps'] = {}

  for (const [key, trapId] of Object.entries(v2.trap_ids)) {
    if (trapId === 'correct') {
      traps[key] = { bias: 'correct', explanation: v2.correct_parse }
    } else {
      traps[key] = {
        bias: getTrapDisplayName(trapId, 'en'),
        explanation: v2.why_trap_attractive[key] ?? '',
      }
    }
  }

  return {
    original_highlighted: v2.original_highlighted,
    correct_option: v2.correct_option,
    options: v2.options,
    traps,
    pmi_signal: v2.pmi_signal,
    compression_tip: v2.compression_tip,
  }
}
