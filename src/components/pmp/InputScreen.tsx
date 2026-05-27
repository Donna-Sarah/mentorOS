'use client'

import { useMemo, useState } from 'react'
import type { PMPQuestion, SampleQuestion } from '@/types/pmp'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/pmp/shared'
import samplesData from '../../../public/data/samples.json'

interface InputScreenProps {
  onConfirm: (question: PMPQuestion) => void
}

type InputMode = 'random' | 'upload' | 'paste'

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

function SampleItem({ sample, onPick }: { sample: SampleQuestion; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full min-h-touch items-start gap-3 rounded-md border border-soft-gray px-4 py-3 text-left transition-colors hover:border-pmp-primary hover:bg-pmp-surface/50"
    >
      <span className="shrink-0 rounded-sm bg-pmp-surface px-2 py-0.5 font-body text-caption font-bold uppercase tracking-widest text-pmp-accent">
        {sample.tag}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className="font-body text-body-sm text-midnight-ink"
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {sample.question}
        </p>
        {sample.response_type === 'multiple' && (
          <span className="mt-2 inline-flex items-center rounded-sm bg-amber-glow px-2 py-0.5 font-body text-caption font-bold uppercase tracking-widest text-sunset-orange">
            Nhiều đáp án
          </span>
        )}
      </div>
    </button>
  )
}

export default function InputScreen({ onConfirm }: InputScreenProps) {
  const [mode, setMode] = useState<InputMode>('random')
  const [pasteText, setPasteText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedText, setUploadedText] = useState('')
  const [uploadedQuestion, setUploadedQuestion] = useState<PMPQuestion | null>(null)

  const samples = useMemo(() => samplesData as SampleQuestion[], [])
  const totalSamples = samples.length

  const canConfirmPaste = pasteText.trim().length >= 50
  const canConfirmUpload = !!uploadedQuestion?.text?.trim()

  return (
    <section className="mx-auto max-w-[640px] px-4 py-8 md:px-6">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-pmp-surface px-3 py-1 font-body text-caption font-bold uppercase tracking-widest text-pmp-accent">
        PMP Thinking Coach
      </div>

      <h1 className="mt-4 font-display text-[28px] font-bold tracking-[-0.025em] text-midnight-ink md:text-[38px]">
        Phân tích câu hỏi PMP
      </h1>
      <p className="mt-2 font-body text-body-sm text-slate-text">
        Chọn câu mẫu, tải ảnh lên hoặc dán text để bắt đầu.
      </p>

      <div className="mt-6 flex gap-1 rounded-md bg-soft-gray/30 p-1">
        {([
          { key: 'random', label: '🎲 Câu mẫu' },
          { key: 'upload', label: '📷 Tải ảnh' },
          { key: 'paste', label: '📋 Dán text' },
        ] as const).map((tab) => {
          const active = mode === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setMode(tab.key)
                setError(null)
              }}
              className={[
                'min-h-touch flex-1 rounded-md px-4 py-2 font-body text-body-sm font-semibold transition-colors',
                active
                  ? 'bg-white-canvas text-midnight-ink shadow-card'
                  : 'bg-transparent text-slate-text hover:text-midnight-ink',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {mode === 'random' && (
          <div>
            <p className="mb-3 font-body text-body-sm font-semibold text-midnight-ink">
              Chọn câu hỏi mẫu ({totalSamples} câu)
            </p>

            <div className="scroll-container max-h-[360px] space-y-2 overflow-y-auto">
              {samples.map((sample, i) => (
                <SampleItem
                  key={`${sample.tag}-${i}`}
                  sample={sample}
                  onPick={() => {
                    const q: PMPQuestion = {
                      text: sample.question,
                      options: sample.options,
                      source: 'sample',
                      sampleId: i,
                      tag: sample.tag,
                    }
                    onConfirm(q)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div>
            <ImageUpload
              onExtracted={(text) => {
                setError(null)
                setUploadedText(text)
                const q = parseExtractedText(text)
                setUploadedQuestion(q)
              }}
              onError={(msg) => setError(msg)}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            {uploadedText && (
              <div className="mt-4">
                <textarea
                  readOnly
                  value={uploadedText}
                  className="w-full resize-y rounded-md border border-soft-gray bg-white-canvas p-3 font-body text-body-sm text-midnight-ink"
                  style={{ fontSize: '16px', minHeight: 160 }}
                />

                <div className="mt-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={!canConfirmUpload}
                    onClick={() => {
                      if (!uploadedQuestion) return
                      onConfirm(uploadedQuestion)
                    }}
                  >
                    Xác nhận câu hỏi
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'paste' && (
          <div>
            <p className="mb-2 font-body text-body-sm font-semibold text-midnight-ink">
              Dán câu hỏi PMP (tiếng Anh)
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value)
                if (error) setError(null)
              }}
              placeholder="During project execution, the project manager notices..."
              className="min-h-[200px] w-full resize-y rounded-md border border-soft-gray p-3 font-body text-body-sm text-midnight-ink transition-colors focus:border-pmp-primary focus:outline-none"
              style={{ fontSize: '16px' }}
            />
            <p className="mt-1 text-right font-body text-caption text-ash-text">
              {pasteText.length} ký tự
            </p>
            <Button
              variant="primary"
              className="mt-3 w-full"
              disabled={!canConfirmPaste}
              onClick={() => {
                const q = parsePastedText(pasteText)
                onConfirm(q)
              }}
            >
              Xác nhận câu hỏi
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-md border border-error/20 bg-error/10 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-body text-body-sm text-error">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex min-h-touch min-w-touch items-center justify-center rounded-md text-error hover:bg-error/10"
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
        )}
      </div>
    </section>
  )
}

