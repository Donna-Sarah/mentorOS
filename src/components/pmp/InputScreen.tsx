'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PMPMood, PMPQuestion, SampleQuestion } from '@/types/pmp'
import ImageUpload from './shared/ImageUpload'
import samplesData from '../../../public/data/samples.json'

interface InputScreenProps {
  onConfirm: (question: PMPQuestion) => void
  onConfirmWithMood: (question: PMPQuestion, mood: PMPMood) => void
  onOpenGlossary?: () => void
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

type InputMode = 'paste' | 'upload' | null

const cardBaseClassName =
  'w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-md bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:w-auto'

const primaryButtonClassName =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#111111] px-5 py-2 font-body text-[13px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-40'

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

function parseExtractedText(text: string): PMPQuestion {
  const { questionText, options } = parseRawQuestionText(text)
  return { text: questionText, options, source: 'uploaded' }
}

export default function InputScreen({ onConfirm, onConfirmWithMood, onOpenGlossary }: InputScreenProps) {
  const [mode, setMode] = useState<InputMode>(null)
  const [pasteText, setPasteText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const samples = useMemo(() => samplesData as SampleQuestion[], [])

  const canConfirmPaste = pasteText.trim().length >= 50

  useEffect(() => {
    if (mode === 'paste') {
      const timer = setTimeout(() => textareaRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [mode])

  function handlePasteConfirm() {
    const parsed = parsePastedText(pasteText)
    onConfirm(parsed)
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-amber-glow md:min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[900px] px-4 pb-16 pt-10 md:px-8">
      <div className="mb-5 inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-pmp-accent" aria-hidden />
        <span className="font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
          PMP Thinking Coach by mentorOS
        </span>
      </div>

      <h1 className="mb-3 font-display text-[28px] font-bold leading-[1.2] tracking-[-0.02em] md:text-[36px]">
        <span className="block text-[#111111]">Không học để thuộc.</span>
        <span className="block text-pmp-accent">Học để đọc đúng và tư duy đúng.</span>
      </h1>

      <p className="mt-2 max-w-[480px] font-body text-[15px] leading-[1.7] text-[#6B7280]">
        Dành cho người đang ôn thi PMP. Phân tích tại sao bạn đọc sai đề, nhận diện bẫy tư duy, và xây
        Core Rule để không sai lại.
      </p>

      <div className="mt-8">
        <p className="mb-3 font-body text-[13px] font-semibold text-[#374151]">
          Có câu hỏi riêng? Dán vào đây:
        </p>
        <div className="flex flex-col items-start gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setMode('paste')
              setError(null)
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#111111] px-6 py-3 font-body text-[14px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            📋 Dán câu hỏi của mình
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload')
              setError(null)
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#C4A882] bg-white/60 px-6 py-3 font-body text-[14px] font-semibold text-[#374151] transition-colors hover:bg-white/90"
          >
            📷 Tải ảnh lên
          </button>
        </div>
      </div>

      <div className="mt-12">
        <p className="mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-[#A0856A]">
          Có gì trong PMP Thinking Coach
        </p>

        <div className="scroll-hidden flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] md:grid md:grid-cols-3 md:overflow-visible">
          <button
            type="button"
            onClick={() => onConfirmWithMood(getRandomSample(samples), 'mood1')}
            className={`${cardBaseClassName} text-left`}
          >
            <div className="relative h-[140px] overflow-hidden bg-[#F5F3FF] p-4">
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
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  🧠
                </span>
                <span className="font-body text-[14px] font-bold text-[#111111]">Mood 1</span>
                <span className="ml-auto font-body text-[10px] text-[#9CA3AF]">77 giây</span>
              </div>
              <p className="mb-1 font-body text-[13px] font-semibold text-[#374151]">Thinking Analysis</p>
              <p className="mt-1 font-body text-[11px] text-[#9CA3AF]">Click để thử với câu mẫu ngay</p>
              <p className="font-body text-[12px] leading-[1.5] text-[#9CA3AF]">
                Chọn đáp án → nhận phân tích tại sao đúng/sai theo PMI mindset
              </p>
              <p className="mt-3 font-body text-[12px] font-semibold text-[#7C3AED]">Bắt đầu →</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onConfirmWithMood(getRandomSample(samples), 'mood2')}
            className={`${cardBaseClassName} text-left`}
          >
            <div className="h-[140px] bg-[#EFF6FF] p-4">
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
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  🔍
                </span>
                <span className="font-body text-[14px] font-bold text-[#111111]">Mood 2</span>
                <span className="ml-auto font-body text-[10px] text-[#9CA3AF]">25 giây</span>
              </div>
              <p className="mb-1 font-body text-[13px] font-semibold text-[#374151]">Reading Decode</p>
              <p className="mt-1 font-body text-[11px] text-[#9CA3AF]">Click để thử với câu mẫu ngay</p>
              <p className="font-body text-[12px] leading-[1.5] text-[#9CA3AF]">
                Luyện đọc đề nhanh — tìm PMI signal trong 25 giây trước khi chọn
              </p>
              <p className="mt-3 font-body text-[12px] font-semibold text-[#2563EB]">Bắt đầu →</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenGlossary?.()}
            className={`${cardBaseClassName} text-left`}
          >
            <div className="h-[140px] bg-[#ECFDF5] p-4">
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
            <div className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-base" aria-hidden>
                  📖
                </span>
                <span className="font-body text-[14px] font-bold text-[#111111]">Glossary</span>
                <span className="ml-auto rounded-sm bg-[#F3F4F6] px-1.5 py-0.5 font-body text-[10px] text-[#6B7280]">
                  46 thuật ngữ
                </span>
              </div>
              <p className="mb-1 font-body text-[13px] font-semibold text-[#374151]">Thuật ngữ hay nhầm</p>
              <p className="font-body text-[12px] leading-[1.5] text-[#9CA3AF]">
                46 cặp thuật ngữ PMI — tra cứu nhanh khi gặp từ lạ trong đề
              </p>
              <p className="mt-3 font-body text-[12px] font-semibold text-[#10B981]">Mở Glossary →</p>
            </div>
          </button>
        </div>
      </div>

      {mode === 'paste' ? (
        <div className="mt-6 max-w-[640px] space-y-2 rounded-md bg-white p-6 shadow-card">
          <p className="font-body text-[13px] font-semibold text-[#374151]">Dán câu hỏi PMP (tiếng Anh):</p>
          <textarea
            ref={textareaRef}
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value)
              if (error) setError(null)
            }}
            placeholder="During project execution, the project manager notices..."
            className="min-h-[180px] w-full resize-y rounded-md border border-[#E5E7EB] bg-white p-4 font-body text-[14px] leading-[1.65] text-[#374151] transition-colors placeholder:text-[#D1D5DB] focus:border-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]/10"
            style={{ fontSize: '16px' }}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-body text-[11px] text-[#9CA3AF]">{pasteText.length} ký tự</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode(null)
                  setPasteText('')
                }}
                className="font-body text-[13px] text-[#9CA3AF] underline underline-offset-2 transition-colors hover:text-[#6B7280]"
              >
                Huỷ
              </button>
              <button
                type="button"
                disabled={!canConfirmPaste}
                onClick={handlePasteConfirm}
                className={primaryButtonClassName}
              >
                Xác nhận →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mode === 'upload' ? (
        <div className="mt-6 max-w-[640px] rounded-md bg-white p-6 shadow-card">
          <ImageUpload
            onExtracted={(text) => {
              setError(null)
              onConfirm(parseExtractedText(text))
            }}
            onError={(msg) => setError(msg)}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          <button
            type="button"
            onClick={() => setMode(null)}
            className="mt-3 font-body text-[13px] text-[#9CA3AF] underline underline-offset-2 transition-colors hover:text-[#6B7280]"
          >
            Huỷ
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 max-w-[640px] rounded-md bg-white p-6 shadow-card">
          <div className="flex items-start gap-2 rounded-md border border-[#FECACA] bg-[#FEF2F2] p-3">
            <p className="flex-1 font-body text-[13px] text-[#991B1B]">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="flex min-h-touch min-w-touch items-center justify-center rounded-md text-[#991B1B] transition-colors hover:bg-[#FECACA]/40"
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
        </div>
      ) : null}
      </div>
    </div>
  )
}
