import trapTaxonomyData from '../../../public/data/trap-taxonomy.json'
import coreRulesData from '../../../public/data/core-rules.json'
import type {
  TrapEntry,
  CoreRuleEntry,
  TrapId,
  CoreRuleId,
  TrapSubtype,
} from '@/types/pmp'

const trapTaxonomy = trapTaxonomyData as { traps: TrapEntry[] }
const coreRules = coreRulesData as { core_rules: CoreRuleEntry[] }

export function getTrap(trapId: TrapId): TrapEntry | undefined {
  return trapTaxonomy.traps.find((t) => t.trap_id === trapId)
}

export function getCoreRule(
  coreRuleId: CoreRuleId | null,
  subtype?: TrapSubtype
): CoreRuleEntry | undefined {
  if (!coreRuleId) return undefined
  if (subtype) {
    const subtypeMatch = coreRules.core_rules.find(
      (r) => r.core_rule_id === coreRuleId && r.trap_subtype === subtype
    )
    if (subtypeMatch) return subtypeMatch
  }
  return coreRules.core_rules.find(
    (r) => r.core_rule_id === coreRuleId && !r.trap_subtype
  )
}

export function getTrapCoreRule(
  trapId: TrapId,
  subtype?: TrapSubtype
): CoreRuleEntry | undefined {
  const trap = getTrap(trapId)
  if (!trap || !trap.core_rule_id) return undefined
  return getCoreRule(trap.core_rule_id, subtype)
}

export function getUserFacingTraps(): TrapEntry[] {
  return trapTaxonomy.traps.filter((t) => t.dimension !== 'internal')
}

export function getTrapDisplayName(
  trapId: TrapId,
  lang: 'en' | 'vi' = 'vi'
): string {
  const trap = getTrap(trapId)
  if (!trap) return trapId
  return lang === 'vi' ? trap.name_vi : trap.name_en
}

export function getCoreRuleText(
  coreRuleId: CoreRuleId | null,
  lang: 'en' | 'vi' = 'vi',
  subtype?: TrapSubtype
): string {
  if (!coreRuleId) return ''
  const rule = getCoreRule(coreRuleId, subtype)
  if (!rule) return ''
  return lang === 'vi' ? rule.rule_vi : rule.rule_en
}
