'use client'

import { useRef, useState, type ChangeEvent, type DragEvent, type ReactElement } from 'react'
import { cn } from '@/lib/utils/cn'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '@/lib/hien-truong/file-types'
import type { StatusMessage } from '@/types/hien-truong'

const ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/ogg,audio/x-m4a,.mp3,.m4a,.wav,.webm,.ogg,.aac'

interface FileUploadProps {
  label: string
  hint: string
  dropHint: string
  loadingImage: string
  loadingAudio: string
  fileTooLargeImage: string
  fileTooLargeAudio: string
  extractError: string
  fileDoneImage: string
  fileDoneAudio: string
  onExtracted: (text: string) => void
  onStatus: (status: StatusMessage) => void
  disabled?: boolean
}

export function FileUpload({
  label,
  hint,
  dropHint,
  loadingImage,
  loadingAudio,
  fileTooLargeImage,
  fileTooLargeAudio,
  extractError,
  fileDoneImage,
  fileDoneAudio,
  onExtracted,
  onStatus,
  disabled = false,
}: FileUploadProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  async function processFile(file: File) {
    if (file.type.startsWith('image/') && file.size > MAX_IMAGE_BYTES) {
      onStatus({ type: 'error', msg: fileTooLargeImage })
      return
    }
    if (
      (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|webm|ogg|aac)$/i.test(file.name)) &&
      file.size > MAX_AUDIO_BYTES
    ) {
      onStatus({ type: 'error', msg: fileTooLargeAudio })
      return
    }

    const isAudio =
      file.type.startsWith('audio/') || /\.(mp3|m4a|wav|webm|ogg|aac)$/i.test(file.name)

    setLoading(true)
    onStatus({ type: 'loading', msg: isAudio ? loadingAudio : loadingImage })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/hien-truong/extract', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as {
        data: { text: string; kind: 'image' | 'audio' } | null
        error: string | null
      }

      if (!response.ok || payload.error || !payload.data?.text) {
        onStatus({ type: 'error', msg: payload.error ?? extractError })
        return
      }

      onExtracted(payload.data.text)
      onStatus({
        type: 'ok',
        msg: payload.data.kind === 'audio' ? fileDoneAudio : fileDoneImage,
      })
    } catch {
      onStatus({ type: 'error', msg: extractError })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void processFile(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || loading) return
    const file = event.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  return (
    <div>
      <p className="mb-2 font-body text-caption uppercase tracking-widest text-ash-text">
        {label}
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!disabled && !loading) inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !loading) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'cursor-pointer rounded-md border border-dashed px-4 py-6 text-center transition-colors',
          isDragging
            ? 'border-slate-text bg-amber-glow'
            : 'border-soft-gray bg-amber-glow/30 hover:bg-amber-glow/60',
          (disabled || loading) && 'pointer-events-none opacity-60',
        )}
      >
        <p className="mb-1 font-body text-body-sm text-slate-text">
          <span className="mr-1" aria-hidden>
            📎
          </span>
          {dropHint}
        </p>
        <p className="font-body text-caption normal-case tracking-normal text-ash-text">
          {hint}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          disabled={disabled || loading}
          onChange={handleChange}
          className="sr-only"
        />
      </div>
    </div>
  )
}
