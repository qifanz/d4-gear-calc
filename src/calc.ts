import type { Affix, StatsResult } from './types'
import { getBucket, getCat } from './presets'

export function calcStats(
  affixes: Affix[],
  baseCrit: number,
  skillBonus: number,
): StatsResult {
  let mainStat = 0
  const skillMults: number[] = []
  let aSum = 0
  const bCats: Record<string, number> = {}
  const cMults: number[] = []
  let critRate = baseCrit
  let critDmg = 0
  let atkSpd = 0

  for (const a of affixes) {
    const b = getBucket(a)
    const v = a.value

    switch (b) {
      case 'mainstat':  mainStat += v; break
      case 'skill':     skillMults.push(v); break
      case 'A':         aSum += v; break
      case 'B': {
        const cat = getCat(a)
        bCats[cat] = (bCats[cat] ?? 0) + v
        break
      }
      case 'C':         cMults.push(v); break
      case 'critrate':  critRate += v; break
      case 'critdmg':   critDmg  += v; break
      case 'atkspd':    atkSpd   += v; break
    }
  }

  const skillMult    = skillMults.reduce((s, v) => s * (1 + v / 100), 1 + skillBonus / 100)
  const mainStatMult = 1 + mainStat * 0.001
  const aMult        = 1 + aSum / 100
  const bMult        = Object.values(bCats).reduce((s, v) => s * (1 + v / 100), 1)
  const cMult        = cMults.reduce((s, v) => s * (1 + v / 100), 1)
  const baseDmg      = skillMult * mainStatMult * aMult * bMult * cMult
  const cr           = Math.min(critRate, 100) / 100
  const cd           = critDmg / 100
  const expectedDmg  = baseDmg * (1 + cr * cd)
  const atkSpdMult   = 1 + atkSpd / 100

  return {
    mainStat, critRate, critDmg, atkSpd,
    skillMult, mainStatMult, aMult, bMult, cMult,
    baseDmg, expectedDmg, atkSpdMult,
  }
}
