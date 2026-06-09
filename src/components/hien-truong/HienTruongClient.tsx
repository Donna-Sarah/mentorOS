'use client'

import { useCallback, useRef, useState, type ReactElement } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { APPS_SCRIPT_CODE, DEFAULT_SHEETS_URL } from '@/lib/hien-truong/constants'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils/cn'
import type { InspectionRow, StatusMessage } from '@/types/hien-truong'

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_HIEN_TRUONG_SHEETS_URL?.trim() || DEFAULT_SHEETS_URL

function StatusBar({ status }: { status: StatusMessage }): ReactElement {
  if (!status.msg) {
    return <div className="mt-2 min-h-[22px]" aria-hidden />
  }

  return (
    <div className="mt-2 flex min-h-[22px] items-center gap-2 font-body text-body-sm text-slate-text">
      {status.type === 'loading' && (
        <span
          className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-soft-gray border-t-slate-text"
          aria-hidden
        />
      )}
      {status.type === 'ok' && (
        <span className="text-success" aria-hidden>
          ✓
        </span>
      )}
      {status.type === 'error' && (
        <span className="text-error" aria-hidden>
          ✕
        </span>
      )}
      {status.type === 'info' && <span aria-hidden>ℹ</span>}
      <span>{status.msg}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <p className="mb-2 font-body text-caption uppercase tracking-widest text-ash-text">
      {children}
    </p>
  )
}

export function HienTruongClient(): ReactElement {
  const { t } = useLanguage()
  const ht = t.hienTruong

  const [rows, setRows] = useState<InspectionRow[]>([])
  const [textInput, setTextInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_URL)
  const [recStatus, setRecStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [aiStatus, setAiStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [pushStatus, setPushStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [copied, setCopied] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const toggleMic = useCallback(() => {
    const SR =
      window.SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition

    if (!SR) {
      setRecStatus({ type: 'error', msg: ht.mic_unsupported })
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SR()
    recognition.lang = 'vi-VN'
    recognition.continuous = false
    recognition.interimResults = true
    recognitionRef.current = recognition

    let finalText = ''

    recognition.onstart = () => {
      setIsRecording(true)
      setRecStatus({ type: 'info', msg: ht.listening })
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += `${event.results[i][0].transcript} `
        } else {
          interim = event.results[i][0].transcript
        }
      }
      setTextInput((finalText + interim).trim())
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false)
      setRecStatus({ type: 'error', msg: `${ht.mic_error}: ${event.error}` })
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (finalText.trim()) {
        setRecStatus({ type: 'ok', msg: ht.record_done })
      } else {
        setRecStatus({ type: '', msg: '' })
      }
    }

    recognition.start()
  }, [ht, isRecording])

  const analyze = useCallback(async () => {
    if (!textInput.trim() || analyzing) return

    setAnalyzing(true)
    setAiStatus({ type: 'loading', msg: ht.analyzing })

    try {
      const res = await fetch('/api/hien-truong/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      })
      const json = (await res.json()) as {
        data: { rows: InspectionRow[] } | null
        error: string | null
      }

      if (!res.ok || json.error || !json.data?.rows) {
        throw new Error(json.error ?? ht.analyze_error)
      }

      setRows((prev) => [...prev, ...json.data!.rows])
      setTextInput('')
      setAiStatus({
        type: 'ok',
        msg: ht.analyze_ok.replace('{n}', String(json.data.rows.length)),
      })
    } catch {
      setAiStatus({ type: 'error', msg: ht.analyze_error })
    }

    setAnalyzing(false)
  }, [analyzing, ht, textInput])

  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index))
  }

  const exportCSV = () => {
    const header = [
      'STT',
      'Ngày',
      'Địa điểm',
      'Hạng mục',
      'Hiện trạng',
      'Đề xuất',
      'Người phụ trách',
      'Ngày hoàn thành',
      'Ghi chú',
    ]
    const csvRows = [header.join(',')]
    rows.forEach((row, index) => {
      const vals = [
        index + 1,
        row.ngay,
        row.dia_diem,
        row.hang_muc,
        row.hien_trang,
        row.de_xuat,
        row.nguoi_phu_trach,
        row.ngay_hoan_thanh,
        row.ghi_chu,
      ]
      csvRows.push(
        vals.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','),
      )
    })

    const blob = new Blob([`\uFEFF${csvRows.join('\r\n')}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = `hientruong_${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
  }

  const pushToSheets = async () => {
    if (!sheetUrl.trim()) {
      setPushStatus({ type: 'error', msg: ht.sheets_url_required })
      return
    }
    if (!rows.length) return

    setPushStatus({
      type: 'loading',
      msg: ht.pushing.replace('{n}', String(rows.length)),
    })

    try {
      const res = await fetch('/api/hien-truong/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, sheetUrl: sheetUrl.trim() }),
      })
      const json = (await res.json()) as {
        data: { added: number } | null
        error: string | null
      }

      if (!res.ok || json.error) {
        throw new Error(json.error ?? ht.push_error)
      }

      setPushStatus({
        type: 'ok',
        msg: ht.push_ok.replace('{n}', String(json.data?.added ?? rows.length)),
      })
    } catch {
      setPushStatus({ type: 'error', msg: ht.push_error })
    }
  }

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = APPS_SCRIPT_CODE
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-6">
        <h1 className="font-display text-heading-sm font-bold text-midnight-ink md:text-heading">
          {ht.page_title}
        </h1>
        <p className="mt-1 font-body text-body-sm text-slate-text">{ht.tagline}</p>
      </header>

      <Card className="mb-3 border border-soft-gray">
        <SectionLabel>{ht.voice_label}</SectionLabel>
        <button
          type="button"
          onClick={toggleMic}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-body text-body font-semibold transition-opacity',
            isRecording
              ? 'animate-pulse bg-error text-white-canvas'
              : 'bg-obsidian text-white-canvas hover:opacity-90',
          )}
        >
          <span className="text-lg" aria-hidden>
            {isRecording ? '⏹' : '🎙'}
          </span>
          {isRecording ? ht.stop_recording : ht.start_recording}
        </button>
        <StatusBar status={recStatus} />

        <hr className="my-4 border-soft-gray" />

        <SectionLabel>{ht.text_label}</SectionLabel>
        <textarea
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder={ht.input_placeholder}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
              void analyze()
            }
          }}
          className="min-h-[90px] w-full resize-y rounded-md border border-soft-gray bg-white-canvas px-3 py-2 font-body text-body-sm leading-relaxed text-midnight-ink outline-none focus:border-slate-text"
        />
        <p className="mt-1 font-body text-caption normal-case tracking-normal text-ash-text">
          {ht.shortcut_hint}
        </p>

        <Button
          variant="ghost"
          className="mt-3 w-full"
          disabled={!textInput.trim() || analyzing}
          onClick={() => void analyze()}
        >
          {analyzing ? ht.analyzing_btn : ht.analyze_btn}
        </Button>
        <StatusBar status={aiStatus} />
      </Card>

      <Card className="mb-3 border border-soft-gray">
        <SectionLabel>{ht.sheets_label}</SectionLabel>
        <p className="mb-1 font-body text-body-sm text-slate-text">{ht.sheets_url_label}</p>
        <input
          type="text"
          value={sheetUrl}
          onChange={(event) => setSheetUrl(event.target.value)}
          placeholder="https://script.google.com/macros/s/.../exec"
          className="w-full rounded-md border border-soft-gray bg-white-canvas px-3 py-2 font-body text-body-sm text-midnight-ink outline-none focus:border-slate-text"
        />
        <p className="mt-1 font-body text-caption normal-case tracking-normal text-ash-text">
          {ht.sheets_hint}
        </p>
      </Card>

      <Card className="mb-3 border border-soft-gray">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionLabel>
            {ht.data_label.replace('{n}', String(rows.length))}
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" disabled={!rows.length} onClick={exportCSV}>
              {ht.export_csv}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!rows.length || !sheetUrl.trim()}
              onClick={() => void pushToSheets()}
            >
              {ht.push_sheets}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!rows.length}
              onClick={() => {
                setRows([])
                setPushStatus({ type: '', msg: '' })
              }}
            >
              {ht.clear_all}
            </Button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="py-10 text-center font-body text-body-sm text-ash-text">
            <div className="mb-2 text-3xl" aria-hidden>
              📋
            </div>
            {ht.empty_state}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-soft-gray">
            <table className="min-w-[860px] w-full border-collapse font-body text-body-sm">
              <thead>
                <tr className="bg-amber-glow">
                  {ht.table_headers.map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap border-b border-soft-gray px-2 py-2 text-left font-semibold text-caption uppercase tracking-wide text-ash-text"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="border-b border-soft-gray px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="even:bg-amber-glow/40">
                    <td className="border-b border-soft-gray px-2 py-2 text-ash-text">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap border-b border-soft-gray px-2 py-2">
                      {row.ngay || '—'}
                    </td>
                    <td className="border-b border-soft-gray px-2 py-2">
                      {row.dia_diem || '—'}
                    </td>
                    <td className="border-b border-soft-gray px-2 py-2">
                      {row.hang_muc || '—'}
                    </td>
                    <td className="border-b border-soft-gray px-2 py-2">
                      {row.hien_trang || '—'}
                    </td>
                    <td className="border-b border-soft-gray px-2 py-2">
                      {row.de_xuat || '—'}
                    </td>
                    <td className="whitespace-nowrap border-b border-soft-gray px-2 py-2">
                      {row.nguoi_phu_trach || '—'}
                    </td>
                    <td className="whitespace-nowrap border-b border-soft-gray px-2 py-2">
                      {row.ngay_hoan_thanh || '—'}
                    </td>
                    <td className="border-b border-soft-gray px-2 py-2">
                      {row.ghi_chu && row.ghi_chu !== '—' ? (
                        <span
                          className="block max-w-[130px] truncate italic text-slate-text"
                          title={row.ghi_chu}
                        >
                          {row.ghi_chu}
                        </span>
                      ) : (
                        <span className="text-ash-text">—</span>
                      )}
                    </td>
                    <td className="border-b border-soft-gray px-2 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="min-h-0 min-w-0 px-2 py-1"
                        onClick={() => deleteRow(index)}
                        aria-label={ht.delete_row}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <StatusBar status={pushStatus} />
      </Card>

      <Card className="border border-soft-gray">
        <SectionLabel>{ht.guide_label}</SectionLabel>
        <ol className="list-decimal space-y-1 pl-5 font-body text-body-sm leading-relaxed text-slate-text">
          <li>{ht.guide_step1}</li>
          <li>{ht.guide_step2}</li>
          <li>{ht.guide_step3}</li>
          <li>{ht.guide_step4}</li>
          <li>{ht.guide_step5}</li>
        </ol>
        <div className="relative mt-3 rounded-md bg-amber-glow p-3">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => void copyScript()}
          >
            {copied ? ht.copy_done : ht.copy_btn}
          </Button>
          <pre className="overflow-x-auto pr-16 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-midnight-ink">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </Card>
    </div>
  )
}
