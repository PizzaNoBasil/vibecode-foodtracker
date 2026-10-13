import { describe, expect, it } from 'vitest'
import { formatAmount, shoppingText } from './format'
import type { ShoppingWeek } from '../plan'

const week: ShoppingWeek = {
  groups: [
    {
      id: 'dairy',
      title: 'Молочное и яйца',
      items: [
        { id: 'egg', name: 'Яйца', unit: 'pcs', amount: 19 },
        { id: 'skyr', name: 'Скир', unit: 'g', amount: 1250 },
      ],
    },
    { id: 'produce', title: 'Овощи и фрукты', items: [{ id: 'herbs', name: 'Зелень', unit: 'g', amount: null }] },
  ],
  pantry: [{ id: 'oil', name: 'Масло растительное', unit: 'g', amount: 54 }],
}

describe('формат', () => {
  it('количества', () => {
    expect(formatAmount(2.4, 'pcs')).toBe('2,4 шт')
    expect(formatAmount(1, 'clove')).toBe('1 зубч.')
    expect(formatAmount(null, 'g')).toBe('')
  })

  it('текст списка без отмеченных позиций', () => {
    const text = shoppingText('Покупки', week, new Set(['skyr']))
    expect(text).toContain('• Яйца — 19 шт')
    expect(text).toContain('• Зелень')
    expect(text).not.toContain('Скир')
    expect(text).toContain('Проверить дома\n• Масло растительное')
  })

  it('пустая группа пропускается', () => {
    const text = shoppingText('Покупки', week, new Set(['herbs']))
    expect(text).not.toContain('Овощи и фрукты')
  })
})
