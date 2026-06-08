'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { AnswerVerdict, Mood1Result, Mood1ResultV2, PMPQuestion } from '@/types/pmp'
import { getCoreRuleText, getTrap, getTrapDisplayName } from '@/lib/pmp/taxonomy'
import { cn } from '@/lib/utils/cn'
import HighlightedText from '@/components/pmp/shared/HighlightedText'
import GlossaryTooltip from '@/components/pmp/shared/GlossaryTooltip'
import LangToggle from '@/components/pmp/shared/LangToggle'
import { formatFullQuestionText, parseTranslation } from '@/components/pmp/shared/parseQuestionText'

interface LessonScreenProps {
  question: PMPQuestion
  result: Mood1Result
  resultV2?: Mood1ResultV2
  userAnswers: string[]
  elapsedSeconds: number
  onReset: () => void
  onBack: () => void
  onOpenGlossary?: (index: number) => void
  cachedTranslation?: string | null
}

interface CollapsibleSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  accent?: string
  isFirst?: boolean
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  accent,
  isFirst = false,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className={cn('lesson-section', !isFirst && 'border-t border-[#F3F4F6]')}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-0 py-5 text-left transition-opacity hover:opacity-80 print:pointer-events-none print:cursor-default"
      >
        <div className="flex items-center gap-3">
          {accent ? (
            <span className="h-5 w-1 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
          ) : null}
          <span className="font-body text-[15px] font-semibold text-[#111111]">{title}</span>
        </div>
        <div className="print:hidden" aria-hidden>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={cn('transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="#2563EB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      <div className={cn('pb-8 pt-0', isExpanded ? 'block' : 'hidden print:block')}>{children}</div>
    </div>
  )
}

function formatMmSs(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const headerButtonClassName =
  'inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB]'

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 7a6 6 0 1 0 1.5-3.9M1 3v3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** html2canvas (via html2pdf) cannot parse Tailwind v4 oklab/oklch/color-mix in stylesheets. */
function stripUnsupportedColorFunctions(doc: Document) {
  doc.querySelectorAll('style').forEach((node) => {
    if (!node.textContent) return
    node.textContent = node.textContent
      .replace(/oklab\([^;)}]+\)/gi, '#6b7280')
      .replace(/oklch\([^;)}]+\)/gi, '#6b7280')
      .replace(/color-mix\([^;)}]+\)/gi, 'transparent')
  })
}

function getTimerState(seconds: number, benchmark: number): { color: string; message: string } {
  const greenEnd = benchmark * 0.52
  const amberEnd = benchmark
  const orangeEnd = benchmark * 1.56

  if (seconds <= greenEnd) return { color: '#10B981', message: 'Trong thời gian lý tưởng' }
  if (seconds <= amberEnd) return { color: '#F59E0B', message: 'Sắp hết thời gian khuyến nghị' }
  if (seconds <= orangeEnd) return { color: '#F97316', message: 'Đã vượt thời gian khuyến nghị' }
  return { color: '#EF4444', message: 'Đang mất rất nhiều thời gian' }
}

const v2SectionLabelClass =
  'mb-2 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]'

export default function LessonScreen({
  question,
  result,
  resultV2,
  userAnswers,
  elapsedSeconds,
  onReset,
  onBack,
  onOpenGlossary,
  cachedTranslation = null,
}: LessonScreenProps) {
  const isV2 = !!resultV2
  const v2 = resultV2
  const [isTranslated, setIsTranslated] = useState(false)
  const [translateCache, setTranslateCache] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState<string>('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [tooltipTerm, setTooltipTerm] = useState<{
    term: string
    idx: number
    rect: DOMRect
  } | null>(null)
  const [expanded, setExpanded] = useState({
    verdict: true,
    anatomy: false,
    mindset: false,
    core_rule: true,
    trap: false,
  })
  const lessonRef = useRef<HTMLDivElement>(null)
  const html2pdfRef = useRef<null | (() => { set: (opt: unknown) => { from: (el: HTMLElement) => { save: () => Promise<void> } } })>(null)
  const isPreloadingRef = useRef(false)
  const reportTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setIsTranslated(false)
    setTranslateCache(null)
    setIsTranslating(false)
  }, [question])

  const displayContent = useMemo(() => {
    const fallbackOptions = question.options ?? {}

    if (!isTranslated) {
      return { questionText: question.text, options: fallbackOptions }
    }

    const translatedSource = translateCache ?? cachedTranslation
    if (translatedSource) {
      const parsed = parseTranslation(translatedSource, fallbackOptions)
      return { questionText: parsed.question, options: parsed.options }
    }

    return { questionText: question.text, options: fallbackOptions }
  }, [isTranslated, translateCache, cachedTranslation, question])

  const displayOptions = useMemo(
    () => Object.entries(displayContent.options),
    [displayContent.options],
  )

  useEffect(() => {
    if (html2pdfRef.current || isPreloadingRef.current) return
    isPreloadingRef.current = true
    void import('html2pdf.js')
      .then((m) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        html2pdfRef.current = (m as unknown as { default?: unknown }).default as typeof html2pdfRef.current
      })
      .catch((err) => {
        console.error('Failed to preload html2pdf.js', err)
      })
  }, [])

  const toggle = (key: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const isCorrect = useMemo(() => {
    const a = [...userAnswers].sort().join(',')
    const b = [...result.correct_answers].sort().join(',')
    return a === b
  }, [result.correct_answers, userAnswers])

  async function handleTranslate() {
    if (isTranslating) return

    if (isTranslated) {
      setIsTranslated(false)
      return
    }

    if (cachedTranslation) {
      setTranslateCache(cachedTranslation)
      setIsTranslated(true)
      return
    }

    if (translateCache) {
      setIsTranslated(true)
      return
    }

    setIsTranslating(true)
    try {
      const fullText = formatFullQuestionText(question.text, question.options ?? {})
      const res = await fetch('/api/pmp/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, mode: 'mood1' }),
      })
      const json = (await res.json()) as { data: string | null; error: string | null }
      if (json.error || !json.data) {
        console.error(json.error ?? 'Translation failed')
        return
      }
      setTranslateCache(json.data)
      setIsTranslated(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsTranslating(false)
    }
  }

  async function handleExportPDF() {
    if (!lessonRef.current || isExporting) return
    // TODO: V2 PDF — Prompt 4 (dedicated full breakdown layout; currently exports rendered V2 DOM)
    setIsExporting(true)
    setExportError(null)

    if (!isV2) {
    setExpanded({
      verdict: true,
      anatomy: true,
      mindset: true,
      core_rule: true,
      trap: true,
    })
    }

    try {
      // Wait 1 frame for expanded DOM to render (keeps download closer to the click gesture)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

      const html2pdf = html2pdfRef.current
      if (!html2pdf) {
        setExportError('PDF exporter chưa sẵn sàng. Thử bấm lại sau 1 giây.')
        return
      }

      const questionPreview = question.text
        .slice(0, 60)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
      const filename = `PMP_Lesson_${questionPreview}.pdf`

      await html2pdf()
        .set({
          margin: [12, 14, 12, 14],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            letterRendering: true,
            windowWidth: 800,
            onclone: (clonedDoc: Document) => {
              stripUnsupportedColorFunctions(clonedDoc)
            },
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true,
          },
          // html2pdf.js supports `pagebreak`, but the DefinitelyTyped options type
          // doesn't include it. Keep runtime behavior while satisfying TS.
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        } as unknown as Record<string, unknown>)
        .from(lessonRef.current)
        .save()
    } catch (err) {
      console.error('PDF export failed:', err)
      setExportError('Xuất PDF thất bại. Mở Console để xem chi tiết lỗi.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleReport() {
    // TODO: Send to Supabase pmp_reports table when ready
    console.log('Report submitted:', {
      questionTag: question.tag,
      questionText: question.text.slice(0, 100),
      reportType,
      timestamp: new Date().toISOString(),
      sampleId: question.sampleId,
      source: question.source,
    })
    setReportSubmitted(true)

    if (reportTimerRef.current) {
      window.clearTimeout(reportTimerRef.current)
    }
    reportTimerRef.current = window.setTimeout(() => {
      setShowReportModal(false)
      setReportSubmitted(false)
      setReportType('')
      reportTimerRef.current = null
    }, 2500)
  }

  const verdictAccent = isCorrect ? '#10B981' : '#EF4444'
  const benchmarkSeconds = 25
  const timerState = getTimerState(elapsedSeconds, benchmarkSeconds)
  const fillPercent = Math.min((elapsedSeconds / (benchmarkSeconds * 1.56)) * 100, 100)

  function handleTermClick(term: string, idx: number, rect: DOMRect) {
    setTooltipTerm({ term, idx, rect })
  }

  function renderV2Content() {
    if (!v2) return null

    const coreRuleText = getCoreRuleText(v2.core_rule_id, 'vi', v2.trap_subtype ?? undefined)
    const trapEntry = getTrap(v2.trap_id)

    if (v2.is_correct) {
      return (
        <div className="v2-lesson-content space-y-8 pt-4">
          <div>
            <div className={v2SectionLabelClass}>Signal bạn đã nhận ra</div>
            <p className="mb-3 font-body text-[13px] leading-[1.7] text-[#6B7280]">{v2.trigger_signal}</p>
            <p className="font-body text-[15px] font-semibold leading-[1.75] text-[#111111]">{v2.hidden_test}</p>
          </div>

          <div>
            <div className={v2SectionLabelClass}>Tại sao đúng</div>
            <p className="font-body text-[15px] leading-[1.75] text-[#374151]">{v2.correct_answer_reason}</p>
          </div>

          <div className="rounded-r-md border-l-4 border-[#F59E0B] bg-[#FFFBEB] px-4 py-3">
            <div className={v2SectionLabelClass}>VN vs PMI</div>
            <p className="font-body text-[15px] leading-[1.75] text-[#374151]">{v2.vn_vs_pmi_one_line}</p>
          </div>

          {v2.core_rule_id && coreRuleText ? (
            <div className="core-rule-content py-6 text-center md:py-8">
              <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                CORE RULE
              </div>
              <div className="mx-auto max-w-[480px] font-display text-[28px] font-medium leading-[1.35] tracking-[-0.03em] text-[#111111] md:text-[36px] print:text-[22px]">
                {coreRuleText}
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <div className="v2-lesson-content space-y-8 pt-4">
        <div>
          <div className={v2SectionLabelClass}>Bẫy bạn đã mắc</div>
          <p className="font-body text-[16px] font-bold text-[#111111]">
            {getTrapDisplayName(v2.trap_id, 'en')}
          </p>
          {trapEntry?.standard_explanation_vi ? (
            <p className="mt-2 font-body text-[14px] leading-[1.75] text-[#6B7280]">
              {trapEntry.standard_explanation_vi}
            </p>
          ) : null}
          {v2.contextual_note ? (
            <p className="mt-3 font-body text-[14px] italic leading-[1.75] text-[#D97706]">
              {v2.contextual_note}
            </p>
          ) : null}
        </div>

        <div>
          <div className={v2SectionLabelClass}>Signal bạn đã bỏ qua</div>
          <p className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            TRIGGER SIGNAL
          </p>
          <p className="mb-4 font-body text-[13px] leading-[1.7] text-[#6B7280]">{v2.trigger_signal}</p>
          <p className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            PMI THỰC SỰ TEST GÌ
          </p>
          <p className="font-body text-[15px] font-semibold leading-[1.75] text-[#111111]">{v2.hidden_test}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className={v2SectionLabelClass}>Đáp án của bạn vs PMI</div>
            <p className="mb-1 font-body text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
              BẠN CHỌN {v2.selected_answer}
            </p>
            <p className="font-body text-[14px] leading-[1.75] text-[#6B7280]">{v2.user_answer_reason}</p>
          </div>
          <div>
            <p className="mb-1 font-body text-[12px] font-semibold uppercase tracking-wide text-[#374151]">
              ĐÁP ÁN ĐÚNG {v2.correct_answer}
            </p>
            <p className="font-body text-[15px] leading-[1.75] text-[#374151]">{v2.correct_answer_reason}</p>
          </div>
        </div>

        <div className="rounded-r-md border-l-4 border-[#F59E0B] bg-[#FFFBEB] px-4 py-3">
          <div className={v2SectionLabelClass}>VN vs PMI</div>
          <p className="font-body text-[15px] leading-[1.75] text-[#374151]">{v2.vn_vs_pmi_one_line}</p>
        </div>

        {v2.core_rule_id && coreRuleText ? (
          <div className="core-rule-content py-6 text-center md:py-8">
            <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              CORE RULE
            </div>
            <div className="mx-auto max-w-[480px] font-display text-[28px] font-medium leading-[1.35] tracking-[-0.03em] text-[#111111] md:text-[36px] print:text-[22px]">
              {coreRuleText}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-[680px] px-5 py-10 pb-28 md:px-8 md:py-12">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onReset} className={headerButtonClassName}>
            <RefreshIcon />
            Câu hỏi mới
          </button>
          <button type="button" onClick={onBack} className={headerButtonClassName}>
            Chuyển sang Mood 2
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleExportPDF()}
            disabled={isExporting}
            className={cn(headerButtonClassName, 'disabled:opacity-60')}
          >
            {isExporting ? 'Đang xuất...' : '📄 Xuất PDF'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReportModal(true)
              setReportSubmitted(false)
              setReportType('')
              setExportError(null)
            }}
            className={headerButtonClassName}
          >
            🚩 Báo cáo
          </button>
          <span className="rounded-md bg-pmp-surface px-3 py-1.5 font-body text-[12px] font-bold text-pmp-accent">
            🧠 Mood 1
          </span>
        </div>
      </div>

      {exportError ? (
        <div className="mb-4 rounded-md border border-error/20 bg-error/10 px-4 py-3 print:hidden">
          <p className="font-body text-[13px] text-error">{exportError}</p>
        </div>
      ) : null}

      {showReportModal ? (
        <>
          <div
            className="fixed inset-0 z-modal bg-obsidian/40"
            onClick={() => setShowReportModal(false)}
            aria-hidden
          />
          <div
            className="fixed left-1/2 top-1/2 z-modal w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {reportSubmitted ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FDF4] font-bold text-[#10B981]">
                  ✓
                </div>
                <div className="mb-1 font-body text-[14px] font-semibold text-[#111111]">Cảm ơn bạn!</div>
                <div className="font-body text-[13px] text-[#6B7280]">
                  Phản hồi của bạn giúp chúng tôi cải thiện PMP Thinking Coach.
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="font-body text-[15px] font-semibold text-[#111111]">
                    Báo cáo nội dung không chính xác
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex h-8 w-8 items-center justify-center text-[#9CA3AF] transition-colors hover:text-[#111111]"
                    aria-label="Đóng"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M3 3L13 13M13 3L3 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mb-4 font-body text-[13px] leading-[1.75] text-[#6B7280]">
                  Cảm ơn bạn đã phản hồi. Vui lòng chọn loại lỗi:
                </p>

                <div className="space-y-2">
                  {[
                    { value: 'wrong_answer', label: 'Đáp án đúng/sai không chính xác' },
                    { value: 'wrong_analysis', label: 'Phân tích hoặc giải thích sai' },
                    { value: 'wrong_trap', label: 'Trap hoặc Core Rule không phù hợp' },
                    { value: 'other', label: 'Vấn đề khác' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-3 rounded-md border border-[#F3F4F6] p-3 transition-colors hover:border-[#E5E7EB] hover:bg-[#FAFAFA] has-[:checked]:border-[#7C3AED] has-[:checked]:bg-[#F5F3FF]"
                    >
                      <input
                        type="radio"
                        name="report"
                        value={opt.value}
                        checked={reportType === opt.value}
                        onChange={(e) => setReportType(e.target.value)}
                        className="accent-pmp-accent"
                      />
                      <span className="font-body text-[13px] text-[#374151]">{opt.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!reportType}
                  onClick={() => void handleReport()}
                  className="mt-4 w-full rounded-md bg-[#111111] py-2.5 font-body text-[13px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Gửi báo cáo
                </button>
              </>
            )}
          </div>
        </>
      ) : null}

      <div
        ref={lessonRef}
        className="lesson-content rounded-md border border-[#F3F4F6] bg-[#FFFFFF] px-8 pb-8 pt-2 shadow-[0_1px_8px_rgba(0,0,0,0.06)] print:border-none print:px-6 print:shadow-none md:px-12"
      >
        <div className="mb-8 rounded-md border border-[#F3F4F6] bg-[#FAFAFA] px-6 py-5 print:border-[#E5E7EB] print:bg-[#FFFFFF] md:px-8">
          {question.tag ? (
            <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              {question.tag}
            </div>
          ) : null}

          <HighlightedText
            text={displayContent.questionText}
            onTermClick={handleTermClick}
            className="font-body text-[16px] leading-[1.75] text-[#111111] md:text-[17px]"
          />

          {displayOptions.length > 0 ? (
            <div className="mt-5 space-y-3">
              {displayOptions.map(([key, value]) => {
                const userPicked = userAnswers.includes(key)

                return (
                  <div
                    key={key}
                    className={cn(
                      'flex min-h-[52px] items-start gap-4 rounded-md border px-5 py-4',
                      userPicked
                        ? 'border-[#93C5FD] bg-[#EEF2FF]'
                        : 'border-[#F3F4F6] bg-[#FFFFFF]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-[13px] font-bold',
                        userPicked ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#6B7280]',
                      )}
                    >
                      {key}
                    </div>
                    <div className="min-w-0 flex-1 font-body text-[15px] leading-[1.65] text-[#111111]">
                      <HighlightedText text={value} onTermClick={handleTermClick} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          <div className="mt-5 flex w-full items-center gap-4">
            <span
              className="font-body text-[14px] font-bold tabular-nums"
              style={{ color: timerState.color }}
            >
              ⏱ {formatMmSs(elapsedSeconds)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${fillPercent}%`, backgroundColor: timerState.color }}
              />
            </div>
            <span className="hidden font-body text-[11px] text-[#9CA3AF] md:block">{timerState.message}</span>
          </div>

          <div className="mt-4 flex justify-end print:hidden">
            <LangToggle
              isVI={isTranslated}
              onToggle={() => void handleTranslate()}
              isLoading={isTranslating}
            />
          </div>
        </div>

        {isV2 ? (
          renderV2Content()
        ) : (
          <>
        <CollapsibleSection
          title="Kết quả"
          isFirst
          isExpanded={expanded.verdict}
          onToggle={() => toggle('verdict')}
          accent={verdictAccent}
        >
          <div
            className={cn(
              'mb-5 flex items-center gap-4 rounded-md p-5 md:p-6',
              isCorrect ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-[#FEF2F2] text-[#991B1B]',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white',
                isCorrect ? 'bg-[#10B981]' : 'bg-[#EF4444]',
              )}
            >
              {isCorrect ? '✓' : '✗'}
            </div>
            <p className="font-body text-[16px] font-semibold leading-[1.5] md:text-[17px]">
              {isCorrect
                ? `Chính xác! Đáp án đúng là ${result.correct_answers.join(', ')}`
                : `Chưa đúng. Đáp án đúng là ${result.correct_answers.join(', ')}`}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {(Object.entries(result.answer_verdict) as Array<[string, AnswerVerdict]>).map(([key, item]) => {
              const isAnswerCorrect = result.correct_answers.includes(key)
              const userPicked = userAnswers.includes(key)

              const rowClass = isAnswerCorrect
                ? 'bg-[#F0FDF4] border border-[#BBF7D0]'
                : userPicked
                  ? 'bg-[#FEF2F2] border border-[#FECACA]'
                  : 'bg-[#FFFFFF] border border-[#F3F4F6]'

              const circleClass = isAnswerCorrect
                ? 'bg-[#10B981] text-white'
                : userPicked
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#F3F4F6] text-[#6B7280]'

              return (
                <div key={key} className={cn('flex items-start gap-4 rounded-md p-4', rowClass)}>
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-[13px] font-bold',
                      circleClass,
                    )}
                  >
                    {key}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-[12px] font-semibold text-[#374151]">
                        {isAnswerCorrect ? 'ĐÚNG' : userPicked ? 'SAI' : 'KHÁC'}
                      </span>
                      {userPicked ? (
                        <span className="inline-flex items-center rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                          BẠN CHỌN
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 font-body text-[14px] leading-[1.7] text-[#374151]">
                      <HighlightedText text={item.explanation} onTermClick={handleTermClick} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Giải phẫu câu hỏi"
          isExpanded={expanded.anatomy}
          onToggle={() => toggle('anatomy')}
          accent="#EE5A29"
        >
          <div className="space-y-5">
            <div>
              <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                VAI TRÒ
              </div>
              <div className="font-body text-[15px] leading-[1.75] text-[#374151]">{result.anatomy.role_anchor}</div>
            </div>

            <div>
              <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                TÌNH HUỐNG CỐT LÕI
              </div>
              <div className="font-body text-[15px] leading-[1.75] text-[#374151]">{result.anatomy.situation}</div>
            </div>

            <div>
              <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                TRIGGER WORD
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm bg-[#FFF6EC] px-2 py-0.5 font-display text-[14px] font-bold text-[#EE5A29]">
                  {result.anatomy.trigger_word}
                </span>
                <span className="font-body text-[14px] text-[#374151]">{result.anatomy.trigger_meaning}</span>
              </div>
            </div>

            <div className="rounded-r-md border-l-4 border-[#7C3AED] bg-[#F5F3FF] p-3">
              <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#7C3AED]">
                PMI THỰC SỰ TEST GÌ
              </div>
              <div className="font-body text-[14px] font-semibold leading-[1.75] text-[#4C1D95]">
                {result.anatomy.hidden_test}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Tư duy VN vs PMI"
          isExpanded={expanded.mindset}
          onToggle={() => toggle('mindset')}
          accent="#EE5A29"
        >
          <div className="rounded-md border-l-4 border-[#EF4444] bg-[#FFF7F7] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span aria-hidden>🇻🇳</span>
              <span className="font-body text-[13px] font-semibold text-[#374151]">Phản xạ thực tế VN</span>
            </div>
            <div className="mb-1 font-body text-[14px] font-semibold leading-[1.75] text-[#111111]">
              {result.mindset.vn_thinking}
            </div>
            <div className="font-body text-[13px] italic leading-[1.75] text-[#6B7280]">
              {result.mindset.vn_reason}
            </div>
          </div>

          <div className="mt-4 rounded-md border-l-4 border-[#10B981] bg-[#F0FDF4] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span aria-hidden>🎯</span>
              <span className="font-body text-[13px] font-semibold text-[#374151]">PMI Mindset</span>
            </div>
            <div className="mb-1 font-body text-[14px] font-semibold leading-[1.75] text-[#111111]">
              {result.mindset.pmi_thinking}
            </div>
            <div className="font-body text-[13px] italic leading-[1.75] text-[#6B7280]">
              {result.mindset.pmi_reason}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Core Rule"
          isExpanded={expanded.core_rule}
          onToggle={() => toggle('core_rule')}
          accent="#EE5A29"
        >
          <div className="core-rule-content relative py-6 text-center md:py-8">
            <div className="mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              CORE RULE
            </div>
            <div className="relative z-10 mx-auto max-w-[480px] font-display text-[28px] font-bold leading-[1.35] tracking-[-0.03em] text-[#111111] md:text-[36px] print:text-[22px]">
              {result.core_rule}
            </div>
            <div className="relative z-0 mx-auto mt-6 w-fit rounded-md bg-[#FFF6EC] px-3 py-1.5 font-body text-[13px] text-[#374151]">
              Lưu lại để ôn sau 💡
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Phân tích Trap"
          isExpanded={expanded.trap}
          onToggle={() => toggle('trap')}
          accent="#EE5A29"
        >
          <div>
            <div className="mb-1 font-display text-[18px] font-bold text-[#111111]">
              {result.trap.name}
              <span className="ml-2 inline-flex items-center rounded-sm bg-[#FEF3C7] px-2 py-0.5 font-body text-[11px] font-semibold text-[#92400E]">
                {result.trap.category}
              </span>
            </div>

            <div className="mt-4 mb-1 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              NGHE CÓ VẺ ĐÚNG VÌ...
            </div>
            <div className="font-body text-[14px] italic leading-[1.75] text-[#374151]">
              {result.trap.why_feels_right}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold text-[#6B7280]">
                {result.trap.domain}
              </span>
              <span className="inline-flex items-center rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold text-[#6B7280]">
                {result.trap.approach}
              </span>
              <span className="inline-flex items-center rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] font-semibold text-[#6B7280]">
                {result.trap.category}
              </span>
            </div>

            <div className="mt-4 rounded-md bg-[rgba(238,242,255,0.5)] p-3 font-body text-[13px] leading-[1.75] text-[#2563EB]">
              💡 Gặp lại bẫy này? Nhớ ngay Core Rule và dừng lại trước khi chọn.
            </div>
          </div>
        </CollapsibleSection>
          </>
        )}
      </div>

      {tooltipTerm ? (
        <GlossaryTooltip
          term={tooltipTerm.term}
          entryIndex={tooltipTerm.idx}
          anchorRect={tooltipTerm.rect}
          onClose={() => setTooltipTerm(null)}
          onViewFull={(idx) => {
            setTooltipTerm(null)
            onOpenGlossary?.(idx)
          }}
        />
      ) : null}
    </section>
  )
}

