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
])

const AUDIO_EXTENSION = /\.(mp3|m4a|wav|webm|ogg|oga|flac|aac|mp4|mpeg|mpga)$/i

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024

export type HienTruongFileKind = 'image' | 'audio'

export function getHienTruongFileKind(file: File): HienTruongFileKind | null {
  if (IMAGE_TYPES.has(file.type)) return 'image'
  if (AUDIO_TYPES.has(file.type) || AUDIO_EXTENSION.test(file.name)) return 'audio'
  return null
}

export function getMaxBytesForKind(kind: HienTruongFileKind): number {
  return kind === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES
}
