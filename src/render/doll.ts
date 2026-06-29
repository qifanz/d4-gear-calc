import { state, selectSlot } from '../state'
import { SLOT_DEFS, DOLL_LAYOUT } from '../presets'

export function renderDoll(): void {
  const grid = document.getElementById('doll-grid')!
  grid.innerHTML = ''

  for (let r = 0; r < DOLL_LAYOUT.length; r++) {
    for (let c = 0; c < 3; c++) {
      const id = DOLL_LAYOUT[r][c]

      if (!id) {
        const empty = document.createElement('div')
        empty.className = 'slot-cell empty-cell'
        grid.appendChild(empty)
        continue
      }

      if (id === 'char') {
        // Only render the silhouette cell once (at row 1), span 2 rows via CSS grid
        if (r === 1) {
          const cell = document.createElement('div')
          cell.className = 'slot-cell char-cell'
          cell.style.gridRow = '2 / 4'
          cell.innerHTML = `<div class="char-silhouette"><span class="char-head">😐</span><span class="char-body">🧍</span></div>`
          grid.appendChild(cell)
        }
        continue
      }

      const def = SLOT_DEFS[id]
      const slot = state.slots[id]
      const hasData = slot.affixes.length > 0
      const isActive = state.selectedSlot === id

      const cell = document.createElement('div')
      cell.className = [
        'slot-cell',
        hasData  ? 'has-data' : '',
        isActive ? 'active'   : '',
      ].filter(Boolean).join(' ')

      cell.innerHTML = `
        <div class="slot-dot"></div>
        <div class="slot-icon">${def.icon}</div>
        <div class="slot-label">${def.name}</div>
        ${hasData ? `<div class="slot-count-badge">${slot.affixes.length}</div>` : ''}
      `
      cell.addEventListener('click', () => {
        selectSlot(id)
        // Trigger full re-render via main
        window.dispatchEvent(new CustomEvent('d4:render'))
      })
      grid.appendChild(cell)
    }
  }
}
