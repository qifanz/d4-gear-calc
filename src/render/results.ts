import { state, getAllAffixes } from '../state'
import { calcStats } from '../calc'
import type { StatsResult } from '../types'

const fm  = (v: number, d = 2): string => v.toFixed(d)
const fmx = (v: number): string => `×${fm(v)}`
const fmP = (v: number): string => `${v >= 0 ? '+' : ''}${fm(v * 100, 1)}%`

function deltaHtml(cur: number, cand: number): string {
  const d = cand / cur - 1
  if (Math.abs(d) < 0.0001) return `<span class="delta zero">—</span>`
  return `<span class="delta ${d > 0 ? 'pos' : 'neg'}">${fmP(d)}</span>`
}

function htmlSingle(s: StatsResult): string {
  return `
    <div class="res-section">
      <div class="res-section-label">乘区分解</div>
      <div class="res-row"><span class="res-label">技能倍率</span><span class="res-val gold">${fmx(s.skillMult)}</span></div>
      <div class="res-row"><span class="res-label">主属性 (${Math.round(s.mainStat)}点)</span><span class="res-val gold">${fmx(s.mainStatMult)}</span></div>
      <div class="res-row"><span class="res-label">A桶 加法</span><span class="res-val magic">${fmx(s.aMult)}</span></div>
      <div class="res-row"><span class="res-label">B桶 前置乘</span><span class="res-val rare">${fmx(s.bMult)}</span></div>
      <div class="res-row"><span class="res-label">C桶 独立乘</span><span class="res-val legend">${fmx(s.cMult)}</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">暴击参数</div>
      <div class="res-row"><span class="res-label">暴击率</span><span class="res-val">${fm(s.critRate, 1)}%</span></div>
      <div class="res-row"><span class="res-label">暴击伤害</span><span class="res-val">${fm(s.critDmg, 1)}%</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-big">
      <div class="res-big-label">基础伤害倍率</div>
      <div class="res-big-val">${fmx(s.baseDmg)}</div>
    </div>
    <div class="res-big" style="margin-top:8px">
      <div class="res-big-label">期望伤害（含暴击）</div>
      <div class="res-big-val">${fmx(s.expectedDmg)}</div>
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
  const ed = d.expectedDmg / c.expectedDmg - 1
  const edCls = Math.abs(ed) < 0.0001 ? '' : ed > 0 ? ' pos' : ' neg'
  return `
    <div class="res-section">
      <div class="res-section-label">乘区对比</div>
      <div class="res-row"><span class="res-label">技能倍率</span>${deltaHtml(c.skillMult, d.skillMult)}</div>
      <div class="res-row"><span class="res-label">主属性倍率</span>${deltaHtml(c.mainStatMult, d.mainStatMult)}</div>
      <div class="res-row"><span class="res-label">A桶</span>${deltaHtml(c.aMult, d.aMult)}</div>
      <div class="res-row"><span class="res-label">B桶</span>${deltaHtml(c.bMult, d.bMult)}</div>
      <div class="res-row"><span class="res-label">C桶</span>${deltaHtml(c.cMult, d.cMult)}</div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">暴击参数</div>
      <div class="res-row"><span class="res-label">暴击率</span><span class="res-val">${fm(c.critRate,1)}% → ${fm(d.critRate,1)}%</span></div>
      <div class="res-row"><span class="res-label">暴击伤害</span><span class="res-val">${fm(c.critDmg,1)}% → ${fm(d.critDmg,1)}%</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-section">
      <div class="res-section-label">绝对值</div>
      <div class="res-row"><span class="res-label">当前期望</span><span class="res-val gold">${fmx(c.expectedDmg)}</span></div>
      <div class="res-row"><span class="res-label">候选期望</span><span class="res-val gold">${fmx(d.expectedDmg)}</span></div>
    </div>
    <div class="res-divider"></div>
    <div class="res-big">
      <div class="res-big-label">期望伤害变化</div>
      <div class="res-big-val${edCls}">${fmP(ed)}</div>
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
