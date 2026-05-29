import type { NextUpStructGroup } from '@/types/nextup'

interface ExcelRow {
  group?: string
  label?: string
  value?: string
}

export function structGroupsFromRows(rows: ExcelRow[]): NextUpStructGroup[] {
  const map = new Map<string, NextUpStructGroup>()

  for (const row of rows) {
    const groupName = (row.group ?? '').trim() || 'Khác'
    const label = (row.label ?? '').trim()
    const value = (row.value ?? '').trim()
    if (!value && !label) continue

    if (!map.has(groupName)) {
      map.set(groupName, { g: groupName, icon: '', items: [] })
    }
    map.get(groupName)?.items.push({ l: label, v: value || label })
  }

  return Array.from(map.values())
}

export function planTextFromStruct(struct: NextUpStructGroup[]): string {
  return struct
    .map((g) => {
      const lines = g.items.map((it) => {
        const prefix = it.l ? `${it.l}: ` : '- '
        return `${prefix}${it.v}`
      })
      return `[${g.g}]\n${lines.join('\n')}`
    })
    .join('\n\n')
}
