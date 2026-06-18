export async function transcribeWithWhisper(
  file: File,
): Promise<{ data: string | null; error: string | null }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return {
      data: null,
      error: 'OPENAI_API_KEY chưa được cấu hình — cần cho file ghi âm',
    }
  }

  try {
    const formData = new FormData()
    formData.append('file', file, file.name || 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'vi')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    })

    const payload = (await response.json()) as { text?: string; error?: { message?: string } }

    if (!response.ok) {
      return {
        data: null,
        error: payload.error?.message ?? `Whisper failed (${response.status})`,
      }
    }

    const text = payload.text?.trim()
    if (!text) {
      return { data: null, error: 'Không nhận dạng được nội dung ghi âm' }
    }

    return { data: text, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { data: null, error: message }
  }
}
