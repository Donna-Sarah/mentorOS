import { NextRequest } from 'next/server'
import { analyzeWithClaude } from '@/lib/ai/provider'
import {
  NEXTUP_SYSTEM_PROMPT,
  buildTodayPrompt,
  buildTomorrowPrompt,
  buildWeekPrompt,
} from '@/lib/ai/prompts/nextup'
import type {
  NextUpGenResult,
  NextUpGenerateTasksResponse,
  NextUpGenerateWeekResponse,
  NextUpLog,
  NextUpTab,
} from '@/types/nextup'
import { getRecentLogKeys, todayKey, tomorrowKey } from '@/lib/nextup/dates'

interface GenerateRequestBody {
  tab: NextUpTab
  plan: string
  logs: Record<string, NextUpLog[]>
  done?: Record<number, boolean>
}

function formatTodayLogs(logs: NextUpLog[]): string {
  if (!logs.length) return 'Chưa có cập nhật hôm nay'
  return logs.map((l) => `- ${l.tm}: ${l.t}`).join('\n')
}

function formatDoneLogs(logs: NextUpLog[]): string {
  if (!logs.length) return 'Chưa có'
  return logs.map((l) => l.t).join(', ')
}

function formatRecentLogs(logs: Record<string, NextUpLog[]>): string {
  const keys = getRecentLogKeys(logs, 7)
  if (!keys.length) return 'Chưa có'
  return keys
    .map((k) => {
      const entries = logs[k] ?? []
      const text = entries.map((l) => l.t).join(', ')
      return `${k}: ${text || '(trống)'}`
    })
    .join('\n')
}

function buildUserPrompt(body: GenerateRequestBody): string {
  const plan = body.plan?.trim() || 'Chưa có'
  const today = todayKey()

  if (body.tab === 'today') {
    const todayLogs = body.logs[today] ?? []
    return buildTodayPrompt(today, plan, formatTodayLogs(todayLogs))
  }

  if (body.tab === 'tom') {
    const todayLogs = body.logs[today] ?? []
    return buildTomorrowPrompt(
      tomorrowKey(),
      plan,
      formatDoneLogs(todayLogs),
    )
  }

  return buildWeekPrompt(plan, formatRecentLogs(body.logs))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody
    const { tab, plan, logs } = body

    if (!tab || !['today', 'tom', 'week'].includes(tab)) {
      return Response.json(
        { data: null, error: 'Invalid tab' },
        { status: 400 },
      )
    }

    if (!logs || typeof logs !== 'object') {
      return Response.json(
        { data: null, error: 'Invalid logs' },
        { status: 400 },
      )
    }

    const userPrompt = buildUserPrompt({ tab, plan: plan ?? '', logs })
    const result = await analyzeWithClaude({
      systemPrompt: NEXTUP_SYSTEM_PROMPT,
      userContent: userPrompt,
      maxTokens: 4000,
    })

    if (result.error || !result.data) {
      console.error('NextUp generate error:', result.error)
      return Response.json(
        { data: null, error: result.error ?? 'AI failed' },
        { status: 500 },
      )
    }

    const parsed = result.data as
      | NextUpGenerateTasksResponse
      | NextUpGenerateWeekResponse

    const genResult: NextUpGenResult = {
      data: parsed,
      at: new Date().toLocaleString('vi-VN'),
    }

    return Response.json({ data: genResult, error: null })
  } catch (err) {
    console.error('NextUp generate route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
