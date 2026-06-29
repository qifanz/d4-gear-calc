import './style.css'
import { state, loadState, saveState, exportJSON, importJSON, clearAll } from './state'
import { renderDoll } from './render/doll'
import { renderEditor } from './render/editor'
import { renderResults } from './render/results'

function render(): void {
  renderDoll()
  renderEditor()
  renderResults()
  saveState()
}

// Full re-render
window.addEventListener('d4:render', () => render())

// Results-only refresh (value edits — no need to rebuild DOM)
window.addEventListener('d4:results', () => renderResults())

// Global inputs
document.getElementById('g-crit-rate')!.addEventListener('input', e => {
  state.globalCritRate = parseFloat((e.target as HTMLInputElement).value) || 0
  saveState()
  renderResults()
})

document.getElementById('g-skill-bonus')!.addEventListener('input', e => {
  state.globalSkillBonus = parseFloat((e.target as HTMLInputElement).value) || 0
  saveState()
  renderResults()
})

// Header buttons
document.getElementById('btn-export')!.addEventListener('click', exportJSON)

document.getElementById('btn-import')!.addEventListener('click', () => {
  document.getElementById('import-file')!.click()
})

document.getElementById('import-file')!.addEventListener('change', e => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importJSON(file, () => {
    const critEl = document.getElementById('g-crit-rate') as HTMLInputElement
    const skillEl = document.getElementById('g-skill-bonus') as HTMLInputElement
    critEl.value  = String(state.globalCritRate)
    skillEl.value = String(state.globalSkillBonus)
    render()
  })
  ;(e.target as HTMLInputElement).value = ''
})

document.getElementById('btn-clear')!.addEventListener('click', () => {
  if (!confirm('清空所有装备数据？')) return
  clearAll()
  render()
})

// Boot
loadState()

// Sync global inputs with loaded state
;(document.getElementById('g-crit-rate')  as HTMLInputElement).value = String(state.globalCritRate)
;(document.getElementById('g-skill-bonus') as HTMLInputElement).value = String(state.globalSkillBonus)

render()
