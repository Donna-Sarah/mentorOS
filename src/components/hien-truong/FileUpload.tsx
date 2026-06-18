'use client'

import { useRef, useState, type ChangeEvent, type DragEvent, type ReactElement } from 'react'
import { Button } from '@/components/ui/Button'
import { mapAudioErrorMessage } from '@/lib/hien-truong/errors'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '@/lib/hien-truong/file-types'
import { cn } from '@/lib/utils/cn'
import type { StatusMessage } from '@/types/hien-truong'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const AUDIO_ACCEPT =
  'audio/*,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/webm,audio/ogg,.mp3,.m4a,.wav,.webm,.ogg,.aac'

interface FileUploadProps {
  label: string
  pickImage: string
  pickAudio: string
  imageHint: string
  audioHint: string
  desktopDropHint: string
  loadingImage: string
  loadingAudio: string
  fileTooLargeImage: string
  fileTooLargeAudio: string
  extractError: string
  audioUnavailable: string
  audioInvalidKey: string
  fileDoneImage: string
  fileDoneAudio: string
  onExtracted: (text: string) => void
  onStatus: (status: StatusMessage) => void
  disabled?: boolean
}

export function FileUpload({
  label,
  pickImage,
  pickAudio,
  imageHint,
  audioHint,
  desktopDropHint,
  loadingImage,
  loadingAudio,
  fileTooLargeImage,
  fileTooLargeAudio,
  extractError,
  audioUnavailable,
  audioInvalidKey,
  fileDoneImage,
  fileDoneAudio,
  onExtracted,
  onStatus,
  disabled = false,
}: FileUploadProps): ReactElement {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  function mapServerError(error: string | null, isAudio: boolean): string {
    if (!isAudio) return error ?? extractError
    return mapAudioErrorMessage(error, {
      notConfigured: audioUnavailable,
      invalidKey: audioInvalidKey,
      generic: error ?? extractError,
    })
  }

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
        onStatus({ type: 'error', msg: mapServerError(payload.error, isAudio) })
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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void processFile(file)
  }

  function handleAudioChange(event: ChangeEvent<HTMLInputElement>) {
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
      <p className="mb-3 font-body text-caption uppercase tracking-widest text-ash-text">
        {label}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <Button
            variant="ghost"
            className="h-auto w-full flex-col gap-1 px-4 py-4"
            disabled={disabled || loading}
            onClick={() => imageInputRef.current?.click()}
          >
            <span className="text-xl" aria-hidden>
              📷
            </span>
            <span>{pickImage}</span>
          </Button>
          <p className="mt-1.5 text-center font-body text-caption normal-case tracking-normal text-ash-text">
            {imageHint}
          </p>
          <input
            ref={imageInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            disabled={disabled || loading}
            onChange={handleImageChange}
            className="sr-only"
          />
        </div>

        <div>
          <Button
            variant="ghost"
            className="h-auto w-full flex-col gap-1 px-4 py-4"
            disabled={disabled || loading}
            onClick={() => audioInputRef.current?.click()}
          >
            <span className="text-xl" aria-hidden>
              🎵
            </span>
            <span>{pickAudio}</span>
          </Button>
          <p className="mt-1.5 text-center font-body text-caption normal-case tracking-normal text-ash-text">
            {audioHint}
          </p>
          <input
            ref={audioInputRef}
            type="file"
            accept={AUDIO_ACCEPT}
            disabled={disabled || loading}
            onChange={handleAudioChange}
            className="sr-only"
          />
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !loading) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'mt-3 hidden rounded-md border border-dashed px-4 py-4 text-center md:block',
          isDragging
            ? 'border-slate-text bg-amber-glow'
            : 'border-soft-gray bg-amber-glow/20',
          (disabled || loading) && 'opacity-60',
        )}
      >
        <p className="font-body text-body-sm text-slate-text">{desktopDropHint}</p>
      </div>
    </div>
  )
}
