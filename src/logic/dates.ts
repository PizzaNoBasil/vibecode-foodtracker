// Даты хранятся строками 'YYYY-MM-DD' в местном времени. Разница в днях
// считается через UTC, поэтому переход на летнее время её не сбивает.

export type ISODate = string

export function toISO(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): ISODate {
  return toISO(new Date())
}

function utc(iso: ISODate): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function isValidISO(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const t = utc(iso)
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === iso
}

export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((utc(a) - utc(b)) / 86_400_000)
}

export function addDays(iso: ISODate, n: number): ISODate {
  return new Date(utc(iso) + n * 86_400_000).toISOString().slice(0, 10)
}

/** День недели: 0 = понедельник, 6 = воскресенье. */
export function weekday(iso: ISODate): number {
  return (new Date(utc(iso)).getUTCDay() + 6) % 7
}

export function mondayOf(iso: ISODate): ISODate {
  return addDays(iso, -weekday(iso))
}

/** Остаток, который для отрицательных чисел тоже даёт 0..n-1. */
export function mod(a: number, n: number): number {
  return ((a % n) + n) % n
}

/** floor((дата - старт) / 7) mod 3, в том числе для дат до старта. */
export function weekIndex(date: ISODate, start: ISODate, weeks = 3): number {
  return mod(Math.floor(diffDays(date, start) / 7), weeks)
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function formatShort(iso: ISODate): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

/** «19–24 окт» или «30 ноя – 5 дек». */
export function formatRange(from: ISODate, to: ISODate): string {
  const [, m1, d1] = from.split('-').map(Number)
  const [, m2, d2] = to.split('-').map(Number)
  return m1 === m2 ? `${d1}–${d2} ${MONTHS[m2 - 1]}` : `${formatShort(from)} – ${formatShort(to)}`
}
