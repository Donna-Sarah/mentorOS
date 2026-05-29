export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function tomorrowKey(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getRecentLogKeys(
  logs: Record<string, { t: string; tm: string }[]>,
  days: number,
): string[] {
  return Object.keys(logs)
    .sort()
    .slice(-days)
}

export function formatLogTime(): string {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
