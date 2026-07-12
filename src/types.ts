export type BucketType =
  | 'mainstat' | 'skill'
  | 'A' | 'B' | 'C'
  | 'critrate' | 'critdmg' | 'dotdmg' | 'atkspd'

export interface AffixPreset {
  id: string
  name: string
  bucket: BucketType
  unit: 'pts' | '%'
  cat?: string
  isCustom?: boolean
}

export interface Affix {
  id: number
  presetId: string
  customName: string
  customBucket: BucketType
  customCat: string
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
  bMult: number
  cMult: number
  baseDmg: number
  critDmgMult: number
  dotDmgMult: number
  expectedCritDmg: number
  expectedDotDmg: number
  atkSpdMult: number
}
