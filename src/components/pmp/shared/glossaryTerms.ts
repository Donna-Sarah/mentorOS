import type { GlossaryEntry } from '@/types/pmp'
import glossaryData from '../../../../public/data/glossary.json'

export const glossaryEntries = glossaryData as GlossaryEntry[]

export const GLOSSARY_PAIR_COUNT = glossaryEntries.length

export const GLOSSARY_TERM_COUNT = glossaryEntries.reduce(
  (count, entry) => count + entry.pair.filter((term) => term.trim()).length,
  0,
)

export interface GlossaryTermMatch {
  term: string
  entryIndex: number
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildGlossaryTermList(): GlossaryTermMatch[] {
  const terms: GlossaryTermMatch[] = []

  glossaryEntries.forEach((entry, entryIndex) => {
    entry.pair.forEach((term) => {
      if (term.trim()) {
        terms.push({ term, entryIndex })
      }
    })
  })

  return terms.sort((a, b) => b.term.length - a.term.length)
}

export function buildGlossaryHighlightPattern(terms: GlossaryTermMatch[]): RegExp | null {
  if (terms.length === 0) return null

  const pattern = terms.map(({ term }) => escapeRegex(term)).join('|')
  return new RegExp(`\\b(${pattern})\\b`, 'gi')
}

export function getOtherPairTerm(entry: GlossaryEntry, clickedTerm: string): string | null {
  const [first, second] = entry.pair
  if (!second) return null

  if (first.toLowerCase() === clickedTerm.toLowerCase()) return second
  if (second.toLowerCase() === clickedTerm.toLowerCase()) return first
  return null
}

export function getOrderedDetailHalves(
  entry: GlossaryEntry,
  clickedTerm: string,
): string[] {
  const halves = entry.detail.split('\n\n').filter(Boolean)
  if (halves.length <= 1) return halves

  const clickedIsFirst = entry.pair[0].toLowerCase() === clickedTerm.toLowerCase()
  return clickedIsFirst ? halves : [...halves].reverse()
}
