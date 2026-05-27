'use client'

import { type ChangeEvent } from 'react'

interface ImageUploadProps {
  onExtracted: (text: string) => void
  onError: (message: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const MAX_FILE_BYTES = 5 * 1024 * 1024

export default function ImageUpload({
  onExtracted,
  onError,
  isLoading,
  setIsLoading,
}: ImageUploadProps) {
  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (file.size > MAX_FILE_BYTES) {
      onError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/pmp/ocr', {
        method: 'POST',
        body: formData,
      })

      const payload = (await response.json()) as {
        data: { text: string } | null
        error: string | null
      }

      if (!response.ok || payload.error || !payload.data?.text) {
        onError('Không thể đọc ảnh. Vui lòng thử lại hoặc dán text.')
        return
      }

      onExtracted(payload.data.text)
    } catch {
      onError('Không thể đọc ảnh. Vui lòng thử lại hoặc dán text.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <label
        htmlFor="pmp-image-upload"
        className="font-body text-body-sm font-semibold text-midnight-ink"
      >
        Tải ảnh câu hỏi lên
      </label>
      <input
        id="pmp-image-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={isLoading}
        onChange={handleChange}
        className="mt-2 w-full cursor-pointer rounded-md border border-soft-gray bg-white-canvas p-3 font-body text-midnight-ink text-[16px]"
      />
      <p className="mt-1 font-body text-caption text-ash-text">
        JPG, PNG hoặc WebP · Tối đa 5MB
      </p>
      {isLoading && (
        <p className="mt-2 flex items-center font-body text-body-sm text-slate-text">
          <span
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-soft-gray border-t-pmp-accent"
            aria-hidden
          />
          Đang đọc ảnh...
        </p>
      )}
    </div>
  )
}
