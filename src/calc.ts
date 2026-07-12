import type { Affix, StatsResult } from './types'
import { getBucket, getCat, getScope } from './presets'

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
  let dotDmg = 0
  let atkSpd = 0

  for (const a of affixes) {
    const b = getBucket(a)
    const v = a.value

    switch (b) {
      case 'mainstat':  mainStat += v; break
      case 'skill':     skillMults.push(v); break
      case 'A':         aSum += v; break
      case 'B': {
        // B桶内暴击伤害/持续伤害只喂各自路径；其余类别（易伤、元素伤等）两条路径共享
        const scope = getScope(a)
        if (scope === 'crit') critDmg += v
        else if (scope === 'dot') dotDmg += v
        else {
          const cat = getCat(a)
          bCats[cat] = (bCats[cat] ?? 0) + v
        }
        break
      }
      case 'C':         cMults.push(v); break
      case 'critrate':  critRate += v; break
      case 'atkspd':    atkSpd   += v; break
    }
  }

  const skillMult    = skillMults.reduce((s, v) => s * (1 + v / 100), 1 + skillBonus / 100)
  const mainStatMult = 1 + mainStat * 0.001
  const aMult        = 1 + aSum / 100
  const bMult        = Object.values(bCats).reduce((s, v) => s * (1 + v / 100), 1)
  const cMult        = cMults.reduce((s, v) => s * (1 + v / 100), 1)
  // 共享乘区：技能/主属性/A/B/C桶同时供给暴击路径与持续伤害路径
  const baseDmg      = skillMult * mainStatMult * aMult * bMult * cMult
  const cr           = Math.min(critRate, 100) / 100
  const cd           = critDmg / 100
  // 暴击伤害只影响直接命中路径；持续伤害只影响DoT路径，两者互不干扰
  const critDmgMult     = 1 + cr * cd
  const dotDmgMult      = 1 + dotDmg / 100
  const expectedCritDmg = baseDmg * critDmgMult
  const expectedDotDmg  = baseDmg * dotDmgMult
  const atkSpdMult   = 1 + atkSpd / 100

  return {
    mainStat, critRate, critDmg, dotDmg, atkSpd,
    skillMult, mainStatMult, aMult, bMult, cMult,
    baseDmg, critDmgMult, dotDmgMult, expectedCritDmg, expectedDotDmg, atkSpdMult,
  }
}
