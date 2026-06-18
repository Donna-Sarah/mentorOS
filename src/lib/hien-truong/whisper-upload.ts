import { HIEN_TRUONG_ERRORS } from '@/lib/hien-truong/errors'

export interface WhisperUploadMeta {
  fileName: string
  mimeType: string
}

export type WhisperResolveResult =
  | WhisperUploadMeta
  | { error: typeof HIEN_TRUONG_ERRORS.AMR_UNSUPPORTED }

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

type DetectedContainer =
  | 'm4a'
  | 'mp4'
  | 'mp3'
  | 'wav'
  | 'ogg'
  | 'webm'
  | 'flac'
  | 'amr'
  | 'unknown'

function baseNameFromPath(fileName: string): string {
  const trimmed = fileName.trim() || 'recording'
  const leaf = trimmed.split(/[/\\]/).pop() ?? trimmed
  return leaf.replace(/\.[a-z0-9]+$/i, '') || 'recording'
}

function readAscii(data: Uint8Array, start: number, length: number): string {
  let out = ''
  for (let i = start; i < start + length && i < data.length; i++) {
    out += String.fromCharCode(data[i])
  }
  return out
}

/** Detect real container from file header (Samsung m4a may be mp4/isom/3gp inside). */
export function detectContainerFromBuffer(data: ArrayBuffer): DetectedContainer {
  const bytes = new Uint8Array(data.slice(0, 16))
  if (bytes.length < 4) return 'unknown'

  const head6 = readAscii(bytes, 0, 6)
  if (head6.startsWith('#!AMR')) return 'amr'

  if (bytes.length >= 12 && readAscii(bytes, 4, 4) === 'ftyp') {
    const brand = readAscii(bytes, 8, 4)
    if (brand.includes('3g') || brand.startsWith('3gp')) return 'mp4'
    if (brand.trim() === 'M4A' || brand === 'M4A ') return 'm4a'
    return 'mp4'
  }

  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'mp3'
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'mp3'
  if (readAscii(bytes, 0, 4) === 'RIFF') return 'wav'
  if (readAscii(bytes, 0, 4) === 'OggS') return 'ogg'
  if (readAscii(bytes, 0, 4) === 'fLaC') return 'flac'
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return 'webm'
  }

  return 'unknown'
}

function metaFromContainer(
  container: DetectedContainer,
  fileName: string,
): WhisperUploadMeta | null {
  const base = baseNameFromPath(fileName)

  switch (container) {
    case 'm4a':
      return { fileName: `${base}.m4a`, mimeType: 'audio/mp4' }
    case 'mp4':
      return { fileName: `${base}.mp4`, mimeType: 'audio/mp4' }
    case 'mp3':
      return { fileName: `${base}.mp3`, mimeType: 'audio/mpeg' }
    case 'wav':
      return { fileName: `${base}.wav`, mimeType: 'audio/wav' }
    case 'ogg':
      return { fileName: `${base}.ogg`, mimeType: 'audio/ogg' }
    case 'webm':
      return { fileName: `${base}.webm`, mimeType: 'audio/webm' }
    case 'flac':
      return { fileName: `${base}.flac`, mimeType: 'audio/flac' }
    default:
      return null
  }
}

export function resolveWhisperUploadMeta(
  fileName: string,
  mimeType: string,
  data?: ArrayBuffer,
): WhisperResolveResult {
  if (data && data.byteLength > 0) {
    const container = detectContainerFromBuffer(data)
    if (container === 'amr') {
      return { error: HIEN_TRUONG_ERRORS.AMR_UNSUPPORTED }
    }
    const fromHeader = metaFromContainer(container, fileName)
    if (fromHeader) return fromHeader
  }

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
      fileName: `${baseNameFromPath(fileName)}.mp4`,
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
    fileName: `${baseNameFromPath(fileName)}.mp4`,
    mimeType: 'audio/mp4',
  }
}

/** Alternate extensions to try when Whisper rejects format (common for Samsung m4a). */
export function whisperUploadAttempts(
  resolved: WhisperUploadMeta,
): WhisperUploadMeta[] {
  const attempts: WhisperUploadMeta[] = [resolved]
  const { fileName } = resolved

  if (fileName.endsWith('.m4a')) {
    attempts.push({
      fileName: fileName.replace(/\.m4a$/i, '.mp4'),
      mimeType: 'audio/mp4',
    })
  } else if (fileName.endsWith('.mp4')) {
    attempts.push({
      fileName: fileName.replace(/\.mp4$/i, '.m4a'),
      mimeType: 'audio/mp4',
    })
  }

  return attempts
}

export function isInvalidFormatWhisperError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('invalid file format') || lower.includes('unsupported file')
}
