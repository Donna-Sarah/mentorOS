import { NextRequest } from 'next/server'
import { buildHienTruongSystemPrompt } from '@/lib/ai/prompts/hien-truong'
import { analyzeWithClaude } from '@/lib/ai/provider'
import type { InspectionRow } from '@/types/hien-truong'

interface AnalyzeRequestBody {
  text?: string
}

function isInspectionRow(value: unknown): value is InspectionRow {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return (
    typeof row.ngay === 'string' &&
    typeof row.dia_diem === 'string' &&
    typeof row.hang_muc === 'string' &&
    typeof row.hien_trang === 'string' &&
    typeof row.de_xuat === 'string' &&
    typeof row.nguoi_phu_trach === 'string' &&
    typeof row.ngay_hoan_thanh === 'string' &&
    typeof row.ghi_chu === 'string'
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    const text = body.text?.trim()

    if (!text) {
      return Response.json(
        { data: null, error: 'Missing text' },
        { status: 400 },
      )
    }

    const today = new Date().toLocaleDateString('vi-VN')
    const result = await analyzeWithClaude({
      systemPrompt: buildHienTruongSystemPrompt(today),
      userContent: text,
      maxTokens: 1200,
    })

    if (result.error || !result.data) {
      console.error('HienTruong analyze error:', result.error)
      return Response.json(
        { data: null, error: result.error ?? 'AI failed' },
        { status: 500 },
      )
    }

    if (!Array.isArray(result.data)) {
      return Response.json(
        { data: null, error: 'AI response was not an array' },
        { status: 500 },
      )
    }

    const rows = result.data.filter(isInspectionRow)
    if (!rows.length) {
      return Response.json(
        { data: null, error: 'No valid rows extracted' },
        { status: 500 },
      )
    }

    return Response.json({ data: { rows }, error: null })
  } catch (err) {
    console.error('HienTruong analyze route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
