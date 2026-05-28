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
        className="mb-2 block font-body text-[13px] font-semibold text-[#374151]"
      >
        Tải ảnh câu hỏi lên
      </label>

      <div className="w-full cursor-pointer rounded-md border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 text-center transition-colors hover:bg-[#F3F4F6]">
        <p className="mb-2 font-body text-[13px] text-[#9CA3AF]">
          Nhấn để chọn ảnh hoặc kéo thả vào đây
        </p>
        <input
          id="pmp-image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isLoading}
          onChange={handleChange}
          className="w-full cursor-pointer font-body text-[13px] text-[#374151]"
          style={{ fontSize: '16px' }}
        />
      </div>

      <p className="mt-2 font-body text-[11px] text-[#9CA3AF]">JPG, PNG hoặc WebP · Tối đa 5MB</p>

      {isLoading && (
        <p className="mt-2 flex items-center font-body text-body-sm text-[#6B7280]">
          <span
            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-pmp-accent"
            aria-hidden
          />
          Đang đọc ảnh...
        </p>
      )}
    </div>
  )
}
