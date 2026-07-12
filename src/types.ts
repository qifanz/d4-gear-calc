export type BucketType =
  | 'mainstat' | 'skill'
  | 'A' | 'B' | 'C'
  | 'critrate' | 'atkspd'

// B桶内的适用范围：暴击伤害只喂给暴击路径，持续伤害只喂给持续路径，
// 易伤/元素伤等其余B桶类别两条路径共享
export type BScope = 'both' | 'crit' | 'dot'

export interface AffixPreset {
  id: string
  name: string
  bucket: BucketType
  unit: 'pts' | '%'
  cat?: string
  scope?: BScope
  isCustom?: boolean
}

export interface Affix {
  id: number
  presetId: string
  customName: string
  customBucket: BucketType
  customCat: string
  customScope: BScope
  value: number
}

export interface SlotDef {
  name: string
  icon: string
  type: string
}

export interface SlotData {
  affixes: Affix[]
}

export interface AppState {
  globalCritRate: number
  globalSkillBonus: number
  slots: Record<string, SlotData>
  selectedSlot: string | null
  compareMode: boolean
  candidateAffixes: Affix[]
}

export interface StatsResult {
  mainStat: number
  critRate: number
  critDmg: number
  dotDmg: number
  atkSpd: number
  skillMult: number
  mainStatMult: number
  aMult: number
  bCats: Record<string, number>
  bMult: number
  cMult: number
  baseDmg: number
  critDmgMult: number
  dotDmgMult: number
  expectedCritDmg: number
  expectedDotDmg: number
  atkSpdMult: number
}
