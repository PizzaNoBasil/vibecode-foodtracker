import type { IngredientLine, ShoppingItem, ShoppingWeek, Unit } from '../plan'

const UNITS: Record<Unit, string> = { g: 'г', ml: 'мл', pcs: 'шт', clove: 'зубч.' }

export function formatNumber(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
}

export function formatAmount(amount: number | null, unit: Unit): string {
  return amount === null ? '' : `${formatNumber(amount)} ${UNITS[unit]}`
}

export function formatLine(line: IngredientLine): string {
  const qty = formatAmount(line.amount, line.unit)
  return [line.name, qty, line.note].filter(Boolean).join(', ')
}

function itemText(i: ShoppingItem): string {
  const qty = formatAmount(i.amount, i.unit)
  return qty ? `${i.name} — ${qty}` : i.name
}

/** Текст списка для «Поделиться». Отмеченные позиции не попадают. */
export function shoppingText(title: string, week: ShoppingWeek, checked: Set<string>): string {
  const parts = [title]
  for (const g of week.groups) {
    const items = g.items.filter((i) => !checked.has(i.id))
    if (items.length) parts.push('', g.title, ...items.map((i) => `• ${itemText(i)}`))
  }
  const pantry = week.pantry.filter((i) => !checked.has(i.id))
  if (pantry.length) parts.push('', 'Проверить дома', ...pantry.map((i) => `• ${i.name}`))
  return parts.join('\n')
}
