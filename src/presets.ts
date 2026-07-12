import type { AffixPreset, Affix, SlotDef, BucketType, BScope } from './types'

export const PRESETS: AffixPreset[] = [
  { id: 'mainstat',    name: '主属性',          bucket: 'mainstat', unit: 'pts' },
  { id: 'skill_dmg',   name: '技能伤害',         bucket: 'skill',    unit: '%' },
  { id: 'crit_rate',   name: '暴击率',           bucket: 'critrate', unit: '%' },
  { id: 'atk_spd',     name: '攻击速度',         bucket: 'atkspd',   unit: '%' },
  { id: 'a_dmg',       name: 'A桶伤害(+)',       bucket: 'A',        unit: '%' },
  { id: 'b_crit',      name: '暴击伤害',         bucket: 'B', cat: 'crit',      scope: 'crit', unit: '%' },
  { id: 'b_vul',       name: '易伤伤害',         bucket: 'B', cat: 'vul',       scope: 'both', unit: '%' },
  { id: 'b_elemental', name: '元素伤害',         bucket: 'B', cat: 'elemental', scope: 'both', unit: '%' },
  { id: 'b_dot',       name: '持续伤害',         bucket: 'B', cat: 'dot',       scope: 'dot',  unit: '%' },
  { id: 'c_legend',    name: '传奇词条加成',     bucket: 'C',        unit: '%' },
  { id: 'c_unique',    name: '独特词条加成',     bucket: 'C',        unit: '%' },
  { id: 'custom',      name: '— 自定义词缀 —',   bucket: 'C',        unit: '%', isCustom: true },
]

export const PRESET_MAP: Record<string, AffixPreset> =
  Object.fromEntries(PRESETS.map(p => [p.id, p]))

export const SLOT_DEFS: Record<string, SlotDef> = {
  helm:    { name: '头盔',  icon: '⛑',  type: '头部防具' },
  chest:   { name: '胸甲',  icon: '🥋', type: '躯干防具' },
  gloves:  { name: '手套',  icon: '🧤', type: '手部防具' },
  pants:   { name: '裤子',  icon: '🩲', type: '腿部防具' },
  boots:   { name: '靴子',  icon: '👢', type: '脚部防具' },
  weapon:  { name: '武器',  icon: '⚔',  type: '主手武器' },
  offhand: { name: '副手',  icon: '🛡', type: '副手装备' },
  ring1:   { name: '戒指1', icon: '💍', type: '戒指' },
  ring2:   { name: '戒指2', icon: '💍', type: '戒指' },
  amulet:  { name: '护符',  icon: '📿', type: '项链' },
}

// null = empty cell, 'char' = character silhouette
export const DOLL_LAYOUT: (string | null)[][] = [
  [null,      'helm',   null    ],
  ['offhand', 'char',   'weapon'],
  ['ring1',   'char',   'ring2' ],
  ['gloves',  'chest',  'boots' ],
  [null,      'pants',  null    ],
  [null,      'amulet', null    ],
]

export const BULLET_CLASS: Record<BucketType, string> = {
  A:        'bullet-A',
  B:        'bullet-B',
  C:        'bullet-C',
  skill:    'bullet-skill',
  mainstat: 'bullet-mainstat',
  critrate: 'bullet-critrate',
  atkspd:   'bullet-atkspd',
}

// B桶内按类别（暴击/持续/易伤/元素）区分颜色，即便它们同属B桶
const B_CAT_BULLET: Record<string, string> = {
  crit:      'bullet-b-crit',
  dot:       'bullet-b-dot',
  vul:       'bullet-b-vul',
  elemental: 'bullet-b-elemental',
}

export function getBucket(a: Affix): BucketType {
  if (a.presetId === 'custom') return a.customBucket
  return PRESET_MAP[a.presetId]?.bucket ?? 'C'
}

export function getCat(a: Affix): string {
  if (a.presetId === 'custom') return a.customCat || `custom_${a.id}`
  return PRESET_MAP[a.presetId]?.cat ?? a.presetId
}

export function getScope(a: Affix): BScope {
  if (a.presetId === 'custom') return a.customScope || 'both'
  return PRESET_MAP[a.presetId]?.scope ?? 'both'
}

export function getBulletClass(a: Affix): string {
  const bucket = getBucket(a)
  if (bucket === 'B') return B_CAT_BULLET[getCat(a)] ?? BULLET_CLASS.B
  return BULLET_CLASS[bucket]
}

export function getAffixName(a: Affix): string {
  if (a.presetId === 'custom') return a.customName || '自定义词缀'
  return PRESET_MAP[a.presetId]?.name ?? '?'
}

export function getUnit(a: Affix): string {
  if (a.presetId === 'custom') return '%'
  return PRESET_MAP[a.presetId]?.unit === 'pts' ? '' : '%'
}

export function buildPresetOptions(selectedId: string): string {
  const groups: [string, string[]][] = [
    ['特殊属性',    ['mainstat', 'skill_dmg', 'crit_rate', 'atk_spd']],
    ['A桶 — 加法',  ['a_dmg']],
    ['B桶 — 前置乘', ['b_crit', 'b_vul', 'b_elemental', 'b_dot']],
    ['C桶 — 独立乘', ['c_legend', 'c_unique']],
    ['自定义',      ['custom']],
  ]
  return groups.map(([label, ids]) =>
    `<optgroup label="${label}">${
      ids.map(id => {
        const p = PRESET_MAP[id]
        return p ? `<option value="${id}"${id === selectedId ? ' selected' : ''}>${p.name}</option>` : ''
      }).join('')
    }</optgroup>`
  ).join('')
}
