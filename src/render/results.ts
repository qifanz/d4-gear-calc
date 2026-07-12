import { state, getAllAffixes } from '../state'
import { calcStats } from '../calc'
import { getCatLabel } from '../presets'
import type { StatsResult } from '../types'

const fm  = (v: number, d = 2): string => v.toFixed(d)
const fmx = (v: number): string => `×${fm(v)}`
const fmP = (v: number): string => `${v >= 0 ? '+' : ''}${fm(v * 100, 1)}%`

function deltaHtml(cur: number, cand: number): string {
  const d = cand / cur - 1
  if (Math.abs(d) < 0.0001) return `<span class="delta zero">—</span>`
  return `<span class="delta ${d > 0 ? 'pos' : 'neg'}">${fmP(d)}</span>`
}

function bCatRowsSingle(s: StatsResult): string {
  const entries = Object.entries(s.bCats)
  if (!entries.length) return ''
  return entries.map(([cat, v]) =>
    `<div class="res-row res-row-sub"><span class="res-label">${getCatLabel(cat)}</span><span class="res-val">${fm(v, 1)}%</span></div>`
  ).join('')
}

function bCatRowsCompare(c: StatsResult, d: StatsResult): string {
  const cats = Array.from(new Set([...Object.keys(c.bCats), ...Object.keys(d.bCats)]))
  if (!cats.length) return ''
  return cats.map(cat => {
    const cv = c.bCats[cat] ?? 0
    const dv = d.bCats[cat] ?? 0
    return `<div class="res-row res-row-sub"><span class="res-label">${getCatLabel(cat)}</span><span class="res-val">${fm(cv, 1)}% → ${fm(dv, 1)}%</span></div>`
  }).join('')
}

function htmlSingle(s: StatsResult): string {
  return `
    <div class="res-section">
      <div class="res-section-label">乘区分解</div>
      <div class="res-row"><span class="res-label">技能倍率</span><span class="res-val gold">${fmx(s.skillMult)}</span></div>
      <div class="res-row"><span class="res-label">主属性 (${Math.round(s.mainStat)}点)</span><span class="res-val gold">${fmx(s.mainStatMult)}</span></div>
      <div class="res-row"><span class="res-label">A桶 加法</span><span class="res-val magic">${fmx(s.aMult)}</span></div>
      <div class="res-row"><span class="res-label">B桶 前置乘</span><span class="res-val rare">${fmx(s.bMult)}</span></div>
      ${bCatRowsSingle(s)}
      <div class="res-row"><span class="res-label">C桶 独立乘</span><span class="res-val legend">${fmx(s.cMult)}</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">暴击 / 持续 参数</div>
      <div class="res-row"><span class="res-label">暴击率</span><span class="res-val">${fm(s.critRate, 1)}%</span></div>
      <div class="res-row"><span class="res-label">暴击伤害</span><span class="res-val">${fm(s.critDmg, 1)}%</span></div>
      <div class="res-row"><span class="res-label">持续伤害</span><span class="res-val">${fm(s.dotDmg, 1)}%</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-big">
      <div class="res-big-label">基础伤害倍率（共享乘区）</div>
      <div class="res-big-val">${fmx(s.baseDmg)}</div>
    </div>
    <div class="res-big" style="margin-top:8px">
      <div class="res-big-label">直接伤害期望（含暴击）</div>
      <div class="res-big-val">${fmx(s.expectedCritDmg)}</div>
    </div>
    <div class="res-big" style="margin-top:8px">
      <div class="res-big-label">持续伤害期望（DoT，不暴击）</div>
      <div class="res-big-val">${fmx(s.expectedDotDmg)}</div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">攻速（独立）</div>
      <div class="res-row"><span class="res-label">攻速加成</span><span class="res-val">${fm(s.atkSpd, 1)}%</span></div>
      <div class="res-row"><span class="res-label">攻速倍率</span><span class="res-val gold">${fmx(s.atkSpdMult)}</span></div>
    </div>
  `
}

function htmlCompare(c: StatsResult, d: StatsResult): string {
  const ecrit = d.expectedCritDmg / c.expectedCritDmg - 1
  const edot  = d.expectedDotDmg  / c.expectedDotDmg  - 1
  const ecritCls = Math.abs(ecrit) < 0.0001 ? '' : ecrit > 0 ? ' pos' : ' neg'
  const edotCls  = Math.abs(edot)  < 0.0001 ? '' : edot  > 0 ? ' pos' : ' neg'
  return `
    <div class="res-section">
      <div class="res-section-label">乘区对比</div>
      <div class="res-row"><span class="res-label">技能倍率</span>${deltaHtml(c.skillMult, d.skillMult)}</div>
      <div class="res-row"><span class="res-label">主属性倍率</span>${deltaHtml(c.mainStatMult, d.mainStatMult)}</div>
      <div class="res-row"><span class="res-label">A桶</span>${deltaHtml(c.aMult, d.aMult)}</div>
      <div class="res-row"><span class="res-label">B桶</span>${deltaHtml(c.bMult, d.bMult)}</div>
      ${bCatRowsCompare(c, d)}
      <div class="res-row"><span class="res-label">C桶</span>${deltaHtml(c.cMult, d.cMult)}</div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">暴击 / 持续 参数</div>
      <div class="res-row"><span class="res-label">暴击率</span><span class="res-val">${fm(c.critRate,1)}% → ${fm(d.critRate,1)}%</span></div>
      <div class="res-row"><span class="res-label">暴击伤害</span><span class="res-val">${fm(c.critDmg,1)}% → ${fm(d.critDmg,1)}%</span></div>
      <div class="res-row"><span class="res-label">持续伤害</span><span class="res-val">${fm(c.dotDmg,1)}% → ${fm(d.dotDmg,1)}%</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">绝对值</div>
      <div class="res-row"><span class="res-label">当前直接期望</span><span class="res-val gold">${fmx(c.expectedCritDmg)}</span></div>
      <div class="res-row"><span class="res-label">候选直接期望</span><span class="res-val gold">${fmx(d.expectedCritDmg)}</span></div>
      <div class="res-row"><span class="res-label">当前持续期望</span><span class="res-val gold">${fmx(c.expectedDotDmg)}</span></div>
      <div class="res-row"><span class="res-label">候选持续期望</span><span class="res-val gold">${fmx(d.expectedDotDmg)}</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-big">
      <div class="res-big-label">直接伤害变化（含暴击）</div>
      <div class="res-big-val${ecritCls}">${fmP(ecrit)}</div>
    </div>
    <div class="res-big" style="margin-top:8px">
      <div class="res-big-label">持续伤害变化（DoT）</div>
      <div class="res-big-val${edotCls}">${fmP(edot)}</div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">攻速（独立）</div>
      <div class="res-row"><span class="res-label">当前攻速</span><span class="res-val">${fmx(c.atkSpdMult)}</span></div>
      <div class="res-row"><span class="res-label">攻速变化</span>${deltaHtml(c.atkSpdMult, d.atkSpdMult)}</div>
    </div>
  `
}

export function renderResults(): void {
  const body = document.getElementById('results-body')!

  if (state.compareMode && state.selectedSlot) {
    const base = getAllAffixes(state.selectedSlot)
    const curStats  = calcStats([...base, ...state.slots[state.selectedSlot].affixes], state.globalCritRate, state.globalSkillBonus)
    const candStats = calcStats([...base, ...state.candidateAffixes],                  state.globalCritRate, state.globalSkillBonus)
    body.innerHTML = htmlCompare(curStats, candStats)
  } else {
    const s = calcStats(getAllAffixes(), state.globalCritRate, state.globalSkillBonus)
    body.innerHTML = htmlSingle(s)
  }
}
