import type { AppState, Affix, BucketType } from './types'
import { SLOT_DEFS } from './presets'

const STORAGE_KEY = 'd4calc_v2'

let _uid = 1
export const uid = (): number => _uid++

export function newAffix(presetId = 'a_dmg'): Affix {
  return {
    id: uid(),
    presetId,
    customName: '',
    customBucket: 'C' as BucketType,
    customCat: '',
    value: 0,
  }
}

export const state: AppState = {
  globalCritRate: 5,
  globalSkillBonus: 0,
  slots: Object.fromEntries(Object.keys(SLOT_DEFS).map(id => [id, { affixes: [] }])),
  selectedSlot: null,
  compareMode: false,
  candidateAffixes: [],
}

export function getAllAffixes(excludeSlot: string | null = null): Affix[] {
  return Object.entries(state.slots)
    .filter(([id]) => id !== excludeSlot)
    .flatMap(([, slot]) => slot.affixes)
}

export function selectSlot(id: string): void {
  state.selectedSlot = id
  state.compareMode = false
  state.candidateAffixes = []
}

export function toggleCompare(): void {
  state.compareMode = !state.compareMode
  if (state.compareMode && state.selectedSlot) {
    state.candidateAffixes = state.slots[state.selectedSlot].affixes.map(a => ({ ...a, id: uid() }))
  } else {
    state.candidateAffixes = []
  }
}

export function addAffix(targetId: string): void {
  const a = newAffix()
  if (targetId === 'candidate') {
    state.candidateAffixes.push(a)
  } else {
    state.slots[targetId].affixes.push(a)
  }
}

export function removeAffix(targetId: string, index: number): void {
  if (targetId === 'candidate') {
    state.candidateAffixes.splice(index, 1)
  } else {
    state.slots[targetId].affixes.splice(index, 1)
  }
}

export function clearSlot(slotId: string): void {
  state.slots[slotId].affixes = []
}

export function clearAll(): void {
  for (const slot of Object.values(state.slots)) slot.affixes = []
  state.compareMode = false
  state.candidateAffixes = []
}

// ── Persistence ──────────────────────────────────────

export function saveState(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    globalCritRate: state.globalCritRate,
    globalSkillBonus: state.globalSkillBonus,
    slots: state.slots,
  }))
}

export function loadState(): void {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    const d = JSON.parse(raw)
    state.globalCritRate   = d.globalCritRate   ?? 5
    state.globalSkillBonus = d.globalSkillBonus ?? 0
    if (d.slots) {
      for (const [id, slot] of Object.entries(d.slots) as [string, { affixes: Affix[] }][]) {
        if (state.slots[id] && Array.isArray(slot.affixes)) {
          state.slots[id].affixes = slot.affixes
          slot.affixes.forEach(a => {
            if (!a.id) a.id = uid()
            else _uid = Math.max(_uid, a.id + 1)
          })
        }
      }
    }
  } catch {
    // corrupted storage — ignore
  }
}

export function exportJSON(): void {
  const data = JSON.stringify({
    globalCritRate: state.globalCritRate,
    globalSkillBonus: state.globalSkillBonus,
    slots: state.slots,
  }, null, 2)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
  a.download = 'd4-gear.json'
  a.click()
}

export function importJSON(file: File, onDone: () => void): void {
  const reader = new FileReader()
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target!.result as string)
      state.globalCritRate   = d.globalCritRate   ?? 5
      state.globalSkillBonus = d.globalSkillBonus ?? 0
      if (d.slots) {
        for (const [id, slot] of Object.entries(d.slots) as [string, { affixes: Affix[] }][]) {
          if (state.slots[id] && Array.isArray(slot.affixes)) {
            state.slots[id].affixes = slot.affixes
            slot.affixes.forEach(a => { if (!a.id) a.id = uid() })
          }
        }
      }
      saveState()
      onDone()
    } catch (err) {
      alert('导入失败：' + (err as Error).message)
    }
  }
  reader.readAsText(file)
}
