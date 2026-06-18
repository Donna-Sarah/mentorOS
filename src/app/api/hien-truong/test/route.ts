import { NextRequest } from 'next/server'
import { DEFAULT_SHEETS_URL } from '@/lib/hien-truong/constants'

interface TestRequestBody {
  sheetUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TestRequestBody
    const sheetUrl =
      body.sheetUrl?.trim() ||
      process.env.HIEN_TRUONG_SHEETS_URL?.trim() ||
      DEFAULT_SHEETS_URL

    const res = await fetch(sheetUrl, { method: 'GET' })
    const raw = await res.text()

    let payload: { ok?: boolean; msg?: string; error?: string } = {}
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
          error: payload.error ?? `Connection failed (${res.status})`,
        },
        { status: 502 },
      )
    }

    return Response.json({ data: { msg: payload.msg ?? 'Connected!' }, error: null })
  } catch (err) {
    console.error('HienTruong test route error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
