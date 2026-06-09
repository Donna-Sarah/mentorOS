import { NextRequest } from 'next/server'
import { DEFAULT_SHEETS_URL } from '@/lib/hien-truong/constants'
import type { InspectionRow } from '@/types/hien-truong'

interface PushRequestBody {
  rows?: InspectionRow[]
  sheetUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PushRequestBody
    const rows = body.rows
    const sheetUrl =
      body.sheetUrl?.trim() ||
      process.env.HIEN_TRUONG_SHEETS_URL?.trim() ||
      DEFAULT_SHEETS_URL

    if (!rows?.length) {
      return Response.json(
        { data: null, error: 'No rows to push' },
        { status: 400 },
      )
    }

    const res = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    })

    const raw = await res.text()
    let payload: { ok?: boolean; added?: number; error?: string } = {}

    try {
      payload = JSON.parse(raw) as typeof payload
    } catch {
      return Response.json(
        { data: null, error: 'Invalid response from Google Sheets' },
        { status: 502 },
      )
    }

    if (!res.ok || !payload.ok) {
      return Response.json(
        {
          data: null,
          error: payload.error ?? `Sheets push failed (${res.status})`,
        },
        { status: 502 },
      )
    }

    return Response.json({
      data: { added: payload.added ?? rows.length },
      error: null,
    })
  } catch (err) {
    console.error('HienTruong push route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
