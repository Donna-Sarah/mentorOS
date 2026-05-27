import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PMPSession } from '@/types/pmp'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json() as PMPSession

    const session = {
      user_id: user?.id ?? null,
      question_text: body.question_text,
      question_tag: body.question_tag ?? null,
      question_source: body.question_source,
      sample_question_id: body.sample_question_id ?? null,
      mood: body.mood,
      response_type: body.response_type,
      user_answers: body.user_answers,
      correct_answers: body.correct_answers,
      is_correct: body.is_correct,
      time_seconds: body.time_seconds,
      ai_response: body.ai_response,
      trap_name: body.trap_name ?? null,
      trap_category: body.trap_category ?? null,
      trap_domain: body.trap_domain ?? null,
      trap_approach: body.trap_approach ?? null,
      core_rule: body.core_rule ?? null,
      pmi_signal: body.pmi_signal ?? null,
    }

    const { data, error } = await supabase
      .from('pmp_sessions')
      .insert(session)
      .select()
      .single()

    if (error) {
      return Response.json({ data: null, error: error.message }, { status: 500 })
    }

    return Response.json({ data, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
