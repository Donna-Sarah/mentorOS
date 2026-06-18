'use client'

import { useId, useState, type ChangeEvent, type DragEvent, type ReactElement } from 'react'
import { mapAudioErrorMessage } from '@/lib/hien-truong/errors'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '@/lib/hien-truong/file-types'
import { cn } from '@/lib/utils/cn'
import type { StatusMessage } from '@/types/hien-truong'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
/** Extension-only accept opens file manager on Android; audio/* often shows photo picker */
const AUDIO_ACCEPT = '.mp3,.m4a,.wav,.aac,.ogg,.webm,.opus,.mpeg,.mpga'

const pickButtonClassName =
  'flex min-h-touch w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-midnight-ink bg-transparent px-4 py-4 font-body text-sm font-semibold text-midnight-ink transition-colors hover:bg-midnight-ink/5'

function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true
  return /\.(mp3|m4a|wav|webm|ogg|aac|mpeg|mpga|opus)$/i.test(file.name)
}

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name)
}

interface FileUploadProps {
  label: string
  pickImage: string
  pickAudio: string
  imageHint: string
  audioHint: string
  audioBrowseHint: string
  audioWrongFile: string
  desktopDropHint: string
  loadingImage: string
  loadingAudio: string
  fileTooLargeImage: string
  fileTooLargeAudio: string
  extractError: string
  audioUnavailable: string
  audioInvalidKey: string
  audioQuotaExceeded: string
  audioAmrUnsupported: string
  audioInvalidFormat: string
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
  audioBrowseHint,
  audioWrongFile,
  desktopDropHint,
  loadingImage,
  loadingAudio,
  fileTooLargeImage,
  fileTooLargeAudio,
  extractError,
  audioUnavailable,
  audioInvalidKey,
  audioQuotaExceeded,
  audioAmrUnsupported,
  audioInvalidFormat,
  fileDoneImage,
  fileDoneAudio,
  onExtracted,
  onStatus,
  disabled = false,
}: FileUploadProps): ReactElement {
  const imageInputId = useId()
  const audioInputId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  function mapServerError(error: string | null, isAudio: boolean): string {
    if (!isAudio) return error ?? extractError
    return mapAudioErrorMessage(error, {
      notConfigured: audioUnavailable,
      invalidKey: audioInvalidKey,
      quotaExceeded: audioQuotaExceeded,
      amrUnsupported: audioAmrUnsupported,
      invalidFormat: audioInvalidFormat,
      generic: extractError,
    })
  }

  async function processFile(file: File, expected: 'image' | 'audio' | 'any') {
    if (expected === 'audio' && !isAudioFile(file)) {
      onStatus({ type: 'error', msg: audioWrongFile })
      return
    }
    if (expected === 'image' && !isImageFile(file)) {
      onStatus({ type: 'error', msg: extractError })
      return
    }

    const isAudio = isAudioFile(file)

    if (isImageFile(file) && file.size > MAX_IMAGE_BYTES) {
      onStatus({ type: 'error', msg: fileTooLargeImage })
      return
    }
    if (isAudio && file.size > MAX_AUDIO_BYTES) {
      onStatus({ type: 'error', msg: fileTooLargeAudio })
      return
    }

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
    if (file) void processFile(file, 'image')
  }

  function handleAudioChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void processFile(file, 'audio')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || loading) return
    const file = event.dataTransfer.files?.[0]
    if (file) void processFile(file, 'any')
  }

  const isDisabled = disabled || loading

  return (
    <div>
      <p className="mb-3 font-body text-caption uppercase tracking-widest text-ash-text">
        {label}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label
            htmlFor={imageInputId}
            className={cn(pickButtonClassName, isDisabled && 'pointer-events-none opacity-60')}
          >
            <span className="text-xl" aria-hidden>
              📷
            </span>
            <span>{pickImage}</span>
          </label>
          <p className="mt-1.5 text-center font-body text-caption normal-case tracking-normal text-ash-text">
            {imageHint}
          </p>
          <input
            id={imageInputId}
            type="file"
            accept={IMAGE_ACCEPT}
            disabled={isDisabled}
            onChange={handleImageChange}
            className="sr-only"
          />
        </div>

        <div>
          <label
            htmlFor={audioInputId}
            className={cn(pickButtonClassName, isDisabled && 'pointer-events-none opacity-60')}
          >
            <span className="text-xl" aria-hidden>
              🎵
            </span>
            <span>{pickAudio}</span>
          </label>
          <p className="mt-1.5 text-center font-body text-caption normal-case tracking-normal text-ash-text">
            {audioHint}
          </p>
          <p className="mt-1 text-center font-body text-caption normal-case tracking-normal text-brand-blue">
            {audioBrowseHint}
          </p>
          <input
            id={audioInputId}
            type="file"
            accept={AUDIO_ACCEPT}
            disabled={isDisabled}
            onChange={handleAudioChange}
            className="sr-only"
          />
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!isDisabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'mt-3 hidden rounded-md border border-dashed px-4 py-4 text-center md:block',
          isDragging
            ? 'border-slate-text bg-amber-glow'
            : 'border-soft-gray bg-amber-glow/20',
          isDisabled && 'opacity-60',
        )}
      >
        <p className="font-body text-body-sm text-slate-text">{desktopDropHint}</p>
      </div>
    </div>
  )
}
