'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent, ChangeEvent } from 'react'
import type { PMPMood, PMPQuestion, SampleQuestion } from '@/types/pmp'
import samplesData from '../../../public/data/samples.json'

interface InputScreenProps {
  onConfirm: (question: PMPQuestion) => void
  onConfirmWithMood: (question: PMPQuestion, mood: PMPMood) => void
  onOpenGlossary?: () => void
  autoScrollToCards?: boolean
  onScrollComplete?: () => void
}

interface OcrResponse {
  data: { text: string } | null
  error: string | null
}

function getRandomSample(samples: SampleQuestion[]): PMPQuestion {
  const randomIndex = Math.floor(Math.random() * samples.length)
  const sample = samples[randomIndex]
  return {
    text: sample.question,
    options: sample.options,
    source: 'sample',
    sampleId: randomIndex,
    tag: sample.tag,
  }
}

const cardBaseClassName =
  'w-[300px] shrink-0 cursor-pointer overflow-hidden rounded-md bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:w-auto'

const MAX_FILE_BYTES = 5 * 1024 * 1024

function parseRawQuestionText(text: string): { questionText: string; options: Record<string, string> } {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const optionRe = /(?:^|\n)\s*([A-D])[\.\)]\s+/g
  const matches = Array.from(normalized.matchAll(optionRe)).map((m) => ({
    key: m[1],
    index: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }))

  if (matches.length < 2) {
    return { questionText: normalized, options: {} }
  }

  const first = matches[0]
  const questionText = normalized.slice(0, first.index).trim()
  const options: Record<string, string> = {}

  for (let i = 0; i < matches.length; i += 1) {
    const cur = matches[i]
    const nextStart = i + 1 < matches.length ? matches[i + 1].index : normalized.length
    const value = normalized.slice(cur.end, nextStart).trim()
    if (cur.key && value) options[cur.key] = value
  }

  const hasAtLeastTwoOptions = Object.keys(options).length >= 2
  return {
    questionText: hasAtLeastTwoOptions ? questionText : normalized,
    options: hasAtLeastTwoOptions ? options : {},
  }
}

function parsePastedText(text: string): PMPQuestion {
  const { questionText, options } = parseRawQuestionText(text)
  return { text: questionText, options, source: 'manual' }
}

function truncateFileName(name: string, max = 20): string {
  if (name.length <= max) return name
  return `${name.slice(0, max - 3)}...`
}

function PaperclipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13.5 7.5l-5.5 5.5a4 4 0 0 1-5.657-5.657l6-6a2.5 2.5 0 0 1 3.536 3.536l-6.001 6a1 1 0 0 1-1.414-1.414l5.5-5.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 2L10 10M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 2v10M3 8l4 4 4-4" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 12V2M3 6l4-4 4 4" />
    </svg>
  )
}

function SubmitSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export default function InputScreen({
  onConfirm,
  onConfirmWithMood,
  onOpenGlossary,
  autoScrollToCards = false,
  onScrollComplete,
}: InputScreenProps) {
  const [inputText, setInputText] = useState('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isOCRing, setIsOCRing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const featureCardsRef = useRef<HTMLDivElement>(null)
  const inputBoxRef = useRef<HTMLDivElement>(null)

  const samples = useMemo(() => samplesData as SampleQuestion[], [])

  const isSubmitDisabled =
    (inputText.trim().length < 20 && !attachedImage) || isOCRing

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  useEffect(() => {
    if (autoScrollToCards && featureCardsRef.current) {
      const timer = window.setTimeout(() => {
        featureCardsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        onScrollComplete?.()
      }, 100)

      return () => window.clearTimeout(timer)
    }
  }, [autoScrollToCards, onScrollComplete])

  const removeAttachment = useCallback(() => {
    setAttachedImage(null)
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const attachImage = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.')
      return
    }

    setError(null)

    const url = URL.createObjectURL(file)
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    setAttachedImage(file)
    setIsOCRing(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/pmp/ocr', {
        method: 'POST',
        body: formData,
      })

      const json = (await res.json()) as OcrResponse

      if (json.data?.text) {
        setInputText(json.data.text)
        setTimeout(() => textareaRef.current?.focus(), 50)
      } else {
        setError('Không thể đọc ảnh. Vui lòng dán text thủ công.')
      }
    } catch {
      setError('Lỗi khi đọc ảnh. Vui lòng thử lại.')
    } finally {
      setIsOCRing(false)
    }
  }, [])

  async function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find((item) => item.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (file) {
        await attachImage(file)
      }
    }
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await attachImage(file)
    e.target.value = ''
  }

  function handleSubmit() {
    if (inputText.trim().length < 20) return
    const parsed = parsePastedText(inputText)
    onConfirm(parsed)
  }

  function scrollToFeatures() {
    featureCardsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function scrollToInput() {
    inputBoxRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    setTimeout(() => textareaRef.current?.focus(), 600)
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-amber-glow md:min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[900px] px-page pb-20 pt-12 md:pb-28 md:pt-20 lg:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 md:mb-8">
          <span className="h-2 w-2 rounded-full bg-pmp-accent" aria-hidden />
          <span className="font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            PMP Thinking Coach by mentorOS
          </span>
        </div>

        <h1 className="mb-4 font-display text-[34px] font-bold leading-[1.12] tracking-[-0.03em] md:mb-6 md:text-[52px] md:leading-[1.08] md:tracking-[-0.035em] xl:text-[42px] xl:leading-[1.1]">
          <span className="block text-[#111111]">Không học để thuộc.</span>
          <span className="block text-pmp-accent">Học để đọc đúng và tư duy đúng.</span>
        </h1>

        <p className="mt-3 max-w-reading font-body text-[16px] leading-[1.75] text-[#6B7280] md:mt-5 md:text-[18px] md:leading-[1.85] xl:text-[17px] xl:leading-[1.75]">
          Dành cho người đang ôn thi PMP. Phân tích tại sao bạn đọc sai đề, nhận diện bẫy tư duy, và xây
          Core Rule để không sai lại.
        </p>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
          <button
            type="button"
            onClick={scrollToFeatures}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-md bg-[#111111] px-6 py-3 font-body text-[15px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            Khám phá 2 chế độ học
            <ArrowDownIcon />
          </button>
          <button
            type="button"
            onClick={scrollToInput}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-md border-2 border-[#C4A882] bg-white/60 px-6 py-3 font-body text-[15px] font-semibold text-[#374151] transition-colors hover:bg-white/90"
          >
            Tải đề lên để phân tích
            <ArrowUpIcon />
          </button>
        </div>

        <div ref={featureCardsRef} className="mt-20 scroll-mt-16 md:mt-28 md:scroll-mt-20 xl:mt-20">
          <p className="mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            Bắt đầu luyện tập ngay
          </p>

          <div className="scroll-hidden flex gap-5 overflow-x-auto pb-3 pr-5 [-webkit-overflow-scrolling:touch] md:grid md:grid-cols-3 md:gap-7 md:overflow-visible md:pr-0">
            <button
              type="button"
              onClick={() => onConfirmWithMood(getRandomSample(samples), 'mood1')}
              className={`${cardBaseClassName} text-left`}
            >
              <div className="relative h-[168px] overflow-hidden bg-[#F5F3FF] p-5 md:h-[200px] md:p-6">
                <div className="rounded-md bg-white p-3 text-left shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]">
                      <span className="text-[10px] font-bold text-white">✓</span>
                    </div>
                    <span className="font-body text-[11px] font-semibold text-[#111111]">
                      Chính xác! Đáp án B
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]" />
                    <div className="h-1.5 w-4/5 rounded-full bg-[#E5E7EB]" />
                    <div className="h-1.5 w-3/5 rounded-full bg-[#E5E7EB]" />
                  </div>
                  <div className="mt-2 border-t border-[#F3F4F6] pt-2">
                    <span className="font-body text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
                      Core Rule
                    </span>
                    <div className="mt-1 h-1.5 w-2/3 rounded-full bg-[#EDE9FE]" />
                  </div>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3">
                  <span className="text-lg md:text-xl" aria-hidden>
                    🧠
                  </span>
                  <span className="font-body text-[15px] font-bold text-[#111111] md:text-[16px]">Mood 1</span>
                  <span className="ml-auto font-body text-[11px] text-[#9CA3AF] md:text-[12px]">77 giây</span>
                </div>
                <p className="mb-1 font-body text-[14px] font-semibold text-[#374151] md:text-[15px]">
                  Thinking Analysis
                </p>
                <p className="mt-2 font-body text-[12px] text-[#9CA3AF] md:text-[13px]">
                  Nhấn để thử với câu mẫu ngay
                </p>
                <p className="mt-2 font-body text-[13px] leading-[1.6] text-[#9CA3AF] md:text-[14px] md:leading-[1.65]">
                  Chọn đáp án → nhận phân tích tại sao đúng/sai theo PMI mindset
                </p>
                <p className="mt-4 font-body text-[14px] font-semibold text-[#7C3AED] md:mt-5 md:text-[15px]">
                  Bắt đầu →
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onConfirmWithMood(getRandomSample(samples), 'mood2')}
              className={`${cardBaseClassName} text-left`}
            >
              <div className="h-[168px] bg-[#EFF6FF] p-5 md:h-[200px] md:p-6">
                <div className="rounded-md bg-white p-3 text-left shadow-sm">
                  <p className="mb-2 font-body text-[11px] leading-[1.6] text-[#374151]">
                    What should the PM do{' '}
                    <mark className="rounded-sm bg-amber-glow px-0.5 font-bold text-sunset-orange not-italic">
                      FIRST
                    </mark>
                    ?
                  </p>
                  <div className="space-y-1.5">
                    <div className="h-6 w-full rounded-md bg-[#F3F4F6]" />
                    <div className="h-6 w-4/5 rounded-md border-2 border-[#2563EB] bg-[#F3F4F6]" />
                    <div className="h-6 w-3/5 rounded-md bg-[#F3F4F6]" />
                  </div>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3">
                  <span className="text-lg md:text-xl" aria-hidden>
                    🔍
                  </span>
                  <span className="font-body text-[15px] font-bold text-[#111111] md:text-[16px]">Mood 2</span>
                  <span className="ml-auto font-body text-[11px] text-[#9CA3AF] md:text-[12px]">25 giây</span>
                </div>
                <p className="mb-1 font-body text-[14px] font-semibold text-[#374151] md:text-[15px]">
                  Reading Decode
                </p>
                <p className="mt-2 font-body text-[12px] text-[#9CA3AF] md:text-[13px]">
                  Nhấn để thử với câu mẫu ngay
                </p>
                <p className="mt-2 font-body text-[13px] leading-[1.6] text-[#9CA3AF] md:text-[14px] md:leading-[1.65]">
                  Luyện đọc đề nhanh — tìm PMI signal trong 25 giây trước khi chọn
                </p>
                <p className="mt-4 font-body text-[14px] font-semibold text-[#2563EB] md:mt-5 md:text-[15px]">
                  Bắt đầu →
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onOpenGlossary?.()}
              className={`${cardBaseClassName} text-left`}
            >
              <div className="h-[168px] bg-[#ECFDF5] p-5 md:h-[200px] md:p-6">
                <div className="space-y-2 rounded-md bg-white p-3 text-left shadow-sm">
                  <div>
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="font-body text-[12px] font-bold text-[#111111]">Risk</span>
                      <span className="text-[10px] text-[#9CA3AF]">vs</span>
                      <span className="font-body text-[12px] font-bold text-[#111111]">Issue</span>
                    </div>
                    <div className="h-1.5 w-3/4 rounded-full bg-[#E5E7EB]" />
                  </div>
                  <div className="border-t border-[#F3F4F6] pt-2">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="font-body text-[12px] font-bold text-[#111111]">Mitigation</span>
                      <span className="text-[10px] text-[#9CA3AF]">vs</span>
                      <span className="font-body text-[12px] font-bold text-[#111111]">Contingency</span>
                    </div>
                    <div className="h-1.5 w-2/3 rounded-full bg-[#E5E7EB]" />
                  </div>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <div className="mb-2 flex items-center gap-2 md:mb-3">
                  <span className="text-lg md:text-xl" aria-hidden>
                    📖
                  </span>
                  <span className="font-body text-[15px] font-bold text-[#111111] md:text-[16px]">Glossary</span>
                  <span className="ml-auto rounded-sm bg-[#F3F4F6] px-2 py-0.5 font-body text-[11px] text-[#6B7280] md:text-[12px]">
                    46 thuật ngữ
                  </span>
                </div>
                <p className="mb-1 font-body text-[14px] font-semibold text-[#374151] md:text-[15px]">
                  Thuật ngữ hay nhầm
                </p>
                <p className="mt-2 font-body text-[13px] leading-[1.6] text-[#9CA3AF] md:text-[14px] md:leading-[1.65]">
                  46 cặp thuật ngữ PMI — tra cứu nhanh khi gặp từ lạ trong đề
                </p>
                <p className="mt-4 font-body text-[14px] font-semibold text-[#10B981] md:mt-5 md:text-[15px]">
                  Mở Glossary →
                </p>
              </div>
            </button>
          </div>
        </div>

        <section className="mt-10 w-full">
          <p className="mb-3 font-body text-[13px] font-semibold text-[#9CA3AF]">
            Có đề PMP riêng? Tải lên để phân tích:
          </p>

          <div ref={inputBoxRef} className="scroll-mt-16 md:scroll-mt-20">
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-150 focus-within:border-[#9CA3AF] focus-within:shadow-[0_2px_16px_rgba(0,0,0,0.1)]">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    if (error) setError(null)
                  }}
                  onPaste={(e) => void handlePaste(e)}
                  placeholder="Dán câu hỏi PMP vào đây, hoặc paste ảnh từ clipboard (Ctrl+V)..."
                  className="min-h-[120px] w-full resize-none border-none bg-transparent px-4 pb-2 pt-4 font-body text-[15px] leading-[1.65] text-[#111111] outline-none placeholder:text-[#C4B5A0]"
                  style={{ fontSize: '16px' }}
                />

                {attachedImage && imagePreviewUrl ? (
                  <div className="px-4 pb-3">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                      <img
                        src={imagePreviewUrl}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="font-body text-[12px] font-semibold text-[#374151]">
                          {truncateFileName(attachedImage.name)}
                        </span>
                        <span className="font-body text-[11px] text-[#9CA3AF]">
                          {isOCRing ? 'Đang đọc ảnh...' : 'Ảnh đính kèm'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        disabled={isOCRing}
                        className="ml-2 flex h-6 w-6 items-center justify-center text-[#9CA3AF] transition-colors hover:text-[#EF4444] disabled:opacity-40"
                        aria-label="Xóa ảnh đính kèm"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between border-t border-[#F3F4F6] px-3 py-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isOCRing}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-2 py-1.5 font-body text-[12px] text-[#9CA3AF] transition-colors hover:bg-[#F9FAFB] hover:text-[#374151] disabled:opacity-40"
                  >
                    <PaperclipIcon />
                    Đính kèm ảnh
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handleFileSelect(e)}
                  />

                  <button
                    type="button"
                    disabled={isSubmitDisabled}
                    onClick={handleSubmit}
                    className={[
                      'inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-4 py-2 font-body text-[13px] font-semibold transition-colors',
                      isSubmitDisabled
                        ? 'cursor-not-allowed bg-[#E5E7EB] text-[#9CA3AF]'
                        : 'bg-[#111111] text-white hover:bg-[#333333]',
                    ].join(' ')}
                  >
                    {isOCRing ? (
                      <>
                        <SubmitSpinner />
                        Đang đọc...
                      </>
                    ) : (
                      'Xác nhận →'
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="mt-3 flex items-start justify-between gap-2 rounded-md border border-[#FECACA] bg-[#FEF2F2] p-3">
                  <p className="flex-1 font-body text-[13px] text-[#991B1B]">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="flex min-h-touch min-w-touch shrink-0 items-center justify-center text-[#991B1B] transition-colors hover:text-[#7F1D1D]"
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
              ) : null}

            <div className="mt-2 flex flex-col items-start gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
              <p className="font-body text-[11px] text-[#C4B5A0]">
                Hỗ trợ paste text, paste ảnh từ clipboard (Ctrl+V / ⌘+V), hoặc đính kèm file ảnh
              </p>
              <p className="font-body text-[11px] italic text-[#C4B5A0] md:text-right">
                Câu hỏi nên là tiếng Anh, đủ 4 lựa chọn A B C D.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
