const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/oga',
  'audio/flac',
  'audio/aac',
  'audio/x-aac',
  'video/mp4',
  'video/webm',
  'application/octet-stream',
])

const AUDIO_EXTENSION = /\.(mp3|m4a|wav|webm|ogg|oga|flac|aac|mp4|mpeg|mpga)$/i

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024

export type HienTruongFileKind = 'image' | 'audio'

export function getHienTruongFileKind(file: File): HienTruongFileKind | null {
  if (IMAGE_TYPES.has(file.type)) return 'image'
  if (AUDIO_TYPES.has(file.type) || AUDIO_EXTENSION.test(file.name)) {
    if (file.type.startsWith('image/')) return 'image'
    return 'audio'
  }
  return null
}

export function guessAudioMimeType(fileName: string, fileType: string): string {
  if (fileType && fileType !== 'application/octet-stream') return fileType
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.m4a')) return 'audio/mp4'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.ogg')) return 'audio/ogg'
  if (lower.endsWith('.webm')) return 'audio/webm'
  if (lower.endsWith('.aac')) return 'audio/aac'
  return 'audio/webm'
}

export function getMaxBytesForKind(kind: HienTruongFileKind): number {
  return kind === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES
}
