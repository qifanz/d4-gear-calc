import { state, addAffix, removeAffix, clearSlot, toggleCompare, saveState } from '../state'
import { SLOT_DEFS, getBucket, getCat, getUnit, getBulletClass, buildPresetOptions } from '../presets'
import type { Affix, BucketType, BScope } from '../types'

export function renderEditor(): void {
  const barName    = document.getElementById('editor-bar-name')!
  const barType    = document.getElementById('editor-bar-type')!
  const barActions = document.getElementById('editor-bar-actions')!
  const body       = document.getElementById('editor-body')!

  if (!state.selectedSlot) {
    barName.textContent = '选择装备槽位'
    barType.textContent = ''
    barActions.innerHTML = ''
    body.className = 'editor-body single'
    body.innerHTML = `<div class="empty-editor"><div class="empty-rune">🔱</div><div class="empty-text">选择左侧装备槽位</div></div>`
    return
  }

  const def  = SLOT_DEFS[state.selectedSlot]
  const slot = state.slots[state.selectedSlot]

  barName.textContent = def.name.toUpperCase()
  barType.textContent = def.type

  barActions.innerHTML = ''

  const btnClear = document.createElement('button')
  btnClear.className = 'ebtn'
  btnClear.textContent = '清空'
  btnClear.addEventListener('click', () => {
    clearSlot(state.selectedSlot!)
    window.dispatchEvent(new CustomEvent('d4:render'))
  })

  const btnCmp = document.createElement('button')
  btnCmp.className = 'ebtn compare-btn' + (state.compareMode ? ' active' : '')
  btnCmp.textContent = state.compareMode ? '◀ 对比中' : '对比候选'
  btnCmp.addEventListener('click', () => {
    toggleCompare()
    window.dispatchEvent(new CustomEvent('d4:render'))
  })

  barActions.appendChild(btnClear)
  barActions.appendChild(btnCmp)

  if (state.compareMode) {
    body.className = 'editor-body dual'
    body.innerHTML = ''
    body.appendChild(buildCard(slot.affixes, state.selectedSlot, def.name, false))
    body.appendChild(buildCard(state.candidateAffixes, 'candidate', def.name + ' (候选)', true))
  } else {
    body.className = 'editor-body single'
    body.innerHTML = ''
    body.appendChild(buildCard(slot.affixes, state.selectedSlot, def.name, false))
  }
}

function buildCard(affixes: Affix[], targetId: string, title: string, isCandidate: boolean): HTMLElement {
  const card = document.createElement('div')
  card.className = 'item-card'

  card.innerHTML = `
    <div class="card-header">
      <div class="card-title${isCandidate ? ' candidate' : ''}">${title.toUpperCase()}</div>
      <div class="card-subtitle">${isCandidate ? '候选替换装备' : '当前装备词缀'}</div>
    </div>
    <div class="card-divider">
      <div class="card-divider-line"></div>
      <div class="card-divider-gem">◆</div>
      <div class="card-divider-line"></div>
    </div>
  `

  const body = document.createElement('div')
  body.className = 'card-body'

  affixes.forEach((affix, i) => body.appendChild(buildAffixRow(affix, i, targetId)))

  const addBtn = document.createElement('button')
  addBtn.className = 'btn-add'
  addBtn.textContent = '+ 添加词缀'
  addBtn.addEventListener('click', () => {
    addAffix(targetId)
    window.dispatchEvent(new CustomEvent('d4:render'))
  })

  const addWrap = document.createElement('div')
  addWrap.className = 'add-affix-wrap'
  addWrap.appendChild(addBtn)
  body.appendChild(addWrap)

  card.appendChild(body)
  return card
}

function buildAffixRow(affix: Affix, index: number, targetId: string): HTMLElement {
  const bucket   = getBucket(affix)
  const isCustom = affix.presetId === 'custom'
  const bulletCls = getBulletClass(affix)

  const row = document.createElement('div')
  row.className = `affix-row bucket-${bucket}` + (bucket === 'B' ? ` bcat-${getCat(affix)}` : '')

  const bullet = document.createElement('div')
  bullet.className = `affix-bullet ${bulletCls}`
  row.appendChild(bullet)

  const sel = document.createElement('select')
  sel.className = 'affix-select'
  sel.innerHTML = buildPresetOptions(affix.presetId)
  sel.addEventListener('change', () => {
    affix.presetId = sel.value
    if (sel.value !== 'custom') {
      affix.customName = ''
      affix.customBucket = 'C'
    }
    saveState()
    window.dispatchEvent(new CustomEvent('d4:render'))
  })
  row.appendChild(sel)

  if (isCustom) {
    const nameInput = document.createElement('input')
    nameInput.className = 'affix-custom-name'
    nameInput.type = 'text'
    nameInput.placeholder = '词缀名'
    nameInput.value = affix.customName
    nameInput.addEventListener('input', () => {
      affix.customName = nameInput.value
      saveState()
      window.dispatchEvent(new CustomEvent('d4:results'))
    })
    row.appendChild(nameInput)

    const bucketSel = document.createElement('select')
    bucketSel.className = 'affix-bucket-sel'
    const bucketOptions: [BucketType, string][] = [
      ['A', 'A桶'], ['B', 'B桶'], ['C', 'C桶'],
      ['skill', '技能'], ['mainstat', '主属性'],
      ['critrate', '暴击率'], ['atkspd', '攻速'],
    ]
    bucketSel.innerHTML = bucketOptions
      .map(([v, l]) => `<option value="${v}"${affix.customBucket === v ? ' selected' : ''}>${l}</option>`)
      .join('')
    bucketSel.addEventListener('change', () => {
      affix.customBucket = bucketSel.value as BucketType
      saveState()
      window.dispatchEvent(new CustomEvent('d4:render'))
    })
    row.appendChild(bucketSel)

    if (affix.customBucket === 'B') {
      const scopeSel = document.createElement('select')
      scopeSel.className = 'affix-scope-sel'
      const scopeOptions: [BScope, string][] = [
        ['both', '两者共享'], ['crit', '仅暴击'], ['dot', '仅持续'],
      ]
      scopeSel.innerHTML = scopeOptions
        .map(([v, l]) => `<option value="${v}"${(affix.customScope || 'both') === v ? ' selected' : ''}>${l}</option>`)
        .join('')
      scopeSel.addEventListener('change', () => {
        affix.customScope = scopeSel.value as BScope
        saveState()
        window.dispatchEvent(new CustomEvent('d4:results'))
      })
      row.appendChild(scopeSel)
    }
  }

  const valInput = document.createElement('input')
  valInput.className = 'affix-val'
  valInput.type = 'number'
  valInput.step = '0.1'
  valInput.value = String(affix.value)
  valInput.addEventListener('input', () => {
    affix.value = parseFloat(valInput.value) || 0
    saveState()
    window.dispatchEvent(new CustomEvent('d4:results'))
  })
  row.appendChild(valInput)

  const unit = document.createElement('span')
  unit.className = 'affix-unit'
  unit.textContent = getUnit(affix)
  row.appendChild(unit)

  const mwDown = document.createElement('button')
  mwDown.className = 'btn-mw'
  mwDown.textContent = '÷1.5'
  mwDown.title = '模拟精造降级（数值 ÷1.5）'
  mwDown.addEventListener('click', () => {
    affix.value = Math.round((affix.value / 1.5) * 100) / 100
    saveState()
    window.dispatchEvent(new CustomEvent('d4:render'))
  })
  row.appendChild(mwDown)

  const mwUp = document.createElement('button')
  mwUp.className = 'btn-mw'
  mwUp.textContent = '×1.5'
  mwUp.title = '模拟精造升级（数值 ×1.5）——配合「对比候选」，在候选栏把要降级的词条÷1.5、要升级的词条×1.5，即可看到换精造后的伤害变化'
  mwUp.addEventListener('click', () => {
    affix.value = Math.round((affix.value * 1.5) * 100) / 100
    saveState()
    window.dispatchEvent(new CustomEvent('d4:render'))
  })
  row.appendChild(mwUp)

  const rmBtn = document.createElement('button')
  rmBtn.className = 'btn-rm'
  rmBtn.textContent = '×'
  rmBtn.addEventListener('click', () => {
    removeAffix(targetId, index)
    window.dispatchEvent(new CustomEvent('d4:render'))
  })
  row.appendChild(rmBtn)

  return row
}
