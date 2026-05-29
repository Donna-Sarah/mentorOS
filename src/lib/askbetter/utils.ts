export function safeParse<T>(raw: string): T | null {
  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    return JSON.parse(raw.slice(start, end + 1)) as T
  } catch {
    return null
  }
}

export function copyText(text: string): boolean {
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;'
    document.body.appendChild(el)
    el.select()
    el.setSelectionRange(0, 99999)
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  } catch {
    /* empty */
  }
  try {
    void navigator.clipboard.writeText(text)
    return true
  } catch {
    /* empty */
  }
  return false
}

export function getScoreColor(score: number): string {
  if (score < 40) return '#EF4444'
  if (score < 65) return '#F59E0B'
  if (score < 85) return '#10B981'
  return '#059669'
}
