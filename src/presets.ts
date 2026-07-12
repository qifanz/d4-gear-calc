import type { AffixPreset, Affix, SlotDef, BucketType } from './types'

export const PRESETS: AffixPreset[] = [
  { id: 'mainstat',    name: '主属性',          bucket: 'mainstat', unit: 'pts' },
  { id: 'skill_dmg',   name: '技能伤害',         bucket: 'skill',    unit: '%' },
  { id: 'crit_rate',   name: '暴击率',           bucket: 'critrate', unit: '%' },
  { id: 'crit_dmg',    name: '暴击伤害',         bucket: 'critdmg',  unit: '%' },
  { id: 'dot_dmg',     name: '持续伤害',         bucket: 'dotdmg',   unit: '%' },
  { id: 'atk_spd',     name: '攻击速度',         bucket: 'atkspd',   unit: '%' },
  { id: 'a_dmg',       name: '伤害加成(+)',      bucket: 'A',        unit: '%' },
  { id: 'a_core',      name: '核心技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_basic',     name: '基础技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_wrath',     name: '愤怒技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_macabre',   name: '阴森技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_conjure',   name: '召唤技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_trap',      name: '陷阱技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_agility',   name: '敏捷技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'a_companion', name: '同伴技能伤害(+)',  bucket: 'A',        unit: '%' },
  { id: 'b_vul',       name: '易伤伤害',         bucket: 'B', cat: 'vul',       unit: '%' },
  { id: 'b_fire',      name: '火焰伤害',         bucket: 'B', cat: 'fire',      unit: '%' },
  { id: 'b_cold',      name: '冰霜伤害',         bucket: 'B', cat: 'cold',      unit: '%' },
  { id: 'b_lightning', name: '闪电伤害',         bucket: 'B', cat: 'lightning', unit: '%' },
  { id: 'b_poison',    name: '毒素伤害',         bucket: 'B', cat: 'poison',    unit: '%' },
  { id: 'b_shadow',    name: '暗影伤害',         bucket: 'B', cat: 'shadow',    unit: '%' },
  { id: 'b_physical',  name: '物理伤害',         bucket: 'B', cat: 'physical',  unit: '%' },
  { id: 'b_close',     name: '近战范围伤害',     bucket: 'B', cat: 'close',     unit: '%' },
  { id: 'b_distant',   name: '远程范围伤害',     bucket: 'B', cat: 'distant',   unit: '%' },
  { id: 'b_elite',     name: '精英伤害',         bucket: 'B', cat: 'elite',     unit: '%' },
  { id: 'b_overpower', name: '超载伤害',         bucket: 'B', cat: 'overpower', unit: '%' },
  { id: 'b_bleed',     name: '出血伤害',         bucket: 'B', cat: 'bleed',     unit: '%' },
  { id: 'b_burn',      name: '燃烧伤害',         bucket: 'B', cat: 'burn',      unit: '%' },
  { id: 'b_stun',      name: '击晕伤害',         bucket: 'B', cat: 'stun',      unit: '%' },
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
  critdmg:  'bullet-critdmg',
  dotdmg:   'bullet-dotdmg',
  atkspd:   'bullet-atkspd',
}

export function getBucket(a: Affix): BucketType {
  if (a.presetId === 'custom') return a.customBucket
  return PRESET_MAP[a.presetId]?.bucket ?? 'C'
}

export function getCat(a: Affix): string {
  if (a.presetId === 'custom') return a.customCat || `custom_${a.id}`
  return PRESET_MAP[a.presetId]?.cat ?? a.presetId
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
    ['特殊属性',    ['mainstat', 'skill_dmg', 'crit_rate', 'crit_dmg', 'dot_dmg', 'atk_spd']],
    ['A桶 — 加法',  PRESETS.filter(p => p.bucket === 'A').map(p => p.id)],
    ['B桶 — 前置乘', PRESETS.filter(p => p.bucket === 'B').map(p => p.id)],
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
