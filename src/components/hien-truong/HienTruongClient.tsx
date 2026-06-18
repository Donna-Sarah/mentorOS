'use client'

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FileUpload } from '@/components/hien-truong/FileUpload'
import { APPS_SCRIPT_CODE, DEFAULT_SHEETS_URL } from '@/lib/hien-truong/constants'
import { mapAudioErrorMessage } from '@/lib/hien-truong/errors'
import {
  extensionForMime,
  extractTextFromFile,
  getSttPreference,
  hasMediaRecorder,
  mapMicError,
  markSttPreferenceWhisper,
  pickRecorderMimeType,
  shouldFallbackFromSpeechError,
  shouldSkipSpeechRecognition,
  type SttPreference,
} from '@/lib/hien-truong/mic'
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
  const [fileStatus, setFileStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [aiStatus, setAiStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [pushStatus, setPushStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [testStatus, setTestStatus] = useState<StatusMessage>({ type: '', msg: '' })
  const [guideOpen, setGuideOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [testing, setTesting] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaChunksRef = useRef<Blob[]>([])
  const speechStartedRef = useRef(false)
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speechFallbackRef = useRef(false)
  const [sttMode, setSttMode] = useState<SttPreference>('speech')

  useEffect(() => {
    setSttMode(getSttPreference())
  }, [])

  const resolveMicError = useCallback(
    (code: string): string => {
      if (code === 'permission_denied') return ht.mic_permission_denied
      if (code === 'not_found') return ht.mic_not_found
      return ht.mic_failed
    },
    [ht],
  )

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
      recognitionRef.current?.abort()
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop()
      }
      stopMediaStream()
    }
  }, [stopMediaStream])

  const finishMediaRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return

    setRecStatus({ type: 'loading', msg: ht.mic_transcribing })

    await new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        stopMediaStream()
        mediaRecorderRef.current = null
        setIsRecording(false)

        try {
          const mime = recorder.mimeType || 'audio/webm'
          const blob = new Blob(mediaChunksRef.current, { type: mime })
          mediaChunksRef.current = []

          if (blob.size < 1000) {
            setRecStatus({ type: 'error', msg: ht.mic_no_speech })
            resolve()
            return
          }

          const file = new File(
            [blob],
            `recording.${extensionForMime(mime)}`,
            { type: mime },
          )
          const { text } = await extractTextFromFile(file)
          setTextInput((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text))
          setRecStatus({ type: 'ok', msg: ht.record_done })
        } catch (err) {
          const message = err instanceof Error ? err.message : ''
          setRecStatus({
            type: 'error',
            msg: mapAudioErrorMessage(message, {
              notConfigured: ht.file_audio_unavailable,
              invalidKey: ht.file_audio_invalid_key,
              quotaExceeded: ht.file_audio_quota,
              amrUnsupported: ht.file_audio_amr,
              invalidFormat: ht.file_audio_format,
              generic: ht.mic_failed,
            }),
          })
        }

        resolve()
      }

      recorder.stop()
    })
  }, [ht, stopMediaStream])

  const startMediaRecording = useCallback(async () => {
    if (!hasMediaRecorder()) {
      setRecStatus({ type: 'error', msg: ht.mic_unsupported })
      return
    }

    setSttMode('whisper')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      mediaChunksRef.current = []

      const mimeType = pickRecorderMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        setIsRecording(false)
        stopMediaStream()
        setRecStatus({ type: 'error', msg: ht.mic_failed })
      }

      recorder.start()
      setIsRecording(true)
      setRecStatus({ type: 'info', msg: ht.listening })
    } catch (err) {
      setRecStatus({ type: 'error', msg: resolveMicError(mapMicError(err)) })
    }
  }, [ht, resolveMicError, stopMediaStream])

  const fallbackToWhisper = useCallback(async () => {
    if (speechFallbackRef.current) return
    speechFallbackRef.current = true
    markSttPreferenceWhisper()
    setSttMode('whisper')
    setRecStatus({ type: 'info', msg: ht.mic_fallback_whisper })

    if (!hasMediaRecorder()) {
      setRecStatus({ type: 'error', msg: ht.mic_unsupported })
      speechFallbackRef.current = false
      return
    }

    await startMediaRecording()
    speechFallbackRef.current = false
  }, [ht, startMediaRecording])

  const startSpeechRecognition = useCallback(
    (onUnavailable: () => void) => {
      const SR =
        window.SpeechRecognition ||
        (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
          .webkitSpeechRecognition

      if (!SR) {
        onUnavailable()
        return
      }

      setSttMode('speech')

      const recognition = new SR()
      recognition.lang = 'vi-VN'
      recognition.continuous = false
      recognition.interimResults = true
      recognitionRef.current = recognition
      speechStartedRef.current = false

      if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
      speechTimerRef.current = setTimeout(() => {
        if (!speechStartedRef.current) {
          recognition.abort()
          setIsRecording(false)
          onUnavailable()
        }
      }, 2500)

      let finalText = ''

      recognition.onstart = () => {
        speechStartedRef.current = true
        if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
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
        if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
        setIsRecording(false)

        if (event.error === 'aborted') return

        if (event.error === 'not-allowed') {
          setRecStatus({ type: 'error', msg: ht.mic_permission_denied })
          return
        }

        if (shouldFallbackFromSpeechError(event.error)) {
          onUnavailable()
          return
        }

        setRecStatus({ type: 'error', msg: `${ht.mic_error}: ${event.error}` })
      }

      recognition.onend = () => {
        if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
        setIsRecording(false)

        if (finalText.trim()) {
          setRecStatus({ type: 'ok', msg: ht.record_done })
          return
        }

        if (!speechStartedRef.current) {
          onUnavailable()
          return
        }

        setRecStatus({ type: 'error', msg: ht.mic_no_speech })
      }

      try {
        recognition.start()
      } catch {
        onUnavailable()
      }
    },
    [ht],
  )

  const toggleMic = useCallback(async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        await finishMediaRecording()
        return
      }
      recognitionRef.current?.stop()
      return
    }

    if (shouldSkipSpeechRecognition()) {
      await startMediaRecording()
      return
    }

    startSpeechRecognition(() => {
      void fallbackToWhisper()
    })
  }, [
    fallbackToWhisper,
    finishMediaRecording,
    isRecording,
    startMediaRecording,
    startSpeechRecognition,
  ])

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

  const testConnection = async () => {
    if (!sheetUrl.trim() || testing) return

    setTesting(true)
    setTestStatus({ type: 'loading', msg: ht.test_loading })

    try {
      const res = await fetch('/api/hien-truong/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: sheetUrl.trim() }),
      })
      const json = (await res.json()) as {
        data: { msg: string } | null
        error: string | null
      }

      if (!res.ok || json.error) {
        throw new Error(json.error ?? ht.test_error)
      }

      setTestStatus({ type: 'ok', msg: ht.test_ok })
    } catch {
      setTestStatus({ type: 'error', msg: ht.test_error })
    }

    setTesting(false)
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
        {sttMode === 'whisper' ? (
          <p className="mt-2 font-body text-caption normal-case tracking-normal text-ash-text">
            {ht.mic_whisper_hint}
          </p>
        ) : (
          <p className="mt-2 font-body text-caption normal-case tracking-normal text-ash-text">
            {ht.mic_speech_hint}
          </p>
        )}
        <StatusBar status={recStatus} />

        <hr className="my-4 border-soft-gray" />

        <FileUpload
          label={ht.file_label}
          pickImage={ht.pick_image}
          pickAudio={ht.pick_audio}
          imageHint={ht.image_hint}
          audioHint={ht.audio_hint}
          audioBrowseHint={ht.audio_browse_hint}
          audioWrongFile={ht.audio_wrong_file}
          desktopDropHint={ht.desktop_drop_hint}
          loadingImage={ht.file_loading_image}
          loadingAudio={ht.file_loading_audio}
          fileTooLargeImage={ht.file_too_large_image}
          fileTooLargeAudio={ht.file_too_large_audio}
          extractError={ht.file_extract_error}
          audioUnavailable={ht.file_audio_unavailable}
          audioInvalidKey={ht.file_audio_invalid_key}
          audioQuotaExceeded={ht.file_audio_quota}
          audioAmrUnsupported={ht.file_audio_amr}
          audioInvalidFormat={ht.file_audio_format}
          fileDoneImage={ht.file_done_image}
          fileDoneAudio={ht.file_done_audio}
          disabled={isRecording || analyzing}
          onExtracted={(text) => {
            setTextInput((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text))
          }}
          onStatus={setFileStatus}
        />
        <StatusBar status={fileStatus} />

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
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-soft-gray pb-3">
          <SectionLabel>{ht.sheets_label}</SectionLabel>
          <button
            type="button"
            onClick={() => setGuideOpen((open) => !open)}
            className="shrink-0 font-body text-body-sm text-brand-blue underline decoration-brand-blue/40 underline-offset-2 transition-colors hover:text-midnight-ink hover:decoration-midnight-ink/40"
            aria-expanded={guideOpen}
          >
            {ht.setup_guide}
          </button>
        </div>

        <p className="mb-1.5 font-body text-body-sm text-slate-text">{ht.sheets_url_label}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={sheetUrl}
            onChange={(event) => {
              setSheetUrl(event.target.value)
              if (testStatus.msg) setTestStatus({ type: '', msg: '' })
            }}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="min-w-0 flex-1 rounded-md border border-soft-gray bg-amber-glow/30 px-3 py-2 font-body text-body-sm text-midnight-ink outline-none focus:border-slate-text"
          />
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 sm:min-w-[88px]"
            disabled={!sheetUrl.trim() || testing}
            onClick={() => void testConnection()}
          >
            <span aria-hidden>📡</span>
            {ht.test_btn}
          </Button>
        </div>
        <StatusBar status={testStatus} />

        {guideOpen && (
          <div className="mt-4 border-t border-soft-gray pt-4">
            <p className="mb-3 font-body text-caption uppercase tracking-widest text-ash-text">
              {ht.guide_label}
            </p>
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
          </div>
        )}
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
    </div>
  )
}
