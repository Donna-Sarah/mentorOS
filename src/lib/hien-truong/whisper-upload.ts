interface WhisperUploadMeta {
  fileName: string
  mimeType: string
}

const EXT_MAP: Record<string, { ext: string; mime: string }> = {
  m4a: { ext: 'm4a', mime: 'audio/mp4' },
  mp4: { ext: 'mp4', mime: 'audio/mp4' },
  mp3: { ext: 'mp3', mime: 'audio/mpeg' },
  mpeg: { ext: 'mpeg', mime: 'audio/mpeg' },
  mpga: { ext: 'mpga', mime: 'audio/mpeg' },
  wav: { ext: 'wav', mime: 'audio/wav' },
  webm: { ext: 'webm', mime: 'audio/webm' },
  ogg: { ext: 'ogg', mime: 'audio/ogg' },
  oga: { ext: 'oga', mime: 'audio/ogg' },
  flac: { ext: 'flac', mime: 'audio/flac' },
  aac: { ext: 'aac', mime: 'audio/aac' },
}

function baseNameFromPath(fileName: string): string {
  const trimmed = fileName.trim() || 'recording'
  const leaf = trimmed.split(/[/\\]/).pop() ?? trimmed
  return leaf.replace(/\.[a-z0-9]+$/i, '') || 'recording'
}

/** Whisper detects format from extension — normalize mobile uploads (esp. .m4a / video/mp4). */
export function resolveWhisperUploadMeta(
  fileName: string,
  mimeType: string,
): WhisperUploadMeta {
  const leaf = (fileName.split(/[/\\]/).pop()?.trim() || 'recording').toLowerCase()
  const extMatch = leaf.match(/\.([a-z0-9]+)$/)
  const extKey = extMatch?.[1]

  if (extKey && EXT_MAP[extKey]) {
    const { ext, mime } = EXT_MAP[extKey]
    return {
      fileName: `${baseNameFromPath(fileName)}.${ext}`,
      mimeType: mime,
    }
  }

  const mime = mimeType.toLowerCase()

  if (
    mime.includes('m4a') ||
    mime === 'audio/mp4' ||
    mime === 'audio/x-m4a' ||
    mime === 'video/mp4'
  ) {
    return {
      fileName: `${baseNameFromPath(fileName)}.m4a`,
      mimeType: 'audio/mp4',
    }
  }
  if (mime.includes('mpeg') || mime.includes('mp3')) {
    return { fileName: `${baseNameFromPath(fileName)}.mp3`, mimeType: 'audio/mpeg' }
  }
  if (mime.includes('wav')) {
    return { fileName: `${baseNameFromPath(fileName)}.wav`, mimeType: 'audio/wav' }
  }
  if (mime.includes('ogg')) {
    return { fileName: `${baseNameFromPath(fileName)}.ogg`, mimeType: 'audio/ogg' }
  }
  if (mime.includes('webm')) {
    return { fileName: `${baseNameFromPath(fileName)}.webm`, mimeType: 'audio/webm' }
  }
  if (mime.includes('flac')) {
    return { fileName: `${baseNameFromPath(fileName)}.flac`, mimeType: 'audio/flac' }
  }

  return {
    fileName: `${baseNameFromPath(fileName)}.m4a`,
    mimeType: 'audio/mp4',
  }
}
